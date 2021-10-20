var tempo = 120; // BPM (beats per minute)
var eighthNoteTime;
var seqInterval;

function play_line(line, line_start_time, index){

  let inst = line["inst"];
  let blocks = line["blocks"];
  let prev_time = line_start_time;
  let instrument_tree = bufferlist[inst];
  let end_time = 0;
  for (var i = 0; i < blocks.length; i++) {
    block = blocks[i];
    levels = block['sound'].split('/');
    let buffer = instrument_tree;
    // The buffers are kept as a tree of dictionaries, and the levels are a '/' separated
    // path in this tree. Example: 'Notes/A'
    for (level = 0; level < levels.length; level++) {
      key = levels[level];
      buffer = buffer[key];
    }

//    console.log("Block:" + i + " currentTime: " + context.currentTime)
    if (i==0) {
      end_time = line_start_time + eighthNoteTime * 2 * block["length"];
      playSound(buffer, line_start_time, end_time);
    }
    else {
      let start_time = prev_time + eighthNoteTime * 2 * blocks[i-1]["length"];
      end_time = start_time + eighthNoteTime * 2 * block["length"];
      playSound(buffer, start_time, end_time);
      prev_time = start_time;
    }
  }
  return(end_time - line_start_time)
}

var audioBuffer = null;
var playing = false;
var position = 0;
var loop = true;

function playSequence(start_time) {
  let seq_length = 0;
  for (i = 0; i < arrange_data['lines'].length; i++){
    let line = arrange_data['lines'][i];
    let length = play_line(line, start_time, i);
    if (length > seq_length) {
      seq_length = length;
    }
  }
  return(seq_length)
}

function play () {
  playing = true;
  eighthNoteTime = (60 / tempo) / 2;
  let cur_time = context.currentTime;

  let length = playSequence(cur_time) * 1000;
  seqInterval = setInterval(() => {  playSequence(context.currentTime); }, length);
  setTimeout(() => {  clearInterval(seqInterval); seqInterval = null; playing = false;}, length*4);
}

function playSound(buffer, time, end_time) {
//  console.log("start: " + time, "end: " + end_time)

  let source = context.createBufferSource();
  let gainNode = context.createGain();
  gainNode.gain.value = 1;
  source.buffer = buffer;
  source.connect(gainNode);
//  visualiseData(source, gainNode, $('#visualise-canvas'));
  gainNode.connect(context.destination);
  
  gainNode.gain.setValueCurveAtTime([1, 0.3, 0], end_time, 0.1);
//  console.log("current in_Play: " + context.currentTime)

  source.start(time);
  source.stop(end_time+0.1);
}

function pauseSound() {
  playing = false;
  context.close();
  context = new AudioContext();
  if (seqInterval) {
    clearInterval(seqInterval);
    seqInterval = null;
  }
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
      if (playing) {
        pauseSound();
      }
      else {
        play();
      }
    }
  })


  $('#tempo-input').hide()
  $('#tempo-span').click(function(){
    $('#tempo-input').show().focus().select().attr('value', $(this).text()).width($('#tempo-span').width())
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
      arrange_data['tempo'] = tempo;
    })

})
