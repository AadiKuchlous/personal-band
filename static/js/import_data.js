function loadProject(data_string, lines_changed) {
  // Parse the json string
  let load_arrange_data = JSON.parse(data_string);
  arrange_data = load_arrange_data;

  // Session metadata
  tempo = arrange_data['tempo'];
  $('#tempo-span').text(tempo);

  // Remove all existing elements
  $('.track-header').remove();
  $('#arrange-area').children().remove('.inst-line');

  let grid_canvas_height = Math.max(120, arrange_data.lines.length*120);
  if (arrange_data.lines.length == 0) {
    $('#grid-canvas').css({'display': 'none'});
  }
  else {
    $('#grid-canvas').css({'display': 'block'});
  }
  $('#grid-canvas').css({'height': `${grid_canvas_height}px`});

  if (arrange_data['lines'].length > 0) {

    if (lines_changed) {
      //Draw the grid
      // $('#grid-canvas').attr('height', '120px');
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

      // console.log(line_data['grid-end'])
      // line_cont.find('.add-block')

      //Add the blocks
      let blocks = line_data['blocks'];
      let j = 0;
      while (j < blocks.length) {
        let block = blocks[j];
        if (!block.to_delete) {
          addblock(inst, line_id, true);
          j += 1;
        }
        else {
          blocks.splice(j, 1);
        }
      }
    }
  }

  changeTheme();

}


var width_index = 0;
function resizeHorizontal() {
  let width = quarter_note_block_width/4;
  $('#number-canvas').attr('width', `${Math.min(60000, quarter_note_block_width*4*200)}px`)
  // $('.inst-line').css({'grid-template-columns': `repeat(3200, ${width}px)`});
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
    let width = parseFloat($(this).attr('length'))
    console.log(width);
    $(this).css({'width': `${width * quarter_note_block_width}px`})
    let grid_start = parseFloat($(this).css('grid-column-start'));
    let left = (grid_start - 1) * quarter_note_block_width / 4;
    // console.log(quarter_note_block_width);
    // console.log($(this).css('grid-column-start'));
    $(this).css({'left': `${left}px`});
  })

  $('.add-block').each(function() {
    let grid_start = parseFloat($(this).css('grid-column-start'));
    let left = (grid_start - 1) * quarter_note_block_width / 4;
    console.log(quarter_note_block_width);
    console.log($(this).css('grid-column-start'));
    $(this).css({'left': `${left}px`});
  })
}
