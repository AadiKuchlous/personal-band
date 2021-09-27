var context;
var bufferLoader;
var sampleList;

var tempo = 60; // BPM (beats per minute)
var eighthNoteTime = (60 / tempo) / 2;

//Defining BufferLoader class
function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
}



function init() {
  try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();
    
    bufferLoader = new BufferLoader(
      context,
      [
        '/static/audio_files/snare.wav',
        '/static/audio_files/piano-b_B_major.wav',
      ],
      function(bufferList){sampleList = bufferList;}
      );

    bufferLoader.load();
  }
  catch(e) {
    alert('Web Audio API is not supported in this browser');
  }
}

function play_line(line, line_start_time, index){

  let inst = line["inst"];
  let blocks = line["blocks"];
  let buffer = sampleList[index];
  let prev_time = line_start_time;
  for (var i = 0; i < blocks.length; i++){
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

function playSequence() {
  let cur_time = context.currentTime;

  for (i = 0; i < arrange_data.length; i++){
    let line = arrange_data[i];
    play_line(line, cur_time, i);
  }
}

function playSound(buffer, time) {
  var source = context.createBufferSource();
  source.buffer = buffer;
//   console.log(buffer)
  source.connect(context.destination);
  console.log(time);
  source.start(time);
}

function pauseSound() {
  context.close();
  context = new AudioContext();
}
