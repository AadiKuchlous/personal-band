let arrange_data = {'lines':[]};
let block_length_options = ['1/16', '1/8', '1/4', '1/2', '1']
let selected_block = null;
let quarter_note_block_width = 100;

$(document).ready(function(){
//  loadProject('{"lines":[{"inst":"piano","pos":0,"blocks":[{"name":"piano0","length":1,"sound":"notes/A"}],"color":"pink"},{"inst":"guitar","pos":1,"blocks":[{"name":"guitar0","length":1,"sound":"chords/C"},{"name":"guitar1","length":1,"sound":"chords/F"}],"color":"lightgreen"}]}');
  init();
  $(this).keydown(function(e) {
    if(e.which == 8) {
      e.preventDefault();
      let line_pos = parseInt(selected_block.parent('.inst-line').attr('position'));
      let block_pos = parseInt(selected_block.attr('position'));
      arrange_data['lines'][line_pos]['blocks'].splice(block_pos, 1);
      selected_block.remove();
    }
  });
  $('#grid-canvas').attr('width', '5000px');
  $('#studio-body').css({'padding-top': $('#control-bar').height()});
  $('#arrange-area').css({'padding-top': $('#control-bar').height()});
})

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

function generateDropdownItems(items) {
  let dropdown_items = [];
  items.forEach(
    (item) => {
      let dropdown_item = $('<button/>')
	      .addClass('dropdown-item')
	      .text(item)
	      .attr('value', item)
	      .off('click');
      if (item == "1/4") {
          dropdown_item.addClass('active');
      }

      dropdown_item.click(
          function() {

            // Highlight the option that corresponds to the length
            $(this).parents('.dropdown-menu').children('.dropdown-item').removeClass('active');
            $(this).addClass('active');
            
            let block = $(this).parents('.inst-block');
            let line = block.parents('.inst-line');
            let line_id = line.attr('id')

            let line_index = parseInt($(this).parents('.inst-line').attr('position'));
            let line_obj = arrange_data['lines'][line_index]['blocks'];
            let block_obj = line_obj[parseInt(block.attr('position'))];

            let new_length = eval(item)*4;
            let old_length = parseInt(block_obj['grid-end'])-parseInt(block_obj['grid-start']);

            let grid_end = parseInt(block_obj['grid-start']) + new_length * 4;
            let grid_start = block_obj['grid-start'];
            block.css(
              {
                'grid-column-start': grid_start,
                'grid-column-end': grid_end,
                'width': 'auto'
              }
            );
            block_obj['grid-start'] = grid_start;
            block_obj['grid-end'] = grid_end;
            block_obj['length'] = new_length

            for (i = parseInt(block.attr('position')) + 1; i < line.children('.inst-block').length; i++) {
              let cur_block = $('#' + line_id + '-' + i);
              let cur_block_obj = line_obj[i];
              let prev_block_obj = line_obj[i-1];
              let grid_start = prev_block_obj['grid-end'];
              let grid_end = grid_start + (cur_block_obj['grid-end'] - cur_block_obj['grid-start']);

              cur_block.css(
                {
                  'grid-column-start': grid_start,
                  'grid-column-end': grid_end,
                  'width': 'auto'
                }
              );
              cur_block_obj['grid-start'] = grid_start;
              cur_block_obj['grid-end'] = grid_end;
            }
          }
      )

      dropdown_items.push(dropdown_item);
    }
  )
  return(dropdown_items);
}

function generateBlockLengthDropdown() {
  let length_dropdown = $('<div/>').addClass('dropdown').addClass('block-length-dropdown')

  let length_button = $('<div/>')
        .addClass('block-length-dropdown-toggle') 
	.attr('data-toggle', 'dropdown')

  length_dropdown.append(length_button)
  let dropdown_menu = $('<div/>').addClass('dropdown-menu')
  let dropdown_items = generateDropdownItems(block_length_options)
  dropdown_items.forEach(
    (item) => {
      dropdown_menu.append(item)
    }
  )
  length_dropdown.append(dropdown_menu)

  return(length_dropdown)
}

function addLine(inst) {
  let arrange_area = $("#arrange-area");
  let div = $('<div/>');
  let index = $('.'+inst+'-line').length
  let id = inst+'-'+index.toString()
  let line_no = $("#arrange-area").children(".inst-line").length;

  $('#grid-canvas').attr('height', (line_no+1)*120 + 'px');
  drawGrid('grid-canvas', 25);

  div.attr('id', id)
	.addClass("inst-line")
	.addClass(inst+'-line')
	.attr('position', line_no);

  let add_button = $('<div/>').addClass('add-block').append($('<img/>').attr('src', 'https://img.icons8.com/ios-glyphs/30/000000/plus-math.png'))
  add_button.click(((inst, id) => {
    return function() {
      addblock(inst, id, false)
    }
  })(inst,id))
  div.append(add_button);
  arrange_area.append(div);

  var color = null;
  switch (inst) {
    case "guitar":
      color = "lightgreen";
      break;
    case "piano":
      color = "pink";
      break;
  }


  let line_index = arrange_data['lines'].length;
  let line_dict = {
	  "inst": inst,
	  "pos": line_index,
	  "blocks": [],
          "color": color
	};
  arrange_data['lines'].push(line_dict);
  let track_header = $('<div/>').addClass('track-header').html('<b>'+capitalize(inst)+'</b>').css({'grid-row-start': line_index+1, 'grid-row-end': line_index+2});
  $('#track-list-grid').append(track_header)
}


function addblock(inst, id, from_load) {
  let arrange_area = $("#arrange-area");
  let inst_line = $('#'+id);
  line_index = inst_line.attr("position");

  let class_name = "block_" + inst;
  var index = inst_line.children('.'+class_name).length;
  let block = $('<div/>');
  let block_id = id + '-' + index.toString();

  block.addClass(class_name)
	.addClass('inst-block')
	.attr('id', block_id)
        .attr('position', index)
	.attr('inst', inst);

  let line_obj = arrange_data['lines'][line_index];
  let block_data_obj = line_obj['blocks'][index];
  let block_obj = {};

  if (from_load) {
    block.attr('length', block_data_obj['length']);
  }
  else {
    block.attr('length', 1);
  }

  let grid_start = 1;
  let grid_end = 5;
  if (index == 0) {
    if (from_load) {
      grid_start = block_data_obj['grid-start'];
      grid_end = grid_start + 4 * block_data_obj['length'];
      console.log('start: ' + grid_start, 'end: ' + grid_end);
    }
    block.css({
        'grid-column-start': grid_start,
        'grid-column-end': grid_end
    });
  }
  else {
    let line_length = line_obj['blocks'].length;
    grid_start = line_obj['blocks'][line_length-1]['grid-end'];
    grid_end = grid_start + 4;
    if (from_load) {
      grid_start = block_data_obj['grid-start'];
      grid_end = grid_start + 4 * block_data_obj['length'];
      console.log('start: ' + grid_start, 'end: ' + grid_end);
    }
    let grid_column = grid_start + '/' + grid_end;
    block.css({
        'grid-column': grid_column
    });
  }
  block_obj['grid-start'] = grid_start;
  block_obj['grid-end'] = grid_end;

  block.click(function() {
    $( this ).addClass('block-selected');
    $('.inst-block').not(this).removeClass('block-selected');
    selected_block = $(this);
  });

  block.dblclick(function() {
    loadModal($(this))
    $('#exampleModalCenter').modal('show');
  });

  let length_dropdown = generateBlockLengthDropdown();
  block.append(length_dropdown);

  block.css({backgroundColor: line_obj['color']});

  if (from_load) {
    let sound = line_obj['blocks'][index]['sound'];
    block.attr('sound', sound);
    block.append($('<div/>').addClass('block-label').text(sound))
  }

  inst_line.append(block);

  if (!from_load) {
    block = $('#' + block_id)
  
    block_obj["name"] = inst + index.toString();
    block_obj["length"] = 1;
  
    let notes_modal = $(".modal-body")
    loadModal(block)

    $('#exampleModalCenter').modal('show');
  
    line_obj["blocks"].push(block_obj);
  }
}


function loadModal(block) {
  // Clear the modal
  $(".modal-body").html('')

  $(".modal-title").html(capitalize(block.attr('inst')));

  let line_index = parseInt(block.parent('.inst-line').attr("position"));
  let sounds = fileList[block.attr('inst')]

  // Create tabs for choosing sound in modal
  // let nav = $('<nav/>')

  let nav_div = $('<ul/>').addClass('nav')
			.addClass('nav-tabs')
			.attr('role', 'tablist')

  let tab_content = $('<div/>').addClass('tab-content')

  for (section in sounds) {
    let tab_li = $('<li/>').addClass('nav-item').attr('role', 'presentation');
    let tab = $('<button/>')
    tab.addClass('nav-link')
	.attr("data-toggle", "tab")
	.attr('data-target', '#nav-'+section)
	.attr('type', 'button')
	.attr('role', 'tab')
	.attr('aria-controls', 'nav-'+section)
	.attr('aria-selected', 'true')
	.html(capitalize(section))
    tab_li.append(tab)
    nav_div.append(tab_li)

    let container = $('<div/>').addClass('container')
  				  .css({
				    "width":"100%"
				  })
				  .attr('id', 'nav-'+section)
				  .addClass('tab-pane')
				  .attr('role', 'tabpanel')
    let buttons_area = $('<div/>').addClass('row').addClass('justify-content-around')

    Object.entries(sounds[section]).forEach(function ([sound, file], index) {
      let button = $('<button/>').addClass('col-5')
				 .attr('value', section+'/'+sound)
				 .html(sound)
				 .css({
				   "height":"80px"
				 })
				 .addClass('note-button')
      if (Number.isInteger((index+1)/2)) {
        button.addClass('align-self-end')
      }
      else {
        button.addClass('align-self-start')
      }
      buttons_area.append(button)
    })

    container.append(buttons_area)
    tab_content.append(container)
  }
  // .children().get(0).addClass("show").addClass('active')
  $(nav_div.children()[0]).find('button').addClass('active');
  $(tab_content.children()[0]).addClass("show").addClass('active');
//  console.log(nav_div.children()[0]);
  // nav.append(nav_div)
  $(".modal-body").append(nav_div)
  $(".modal-body").append(tab_content)
  
  $(".modal-body").find("button.note-button").each(
    function() {
      $(this).off('click');
      $(this).click(
        ((block) => {
          return(
            function() {
              block.attr("sound", $(this).attr("value"))
              block.find('.block-label').remove()
              block.append($('<div/>').text($(this).attr("value")).addClass('block-label'))
              arrange_data['lines'][line_index]["blocks"][parseInt(block.attr('position'))]["sound"] = $(this).attr("value")
            }
          )
        })(block)
      )
    }
  );
}

function drawGrid(canvas_id, grid_width){
  let canvas = $('#' + canvas_id);

  let height = canvas.height();
  let width = canvas.width();

  for (var x = 0; x <= width; x += grid_width) {
    let context = canvas[0].getContext('2d');
    context.beginPath();
    context.strokeStyle = 'lightgray';
    context.lineWidth = 1;
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
}
