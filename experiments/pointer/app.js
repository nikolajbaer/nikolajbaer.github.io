// https://github.com/dorukeker/gyronorm.js

var ROME = {latitude:41.8921636,longitude:12.4844232,altitude:21}; 
var geoWatchId = null;
var my_coords = null;
var my_orient = null;

function radians(d){ return d * (Math.PI/ 180); }
function degrees(d){ return d/(Math.PI/180); }

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
    var y = Math.sin(p2.longitude - p1.longitude) * Math.cos(p2.latitude);
    var x = Math.cos(p1.latitude) * Math.sin(p2.latitude) -
            Math.sin(p1.latitude) * Math.cos(p2.latitude) * 
            Math.cos(p2.longitude - p1.longitude);
    var bearing = degrees(Math.atan2(y, x));

    return {bearing:bearing,distance:distance};
}

function align_arrow(){
    var logo = document.getElementById("arrow");

    var beardist = distance_and_bearing(my_coords,ROME);

    console.log(my_coords,ROME,beardist);
    document.getElementById("msg").innerHTML = "" + (Math.round(beardist.distance/1000) +"km to Rome");

    if(my_orient != null){
        // TODO think about how this translates
        logo.style.transform =
            "rotate("+ beardist.bearing +"deg) rotate3d(1,0,0, "+ (my_orient.pitch*-1)+"deg)";
    }else{
        logo.style.transform =
            "rotate("+ beardist.bearing +"deg)"; 
    }
}

function main(){

    if("geolocation" in navigator){
       geoWatchId = navigator.geolocation.watchPosition(function(position) {
            my_coords = position.coords;
            align_arrow();
        },function(failure){
            alert(failure.message);
        }); 
    }else{
        alert("geolocation not available");
    }
    
    var gn = new GyroNorm();     
    gn.init({frequency:1000}).then(function(){
        gn.start(function(data){
            var roll = data.gamma;
            var pitch = data.beta;
            var yaw = data.alpha             

            //document.getElementById("msg").innerHTML = "<code>"+JSON.stringify(data)+"</code>";
        });
    }).catch(function(e){
        console.log("DeviceOrientation or DeviceMotion is not supported by the browser or device",e);
    });
}

main();

