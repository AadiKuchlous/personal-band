let arrange_data = {'lines':[], 'length':0, 'tempo':120};

const empty = JSON.stringify(arrange_data);

let block_length_options = ['1/16', '1/8', '1/4', '1/2', '1']
let selected_blocks = [];
let clipboard = [];
let quarter_note_block_width = 100;
let theme = "dark";
let theme_obj = themes[theme];
var line_to_edit = null;
var playhead_position = 0;
var keys = {
	"types": {
		'major': {
			"notes": [0, 2, 2, 1, 2, 2, 2],
			"chords": ['major', 'minor', 'minor', 'major', 'major', 'minor', 'minor']
		},
		'minor': {
			"notes": [0, 2, 1, 2, 2, 1, 2],
			"chords": ['minor', 'minor', 'major', 'minor', 'minor', 'major', 'major']
		}
	},
	"notes": ['C', 'C#','D', 'D#','E', 'F','F#', 'G','G#', 'A','A#', 'B']
}
var scale = ['C', 'major'];
var scale_notes = [];
var scale_chords = [];

var delKey = 8,
    rightKey = 39,
    leftKey = 37,
    cKey = 67,
    vKey = 86


function browserNotSupported() {
  $('body').html('');
  setTimeout(() => {
    alert('This browser is not currently supported by EsayDAW\nPlease use a recent version of Chrome, Brave or Firefox');
  }, 300)}


window.addEventListener("error", browserNotSupported);

$(document).ready(function(){
  loadAllBuffers();

  $(this).keydown(function(e) {
    if (e.which == delKey && !($(':focus').hasClass('block-octave-change') || $(':focus').hasClass('tempo-input'))) {
      e.preventDefault();
      while (selected_blocks.length > 0) {
        let selected_block = selected_blocks[0];
        deleteBlock(selected_block, false);
        selected_blocks.shift();
      }
      selected_blocks = [];
      loadProject(JSON.stringify(arrange_data), true);
    }

    // Moving the playhead with arrow Keys. Holding Shift moves 1 bar at a time.
    if (e.which == rightKey && !($(':focus').hasClass('block-octave-change') || $(':focus').hasClass('tempo-input'))) {
      if (!playing) {
      e.preventDefault();
        if (event.shiftKey) {
          playhead_position += 8;
        }
        else {
          playhead_position += 0.5;
        }
      }
    }
    if (e.which == leftKey && !($(':focus').hasClass('block-octave-change') || $(':focus').hasClass('tempo-input'))) {
      if (!playing) {
        e.preventDefault();
      
        if (playhead_position >= 0.5) {
          if (event.shiftKey) {
            if (playhead_position >= 8) {
              playhead_position -= 8;
            }
            else {
              playhead_position = 0;
            }
          }
          else {
            playhead_position -= 0.5;
          }
        }
        else {
          playhead_position = 0;
        }
      }
    }
  movePlayhead();
  });

  $(document).bind('copy', copy).bind('paste', paste);

  $('#number-area').css({'height': '32px'});
  $('#number-canvas').attr('width', `${Math.min(30000, quarter_note_block_width*4*200)}px`).attr('height', $('#number-area').height());
//	.css({'top': $('#control-bar').height()})
  $('#grid-canvas').attr('width', $('#number-canvas').attr('width')).css({'height':'120px'}).attr('height', '120px');
//  $('#studio-body').css({'top': $('#control-bar').height()});
  $('#playhead-canvas').attr('width', $('#number-canvas').height()/2)
	.attr('height', '0px');

  $('#arrange-area').css({'top': $('#number-area').height()+$('#control-bar').height()});

  $('#load-project').click((() => {loadProject(sample_project, true)}));

  $('.tempo-change').on("click", (e) => {
    let clicked = $(e.currentTarget);
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

  $('.transpose-button').on("click", (e) => {
    let clicked = $(e.currentTarget);
    let increment = 1;
    if (clicked.attr('value') == "plus") {
      increment = 1;
    }
    else if (clicked.attr('value') == "minus") {
      increment = -1;
    }
    changeTransposeValue(increment)
  })

  $('#transpose-line-button').click(function(){
    transposeLine($('#lineSettingsModal').find('.transpose-value').text());
  })

  $('#SettingsButton').click(loadSettings);

  $('#lineSettingsModal').find('[data-target="#transpose-line"]').click(
    function() {
      $('#transpose-line-footer').addClass('show-footer').siblings().removeClass('show-footer');
    }
  )
  $('#lineSettingsModal').find('[data-target="#delete-line"]').click(
    function() {
      $('#delete-line-footer').addClass('show-footer').siblings().removeClass('show-footer');
    }
  )

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
        start: function(event, ui) {
          $('.inst-line, .inst-block').off('mouseenter mouseleave')
        },
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

  $('#number-canvas').click(numberCanvasClick);

  $('#download-wav').click(downloadWav);

  generateKeyDropdowns();
  getScale();

  generateAddLineDropdown();

  window.scrollTo({'top': '32'})

  $(window).scroll(function(event) {
    if ($(window).scrollTop() <= 32) {
      window.scrollTo({'top': '32'})
    }
  })

  loadProject(sample_project, true)

  zoomHorizontal(-1);
  zoomHorizontal(-1);

})


function playheadDragged(event, ui) {
  playhead_position = (parseFloat($(this).css('left')) - playhead_start_pos) / (quarter_note_block_width/2);
  $('.inst-line').hover(instLineHover, instLineHoverOut);
  $('.inst-block').hover(blockHover,blockHoverOut);
}


function numberCanvasClick(e) {
  if (!playing) {
    let posX = e.pageX-$(this).offset().left + playhead_start_pos;
    if (posX < 0) {
      posX = playhead_start_pos;
    }
    $('#playhead-canvas').css({'left': posX});
    newPlayheadPosition();
  }
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
                // 'grid-column-start': grid_start,
                'left': `${(grid_start-1) * quarter_note_block_width / 4}px`,
                // 'grid-column-end': grid_end,
                'width': `${new_length*quarter_note_block_width}px`
              }
            );
            block.attr('grid-column-start', grid_start);
            block.attr('length', new_length);
            block_obj['grid-start'] = grid_start;
            block_obj['grid-end'] = grid_end;
            block_obj['length'] = new_length;

            let i = parseInt(block.attr('position'));
            if (i+1 == line.children('.inst-block').length) {
              let line_obj = arrange_data['lines'][line_index];
              calculateLineLength(line_obj);
              // block.parents('.inst-line').find('.add-block').css({'grid-column-start': `${line_obj['grid-end']}`});
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
                  'left': `${(grid_start-1) * quarter_note_block_width / 4}px`,
                  // 'grid-column-end': grid_end,
                  'width': `${(grid_end-grid_start)*quarter_note_block_width/4}px`
                }
              );
              cur_block_obj['grid-start'] = grid_start;
              cur_block_obj['grid-end'] = grid_end;

              if (i+1 == line.children('.inst-block').length) {
                let line_obj = arrange_data['lines'][line_index];
                // line_obj['grid-end'] = grid_end;
                // line_obj['length'] = (line_obj['grid-end'] - line_obj['grid-start']) / 2;
                calculateLineLength(line_obj);
                // block.parents('.inst-line').find('.add-block').css({'grid-column-start': `${line_obj['grid-end']}`});
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
	.attr('position', line_no)
	.mousedown(lineMouseDown)
	.mouseup(lineMouseUp)
	.mousemove(lineMouseMove);
  let grid_width = quarter_note_block_width/4;
  // line.css({'grid-template-columns': `repeat(20000, ${grid_width}px)`});

  let add_button = $('<div/>').addClass('add-block').append($('<img/>').attr('src', 'https://img.icons8.com/ios-glyphs/30/000000/plus-math.png'))
  add_button.click(((inst, id) => {
    return function() {
      addblock(inst, id, false)
    }
  })(inst,id))
  line.append(add_button);

  if (from_load) {
    add_button.css({
      'grid-column-start': `${from_load['grid-end']}`,
      'left': `${(from_load['grid-end']-1) * quarter_note_block_width / 4}px`
    });
  }

  line.hover(instLineHover, instLineHoverOut);

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
	  .addClass('track-header-dropdown')
	  .html('<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 30 30" style=" fill:#000000;" class="track-header-dropdown-icon"><path d="M 15 4 A 3 3 0 0 0 12 7 A 3 3 0 0 0 15 10 A 3 3 0 0 0 18 7 A 3 3 0 0 0 15 4 z M 15 12 A 3 3 0 0 0 12 15 A 3 3 0 0 0 15 18 A 3 3 0 0 0 18 15 A 3 3 0 0 0 15 12 z M 15 20 A 3 3 0 0 0 12 23 A 3 3 0 0 0 15 26 A 3 3 0 0 0 18 23 A 3 3 0 0 0 15 20 z"></path></svg>')
	  .attr('data-toggle', 'dropdown')
	  .attr('aria-haspopup', 'true')
	  .attr('aria-expanded', 'false')
  );

  track_header.append(
	$('<div/>')
	.addClass('dropdown-menu')
	.addClass('dropdown-menu-end')
	.attr('aria-labelledby', 'dropdownMenuButton')
  );

  if (inst_data[inst].type == 'melodic'){
    track_header.find('.dropdown-menu').append(
	  $('<button/>')
	  .addClass('dropdown-item')
	  .text('Transpose Line')
	  .click(() => (showLineMenu(line)))
    )
  }
  track_header.find('.dropdown-menu').append(
	$('<button/>')
	.addClass('dropdown-item')
	.text('Delete')
	.click(() => (deleteLine(line)))	
  )

  track_header.hover(function (){
	  $(this).find('.track-header-dropdown').css({'display': 'flex'})
	}, 
	function (){
	  $(this).find('.track-header-dropdown').css({'display': 'none'})
	}
  );

  $('#track-list-grid').append(track_header)

  $('.track-header-dropdown-icon').css({'fill': theme_obj["del-line-color"]});

  if (!grid_drawn){
    $('#grid-canvas').attr('height', '120px');
    drawGrid('grid-canvas', quarter_note_block_width/4);
  }
  else {
    $('#grid-canvas').css({'width': $('#grid-canvas').attr('width'), 'height': ((line_no+1)*120) + 'px'})
  }

  return(line);
}

function instLineHover (){
  $(this).find('.add-block').css({'display': 'flex'})
}

function instLineHoverOut (){
  $(this).find('.add-block').css({'display': 'none'})
}


function showLineMenu(line) {
  line_to_edit = line.attr('id');
  $('#lineSettingsModal').modal('show');
  $('#lineSettingsModal').find('[data-target="#transpose-line"]').tab('show');
  $('#transpose-line-footer').addClass('show-footer').siblings().removeClass('show-footer');
}


function changeTransposeValue(increment) {
  let modal = $('#lineSettingsModal');
  let span = modal.find('.transpose-value');
  let old_value = parseInt(span.text());
  let new_value = old_value + increment;
  if (new_value > 0) {
    span.text('+' + new_value);
  }
  else {
    span.text(new_value);
  }
}


function transposeLine(increment){
  increment = parseInt(increment)
  $('#' + line_to_edit).find('.inst-block').each(function() {
    let line_index = parseInt($(this).parents('.inst-line').attr('position'));
    let block_index = parseInt($(this).attr('position'));
    let block_obj = arrange_data.lines[line_index].blocks[block_index];
    let block = $(this).attr('sound');
    let block_split = block.split('/');
    let value = block_split[block_split.length-1];
    let sound_type = block.split('/')[0];
    let chord_suffix = '';
    if (sound_type == 'chords') {
      if (value[value.length-1] == 'm') {
        chord_suffix = value[value.length-1];
        value = value.slice(0, -1);
      }
    }
    let old_octave = parseInt($(this).attr('octave'));
    let octave = old_octave;
    let note_index = keys.notes.indexOf(value);
    let new_note_index = (note_index + increment);
    if (new_note_index < 0) {
      octave -= Math.floor((-1*new_note_index)/keys.notes.length) + 1;
      new_note_index = keys.notes.length - (-1*new_note_index)%keys.notes.length;
    }
    if (new_note_index >= keys.notes.length) { 
      octave += Math.floor(new_note_index/keys.notes.length);
      new_note_index = new_note_index%keys.notes.length;
    }
    let new_note = keys.notes[new_note_index];
    let new_sound = sound_type + '/' + new_note + chord_suffix;
    block_obj.octave = octave;
    block_obj.sound = new_sound;
    $(this).find('.block-label').text(new_note + chord_suffix);
    $(this).find('.block-octave-span').text(octave);
    $(this).attr('sound', new_sound).attr('octave', octave)

    let oct_range = inst_data[$(this).attr('inst')][`range-${sound_type}`].split('-');
    let min_oct = parseInt(oct_range[0]);
    let max_oct = parseInt(oct_range[1]);

    if (octave > max_oct || octave < min_oct) {
      $(this).addClass('block-disabled');
    }
    else {
      $(this).removeClass('block-disabled');
    }
  })
}


function deleteLine(line) {
  line_to_edit = line.attr('id');
  $('#lineSettingsModal').modal('show');
  $('#lineSettingsModal').find('[data-target="#delete-line"]').tab('show');
  $('#delete-line-footer').addClass('show-footer').siblings().removeClass('show-footer');
}


function confirmDeleteLine() {
  let index = parseInt($('#'+line_to_edit).attr('position'));
  arrange_data['lines'].splice(index, 1);

  loadProject(JSON.stringify(arrange_data), true);  
  findNewTotalLength();
}


let mouse_down = false;
let selecting_started = false;
let select_start_x = 0;
let select_start_y = 0;

function lineMouseDown(e){
  if ($(e.target).hasClass('inst-block') || $(e.target).parents('.inst-block').length > 0) {
    return
  }
  mouse_down = true;
  select_start_x = e.pageX;
  select_start_y = e.pageY;
}

function lineMouseMove(e){
  if (mouse_down) {
    selecting_started = true;

    mouseX = e.pageX;
    mouseY = e.pageY;

    let count = 0;

    $('.inst-block').removeClass('block-selected');
    selected_blocks = [];

    $('.inst-block').each(
      function() {
        let x_start = $(this).offset().left;
        let y_start = $(this).offset().top;
        let x_end = $(this).width() + x_start;
        let y_end = $(this).height() + y_start;

        let selectX1 = Math.min(select_start_x, mouseX);
        let selectX2 = Math.max(select_start_x, mouseX);
        let selectY1 = Math.min(select_start_y, mouseY);
        let selectY2 = Math.max(select_start_y, mouseY);

        if ((x_start >= selectX1 && x_start <= selectX2) || (x_end >= selectX1 && x_end <= selectX2) || (x_end >= selectX2 && x_start <= selectX1)) {
          if ((y_start >= selectY1 && y_start <= selectY2) || (y_end >= selectY1 && y_end <= selectY2) || (y_end >= selectY2 && y_start <= selectY1)) {
            count +=1
            $(this).addClass('block-selected');
          }
        }
      }
    )
  }
}

function lineMouseUp(e){
  mouse_down = false;
  if (selecting_started) {
    $('.inst-block.block-selected').each(
      function() {
        selected_blocks.push($(this));
      }
    )
  }
  selecting_started = false;
}


function copy() {
  clipboard = [];
  $('.block-selected').each(function(){
    clipboard.push($(this));
    // console.log($(this).attr('length'))
  })
}

function paste() {
  let playhead_grid = Math.round(playhead_position * 2) + 1;
  let copy_buffer_grid_start = 1000000;
  
  // Organise all of the selected blocks into a
  // dictionary of arrays, one key-pair for each line
  let blocks = {};
  for (i = 0; i < clipboard.length; i++) {
    let block = clipboard[i];
    let inst_line = block.parents('.inst-line');
    let line_id = inst_line.attr('id');
    if (!(line_id in blocks)) {
      blocks[line_id] = [];
    }
    blocks[line_id].push(block);

    let block_grid_start = parseInt(block.css('grid-column-start'));
    console.log(block_grid_start);
    copy_buffer_grid_start = Math.min(block_grid_start, copy_buffer_grid_start);
  }

  // Update arrange_data

  for (line_id in blocks) {
    let line_index = parseInt($(`#${line_id}`).attr('position'));
    let line_obj = arrange_data.lines[line_index];
    let line_blocks = blocks[line_id];
    line_blocks.sort((a, b) => parseInt($(a).css('grid-column-start')) - parseInt($(b).css('grid-column-start')));
    let line_grid_start = $(line_blocks[0]).css('grid-column-start');

    for (i = 0; i < line_blocks.length; i++) {
      let block = $(line_blocks[i]);
      let old_block_index = parseInt(block.attr('position'));
      let old_block_obj = line_obj.blocks[old_block_index];
      let old_grid_start = parseInt(old_block_obj['grid-start']);
      let old_grid_end = parseInt(old_block_obj['grid-end']);
      let length = block.attr('length');
      let octave = block.attr('octave');
      let sound = block.attr('sound');

      let new_grid_start = (old_grid_start - copy_buffer_grid_start) + playhead_grid;
      console.log(old_grid_start, copy_buffer_grid_start, playhead_grid);
      let new_grid_end = (old_grid_end - old_grid_start) + new_grid_start;

      let block_obj = {
          'grid-end': parseInt(new_grid_end),
          'grid-start': parseInt(new_grid_start),
          'length': parseFloat(length),
          'name': '',
          'sound': sound
      }

      if (octave) {
        block_obj.octave = octave;
      }

      line_obj.blocks.push(block_obj);

      // line_obj['grid-end'] = Math.max(line_obj['grid-end'], new_grid_end);
      // line_obj['length'] += length * 2;
      calculateLineLength(line_obj);
    }

    line_obj['blocks'].sort((a, b) => parseInt(a['grid-start']) - parseInt(b['grid-start']));
  }


  // Redraw the page with the updated data
  findNewTotalLength();
  loadProject(JSON.stringify(arrange_data, true));
  selected_blocks = [];
}


function blockDragged(event, ui) {
  dragging_started = false;

  for (block_index in selected_blocks) {
    let this_block = selected_blocks[block_index];
    let line_pos = parseInt(this_block.parent().attr('position'));
    let block_obj = arrange_data['lines'][line_pos]['blocks'][parseInt(this_block.attr('position'))];
    let old_start = parseInt(block_obj['grid-start']);
    let old_end = parseInt(block_obj['grid-end']);
    let displacement = parseFloat(this_block.css('left')) - ((old_start - 1) * quarter_note_block_width/4);
    let grid_displacement = Math.round(parseFloat(displacement)/(quarter_note_block_width/4));
    let grid_start = old_start + grid_displacement;
    let grid_end = old_end + grid_displacement;

    // this_block.css({'grid-column-start': grid_start, 'left': '0px'});
    // block_obj['grid-start'] = grid_start;
    // block_obj['grid-end'] = grid_end;

    // console.log(`old ${old_start} ${old_end}, new ${block_obj['grid-start']} ${block_obj['grid-end']}, from ${grid_displacement}`)
    let line_div = this_block.parent();
    let line_obj = arrange_data['lines'][parseInt(line_div.attr('position'))];
    
    calculateLineLength(line_obj);
  }

  for (i = 0; i < arrange_data.lines.length; i++) {
    let line_obj = arrange_data.lines[i];
    line_obj['blocks'].sort((a, b) => parseInt(a['grid-start']) - parseInt(b['grid-start']));
    // console.log(line_obj)
  }

  findNewTotalLength();
  loadProject(JSON.stringify(arrange_data, false));
  selected_blocks = [];
}


function blockDragging(event, ui) {
  dragging_started = true;
  let this_block = $(event.target)

  let this_block_pos = parseInt(this_block.attr('position'));
  let this_line_pos = parseInt(this_block.parents('.inst-line').attr('position'));
  let this_block_obj = arrange_data.lines[this_line_pos].blocks[this_block_pos];
  let this_old_pos = (this_block_obj['grid-start'] - 1) * quarter_note_block_width / 4;

  let displacement = ui.position.left - this_old_pos;

  if (Math.abs(displacement % (quarter_note_block_width/4) < 15) && (this_old_pos !== parseFloat(this_block.css('left')))) {
    console.log(this_old_pos, this_block.css('left'))
    for (block_index in selected_blocks) {
      let block = selected_blocks[block_index];
      let block_pos = parseInt(block.attr('position'));
      let line_pos = parseInt(block.parents('.inst-line').attr('position'));
      let block_obj = arrange_data.lines[line_pos].blocks[block_pos];
      let old_pos = (block_obj['grid-start'] - 1) * quarter_note_block_width / 4;

      block.css({'left': `${parseFloat(block.css('left')) + displacement}px`});

      let grid_displacement = displacement / (quarter_note_block_width / 4);

      block_obj['grid-start'] += grid_displacement;
      block_obj['grid-end'] += grid_displacement;
    }
  // this_block_obj['grid-start'] = this_block_obj['grid-start'] + displacement / (quarter_note_block_width / 4);
  }
}


var dragging_started = false;
var block_clicked;

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
                drag: blockDragging,
		stop: blockDragged,
		'cursor': 'move'
	})
	.css({'position': 'absolute'});

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
  let width = parseFloat(block.attr('length'));

  if (from_load) {
    grid_start = block_data_obj['grid-start'];
  }

  else {
    let line_length = line_obj['blocks'].length;
    if (index > 0) {
      grid_start = line_obj['blocks'][line_length-1]['grid-end'];
    }
  }
  grid_end = grid_start + 4;
  
  block.css({
    'grid-column-start': grid_start,
    'left': `${(grid_start-1) * quarter_note_block_width / 4}px`,
    'width': `${width * quarter_note_block_width}px`
  });

  block_obj['grid-start'] = grid_start;
  block_obj['grid-end'] = grid_end;

  // Click Functionality
  block.on('mouseup', function(e) {
    if (selecting_started || dragging_started) { 
      return
    }

    if ($(this).hasClass('block-selected')) {
      $('.inst-block').removeClass('block-selected');
      selected_blocks = [];
    }

    else {
      $('.inst-block').removeClass('block-selected'); 
      selected_blocks = [];
      $(this).addClass('block-selected')
      selected_blocks.push($(this));
    }
  });


/*
  block.on('mousedown', function(e) {
    $('.inst-block').removeClass('block-selected');
    selected_blocks = [];
    block_clicked = null;
    if (!($(this).hasClass('block-selected'))) {
      $(this).addClass('block-selected');
      block_clicked = $(this)[0];
      selected_blocks.push($(this));
    }
  })

  block.on('mouseup', function(e) {    
    if (block_clicked == $(this)[0]) {
      block_clicked = null;
      return
    }
    if (selecting_started) {
      return
    }
    if ($(this).hasClass('block-selected')) {
      selected_blocks = [];
    }
    $('.inst-block').removeClass('block-selected');
  })
*/

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

  block.hover(blockHover, blockHoverOut);

  block.css({backgroundColor: theme_obj['block-'+line_obj['color']]});
  block.css({'box-shadow': '0 0 20px ' + theme_obj['block-'+line_obj['color']+'-highlight']});

  let octave_span = null;
  let octave_input = null;
  if (inst_data[inst].type == 'melodic') {
    octave_span = $('<span/>').addClass('block-octave-span').css({'order': '10'}).text('2')
	  .click(function() {
	    $(this).siblings('.block-octave-change').show().focus().select().val($(this).text()).attr('value', $(this).text()).width($(this).width())
	    $(this).hide()
	  });

    if (from_load) {
      octave_span.text(block_data_obj.octave);
      block.attr('octave', block_data_obj.octave);
    }

    octave_input = $('<input/>').attr('type', 'number').addClass('block-octave-change').css({'order': '10'})
    .attr('step', '1')
    .keyup(function(e){
      if (e.which == 13) {
        e.preventDefault();
        $(this).blur();
      }
    }).on('blur', function(){
        $(this).hide();
        let input_val = parseFloat($(this).val());
        if (input_val !== parseInt($(this).val())) {
          $(this).siblings('.block-octave-span').show();
          $(this).val($(this).siblings('.block-octave-span').text()).attr('value', $(this).siblings('.block-octave-span').text())
          return
        }
        if (input_val < parseInt($(this).attr('min'))) {
          $(this).siblings('.block-octave-span').show();
          $(this).val($(this).attr('min')).attr('value', $(this).attr('min'));
          $(this).siblings('.block-octave-span').text($(this).val());
          return
        }
        if (input_val > parseInt($(this).attr('max'))) {
          $(this).siblings('.block-octave-span').show();
          $(this).val($(this).attr('max')).attr('value', $(this).attr('max'));
          $(this).siblings('.block-octave-span').text($(this).val());
          return
        }

        $(this).parent('.inst-block').attr('octave', input_val).removeClass('block-disabled');

        let line_index = parseInt($(this).parents('.inst-line').attr('position'));
        let block_index = parseInt($(this).parents('.inst-block').attr('position'));
        arrange_data.lines[line_index].blocks[block_index].octave = input_val;

        $(this).siblings('.block-octave-span').show();
        $(this).siblings('.block-octave-span').text($(this).val());

        let line = $(this).parents('.inst-line');

        block.attr('sound', block.attr('sound').split('-')[0]);
        arrange_data['lines'][parseInt(line.attr('position'))]['blocks'][parseInt(block.attr('position'))]['sound'] = block.attr('sound');
      });

    block.append(octave_span);
    block.append(octave_input);
  }

  let chord_symbol = $('<img/>').attr('src', 'https://img.icons8.com/fluency-systems-filled/20/000000/layers.png').addClass('block-chord-symbol');

  if (from_load) {
    let sound = line_obj['blocks'][index]['sound'].split('/');
    block.attr('sound', sound);
    block.append($('<div/>').addClass('block-label').text(sound[sound.length-1].split('-')[0]))
    block.attr('title', sound)

    if (sound !== ['']) {
      if (inst_data[inst].type == 'melodic') {
        octave_span.css({'display': 'block'});
      }
    }
   
    if (sound[0] == 'chords') { 
      chord_symbol.css({'display': 'block'});
    }
  }

  block.append(chord_symbol);

  inst_line.append(block);

  if (!from_load) {
    block = $('#' + block_id)

    block_obj['sound'] = '';
    block_obj["name"] = inst + index.toString();
    block_obj["length"] = 1;

    if (inst_data[inst]['type'] == 'melodic') {
      block_obj['octave'] = 2;
    }
    else {
      block_obj['octave'] = null;
    }

    let notes_modal = $("#noteModal .modal-body")
    loadNoteModal(block);

    $('#noteModal').modal('show');
  
    line_obj["blocks"].push(block_obj);

    calculateLineLength(line_obj);

    block.parents('.inst-line').find('.add-block').css({'grid-column-start': `${line_obj['grid-end']}`, 'left': `${(line_obj['grid-end']-1) * quarter_note_block_width / 4}px`});

    findNewTotalLength();
  }
}

function blockHover() {
  $(this).find('.block-del').css({'display': 'flex'})
}

function blockHoverOut() {
  $(this).find('.block-del').css({'display': 'none'})
}


function loadNoteModal(block) {
  let current_octave = null;
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

    if (inst_data[block.attr('inst')].type == 'melodic') {
      current_octave = 2;
      let oct_change_div = $('<div/>').addClass('note-selector-octave-div');

      let octave_span = $('<span/>').css({'color': 'white', 'font-size': '21.5px'});

      let range = inst_data[block.attr('inst')]['range-'+section].split('-');
      let min = parseInt(range[0]);
      let max = parseInt(range[1]);      
      if (block.attr('sound')) {
        let block_oct = parseInt(block.attr('octave'));
        if (block_oct > max) {
          octave_span.text(max);
        }
        else if (block_oct < min) {
          octave_span.text(min);
        }
        else {
          octave_span.text(block.attr('octave'));
        }
      }
      else {
        octave_span.text('2');
      }
      container.attr('octave', octave_span.text());

      let minus_div = $('<div/>').addClass('note-selector-octave-change-div')
	.html('<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><g class="tempo-change-path" fill="#ffffff" style="fill: rgb(255, 255, 255);"><path d="M21.5,78.83333v14.33333h129v-14.33333z"></path></g></g></svg>')
	.on('click', (e) => {
	  let new_oct = parseInt(octave_span.text())-1;
          let min = parseInt(inst_data[block.attr('inst')]['range-' + $(e.target).parents('.tab-pane').attr('id').split('-')[1]].split('-')[0]);
	  if (new_oct >= min) {
	    octave_span.text(new_oct);
	    $(e.target).parents('.tab-pane').attr('octave', new_oct);
            $('#noteModal').find('.note-button').each(
              function() {
                $(this).css({'border-color': '#767676'});
                if (block.attr('octave') == $(this).parents('.tab-pane').attr('octave')) {
                  if (block.attr('sound') == $(this).attr('value')) {
                    $(this).css({'border-color': 'blue'});
                  }
                }
              }
            );
	  }
	});
      let plus_div = $('<div/>').addClass('note-selector-octave-change-div')
	.html('<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><g class="tempo-change-path" fill="#ffffff" style="fill: rgb(255, 255, 255);"><path d="M78.83333,21.5v57.33333h-57.33333v14.33333h57.33333v57.33333h14.33333v-57.33333h57.33333v-14.33333h-57.33333v-57.33333z"></path></g></g></svg>')
	.on('click', (e) => {
	  let new_oct = parseInt(octave_span.text())+1;
          let max = parseInt(inst_data[block.attr('inst')]['range-' + $(e.target).parents('.tab-pane').attr('id').split('-')[1]].split('-')[1]);
	  if (new_oct <= max) {
	    octave_span.text(new_oct);
	    $(e.target).parents('.tab-pane').attr('octave', new_oct);
            $('#noteModal').find('.note-button').each(
              function() {
                $(this).css({'border-color': '#767676'});
                if (block.attr('octave') == $(this).parents('.tab-pane').attr('octave')) {
                  if (block.attr('sound') == $(this).attr('value')) {
                    $(this).css({'border-color': 'blue'});
                  }
                }
              }
            );
	  }
	});
      oct_change_div.append(minus_div);
      oct_change_div.append(octave_span);
      oct_change_div.append(plus_div);
      container.append(oct_change_div);
    }


    let buttons_area = $('<div/>').addClass('row').addClass('justify-content-around').addClass('button-row');

    Object.entries(sounds[section]).forEach(function ([sound, file], index) {

      if (inst_data[block.attr('inst')].type == 'melodic') {
        if (parseInt(sound.slice(-1)) !== current_octave) {
          return
        }
      }

      let button = $('<div/>').addClass('col-5')
				 .attr('value', section+'/'+sound)
				 .html(sound.split('-')[0])
				 .addClass('note-button')
				 .css({'background': theme_obj['note-select-button-color'], 'color': theme_obj['text-color']})

      if (inst_data[block.attr('inst')].type == 'melodic') {
        button.attr('value', section+'/'+sound.split('-')[0])
      }

      try {
        if (block.attr('sound') == button.attr('value') && block.attr('octave') == $('#noteModal').attr('octave')) {
          button.css({'border-color': 'blue'});
        }
      } catch (error) {}

      if (Number.isInteger((index+1)/2)) {
        button.addClass('align-self-end')
      }
      else {
        button.addClass('align-self-start')
      }

      // Highlight button if it is part of the scale
      if (section == 'chords') {
        // Get the chord name as per convention: <root_note>-<type>
        let chord_type = 'major';
        let chord = sound.split('-')[0];
        let suffix = chord.slice(-1);
        if (suffix == 'm') {
          chord = chord.slice(0, -1);
          chord_type = 'minor';
        }
        let chord_name = chord + '-' + chord_type;

        // Check if chord is in the scale_chords and add highlight class
        if (scale_chords.includes(chord_name)) {
          button.addClass('highlight');
        }
      }
      if (section == 'notes') {
        if (scale_notes.includes(sound.split('-')[0])) {
          button.addClass('highlight');
        }
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
                modal_body.find(".note-button").css({'border-color': '#767676'});
                $(this).css({'border-color': 'blue'});
                let old_value = $(this).attr('value');
//                $(this).attr('value', old_value);

                block.removeClass('block-disabled');

                block.attr("sound", $(this).attr("value"));
                block.find('.block-label').remove()
                let val = sound.split('/');
                block.append($('<div/>').text(val[val.length-1].split('-')[0]).addClass('block-label'));
                let block_obj = arrange_data['lines'][line_index]["blocks"][parseInt(block.attr('position'))]
                block_obj.sound = $(this).attr("value");
                block_obj.octave = $(this).parents('.tab-pane').attr('octave');
                block.attr('octave', $(this).parents('.tab-pane').attr('octave'));
                block.find('.block-octave-span').text($(this).parents('.tab-pane').attr('octave'));

                if (inst_data[block.attr('inst')].type == 'melodic') {
                  block.find('.block-octave-span').show()
                  let inst = block.parent('.inst-line').attr('id').split('-')[0];
                  let sound_type = block.attr('sound').split('/')[0];
                  let min = parseInt(inst_data[inst]['range-' + sound_type].split('-')[0]);
                  let max = parseInt(inst_data[inst]['range-' + sound_type].split('-')[1]);
                  block.find('.block-octave-change').attr('min', min).attr('max', max);

                }

                if ($(this).attr("value").split('/')[0] == 'chords') {
                  block.find('.block-chord-symbol').show();
                }
                else {
                  block.find('.block-chord-symbol').hide();
                }
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
              let sound = $(this).parent().attr('value') + '-' + $(this).parents('.tab-pane').attr('octave'); 
              levels = sound.split('/');
              let instrument_tree = bufferlist[modal_body.attr('inst')];
              let buffer = instrument_tree;
              // The buffers are kept as a tree of dictionaries, and the levels are a '/' separated
              // path in this tree. Example: 'Notes/A'
              for (level = 0; level < levels.length; level++) {
                key = levels[level];
                buffer = buffer[key];
              }
              newGlobalContext();
              playAuditionSound(buffer, globalcontext.currentTime, globalcontext.currentTime + 1000, 1);
            }
          )
        })()
      )
    }
  )
}

function deleteBlock(block, single=true) {
  let line_index = parseInt(block.parents('.inst-line').attr('position'));
  let block_index = parseInt(block.attr('position'));
  let line_data = arrange_data['lines'][line_index];
  let blocks = line_data['blocks'];
  blocks[block_index]['to_delete'] = true;
  let old_line_length = line_data['length'];
  if (block_index == blocks.length-1) {
    line_data['length'] = line_data['length'] - (parseInt(block.attr('length')) * 2)
    
    if (block_index == 0) {
      line_data['grid-end'] = 1;
    }
    else {
      line_data['grid-end'] = blocks[block_index-1]['grid-end'];
    }
  }

  updateLengths();

  if (single) {
    loadProject(JSON.stringify(arrange_data, false));
  }
}

function updateLengths() {
  let lines = arrange_data['lines'];
  for (i = 0; i < lines.length; i++) {
    line_data = lines[i];
    grid_end = line_data['grid-start'];
    blocks = line_data['blocks'];
    if (blocks.length !== 0) {
      grid_end = blocks[blocks.length-1]['grid-end'];
    }
    length = (grid_end-1)/2;

   line_data['grid-end'] = grid_end;
   line_data['length'] = length;
  }

  findNewTotalLength();
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
  $('#block').css({'background-color': theme_obj['studio-background']})
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
  
  $('.key-change').css({'color': theme_obj['text-color']});

  $('.track-header-dropdown-icon').css({'fill': theme_obj["del-line-color"]});

  $('#number-area').css({'background-color': theme_obj['studio-background']});
  $('#download-svg-path').css({'fill': theme_obj["del-line-color"]});
  drawNumbers('number-canvas', quarter_note_block_width/4);
}


function generateKeyDropdowns() {
  keys['notes'].forEach((note) => {
    let button = $('<button/>');
    button.addClass('dropdown-item').attr('id', note)
    .bind("click", function() {
	  changeKeyNote($(this))
	}
    )
    .html(note).attr('value', note);

    if (note == "C") {
      button.addClass('active')
    }

    $('#key-note-options').append(button);
  })


  console.log(keys['types'])

  for(let type in keys['types']) {
    let button = $('<button/>');
    button.addClass('dropdown-item').attr('id', type)
    .bind("click", function() {
	  changeKeyType($(this))
	}
    )
    .html(capitalize(type)).attr('value', type);

    if (type == "major") { 
      button.addClass('active')
    }
    $('#key-type-options').append(button);
  }
}


function changeKeyNote(button) {
  $('#key-note-options').find('button').removeClass('active')
  button.addClass('active')
  $('#keyNoteChangeButton').html(button.attr('value'))
  scale.splice(0, 1, button.attr('value'));
  getScale();
}


function changeKeyType(button) {
  $('#key-type-options').find('button').removeClass('active')
  button.addClass('active')
  $('#keyTypeChangeButton').html(button.attr('value'))
  scale.splice(1, 1, button.attr('value'));
  getScale();
}


function getScale() {
  scale_notes = [];
  scale_chords = [];
  let root_note = scale[0];
  let type = scale[1];
  let scale_form = keys['types'][type]['notes'];
  let chord_form = keys['types'][type]['chords'];
  let note_index = keys['notes'].indexOf(root_note);
  let pos = 0;
  let all_notes = keys['notes'];
  scale_form.forEach((interval => {
    note_index += interval;
    note_index = note_index % all_notes.length;
    let note = all_notes[note_index];
    scale_notes.push(note);

    let chord = note + '-' + chord_form[pos];
    scale_chords.push(chord);
    pos += 1;
  }))

  console.log(scale);
  console.log(scale_chords);
}


function transposeToScale() {
  return
}


function generateAddLineDropdown() {
  for (let inst in inst_data) {
    let button = $('<button/>');
    button.addClass('dropdown-item')
	.bind("click", function() {
	  addLine(inst)
	})
	.html(capitalize(inst));
    $('#add-inst-dropdown-menu').append(button);
  }
}


function zoomHorizontal(type) {
  let growth_factor = 1;
  if (type > 0) {
    growth_factor = 8/6;
    width_index += 1;
  }
  else {
    growth_factor = 3/4;
    width_index -= 1;
  }
  quarter_note_block_width = growth_factor*quarter_note_block_width;

  resizeHorizontal();
}


function calculateLineLength(line_obj) {
  let blocks = line_obj.blocks;
  let grid_end = 1;
  for (index in blocks) {
    block = blocks[index];
    if (block['grid-end'] > grid_end) {
      grid_end = block['grid-end'];
    }
  }
  line_obj['grid-end'] = grid_end;
  line_obj['length'] = (grid_end - 1) / 2;
}


function clearPage() {
  loadProject(empty, true);

}
