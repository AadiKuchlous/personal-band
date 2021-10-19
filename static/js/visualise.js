function getFrequencyValue(frequency) {
  var nyquist = context.sampleRate/2;
  var index = Math.round(frequency/nyquist * freqDomain.length);
  return freqDomain[index];
}

window.requestAnimationFrame = (function(){
return window.requestAnimationFrame  ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame    ||
  window.oRequestAnimationFrame      ||
  window.msRequestAnimationFrame     ||
  function(callback){
  window.setTimeout(callback, 1000 / 60);
};
})();

async function visualiseData(source, destination, canvas){
  var analyser = context.createAnalyser();
  source.connect(analyser);
  analyser.connect(destination);

  drawVisuals(canvas, analyser);
}

async function drawVisuals (canvas, analyser) {
  var freqDomain = new Float32Array(analyser.frequencyBinCount);
  analyser.getFloatFrequencyData(freqDomain);

  let drawContext = canvas[0].getContext('2d');

  var freqDomain = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(freqDomain);  
  for (var i = 0; i < analyser.frequencyBinCount; i++) {
    var value = freqDomain[i];
    console.log(value);
    var percent = value / 256;
    let HEIGHT = canvas.height();
    let WIDTH = canvas.width();
    var height = HEIGHT * percent;
    var offset = HEIGHT - height - 1;
    var barWidth = WIDTH/analyser.frequencyBinCount;
    var hue = i/analyser.frequencyBinCount * 360;
    drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
    drawContext.fillRect(i * barWidth, offset, barWidth, height);
  }

}
