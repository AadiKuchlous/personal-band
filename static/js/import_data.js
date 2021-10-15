function loadProject(data_string) {
  // Remove all existing elements
  $('.track-header').remove();
  $('#arrange-area').children().remove();

  // Parse the json string
  let load_arrange_data = JSON.parse(data_string);
  arrange_data = load_arrange_data

  for (i = 0; i < arrange_data.length; i++){
    let line_index = i;
    let line_data = arrange_data[i];
    let inst = line_data.inst
    let pos = line_data.pos

    // Add track headers
    let track_header = $('<div/>').addClass('track-header').html('<b>'+capitalize(inst)+'</b>').css({'grid-row-start': pos+1, 'grid-row-end': pos+2});
    $('#track-list-grid').append(track_header);

    // Make intrument line
    let line_id = inst+'-'+(pos).toString();
    let line_cont = $('<div/>').addClass('inst-line')
			       .addClass(inst+'-line')
			       .attr('id', line_id)
			       .attr('position', pos)
			       .css({'order':pos});
    $('#arrange-area').append(line_cont)

    // Add blocks
    let add_block_div = $('<div/>').addClass('add-block').append($('<img/>').attr('src', "https://img.icons8.com/ios-glyphs/30/000000/plus-math.png"))
    add_block_div.click(((inst, id) => {
      return function() {
        addblock(inst, id, false)
      }
    })(inst, line_id))
    line_cont.append(add_block_div)

    let blocks = line_data['blocks'];
    for (j = 0; j < blocks.length; j++) {
      let block = blocks[j];
      addblock(inst, line_id, true, load_arrange_data);
    }
  }
}
