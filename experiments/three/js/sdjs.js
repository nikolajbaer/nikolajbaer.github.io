var i=0;
function advance(forward){
    console.log("advancing from "+i+"+..");
    var slides = document.getElementsByClassName("slide");
    if(forward && i<slides.length-1){
        i++;
    }else if(!forward && i > 0){
        i--;
    }
    for(var j=0;j<slides.length;j++){
        slides[j].className = i==j?"slide current":"slide";
        console.log(j+"=="+i+" "+slides[j].className);
    }  
      
}

// detect shift
function keydown(e){
}
function keyup(e){
    if(e.keyCode==39){  advance(true); }
    if(e.keyCode==37){  advance(false); }
}

window.onload = function(){
    console.log("initializing");
    document.onkeyup = keyup;
    document.onkeydown = keydown;
}


