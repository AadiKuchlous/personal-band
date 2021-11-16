// loaded buffers will only catch up to total buffers
// in the end because total buffers in inremented
// intintaneously
let total_buffers = 0;
let loaded_buffers = 0;

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

var bufferlist = null;

function generateBufferList(input, path, context) {
  let buffers_new = {};
  for (var key in input) {
    if (typeof input[key] == typeof {}) {
      buffers_new[key] = generateBufferList(input[key], path+'/'+key, context);
    }
    else {
      audio_path = path+'/'+input[key];
      total_buffers += 1;
      let bufferLoader = new BufferLoader(
          context, [audio_path],
	  ((key) => {
            return function(bufferList){
              buffers_new[key] = bufferList[0];
              checkForFinalBuffer();
            }
	  })(key)
      );
      bufferLoader.load();
    }
  }
  return(buffers_new);
}

var context;

function loadAllBuffers() {
//  try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();

    loadBuffers(context, audio_location);

//  }
//  catch(e) {
//    alert('Web Audio API is not supported in this browser');
//  }
}


function loadBuffers(context, audio_location) {
  bufferlist = generateBufferList(fileList, audio_location, context);
}

function checkForFinalBuffer() {
  loaded_buffers += 1;
  if (loaded_buffers == total_buffers) {
    $('#playback-button-play').html(play_button_svg).on('click', play);
    
    $(document).keyup(function (e) {
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
  }
  else {
    return
  }
}
