var context;
var padGain;
var leadGain;

var polarity = parseFloat($('#polarity').text());
var subjectivity = parseFloat($('#subjectivity').text());
var tweets = parseInt($('#tweets').text());
var retweets = parseInt($('#retweets').text());
var avgLength = parseInt($('#avglength').text());
var tweetRate = parseFloat($('#tweetrate').text());

var samples = 512;

function checkValues(){
  if (isNaN(polarity)){
    polarity = Math.random() * 2 - 1;
  }
  if (isNaN(subjectivity)){
    subjectivity = Math.random();
  }
  if (isNaN(tweets)){
    tweets = parseInt(Math.random() * 100);
  }
  if (isNaN(retweets)){
    retweets = parseInt(Math.random() * 1000);
  }
  if (isNaN(avgLength)){
    avgLength = Math.random() * 70 + 70;
  }
  if (isNaN(tweetRate)){
    tweetRate = Math.random() * 1000;
  }
}

function initAudio() {
  // Create audio context.
  var contextClass = (window.AudioContext ||
      window.webkitAudioContext ||
      window.mozAudioContext ||
      window.oAudioContext ||
      window.msAudioContext);
  if (contextClass) {
      context = new contextClass();
  } else {
    alert("You browser is too old to work - sorry.")
  }
}

function createAnalyser(){
  // Create an analyser to collect music frequency data.
  var analyser = context.createAnalyser();
  analyser.connect(context.destination);
  analyser.fftSize = samples;
  return analyser;
}

function createGains(){
  // Create all gain control nodes.
  padGain = context.createGain();
  padGain.gain.value = 7.0;
  padGain.connect(analyser);
  leadGain = context.createGain();
  leadGain.gain.value = 3.0;
  leadGain.connect(analyser);
}

function createPad(freq) {
  var panner = context.createPanner();
  var max = 20;
  var min = -20;
  var x = rand(min, max);
  var y = rand(min, max);
  var z = rand(min, max);
  panner.setPosition(x, y, z);
  panner.connect(padGain);

  var filter = context.createBiquadFilter();
  filter.type = filter.BANDPASS;
  filter.frequency.value = freq;
  filter.Q.value = avgLength;
  filter.connect(panner);

  var osc = context.createOscillator();
  osc.connect(filter);
  osc.type = retweets%4;
  osc.frequency.value = avgLength * 2;
  osc.start(0);

  setInterval(function () {
    x = x + rand(-(subjectivity), subjectivity);
    y = y + rand(-(subjectivity), subjectivity);
    z = z + rand(-(subjectivity), subjectivity);
    panner.setPosition(x, y, z);
    filter.frequency.value = 800 * (polarity + 1); // This value reps polarity
    osc.frequency.value += rand(-(subjectivity), subjectivity); // This value reps subjectivity
  }, 100/tweetRate);
}

function createLead() {
    var filter2 = context.createBiquadFilter();
    filter2.type = filter2.BANDPASS;
    filter2.frequency.value = tweetRate;
    filter2.Q.value = avgLength * 2;
    filter2.connect(leadGain);

    var delay = context.createDelay();
    delay.connect(filter2);
    delay.delayTime.value = subjectivity * 4;

    var notes = createMelody();
    console.log(notes);
    var aux = context.createOscillator();
    aux.connect(delay);
    aux.frequency.value = avgLength * 2;
    aux.start(0);
    aux.type = (polarity+1)*2%4;
    var aux2 = context.createOscillator();
    aux2.connect(filter2);
    aux2.frequency.value = avgLength * 2;
    aux2.start(0);
    aux2.type = (polarity+1)*2%4;
    var beat = 0;
    setInterval( function () {
      aux.frequency.value = notes[beat % 8];
      aux2.frequency.value = notes[beat % 8];
      beat++;
  }, tweetRate);
}

function createMelody(){
  var notes = [];
  var base = (polarity + 1) * 440;
  for (i = 0; i < 8; i++){
    var note = base * scale[parseInt(Math.random()*8)];
    notes.push(note);
  }
  return notes
}

var scale = [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8, 2];

function createSound(){
  var num_osc = ((tweets+1)/100) * 30;
  var base = (polarity + 1) * 440;
  var variance = [1,1,0.5,2,0.25,4,0.125,8,0.0625,16];
  for (var i = 0; i < num_osc; i++) {
    var freq = base * scale[parseInt(Math.random()*8)]
    freq = freq * variance[parseInt(subjectivity*10*Math.random())] //The more subjective the more dissonant
    createPad(freq);
  }
  createLead();
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function getFrequencyValue(frequency) {
  var nyquist = context.sampleRate/2;
  var index = Math.round(frequency/nyquist * freqDomain.length);
  return freqDomain[index];
}


checkValues();
initAudio();

var analyser = createAnalyser();

createGains();

createSound();



function stop(){
  leadGain.gain.value = 0;
  padGain.gain.value = 0;
  $("#stop").text("Start");
  $("#stop").attr("id", "start");
  $("#start").click(start);
}

function start(){
  leadGain.gain.value = 3;
  padGain.gain.value = 7;
  $("#start").text("Stop");
  $("#start").attr("id", "stop");
  $("#stop").click(stop);
}

var canvas;
var canvasContext;

function setupCanvas() {
  canvas = document.createElement('canvas');
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  canvas.className = "visualization";
  canvasContext = canvas.getContext('2d');
  document.body.appendChild(canvas);
  webkitRequestAnimationFrame(update);
}

function drawCircle(pos, freq){
  canvasContext.beginPath();
  var x              = pos*20 +100;
  var y              = canvas.height/2;
  var radius         = freq;
  var startAngle     = 0;

  canvasContext.arc(x, y, radius, startAngle, 2*Math.PI, false);
  // canvasContext.strokeStyle = 'white';
  canvasContext.strokeStyle = randColor();
  canvasContext.stroke();
  canvasContext.fillStyle = randColor();
  canvasContext.fill();
}

function randColor(){
  var r = parseInt(Math.random() * 255);
  var g = parseInt(0);
  var b = parseInt(0);
  var a = parseInt(Math.random() * 100);
  var rgba = "rgba(" + r + ", " + g + ", " + b + "," + a + ")";
  return rgba
}

function update() {
  var data = new Uint8Array(samples);
  analyser.getByteFrequencyData(data);
  for (var i = 0; i < data.length; i++){
    drawCircle(i,data[i]);
  }
  webkitRequestAnimationFrame(update);
}

$("#stop").click(stop);
setupCanvas();
