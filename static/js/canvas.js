let grid_drawn = false;
let playhead_start_pos = 0;
let grid_lines_width = 25;


function closest(l, needle) {
  return l.reduce((a, b) => {
    return Math.abs(b - needle) < Math.abs(a - needle) ? b : a;
  })
}


function drawGrid(canvas_id, grid_width){
  let canvas = $('#' + canvas_id);

  canvas.css("display", "block");

  if (width_index < 0) {
    let width_options = [];
    for (x = width_index; x < 0; x++) {
      width_options.push(grid_width / Math.pow(2, x));
    }
    grid_width = closest(width_options, 25)
  }

  grid_lines_width = grid_width;

  let height = canvas.height();
  let width = canvas.width();

  let context = canvas[0].getContext('2d');
  context.clearRect(0, 0, width, height);

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

  grid_drawn = true;
}


function drawNumbers(canvas_id, grid_width){
  let canvas = $('#' + canvas_id);

  let height = canvas.height();
  let width = canvas.width();

  let context = canvas[0].getContext('2d');
  context.clearRect(0, 0, width, height);

  for (var i = 0; i <= 200*16; i += 1) {
    let x = i * grid_lines_width;
    let context = canvas[0].getContext('2d');
    context.beginPath();
    context.strokeStyle = 'lightgray';
    context.lineWidth = 1;
    context.font = '15px serif';


    if (width_index >= 0 && Math.abs(x - grid_lines_width*i) >= 0.001) {
      continue
    }
/*
    if (x %grid_lines_width) {
      console.log(i, x)
    }

    if (width_index < 0 && (x % grid_lines_width !== 0)) {
      continue
    }
*/
  
    let grid_no = x / grid_width

    if ((grid_no) % 16 == 0 || i == 0) {
      context.strokeStyle = '#999999';
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.fillStyle = theme_obj['text-color'];
      context.fillText(Math.round((grid_no / 16 + 1)).toString(), x + 3, height-5);
    }
    else if ((grid_no) % 8 == 0) {
      context.strokeStyle = '#bbbbbb';
      context.moveTo(x, height/2);
      context.lineTo(x, height);
    }
    else if ((grid_no) % 4 == 0) {
      context.strokeStyle = '#bbbbbb';
      context.moveTo(x, height*2/3);
      context.lineTo(x, height);
    }
    context.stroke();
  }
}


function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.arcTo(x, y + height, x + radius, y + height, radius);
  ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
  ctx.arcTo(x + width, y, x + width - radius, y, radius);
  ctx.arcTo(x, y, x, y + radius, radius);
  ctx.fill();
}


function drawPlayhead() {
  let canvas = $('#playhead-canvas');

  let left = parseFloat($('#arrange-area').css('padding-left'))-(canvas.attr('width')/2);
  left = parseFloat($('#number-area').css('padding-left'))-8;
  canvas.css({
//          'top': $('#number-canvas').height()*-1,
          'left': left
        });

  playhead_start_pos = left;

  let height = parseFloat($('#studio-body').height()) + parseFloat($('#number-canvas').height());
  canvas.attr('height', height + 'px');
  width = parseFloat(canvas.attr('width'));

  let ctx = canvas[0].getContext('2d');
  ctx.fillStyle = "blue";
  roundedRect(ctx, 0, 0, width, width, 1);
//  ctx.fillRect(0, 0, 25, 25);


  ctx.beginPath();
  ctx.moveTo(0, width);
  ctx.lineTo(width, width);
  ctx.lineTo(width/2, width*2);
  ctx.fill();

  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width/2, 0);
  ctx.lineTo(width/2, height);
  ctx.stroke();
  ctx.closePath();
}

var old_playhead_pos = 0;
function updatePlayheadPos() {
  let cur_time = globalcontext.currentTime;
  let current_play_position = cur_time-play_start_time;
  if (current_play_position <= fullBuffer.duration - playhead_position * eighthNoteTime && playing) {
    let playhead = $('#playhead-canvas');
    let new_pos = (playhead_position * quarter_note_block_width/2) + playhead_start_pos + (current_play_position / eighthNoteTime) * quarter_note_block_width/2;
    playhead.css({'left': new_pos});
    old_playhead_pos = new_pos;
    if (new_pos >= 0.5*window.innerWidth) {
    }
    window.requestAnimationFrame(updatePlayheadPos);
  }
  else {
    playhead_position = (parseFloat($('#playhead-canvas').css('left'))-playhead_start_pos)/(quarter_note_block_width/2);
  }
}


function roundPlayhead() {
  playhead_position = Math.round((parseFloat($('#playhead-canvas').css('left'))-playhead_start_pos)/(quarter_note_block_width/4))/2;
  $('#playhead-canvas').css({'left': (playhead_position*quarter_note_block_width/2)+playhead_start_pos});
}


function movePlayhead() {
  $('#playhead-canvas').css({'left': (playhead_position*quarter_note_block_width/2)+playhead_start_pos});
}

function newPlayheadPosition() {
  playhead_position = (parseFloat($('#playhead-canvas').css('left'))-playhead_start_pos)/(quarter_note_block_width/2);
  $('#playhead-canvas').css({'left': (playhead_position*quarter_note_block_width/2)+playhead_start_pos});
}
