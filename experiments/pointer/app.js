// https://github.com/dorukeker/gyronorm.js

var ROME = {latitude:41.8921636,longitude:12.4844232,altitude:21}; 
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
    var y = Math.sin(p2.longitude - p1.longitude) * Math.cos(p2.latitude);
    var x = Math.cos(p1.latitude) * Math.sin(p2.latitude) -
            Math.sin(p1.latitude) * Math.cos(p2.latitude) * 
            Math.cos(p2.longitude - p1.longitude);
    var bearing = degrees(Math.atan2(y, x));

    return {bearing:bearing,distance:distance};
}

function align_arrow(){
    if(my_coords == null) { return; } 
    var logo = document.getElementById("arrow");

    var beardist = distance_and_bearing(my_coords,ROME);

    //console.log(my_coords,ROME,beardist);
    document.getElementById("msg").innerHTML = "" + (Math.round(beardist.distance/1000) +"km to Rome");

    // rotate X axis for pitch, and z axis for bearing (yaw) 
    var yaw = beardist.bearing; // TODO factor in current gyro yaw
    var pitch = 45; //default forward pitch 
    if(my_orient != null){
        yaw -= my_orient.yaw;
        pitch = my_orient.pitch;
    }
    
    logo.style.transform = "rotate3d(1,0,0, "+ pitch +"deg) rotate3d(0,0,1,"+ yaw +"deg) ";
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
            document.getElementById("debug").innerHTML = "<code>"+JSON.stringify(data)+"</code>";
            var roll = data.dm.gamma;
            var pitch = data.dm.beta;
            var yaw = data.dm.alpha             

            if(roll == 0 && pitch == 0 && yaw == 0){
                //TODO explicit indication of no sensor data
            }else{
                my_orient =  {pitch:pitch,roll:roll,yaw:yaw};
                align_arrow();
            }
        });
    }).catch(function(e){
        alert("DeviceOrientation or DeviceMotion is not supported by the browser or device",e);
    });
}

main();

