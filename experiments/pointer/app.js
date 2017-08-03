// https://github.com/dorukeker/gyronorm.js

var ROME = {lat:41.8921636,lng:12.4844232,alt:21}; 

function main(){
    
    var gn = new GyroNorm();     
    gn.init({frequency:1000}).then(function(){
        gn.start(function(data){
            document.getElementById("msg").innerHTML = "<code>"+JSON.stringify(data)+"</code>";
        });
    }).catch(function(e){
        console.log("DeviceOrientation or DeviceMotion is not supported by the browser or device",e);
    });
}

main();

