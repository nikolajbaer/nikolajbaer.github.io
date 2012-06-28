// Define Models Here

//   {name:"cymbal",ytid:"mslT361M6-E",start:0,end:5},
//    {name:"guitar",ytid:"ICLkuwWO9tU",start:0,end:1},

var Sequencer = function(steps,tracks,bpm){
    this.steps = steps;
    this.tracks = [];
    this.sequences = [];
    this.bpm = bpm;
    this.ival = null;
    this.current_step = 0;
    this.current_sequence = 0;
    var self = this;

    this.add_track = function(name, player, start, end){
        this.tracks.push({name:name,player:player,start:start,end:end,ival:null});
    };

    this.tick = function(){
        console.log("beat "+this.current_step+"/"+this.steps);

        var seq = this.sequences[this.current_sequence];
        for(var i=0;i<seq.length; i++){ // for each track in the sequencej
            if(seq[i][this.current_step]){ // if true, then play the sample
                // clear the timeout for stopping the video
                var t = this.tracks[i];
                if(t.ival){
                    clearInterval(t.ival);
                    t.ival=null;
                }
                console.log(t.player);
                t.player.seekTo(t.start,false);
                t.player.playVideo(); // TODO make this play the yt player
                t.ival = setTimeout(function(){ t.player.pauseVideo(); },t.end - t.start);
            }
        }
        this.current_step = (this.current_step + 1)%this.steps;
    };
   
    this.play = function(){
        if(this.ival != null){ return; }
        console.log("playing at "+(60000/this.bpm)+"ms per interval");
        this.ival = setInterval(function(){ self.tick(); },60000/this.bpm);
    }

    this.pause = function(){
        if(this.ival != null){ 
            clearInterval(this.ival);
            this.ival = null;
        }
        
    }
    
    this.rewind = function(){
        this.current_step = 0;
    }   

    this.build_sequences = function(n,randomize){
        for(var i=0;i<n;i++){
            var sequence = [];
            for(var j=0;j<this.tracks.length;j++){
                var s = [];
                for(var k=0;k<steps;k++){
                    s.push(randomize?Math.random()>0.5:false);
                }
                sequence.push(s);
            }
            this.sequences.push(sequence);
        }
    };
};

var sequencer = null;

function onYouTubePlayerAPIReady() {
<<<<<<< HEAD
    sequencer = new Sequencer(16,4,100);
    var tracks = [{name:"cymbal",ytid:"wF9Me35vQ20",start:0,end:5},
                  {name:"guitar",ytid:"ICLkuwWO9tU",start:0,end:1},]
=======
    sequencer = new Sequencer(8,2,60);
    var tracks = [{name:"cymbal",ytid:"mv4kBI15cEk",start:44,end:46},
                  {name:"guitar",ytid:"ICLkuwWO9tU",start:2,end:4},]

    var h = window.height;
    var w = window.width;
>>>>>>> 1173f5a6f80e92969bfb34cc6be3ebb9646c7e44

    // Build samples
    for(var i=0;i<tracks.length;i++){
        $("#tubes").append('<div id="track_'+i+'"></div>');
        var player = new YT.Player('track_'+i, {
                  width: w/tracks.length,
                  height: 0.75*w,
                  videoId: tracks[i].ytid, 
                  playerVars: {'autoplay':false,'controls':0}
        });
        sequencer.add_track(tracks[i].name,player,tracks[i].start,tracks[i].end);
    }    
    sequencer.build_sequences(4,true); 
    //sequencer.play();

    $("#play").click(function(){ sequencer.play(); });
    $("#pause").click(function(){ sequencer.pause(); });

}


