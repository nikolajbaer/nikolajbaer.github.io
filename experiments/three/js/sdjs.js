var i=0;
var shift = false;
function advance(e){
    console.log("advancing from "+i+"+..");
    var slides = document.getElementsByClassName("slide");
    if(shift){
        if(i==0){ 
            i=slides.length-1; 
        }else{
            i= (i-1)%slides.length;
        }
    }else{
        i= (i+1)%slides.length; 
    }
    for(var j=0;j<slides.length;j++){
        slides[j].className = i==j?"slide current":"slide";
        console.log(j+"=="+i+" "+slides[j].className);
    }  
      
}

// detect shift
function keydown(e){
    shift = e.keyCode == 16 && true;
}
function keyup(e){
    shift = e.keyCode == 16 && false;
}

window.onload = function(){
    console.log("initializing");
    document.onmouseup = advance;
    document.onkeyup = keyup;
    document.onkeydown = keydown;
}

