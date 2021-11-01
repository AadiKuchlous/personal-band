function loadProject(data_string) {
  // Parse the json string
  let load_arrange_data = JSON.parse(data_string);
  arrange_data = load_arrange_data;

  // Session metadata
  tempo = arrange_data['tempo'];
  $('#tempo-span').text(tempo);

  // Remove all existing elements
  $('.track-header').remove();
  $('#arrange-area').children().remove('.inst-line');

//  $('#grid-canvas').attr('height', $('#arrange-area').children('.inst-line').length*120 + 'px');

  if (arrange_data['lines'].length > 0) {

    if (!grid_drawn) {
      //Draw the grid
      $('#grid-canvas').attr('height', '120px');
      drawGrid('grid-canvas', 25);
    }

    for (i = 0; i < arrange_data['lines'].length; i++){
      let line_index = i;
      let line_data = arrange_data['lines'][i];
      let inst = line_data.inst
      let pos = line_data.pos

      // Make intrument line
      let line_id = inst+'-'+(pos).toString();
      let line_cont = addLine(inst, line_data);

      //Add the blocks
      let blocks = line_data['blocks'];
      for (j = 0; j < blocks.length; j++) {
        let block = blocks[j];
        addblock(inst, line_id, true);
      }
    }
  $('#grid-canvas').css({'height': $('#arrange-area').children('.inst-line').length*120 + 'px'});
  }
}
