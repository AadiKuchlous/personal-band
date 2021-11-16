function loadProject(data_string) {
  console.log("drawing")
  // Parse the json string
  let load_arrange_data = JSON.parse(data_string);
  arrange_data = load_arrange_data;

  // Session metadata
  tempo = arrange_data['tempo'];
  $('#tempo-span').text(tempo);

  // Remove all existing elements
  $('.track-header').remove();
  $('#arrange-area').children().remove('.inst-line');

  if (arrange_data['lines'].length > 0) {

    if (!grid_drawn) {
      console.log("drawing_grid") 
      //Draw the grid
      $('#grid-canvas').attr('height', '120px');
      drawGrid('grid-canvas', quarter_note_block_width/4);
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
  }
  $('#grid-canvas').css({'height': $('#arrange-area').children('.inst-line').length*120 + 'px'});

}


var width_index = 0;
function resizeHorizontal() {
  let width = quarter_note_block_width/4;
  $('#number-canvas').attr('width', `${Math.min(60000, quarter_note_block_width*4*200)}px`)
  console.log(width);
  $('.inst-line').css({'grid-template-columns': `repeat(3200, ${width}px)`});
  $('#grid-canvas').attr('width', $('#number-canvas').attr('width')).css({'width': $('#number-canvas').attr('width')})
  drawGrid('grid-canvas', width);
  drawNumbers('number-canvas', width);
  console.log($('inst-line').length*120)
  $('#grid-canvas').css({'height': ($('.inst-line').length*120) + 'px'})

  $('.inst-block').each(function() {
      $(this).draggable({
                'axis':'x',
                'grid': [quarter_note_block_width/4],
                'containment': '.inst-line',
                stop: blockDragged,
                'cursor': 'move'
        })
  })
}
