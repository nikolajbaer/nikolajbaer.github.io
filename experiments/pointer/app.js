// https://github.com/dorukeker/gyronorm.js

var TARGET = null; 
var TARGET_NAME = null;
var geoWatchId = null;
var my_coords = null;
var my_orient = null;

function radians(d){ return d * (Math.PI/ 180); }
function degrees(d){ return d/(Math.PI/180); }

function sms_share_url(){
    // from https://stackoverflow.com/questions/6480462/how-to-pre-populate-the-sms-body-text-via-an-html-link
    return "sms:?&body="+window.location;
}

// http://www.movable-type.co.uk/scripts/latlong.html
function distance_and_bearing(p1,p2){
    
    // haversine distance
    var R = 6371000; // earth's radius in m
    var phi1 = radians(p1.latitude);
    var phi2 = radians(p2.latitude);
    var d_phi = radians(p2.latitude - p1.latitude);
    var d_lambda  = radians(p2.longitude - p1.longitude);
    
    var a = Math.sin(d_phi / 2 ) * Math.sin( d_phi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(d_lambda/2) * Math.sin(d_lambda/2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 

    var distance = R * c;
   
    // bearing 
    var lam1 = radians(p1.longitude);
    var lam2 = radians(p2.longitude);
    var phi1 = radians(p1.latitude);
    var phi2 = radians(p2.latitude);

    var y = Math.sin(lam2 - lam1) * Math.cos(phi2);
    var x = Math.cos(phi1) * Math.sin(phi2) -
            Math.sin(phi1) * Math.cos(phi2) * 
            Math.cos(lam2 - lam1);
    var bearing = degrees(Math.atan2(y, x));

    return {bearing:bearing,distance:distance};
}

function align_arrow(){
    if(my_coords == null) { return; } 
    var compass = document.getElementById("compass");
    var arrow = document.getElementById("arrow");

    var beardist = distance_and_bearing(my_coords,TARGET);

    document.getElementById("msg").innerHTML = "" + (Math.round(beardist.distance/1000) +"km to " + TARGET_NAME +
                                                     "( bearing "+Math.round(beardist.bearing)+"&deg; )");

    // rotate X axis for pitch, and z axis for bearing (yaw) 
    var bearing = beardist.bearing;
    var yaw = 0; // TODO factor in current gyro yaw
    var pitch = 50; //default forward pitch 
    if(my_orient != null){
        yaw = my_orient.yaw;
        pitch = my_orient.pitch;
    }
    
    compass.style.transform = "rotate3d(1,0,0, "+ pitch +"deg) rotate3d(0,0,1,"+ (yaw) +"deg) ";
    arrow.style.transform = "rotate("+ (bearing) +"deg) ";
}

function main(){

    // Request and retrieve geolocation from system
    if("geolocation" in navigator){
       geoWatchId = navigator.geolocation.watchPosition(function(position) {
            my_coords = position.coords;
            align_arrow();
        },function(failure){
            alert(failure.message);
        }); 
    }else{
        alert("Geolocation not available, please refresh and allow to continue!");
    }

    // Not consistent, using gyronorm for now
    // https://developers.google.com/web/updates/2016/03/device-orientation-changes
    // TODO safari
    if('ondeviceorientationabsolute' in window){
        console.log("regisering orientation event");
        window.addEventListener('deviceorientationabsolute', handleOrientation); 
    }else{
        console.log("no absolute device orientation in window");
    }

    // Associate targeting location list
    document.querySelectorAll("#locations li").forEach(function(el,i,l){ 
        el.addEventListener("click",function(){ set_target(el) }); 
    });
    set_target(document.querySelector("#locations li"));
}

function set_target(el){
    TARGET = {latitude:Number(el.dataset.lat), longitude: Number(el.dataset.lng)};
    TARGET_NAME = el.innerHTML;
    console.log("Targeting "+TARGET_NAME);
    align_arrow();
}

// For native DeviceOrientationAbsolute
function handleOrientation(event) {
    console.log(event);     
    var roll = event.gamma;
    var pitch = event.beta;
    var yaw = event.alpha             
    
    if(pitch == null || (pitch == 0 && roll == 0 && yaw == 0)){
        my_orient = null; // we probably didn't get a reading..
    }else{
        my_orient =  {pitch:pitch,roll:roll,yaw:yaw};
    }
    align_arrow();
}

main();

