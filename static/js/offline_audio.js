var tempo = 120; // BPM (beats per minute)
var eighthNoteTime;
var loopInterval;
var playing = false;
var position = 0;
var loop = true;
var globalcontext = new AudioContext();
var globalOfflineContext;
var line_buffers = {};
var seq_length = 0;
var lines_loaded = 0;
var total_lines = 0;
var waiting_for_download;
var play_start_time = 0;
var fullBuffer = null;
var previous_arrange_data;
var stop_timeout;
var prev_time_test = 0;

function newGlobalContext() {
  eighthNoteTime = (60 / tempo) / 2;
  globalOfflineContext = new OfflineAudioContext({
    numberOfChannels: 2,
    length: 44100 * arrange_data['length'] * eighthNoteTime,
    sampleRate: 44100
  });
  globalcontext.close();
  globalcontext = new AudioContext();
}

function stopSound() {
  pause();
  playhead_position = 0;
  if (loopInterval) {
    clearInterval(loopInterval);
    loopInterval = null;
  }
}


function pause() {
  playing = false;
  newGlobalContext();
  clearTimeout(stop_timeout);
//  playhead_position = 0;
}


function play () {
//  console.log(performance.now());
//  prev_time_test = performance.now();

  playing = true;
  newGlobalContext();
  let cur_time = globalcontext.currentTime;

  if (previous_arrange_data !== JSON.stringify(arrange_data)) {
    eighthNoteTime = (60 / tempo) / 2;
    total_lines = 0;
    newGlobalContext();
    loadSequence(cur_time);
    previous_arrange_data = JSON.stringify(arrange_data);
  }
  else {
    let total_length = (parseFloat(arrange_data.length) - playhead_position)*eighthNoteTime*1000
    play_start_time = cur_time;
    updatePlayheadPos();
    playSound(fullBuffer, cur_time, cur_time + total_length, 1);
    if (waiting_for_download) {
      serveDownload(fullBuffer);
    }
  }

  let length = (seq_length - (playhead_position * eighthNoteTime))*1000;
  stop_timeout = setTimeout(() => {playing = false; clearTimeout(stop_timeout)}, length+100);
}


function loadSequence(start_time) {
  seq_length = 0;
  for (i = 0; i < arrange_data['lines'].length; i++){
    let line = arrange_data['lines'][i];
    if (line['length'] > 0) {
      total_lines += 1;
      let volume = parseInt(line['volume']) / 100;
      let length = load_line(line, i, volume, start_time);
      if (length > seq_length) {
        seq_length = length;
      }
    }
  }
}


function load_line(line, index, volume, seq_start_time){

//  console.log("Load Line Start " + performance.now());

  if (line['length'] > 0) {
    let lineCtx = new OfflineAudioContext({
      numberOfChannels: 2,
      length: 44100 * line['length'] * eighthNoteTime,
      sampleRate: 44100
    });
    let inst = line["inst"];
    let blocks = line["blocks"];
    let instrument_tree = bufferlist[inst];
    let end_time = 0;
    let line_start_time = 0;
    for (var i = 0; i < blocks.length; i++) {
      block = blocks[i];
      let sound = block['sound'];
      if (sound !== '') {
        if (inst_data[inst].type == 'melodic') {
          sound = sound + '-' + block.octave;
        }
        levels = sound.split('/');
        let buffer = instrument_tree;
        // The buffers are kept as a tree of dictionaries, and the levels are a '/' separated
        // path in this tree. Example: 'Notes/A'
        for (level = 0; level < levels.length; level++) {
          key = levels[level];
          buffer = buffer[key];
        }

        let start_time = line_start_time + eighthNoteTime * 0.5 * (block['grid-start'] - 1);
        end_time = start_time + eighthNoteTime * 2 * block["length"];
        loadBlockOffline(buffer, start_time, end_time, volume, lineCtx);
      }
    }

    lineCtx.startRendering().then(function(renderedBuffer) {
//      console.log("Loaded Line Buffer " + performance.now());
      buffer = renderedBuffer;
      addToGlobal(buffer, line, line_start_time, index, seq_start_time);
    });

//    console.log("Load Line End " + performance.now());

    return (end_time - seq_start_time);
  }
}


function addToGlobal(buffer, line, start_time, index, seq_start_time) {
  // Play offline to globalOfflineContext
  let source = globalOfflineContext.createBufferSource()
  source.buffer = buffer;
  source.connect(globalOfflineContext.destination);
  source.start(start_time);

  // Add to line_buffers
  line_buffers[line['pos']] = buffer;

  lines_loaded += 1;

//  console.log("Loaded line " + lines_loaded + ' ' + (performance.now()));
  prev_time_test = performance.now();

  if (lines_loaded == total_lines){
//    console.log(performance.now())
    playFull(seq_start_time);
    lines_loaded = 0;
  }
}


function playFull(seq_start_time){
  globalOfflineContext.startRendering().then(function(renderedBuffer) {
//    console.log('playing full: ' + performance.now())
    fullBuffer = renderedBuffer;
    let length = seq_length * 100;
    play_start_time = seq_start_time;
    play_start_time = globalcontext.currentTime;
//    updatePlayheadPos(fullBuffer);
    updatePlayheadPos();
    playSound(fullBuffer, seq_start_time, seq_start_time+length, 1);
    if (waiting_for_download) {
      serveDownload(renderedBuffer);
    }

  });
}

function loadBlockOffline(buffer, time, end_time, volume, ctx) {
  let source = ctx.createBufferSource();
  let offlinegainNode = ctx.createGain();
  offlinegainNode.gain.value = 1;
  source.buffer = buffer;
  source.connect(offlinegainNode);
  offlinegainNode.connect(ctx.destination);
  offlinegainNode.gain.value = volume;
  let fade_out_curve = [volume, volume*0.3, 0]
  offlinegainNode.gain.setValueCurveAtTime(fade_out_curve, end_time, 0.1);

  source.start(time);
  source.stop(end_time+0.1);
}


function playSound(buffer, time, end_time, volume) {
  let source = globalcontext.createBufferSource();
  let gainNode = globalcontext.createGain();
  gainNode.gain.value = 1;
  source.buffer = buffer;
  source.connect(gainNode);
  gainNode.connect(globalcontext.destination);
  gainNode.gain.value = volume;
  let fade_out_curve = [volume, volume*0.3, 0]
  gainNode.gain.setValueCurveAtTime(fade_out_curve, end_time, 0.1);

  source.start(globalcontext.currentTime, playhead_position * eighthNoteTime);
  source.stop(end_time+0.1);
}

function playAuditionSound(buffer, time, end_time, volume) {
  let source = globalcontext.createBufferSource();
  let gainNode = globalcontext.createGain();
  gainNode.gain.value = 1;
  source.buffer = buffer;
  source.connect(gainNode);
  gainNode.connect(globalcontext.destination);
  gainNode.gain.value = volume;
  let fade_out_curve = [volume, volume*0.3, 0]
  gainNode.gain.setValueCurveAtTime(fade_out_curve, end_time, 0.1);

  source.start(time);
  source.stop(end_time+0.1);
}


$(document).ready(function(){
  $(this).keydown(function(e) {
    if(e.which == 32) {
      e.preventDefault();
    }
  });

/*
  $(this).keyup(function (e) {
    code = e.which
    if (code == 32) {
      if (e.stopPropagation) {
        e.stopPropagation();
        e.preventDefault();
      }
      if (playing) {
        pause();
      }
      else {
        play();
      }
    }
  })
*/

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
      eighthNoteTime = (60 / tempo) / 2;
      $('#tempo-span').show().text(tempo)
      arrange_data['tempo'] = tempo;
    })

})


function downloadWav() {
  waiting_for_download = true;
  play();
}

function serveDownload(buffer) {
  let anchor = $('#download-a');
  let wav = audioBufferToWav(buffer);
  let blob = new window.Blob([ new DataView(wav) ], {
    type: 'audio/wav'
  });

  let url = window.URL.createObjectURL(blob);
  anchor.attr('href', url);
  anchor.attr('download', 'audio.wav');
  waiting_for_download = false;
  anchor[0].click();
}
