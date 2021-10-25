let arrange_data = {'lines':[], 'length':0, 'tempo':120};
let block_length_options = ['1/16', '1/8', '1/4', '1/2', '1']
let selected_block = null;
let quarter_note_block_width = 100;
let theme = "dark";
let theme_obj = themes[theme];
var line_to_delete = null;
var playhead_position = 0;

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

  $('#number-canvas').attr('width', '50000px').attr('height', '32px').css({'top': $('#number-canvas').height()*-1});
  $('#grid-canvas').attr('width', $('#number-canvas').attr('width'));
  $('#studio-body').css({'top': $('#control-bar').height()+$('#number-canvas').height()});
  $('#playhead-canvas').attr('width', $('#number-canvas').height()/2)
	.attr('height', '0px');

  $('#load-project').click((() => {loadProject(sample_project)}));

  $('.tempo-change').on("click", (e) => {
    let clicked = $(e.target);
    if (!clicked.hasClass('tempo-change')) {
      clicked = clicked.closest('.tempo-change');
    }
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

  $('#SettingsButton').click(loadSettings);

  $('#themeSelector').change(function() {
    theme = $("input[name='theme']:checked").val();
    theme_obj = themes[theme];
    changeTheme();
  })

  changeTheme();

  drawPlayhead();
  $('#playhead-canvas').draggable({
	'axis':'x',
	'grid': [quarter_note_block_width/4],
        drag: function(event, ui) {
	  if (ui.position.left < parseFloat(playhead_start_pos)) {
	    ui.position.left = parseFloat(playhead_start_pos);
	  }
	},
	stop: playheadDragged,
	'cursor': 'move'
  })

  $('#playhead-canvas').mousedown((e) => {
    e.preventDefault();
    roundPlayhead();
  })

  $('#download-wav').click(downloadWav);
})


function playheadDragged(event, ui) {
  playhead_position = (parseFloat($(this).css('left')) - playhead_start_pos) / (quarter_note_block_width/2);
  console.log(playhead_position);
}


function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}


function generateDropdownItems(items, block) {
  let dropdown_items = [];
  items.forEach(
    (item) => {
      let dropdown_item = $('<button/>')
	      .addClass('dropdown-item')
	      .text(item)
	      .attr('value', item)
	      .off('click');
      if (eval(item) == parseFloat(block.attr('length'))*0.25) {
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

            let i = parseInt(block.attr('position'));
            if (i+1 == line.children('.inst-block').length) {
              let line_obj = arrange_data['lines'][line_index];
              line_obj['grid-end'] = grid_end;
              line_obj['length'] = (line_obj['grid-end'] - line_obj['grid-start']) / 2;
              findNewTotalLength();
            }

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

              if (i+1 == line.children('.inst-block').length) {
                let line_obj = arrange_data['lines'][line_index];
                line_obj['grid-end'] = grid_end;
                line_obj['length'] = (line_obj['grid-end'] - line_obj['grid-start']) / 2;
                findNewTotalLength();
              }
            }
          }
      )

      dropdown_items.push(dropdown_item);
    }
  )
  return(dropdown_items);
}


function generateBlockLengthDropdown(block) {
  let length_dropdown = $('<div/>').addClass('dropdown').addClass('block-length-dropdown')

  let length_button = $('<div/>')
        .addClass('block-length-dropdown-toggle') 
	.attr('data-toggle', 'dropdown')

  length_dropdown.append(length_button)
  let dropdown_menu = $('<div/>').addClass('dropdown-menu')
  let dropdown_items = generateDropdownItems(block_length_options, block)
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
      color = "green";
      break;
    case "piano":
      color = "pink";
      break;
    case "drums":
      color = "blue";
      break;
  }


  let line_index = arrange_data['lines'].length;

  if (!from_load) {
    let line_dict = {
	    "inst": inst,
	    "pos": line_index,
	    "blocks": [],
	    "color": color,
	    "volume": "50",
	    "length": 0,
	    "grid-start": 1,
	    "grid-end": 1
	  };
    arrange_data['lines'].push(line_dict);
  }
  let track_header = $('<div/>')
	.addClass('track-header')
	.html('<b>'+capitalize(inst)+'</b>')
	.css(
	  {
	    'grid-row-start': line_no+1,
	    'grid-row-end': line_no+2,
	    'color': theme_obj['text-color']
	  }
	)
	.attr('index', line_no);

  let volume_knob = $('<input/>').attr('type', 'range').attr('max', '100').attr('min', '0').attr('value', '50');
  volume_knob.attr('value', arrange_data['lines'][line_no]['volume']);
  volume_knob.change(function (e) {
    let slider = e.target;
    let line_index = $(slider).parents('.track-header').attr('index')
    arrange_data['lines'][line_index]['volume'] = slider.value;
  })
  track_header.append(volume_knob);

  track_header.append(
	$('<div/>')
	.addClass('line-del')
	.html('<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><g class="del-line-path"><path d="M107.33488,86l46.8872,-70.3308c0.70176,-1.05608 0.77056,-2.41144 0.172,-3.52944c-0.59856,-1.118 -1.76472,-1.81976 -3.03408,-1.81976h-25.2496c-1.12488,0 -2.18096,0.5504 -2.82424,1.47576l-37.28616,53.56424l-37.2896,-53.56424c-0.64328,-0.92536 -1.69592,-1.47576 -2.8208,-1.47576h-25.2496c-1.26936,0 -2.43552,0.69832 -3.03408,1.81632c-0.59856,1.118 -0.52976,2.4768 0.172,3.52944l46.8872,70.33424l-46.8872,70.3308c-0.70176,1.05608 -0.77056,2.41144 -0.172,3.52944c0.59856,1.118 1.76472,1.81976 3.03408,1.81976h25.2496c1.12488,0 2.18096,-0.5504 2.82424,-1.47576l37.28616,-53.56424l37.2896,53.56424c0.64328,0.92536 1.69592,1.47576 2.8208,1.47576h25.2496c1.26936,0 2.43552,-0.69832 3.03408,-1.81632c0.59856,-1.118 0.52976,-2.4768 -0.172,-3.52944z"></path></g></g></svg>')
	.click(() => (deleteLine(line)))
  );

  track_header.hover(function (){
	  $(this).find('.line-del').css({'display': 'flex'})
	}, 
	function (){
	  $(this).find('.line-del').css({'display': 'none'})
	}
  );

  $('#track-list-grid').append(track_header)

  $('.del-line-path').css({'fill': theme_obj["del-line-color"]});

  console.log('added header and line')

  if (!grid_drawn){
    $('#grid-canvas').attr('height', ((line_no+1)*120) + 'px');
    drawGrid('grid-canvas', quarter_note_block_width/4);
  }
  else {
    $('#grid-canvas').css({'width': $('#grid-canvas').attr('width'), 'height': ((line_no+1)*120) + 'px'})
  }

//  drawPlayhead();

  return(line);
}


function deleteLine(line) {
  line_to_delete = line;
  $('#deleteLineModal').modal('show');
}


function confirmDeleteLine() {
  let index = parseInt(line_to_delete.attr('position'));
  arrange_data['lines'].splice(index, 1);
  loadProject(JSON.stringify(arrange_data));  
}


function blockDragged(event, ui) {
  let this_block = $(this);
  let old_start = parseInt(this_block.css('grid-column-start'));
  let old_end = parseInt(this_block.css('grid-column-end'));
  let displacement = this_block.css('left');
  let grid_displacement = parseInt(displacement)/(quarter_note_block_width/4);
  let grid_start = old_start + grid_displacement;
  let grid_end = old_end + grid_displacement;
  this_block.css({'grid-column-start': grid_start, 'grid-column-end': grid_end, 'left': '0px'});
  let line_pos = parseInt(this_block.parent().attr('position'));
  let block_obj = arrange_data['lines'][line_pos]['blocks'][parseInt(this_block.attr('position'))];
  block_obj['grid-start'] = grid_start;
  block_obj['grid-end'] = grid_end;

  let line_div = this_block.parent();
  let line_obj = arrange_data['lines'][parseInt(line_div.attr('position'))];
  if (grid_end > line_obj['grid-end']) {
    line_obj['grid-end'] = parseInt(grid_end);
    line_obj['length'] = (line_obj['grid-end'] - line_obj['grid-start']) / 2;
  }
  if (old_end == line_obj['grid-end'] && grid_end < line_obj['grid-end']) {
    console.log(line_div)
    let line_end = 0;
    line_div.find('.inst-block').each(
      (i, block) => {
        let block_end = parseInt($(block).css('grid-column-end'));
        if (block_end > line_end) {
          line_end = block_end;
        }
      }
    );
    line_obj['grid-end'] = line_end;
    line_obj['length'] = (line_obj['grid-end'] - line_obj['grid-start']) / 2;
  }
  findNewTotalLength();
  line_obj['blocks'].sort((a, b) => parseInt(a['grid-start']) - parseInt(b['grid-start']));
  loadProject(JSON.stringify(arrange_data));
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
	.attr('inst', inst)
	.draggable({
		'axis':'x',
		'grid': [quarter_note_block_width/4],
		'containment': '.inst-line',
		stop: blockDragged,
		'cursor': 'move'
	})

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
        'grid-column-start': grid_start,
	'grid-column-end': grid_end
    });
  }
  block_obj['grid-start'] = grid_start;
  block_obj['grid-end'] = grid_end;

  if (grid_end > line_obj['grid-end']) {
    line_obj['grid-end'] = grid_end;
    line_obj['length'] = (line_obj['grid-end'] - line_obj['grid-start']) / 2;
    if (line_obj['length'] > arrange_data['length']) {
      arrange_data['length'] = line_obj['length'];
    }
  }

  block.click(function() {
    $( this ).addClass('block-selected');
    $('.inst-block').not(this).removeClass('block-selected');
    selected_block = $(this);
    $(this).find('.block-del').css({'display': 'flex'});
  });

  block.dblclick(function() {
    loadNoteModal($(this))
    $('#noteModal').modal('show');
  });

  let length_dropdown = generateBlockLengthDropdown(block);
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

  block.css({backgroundColor: theme_obj['block-'+line_obj['color']]});
  block.css({'box-shadow': '0 0 20px ' + theme_obj['block-'+line_obj['color']+'-highlight'] });

  if (from_load) {
    let sound = line_obj['blocks'][index]['sound'];
    block.attr('sound', sound);
    block.append($('<div/>').addClass('block-label').text(sound.split('/').at(-1)))
    block.attr('title', sound)
  }

  inst_line.append(block);

  if (!from_load) {
    block = $('#' + block_id)
  
    block_obj['sound'] = '';
    block_obj["name"] = inst + index.toString();
    block_obj["length"] = 1;
  
    let notes_modal = $("#noteModal .modal-body")
    loadNoteModal(block);

    $('#noteModal').modal('show');
  
    line_obj["blocks"].push(block_obj);
  }
}


function loadNoteModal(block) {
  let modal_body = $("#noteModal .modal-body");
  let modal_title = $("#noteModalTitle");
  // Clear the modal
  modal_body.html('')

  modal_body.attr('inst', block.attr('inst'));

  modal_title.html(capitalize(block.attr('inst')));

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
				 .css({'background': theme_obj['note-select-button-color'], 'color': theme_obj['text-color']})
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
  modal_body.append(nav_div)
  modal_body.append(tab_content)
  
  modal_body.find(".note-button").each(
    function() {
      $(this).off('click');
      $(this).click(
        ((block) => {
          return(
            function(e) {
              if (e.target == this) {
                block.attr("sound", $(this).attr("value"));
                block.find('.block-label').remove();
                block.append($('<div/>').text($(this).attr("value").split('/').at(-1)).addClass('block-label'));
                arrange_data['lines'][line_index]["blocks"][parseInt(block.attr('position'))]["sound"] = $(this).attr("value");
              }
            }
          )
        })(block)
      )
    }
  );

  $('.note-listen').each(
    function() {
      $(this).off('click');
      $(this).click(
        (() => {
          return(
            function() {
              levels = $(this).parent().attr('value').split('/');
              let instrument_tree = bufferlist[modal_body.attr('inst')];
              let buffer = instrument_tree;
              // The buffers are kept as a tree of dictionaries, and the levels are a '/' separated
              // path in this tree. Example: 'Notes/A'
              for (level = 0; level < levels.length; level++) {
                key = levels[level];
                buffer = buffer[key];
              }
	      newGlobalContext();
              playSound(buffer, globalcontext.currentTime, globalcontext.currentTime + 1000, 1);
            }
          )
        })()
      )
    }
  )
}

function deleteBlock(block) {
  let line_index = parseInt(block.parents('.inst-line').attr('position'));
  let block_index = parseInt(block.attr('position'));
  let line_data = arrange_data['lines'][line_index];
  let blocks = line_data['blocks'];
  blocks.splice(block_index, 1);
  let old_line_length = line_data['length'];
  if (block_index == blocks.length) {
    line_data['length'] = line_data['length'] - (parseInt(block.attr('length')) * 2)
    if (block_index == 0) {
      line_data['grid-end'] = 1;
    }
    else {
      line_data['grid-end'] = blocks[block_index-1]['grid-end'];
    }
    findNewTotalLength();
  }
//  for (i = block_index; i < blocks.length; i++) {}
  loadProject(JSON.stringify(arrange_data));
}

function findNewTotalLength() {
  let length = 0;
  let lines_data = arrange_data['lines'];
  for (index in lines_data) {
    line = lines_data[index];
    if (line['length'] > length) {
      length = line['length'];
    }
  }
  arrange_data['length'] = length;
}


function loadSettings() {
  $('#settingsModal').modal('show');
}

function changeTheme() {
  $('#control-bar').css({'background-color': theme_obj['control-bar-background']});
  $('#studio-body').css({'background-color': theme_obj['studio-background']});
  $('#track-list').css({'background-color': theme_obj['studio-background']});
  $('#arrange-area').css({'background-color': theme_obj['studio-background']});
  $('#number-canvas').css({'background-color': theme_obj['studio-background']});
  $('body').css({'background-color': theme_obj['studio-background']});
  $('.inst-block').each(function() {
    let color = arrange_data['lines'][parseInt($(this).parents('.inst-line').attr('position'))]['color'];
    $(this).css({'background-color': theme_obj['block-'+color]});

    let box_shadow = theme_obj['block-'+color+'-highlight'] + ' ' + theme_obj['block-box-shadow'];
    $(this).css({'box-shadow': 'none'});
    $(this).css({'box-shadow': box_shadow.toString()});
  })
  $('.track-header').css({'color': theme_obj['track-text-color']});
  $('#dropdownMenuButton').css({'color': theme_obj['track-text-color']});
  $('.note-button').css({'background': theme_obj['note-select-button-color'], 'color': theme_obj['text-color']})
  $('#dropdownMenuButton').css({'background': theme_obj['studio-background']});
  $('#dropdownMenuButton').hover(function(){
    $(this).css({'background': theme_obj['new-track-hover-color']});
  }, function(){
    $(this).css({'background': theme_obj['studio-background']});
  });

  $('.modal-content').css({'background-color': theme_obj['modal-background'], 'color': theme_obj['text-color']});
  $('.tempo').css({'color': theme_obj['text-color']});
  $('.tempo-change-path').css({'fill': theme_obj["del-line-color"]});
  
  $('.del-line-path').css({'fill': theme_obj["del-line-color"]});

  $('#download-svg-path').css({'fill': theme_obj["del-line-color"]});
  drawNumbers('number-canvas', quarter_note_block_width/4);
}
