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

  if (arrange_data['lines'].length > 0) {

    if (!grid_drawn) {
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

      console.log(line_data['grid-end'])
      // line_cont.find('.add-block')

      //Add the blocks
      let blocks = line_data['blocks'];
      for (j = 0; j < blocks.length; j++) {
        let block = blocks[j];
        addblock(inst, line_id, true);
      }
    }
  }
  let grid_canvas_height = Math.max(120, arrange_data.lines.length*120);
  if (arrange_data.lines.length == 0) {
    $('#grid-canvas').css({'display': 'none'});
  }
  else {
    $('#grid-canvas').css({'display': 'block'});
  }
  $('#grid-canvas').css({'height': `${grid_canvas_height}px`});

}


var width_index = 0;
function resizeHorizontal() {
  let width = quarter_note_block_width/4;
  $('#number-canvas').attr('width', `${Math.min(60000, quarter_note_block_width*4*200)}px`)
  $('.inst-line').css({'grid-template-columns': `repeat(3200, ${width}px)`});
  $('#grid-canvas').attr('width', $('#number-canvas').attr('width')).css({'width': $('#number-canvas').attr('width')})
  drawGrid('grid-canvas', width);
  drawNumbers('number-canvas', width);
  $('#grid-canvas').css({'height': ($('.inst-line').length*120) + 'px'})

  $('.inst-block').each(function() {
    $(this).draggable({
        'axis':'x',
        'grid': [quarter_note_block_width/4],
        'containment': '.inst-line',
        drag: blockDragging,
        stop: blockDragged,
        'cursor': 'move'
    })
    let width = parseInt($(this).attr('length'))
    $(this).css({'width': `${width * quarter_note_block_width}px`})
  })
}
