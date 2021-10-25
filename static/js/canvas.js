let grid_drawn = false;
let playhead_start_pos = 0;

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

  grid_drawn = true;
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
      context.fillStyle = theme_obj['text-color'];
      context.fillText((x / (16*grid_width) + 1).toString(), x + 3, height-5);
    }
    else if (x % 8 == 0) {
      context.strokeStyle = '#bbbbbb';
      context.moveTo(x, height/2);
      context.lineTo(x, height);
    }
    else if (x % 4 == 0) {
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
  canvas.css({
          'top': $('#number-canvas').height()*-1,
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


function updatePlayheadPos() {
  let cur_time = globalcontext.currentTime;
  let current_play_position = cur_time-play_start_time;
  if (current_play_position <= fullBuffer.duration - playhead_position * eighthNoteTime && playing) {
    let playhead = $('#playhead-canvas');
    let new_pos = (playhead_position * quarter_note_block_width/2) + playhead_start_pos + (cur_time / eighthNoteTime) * quarter_note_block_width;
    playhead.css({'left': new_pos}); 
    window.requestAnimationFrame(updatePlayheadPos);
  }
  else {
    roundPlayhead()
  }
  console.log(playhead_position)
}


function roundPlayhead() {
  playhead_position = Math.round((parseFloat($('#playhead-canvas').css('left'))-192)/quarter_note_block_width/4)/2;
  $('#playhead-canvas').css({'left': (playhead_position*quarter_note_block_width/2)+playhead_start_pos});
}
