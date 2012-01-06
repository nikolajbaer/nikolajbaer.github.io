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

    this.add_track = function(name, player, start, end){
        this.tracks.push({name:name,player:player,start:start,end:end,ival:null});
    };

    this.tick = function(){
        console.log(this);
        console.log(this.sequences);

        var seq = this.sequences[this.current_sequence];
        for(var i=0;i<seq.length; i++){ // for each track in the sequencej
            if(seq[i][this.current_step]){ // if true, then play the sample
                // clear the timeout for stopping the video
                var t = this.tracks[i];
                if(t.ival){
                    clearInterval(t.ival);
                    t.ival=null;
                }
                t.player.seekTo(t.start);
                t.player.playVideo(); // TODO make this play the yt player
                t.ival = setTimeout(function(){ t.pauseVideo },t.end - t.start);
            }
        }
        this.current_step = (this.current_step + 1)%this.steps;
    };
   
    this.play = function(){
        if(this.ival){ return; }
        this.ival = setInterval(function(){ this.tick },60000/this.bpm);
    }

    this.pause = function(){
        if(this.ival){ 
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
                for(var j=0;j<steps;j++){
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
    sequencer = new Sequencer(16,4);
    var tracks = [{name:"cymbal",ytid:"mslT361M6-E",start:0,end:5},
                  {name:"guitar",ytid:"ICLkuwWO9tU",start:0,end:1},]

    // Build samples
    for(var i=0;i<tracks.length;i++){
        $("#tubes").append('<div id="track_'+i+'"></div>');
        var player = new YT.Player('track_'+i, {
                  width: 200,
                  height: 200,
                  videoId: tracks[i].ytid, 
                  playerVars: {'autoplay':false,'controls':0}
        });
        sequencer.add_track(tracks[i].name,player,tracks[i].start,tracks[i].end);
        // TODO create the Google iFrame player for each, and stick in #tubes
    }    
    sequencer.build_sequences(4,true); 
    //sequencer.play();
}


