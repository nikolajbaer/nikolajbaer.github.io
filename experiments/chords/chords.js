
var chord = ["C4","E4","G4"];
var root = 0;
var octave = 4; 
var voicing = [0,4,7];

var freqs = [];
var oscillators = [];
var gnode = null;
var canvas = null;
var ctx = null;
var atx = null;
var source = null;
var t=0;
var fade = 1;
var graph_height = 0;
var xpand = 1;
var mute = true;
var MAX_GAIN = 0.5;
var TICK = 35;
var BPM = 120;
var MEASURE = 4;
var beat_count = 0;
var BEAT = 60/BPM * 1000;

function init_audio(){
    atx = new (window.AudioContext || window.webkitAudioContext)();
    gnode = atx.createGain();
    gnode.gain.value = 0.0; //mute
    gnode.connect(atx.destination);
}

function init_canvas(){
    // Sine wave drawing from https://jsfiddle.net/hashem/Lw41nwx7/
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");    
    ctx.strokeStyle = "#fff";
    ctx.lineJoin = 'round';
    ctx.save(); 
}

function tick(){
    if(mute && gnode.gain.value > 0){
        gnode.gain.value -= 0.05; 
    }else if(!mute && gnode.gain.value < MAX_GAIN){
        gnode.gain.value += 0.05;
    }

    if(fade == 0 && graph_height >= 0){
        graph_height  -= 0.2;
    }else if(fade == 1 && graph_height <= 1){
        graph_height += 0.2;
    }

    draw();
    t += 1;
    setTimeout(tick,TICK);
}

function draw(){
    var h = canvas.height;
    var w = canvas.width;
    ctx.clearRect(0,0,w,h);

    var mx = Math.max.apply(null,freqs);
    
    var gain = graph_height; //gnode.gain.value; 

    // draw background waves
    for(var i=0;i<freqs.length;i++){
        //console.log("drawing "+freqs[i] + " as "+ (freqs[i]/mx));
        ctx.save();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0,canvas.height/2);
        for(x=0; x<canvas.width; x++){
            y = Math.sin( ((x-t)/(canvas.width/12)) * (Math.PI/(freqs[i]/mx)) * xpand );
            ctx.lineTo(x,( gain*y*canvas.height/3 + canvas.height/2));
        }
        ctx.stroke();
    }
    
    // draw composite wave
    ctx.moveTo(0,canvas.height/2); 
    ctx.strokeStyle = "#ddf";
    ctx.beginPath();
    for(var x=0;x<canvas.width; x++){
        var y=0;
        for( var i=0; i<freqs.length; i++){
            y += Math.sin( ((x+t)/(canvas.width/12)) * (Math.PI/(freqs[i]/mx))  * xpand );
        }
        ctx.lineTo(x,( gain*(y/freqs.length)*canvas.height/3 + canvas.height/2 ) );
    }
    ctx.stroke();
}

function update_audio(){
    for(var i=0; i<oscillators.length; i++){
        oscillators[i].stop();
        oscillators[i].disconnect();
    }
    for(var i=0;i<freqs.length; i++){
        var osc = atx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freqs[i];
        osc.connect(gnode);
        osc.start();
        oscillators.push(osc);
    }  
}

function update_chord(notes){
    chord = notes;
    update_freqs();
}

function update_freqs(){
    freqs = [];
    for(var i=0; i<chord.length; i++){
        freqs.push(FREQ[chord[i]]);
    }
    draw();
    update_audio();
}



function walk_chords(){
    // circle of fifths.. 
    root = (root + 7) % SCALE.length;
    console.log("new root" + SCALE[root]);
    // build chord
    var c = [];
    for(var v=0; v<voicing.length; v++){
        // TODO allow voicing to drop octave or raise octaves..
        c.push(SCALE[(root+voicing[v])%SCALE.length]+octave);
    }
    console.log("transitioning to "+c);
    update_chord(c);
}

function beat(){
    // Count in sixteenth notes
    beat_count = (beat_count + 1)%(MEASURE*4);
    if(beat_count == ((MEASURE*4)-2)){
        fade = 0;
    }else if(beat_count == 0){
        walk_chords();
        fade = 1;
    }
    setTimeout(beat,BEAT/4);
}

function main(){
    window.addEventListener("click",function(){
        mute = !mute;
    });
    init_canvas();
    init_audio();
    update_freqs();
    tick();
    beat();
}

window.onload = main;

// Audio freq table from http://www.phy.mtu.edu/~suits/notefreqs.html
// A440

var SCALE = ["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"];

var FREQ = {
 "A#4": 466.16, 
 "C#8": 4434.92, 
 "A#3": 233.08, 
 "G7": 3135.96, 
 "G6": 1567.98, 
 "G5": 783.99, 
 "G4": 392.0, 
 "G3": 196.0, 
 "G2": 98.0, 
 "G1": 49.0, 
 "G0": 24.5, 
 "G8": 6271.93, 
 "G#8": 6644.88, 
 "F0": 21.83, 
 "F#5": 739.99, 
 "F#2": 92.5, 
 "C#3": 138.59, 
 "D#7": 2489.02, 
 "G#3": 207.65, 
 "G#6": 1661.22, 
 "B4": 493.88, 
 "B5": 987.77, 
 "B6": 1975.53, 
 "B7": 3951.07, 
 "B0": 30.87, 
 "B1": 61.74, 
 "A#6": 1864.66, 
 "B3": 246.94, 
 "B8": 7902.13, 
 "G#0": 25.96, 
 "C#7": 2217.46, 
 "F#8": 5919.91, 
 "A#7": 3729.31, 
 "A#5": 932.33, 
 "G#5": 830.61, 
 "E8": 5274.04, 
 "G#1": 51.91, 
 "E5": 659.25, 
 "E4": 329.63, 
 "E7": 2637.02, 
 "E6": 1318.51, 
 "E1": 41.2, 
 "E0": 20.6, 
 "E3": 164.81, 
 "E2": 82.41, 
 "D#2": 77.78, 
 "B2": 123.47, 
 "D#6": 1244.51, 
 "C#2": 69.3, 
 "G#2": 103.83, 
 "F#7": 2959.96, 
 "A#8": 7458.62, 
 "C8": 4186.01, 
 "D#0": 19.45, 
 "C2": 65.41, 
 "C1": 32.7, 
 "C0": 16.35, 
 "C7": 2093.0, 
 "C6": 1046.5, 
 "C5": 523.25, 
 "C4": 261.63, 
 "C#5": 554.37, 
 "D#3": 155.56, 
 "C3": 130.81, 
 "A#1": 58.27, 
 "D#4": 311.13, 
 "A#2": 116.54, 
 "F#0": 23.12, 
 "F1": 43.65, 
 "F2": 87.31, 
 "F3": 174.61, 
 "F4": 349.23, 
 "F5": 698.46, 
 "F6": 1396.91, 
 "F7": 2793.83, 
 "F8": 5587.65, 
 "D#1": 38.89, 
 "C#6": 1108.73, 
 "C#4": 277.18, 
 "A#0": 29.14, 
 "F#6": 1479.98, 
 "F#3": 185.0, 
 "G#4": 415.3, 
 "D#8": 4978.03, 
 "A1": 55.0, 
 "A0": 27.5, 
 "A3": 220.0, 
 "A2": 110.0, 
 "A5": 880.0, 
 "A4": 440.0, 
 "A7": 3520.0, 
 "A6": 1760.0, 
 "A8": 7040.0, 
 "C#0": 17.32, 
 "D#5": 622.25, 
 "F#1": 46.25, 
 "F#4": 369.99, 
 "C#1": 34.65, 
 "G#7": 3322.44, 
 "D8": 4698.63, 
 "D6": 1174.66, 
 "D7": 2349.32, 
 "D4": 293.66, 
 "D5": 587.33, 
 "D2": 73.42, 
 "D3": 146.83, 
 "D0": 18.35, 
 "D1": 36.71
}
