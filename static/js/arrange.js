let arrange_data = [];

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
	.attr('id', inst + index.toString())
  block.resizable({grid: [ 100 ], maxHeight: 100, minHeight: 100});

  block.click(function() {
    $( this ).css({
	border: "2px solid #d0d0d0"
    });
    $('.inst_block').not(this).css({
	border: "none"
    });
  });

  block.dblclick(function() {
    $('#exampleModalCenter').modal('show');
  });


  console.log(arrange_data);
  
  if (!($.contains(document.body, document.getElementById(inst)))) {
    var div = $('<div/>');
    div.attr('id', inst)
	.addClass("inst_line")
	.css({
	  display :"flex",
	  flexDirection: "row",
	  width: "100%",
	  padding: "10px"
	})
	.attr('position', $("#arrange_area").children(".inst_line").length);
    arrange_area.append(div);

    let line_dict = {
	  "inst": inst,
	  "pos": arrange_data.length + 1,
	  "blocks": []
	};
    arrange_data.push(line_dict);
  }

  console.log(JSON.stringify(arrange_data));
  
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

  line_index = parseInt($('#' + inst + index.toString()).parent('.inst_line').attr("position"));
  
  let block_obj = {}

  block_obj["name"] = inst + index.toString();
  block_obj["length"] = 1;
  block_obj["note"] = "A";
  
  arrange_data[line_index]["blocks"].push(block_obj);

  console.log("Before second print");
  console.log(JSON.stringify(arrange_data));
}
