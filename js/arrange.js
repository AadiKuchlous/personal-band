function addblock(inst) {
  const arrange_area = document.getElementById("arrange_area");
  var block = document.createElement("DIV");
  var class_name = "block_" + inst;
  block.classList.add(class_name);
  block.style.height = "100px";
  block.style.width = "100px";
  block.style.margin = "10px";
  block.style.display = "inline-flex";
  
  if (!(arrange_area.contains(document.getElementById(inst)))) {
    var div = document.createElement("DIV")
    div.id = inst;
    div.style.display = "flex";
    div.style.flexDirection = "row";
    arrange_area.appendChild(div);
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

  block.style.backgroundColor = color;

  document.getElementById(inst).appendChild(block);
}
