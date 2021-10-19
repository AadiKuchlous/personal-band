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

const fileList = {
	"piano": {
	    "notes": {
		"A": "A.wav",
		"As": "As.wav",
		"B": "B.wav",
		"C": "C.wav",
		"Cs": "Cs.wav",
		"D": "D.wav",
		"Ds": "Ds.wav",
		"E": "E.wav",
		"F": "F.wav",
		"Fs": "Fs.wav",
		"G": "G.wav",
		"Gs": "Gs.wav"
	    },
	},
	"guitar": {
            "chords": {
		"C": "Cmaj.wav",
		"Cm": "Cmin.wav",
		"Cs": "Csmaj.wav",
		"Csm": "Csmin.wav",
		"D": "Dmaj.wav",
		"Dm": "Dmin.wav",
		"Ds": "Dsmaj.wav",
		"Dsm": "Dsmin.wav",
		"E": "Emaj.wav",
		"Em": "Emin.wav",
		"F": "Fmaj.wav",
		"Fm": "Fmin.wav",
		"Fs": "Fsmaj.wav",
		"Fsm": "Fsmin.wav",
		"G": "Gmaj.wav",
		"Gm": "Gmin.wav",
		"Gs": "Gsmaj.wav",
		"Gsm": "Gsmin.wav",
		"A": "Amaj.wav",
		"Am": "Amin.wav",
		"As": "Asmaj.wav",
		"Asm": "Asmin.wav",
		"B": "Bmaj.wav",
		"Bm": "Bmin.wav",

            }
        },
	"drums": {
	    "kick": {
		"Kick 1": "kick1.wav",
		"Kick 2": "kick2.wav"
	    },
	    "snare": {
		"Snare 1": "snare1.wav",
		"Snare 2": "snare2.wav"
	    },
	    "hihat": {
		"Hihat Closed 1": "hatclosed1.wav",
		"Hihat Open 1": "hatopen1.wav",
		"Hihat Closed 2": "hatclosed2.wav",
		"Hihat Open 2": "hatopen2.wav"
	    }
	}
}

const audio_location = "/static/audio_files"

var bufferlist = null;

function generateBufferList(input, path, context) {
  let buffers_new = {};
  for (var key in input) {
    if (typeof input[key] == typeof {}) {
      buffers_new[key] = generateBufferList(input[key], path+'/'+key, context);
    }
    else {
      audio_path = path+'/'+input[key];
      let bufferLoader = new BufferLoader(
          context, [audio_path],
	  ((key) => {
            return function(bufferList){
              buffers_new[key] = bufferList[0];
            }
	  })(key)
      );
      bufferLoader.load();
    }
  }
  return(buffers_new);
}

var context;

function init() {
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

