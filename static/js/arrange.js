let arrange_data = {'lines':[]};
let block_length_options = ['1/16', '1/8', '1/4', '1/2', '1']
let selected_block = null;
let quarter_note_block_width = 100;

$(document).ready(function(){
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

  $('#number-canvas').attr('width', '5000px').attr('height', '20px').css({'top': $('#number-canvas').height()*-1});
  $('#grid-canvas').attr('width', $('#number-canvas').attr('width'));
  $('#studio-body').css({'top': $('#control-bar').height()+$('#number-canvas').height()});

  $('#load-project').click((() => {loadProject(sample_project)}));

  drawNumbers('number-canvas', 25);

  $('.tempo-change').on("click", (e) => {
    let clicked = $(e.target);
    let tempo_span = $('#tempo-span');
    let tempo_input = $('#tempo-input');
    let increment = 1;
    if (clicked.attr('value') == "plus") {
      increment = 1;
    }
    else if (clicked.attr('value') == "minus") {
      increment = -1;
    }
    tempo_span.text(parseInt(tempo_span.text()) + increment);
    tempo_input.attr('value', tempo_span.text());
  })
  $('.tempo').hover( function (){
	  $('#tempo-label').css({'display': 'flex'})
	}, 
	function (){
	  $('#tempo-label').css({'display': 'none'})
	}
  );

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

function addLine(inst, from_load=null) {
  let arrange_area = $("#arrange-area");
  let line = $('<div/>');
  let index = 0;
  if (from_load) {
    index = from_load['pos']
  }
  else {
    index = $('.'+inst+'-line').length;
  }
  let id = inst+'-'+index.toString()
  let line_no = $("#arrange-area").children(".inst-line").length;

  $('#grid-canvas').attr('height', ((line_no+1)*120) + 'px');
  drawGrid('grid-canvas', 25);

  line.attr('id', id)
	.addClass("inst-line")
	.addClass(inst+'-line')
	.attr('position', line_no);

  let add_button = $('<div/>').addClass('add-block').append($('<img/>').attr('src', 'https://img.icons8.com/ios-glyphs/30/000000/plus-math.png'))
  add_button.click(((inst, id) => {
    return function() {
      addblock(inst, id, false)
    }
  })(inst,id))
  line.append(add_button);
  line.hover( function (){
	  $(this).find('.add-block').css({'display': 'flex'})
	}, 
	function (){
	  $(this).find('.add-block').css({'display': 'none'})
	}
  );

  arrange_area.append(line);

  var color = null;
  switch (inst) {
    case "guitar":
      color = "#44D62C";
      break;
    case "piano":
      color = "#DB3EB1";
      break;
    case "drums":
      color = "#4D4DFF";
      break;
  }


  let line_index = arrange_data['lines'].length;

  if (!from_load) {
    let line_dict = {
	    "inst": inst,
	    "pos": line_index,
	    "blocks": [],
            "color": color
	  };
    arrange_data['lines'].push(line_dict);
  }
  let track_header = $('<div/>').addClass('track-header').html('<b>'+capitalize(inst)+'</b>').css({'grid-row-start': line_no+1, 'grid-row-end': line_no+2});
  $('#track-list-grid').append(track_header)

  return(line);
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
    $(this).find('.block-del').css({'display': 'flex'});
  });

  block.dblclick(function() {
    loadModal($(this))
    $('#exampleModalCenter').modal('show');
  });

  let length_dropdown = generateBlockLengthDropdown();
  block.append(length_dropdown);

  block.append(
	$('<div/>')
	.addClass('block-del')
	.html('<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 172 172"style=" fill:#000000;"><g transform="translate(-21.5,-21.5) scale(1.25,1.25)"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><g fill="#000000"><path d="M86,17.2c-37.9948,0 -68.8,30.8052 -68.8,68.8c0,37.9948 30.8052,68.8 68.8,68.8c37.9948,0 68.8,-30.8052 68.8,-68.8c0,-37.9948 -30.8052,-68.8 -68.8,-68.8zM113.1932,114.66667h-16.4088l-10.8876,-18.15747h-0.7568l-10.96213,18.15747h-15.4972l17.60133,-28.92467l-17.5612,-28.40867h17.00507l10.29133,18.9888h0.7568l10.36587,-18.9888h16.20813l-18.318,28.5692z"></path></g><path d="" fill="none"></path></g></g></svg>')
	.click(() => (deleteBlock(block)))
  );

  block.hover( function (){
		  $(this).find('.block-del').css({'display': 'flex'})
		}, 
		function (){
		  $(this).find('.block-del').css({'display': 'none'})
		}
	);

  block.css({backgroundColor: line_obj['color']});

  if (from_load) {
    let sound = line_obj['blocks'][index]['sound'];
    block.attr('sound', sound);
    block.append($('<div/>').addClass('block-label').text(sound.split('/').at(-1)))
    block.attr('title', sound)
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
      let button = $('<div/>').addClass('col-5')
				 .attr('value', section+'/'+sound)
				 .html(sound)
				 .addClass('note-button')
      if (Number.isInteger((index+1)/2)) {
        button.addClass('align-self-end')
      }
      else {
        button.addClass('align-self-start')
      }

      button.append($('<div>').addClass('note-listen').html('<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><g fill="#000000"><path d="M107.45801,23.59961c-3.81482,-0.02636 -7.12468,3.16106 -7.12468,7.18066c0,3.16767 2.08371,6.02157 5.15104,6.80273c20.43844,5.20703 35.82348,22.73457 37.66699,44.09179c0.1229,1.42382 0.18197,2.86992 0.18197,4.3252c0,23.2845 -16.04796,42.86282 -37.84896,48.41699c-3.06733,0.78117 -5.15104,3.63507 -5.15104,6.80274c0,4.59383 4.3327,8.10303 8.79036,6.9707c27.90701,-7.08783 48.54297,-32.28393 48.54297,-62.19043c0,-29.9065 -20.63597,-55.1026 -48.54297,-62.19043c-0.5572,-0.14154 -1.12071,-0.2062 -1.66568,-0.20996zM79.61719,31.66211c-2.01815,-0.23721 -4.15778,0.37849 -5.85091,2.07161l-30.76628,30.76628h-14.33333c-7.91917,0 -14.33333,6.41417 -14.33333,14.33333v14.33333c0,7.91917 6.41417,14.33333 14.33333,14.33333h14.33333l30.76628,30.76628c4.515,4.515 12.23372,1.31844 12.23372,-5.06706v-94.39844c0,-3.99094 -3.01924,-6.74332 -6.38281,-7.13867zM107.22006,54.01595c-3.61201,0.13706 -6.88672,3.16341 -6.88672,7.19466v0.16797c0,2.52267 1.32684,4.87053 3.54134,6.08887c6.59333,3.6335 10.79199,10.56322 10.79199,18.53255c0,7.96933 -4.19866,14.89222 -10.79199,18.51855c-2.2145,1.21833 -3.54134,3.5802 -3.54134,6.10287v0.15397c0,5.38217 5.83938,8.986 10.51205,6.31283c10.89333,-6.22783 18.15462,-17.80839 18.15462,-31.08822c0,-13.27983 -7.26129,-24.85322 -18.15462,-31.08822c-1.16817,-0.6665 -2.42133,-0.94152 -3.62532,-0.89583z"></path></g></g></svg>'));

      buttons_area.append(button)
    })

    container.append(buttons_area)
    tab_content.append(container)
  }
  // .children().get(0).addClass("show").addClass('active')
  $(nav_div.children()[0]).find('button').addClass('active');
  $(tab_content.children()[0]).addClass("show").addClass('active');
  // nav.append(nav_div)
  $(".modal-body").append(nav_div)
  $(".modal-body").append(tab_content)
  
  $(".modal-body").find(".note-button").each(
    function() {
      $(this).off('click');
      $(this).click(
        ((block) => {
          return(
            function() {
              block.attr("sound", $(this).attr("value"));
              block.find('.block-label').remove();
              block.append($('<div/>').text($(this).attr("value").split('/').at(-1)).addClass('block-label'));
              arrange_data['lines'][line_index]["blocks"][parseInt(block.attr('position'))]["sound"] = $(this).attr("value");

              levels = block.attr('sound').split('/');
              let instrument_tree = bufferlist[block.attr('inst')];
              let buffer = instrument_tree;
              // The buffers are kept as a tree of dictionaries, and the levels are a '/' separated
              // path in this tree. Example: 'Notes/A'
              for (level = 0; level < levels.length; level++) {
                key = levels[level];
                buffer = buffer[key];
              }
              playSound(buffer, context.currentTime, context.currentTime + 1000);
            }
          )
        })(block)
      )
    }
}

function deleteBlock(block) {
  let line_index = parseInt(block.parents('.inst-line').attr('position'));
  let block_index = parseInt(block.attr('position'));
  let line_data = arrange_data['lines'][line_index];
  let blocks = line_data['blocks'];
  blocks.splice(block_index, 1);
  for (i = block_index; i < blocks.length; i++) {
    let this_block = blocks[i];
    if (i == 0) {
      this_block['grid-start'] = 1;
    }
    else {
      let prev_block = blocks[i-1];
      this_block['grid-start'] = prev_block['grid-end'];
    }
    this_block['grid-end'] = this_block['grid-start'] + (4 * this_block['length']);
  }
  loadProject(JSON.stringify(arrange_data));
//  block.remove();
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
    if (x % 16 == 0) {
      context.strokeStyle = '#999999';
    }
    else if (x % 8 == 0) {
      context.strokeStyle = '#bbbbbb';
    }
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
}

function drawNumbers(canvas_id, grid_width){
  let canvas = $('#' + canvas_id);

  let height = canvas.height();
  let width = canvas.width();

  for (var x = 0; x <= width; x += grid_width) {
    let context = canvas[0].getContext('2d');
    context.beginPath();
    context.strokeStyle = 'lightgray';
    context.lineWidth = 1;
    context.font = '15px serif';
    if (x % 16 == 0 || x == 0) {
      context.strokeStyle = '#999999';
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.fillText((x / (16*grid_width) + 1).toString(), x + 3, height-5);
    }
    else if (x % 8 == 0) {
      context.strokeStyle = '#bbbbbb';
      context.moveTo(x, height/2);
      context.lineTo(x, height);
    }
    context.stroke();
  }
}

