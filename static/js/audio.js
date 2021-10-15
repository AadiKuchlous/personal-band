var tempo = 120; // BPM (beats per minute)
var eighthNoteTime;

function play_line(line, line_start_time, index){

  let inst = line["inst"];
  let blocks = line["blocks"];
  let prev_time = line_start_time;
  for (var i = 0; i < blocks.length; i++){
    block = blocks[i];
    let buffer = bufferlist[inst];
    levels = block['sound'].split('/')
    for (level = 0; level < levels.length; level++) {
      key = levels[level]
      buffer = buffer[key]
    }

    if (i==0) {
      playSound(buffer, line_start_time);
    }
    else {
      let start_time = prev_time + eighthNoteTime * 2 * blocks[i-1]["length"];
      playSound(buffer, start_time);
      prev_time = start_time;
    }
  }
}

var audioBuffer = null;
var playing = false;
var position = 0;

function playSequence() {
  eighthNoteTime = (60 / tempo) / 2;  
  console.log(bufferlist);
  let cur_time = context.currentTime;

  for (i = 0; i < arrange_data.length; i++){
    let line = arrange_data[i];
    play_line(line, cur_time, i);
  }
}

function playSound(buffer, time) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(time);
}

function pauseSound() {
  context.close();
  context = new AudioContext();
}


$(document).ready(function(){
  $(this).keydown(function(e) {
    if(e.which == 32) {
      e.preventDefault();
    }
  });


  $(this).keyup(function (e) {
    code = e.which
    if (code == 32) {
      if (e.stopPropagation) {
        e.stopPropagation();
        e.preventDefault();
      }
      playSequence()
    }
  })


  $('#tempo-input').hide()
  $('#tempo-span').click(function(){
    $('#tempo-input').show().focus().select().attr('value', $(this).text())
    $(this).hide()
  })
  $('#tempo-input').keyup(function(e){
    if (e.which == 13) {
      e.preventDefault();
      $(this).blur()
    }
  }).on('blur', function(){
      $(this).hide()
      tempo = $(this).val()
      $('#tempo-span').show().text(tempo)
    })

})
