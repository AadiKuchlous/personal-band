function addblock(inst) {
  const arrange_area = $("#arrange_area");

  let class_name = "block_" + inst;
  var index = $('.'+class_name).length + 1;
  let block = $('<div/>');
  block.addClass(class_name)
	.addClass('inst_block')
	.addClass("ui-widget-content")
	.css({
	    height: "100px",
	    width: "100px",
	    display: "inline-flex"})
	.attr('id', inst + index.toString());
//	.click(block_clicked);
  block.resizable({grid: [ 100 ], maxHeight: 100, minHeight: 100});
  
  if (!($.contains(document.body, document.getElementById(inst)))) {
    var div = $('<div/>');
    div.attr('id', inst)
	.addClass("inst_line")
	.css({
	  display :"flex",
	  flexDirection: "row",
	  width: "100%",
	  padding: "10px"
	});
    arrange_area.append(div);
  }
  
  var color = null;
  switch (inst) {
    case "guitar":
      color = "green";
      break;
    case "piano":
      color = "pink";
      break;
  }

  block.css({backgroundColor: color});

  let inst_area = $('#'+inst);
  inst_area.append(block);
}

var block_clicked = function() {
  this.innerHTML = this.id;
  console.log(this.id);
}
