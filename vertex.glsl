#define PI 3.141592653589793
#define E 2.718281828459045
uniform float time;
uniform float width;
uniform float period;
uniform float amplitude;
uniform float thickness;
uniform vec3 reef_location;
varying float distToCamera;
varying float distFromCenter;
varying float distFromReef;
varying float vertex_y;

// Vertical Component (height)
float wave_y(float x, float t1, float a){
    // the position of the wave relative to our current X
    float p = (x+t1)/thickness; // d is the width of the wave
    float wy = (cos(p-t1) + 1.) * step(abs(t1-p),PI);  // use step to isolate the single sine wave 

    return a * wy;
}
 
void main(){
    // NOTE I am composing functions, not doing a proper first principles approach
    // this may or may not yield a nice looking result
    
    float time_val = time;

    // track distance to camera per https://stackoverflow.com/a/16137020
    vec4 cs_position = modelViewMatrix * vec4(position,1.);
    distToCamera = -cs_position.z;
    distFromCenter = sqrt(pow(position.x,2.) + pow(position.z,2.));


    // map the time into a value crossing the relevant X bounds over the given period
    float travel_width = width * 1.25; // the extend we want to travel (a bit off the sides of our visible plane)
    float t1 = (travel_width/2.)  - mod(time_val * period,travel_width);
    float pos = position.x / (width/2.); // position of wave -1.0 to 1.0
    float zpos = ((position.z+(width/2.))/width); // current vertex position in wave -1 to 1 (e.g. 0 is middle)
    
    // shape our amplitude relative to z (breadth of wave)
    // for now we are doing a "reef" wave which peaks in the middle like an A-Frame
    float shape = sin( zpos * PI );
    // shape when we crest the wave relative to x (wave path)
    float breakpos = cos(pos * PI) + 1.;
    float pump = shape * breakpos * amplitude;
    float y_pos = wave_y(position.x,t1,shape * breakpos * amplitude);

    // calculate vertical component as sine wave, amplified later on by v
    // TODO and later by A if we focus like a reef a-frame

    // lateral distance from reef (on XZ plane) 
    distFromReef = sqrt(
        pow(reef_location.x - position.x,2.) + 
        pow(reef_location.z - position.z,2.)
    );

    float height_above_reef = (y_pos - reef_location.y)/amplitude;

    // twist based on height of wave
    // but scale influence down by xz distance from reef point
    float twist = pow(height_above_reef,2.); // * distFromReef/(width/4.);
    float theta = twist * PI/8.;
    float x = position.x * cos(theta) - y_pos * sin(theta);
    float y = clamp(y_pos * cos(theta) + position.x * sin(theta), 0., amplitude*10.);

    //float y = y_pos;
    //float x = position.x;

    
    gl_PointSize = 2. * (1. - distToCamera/width);

    // and update our position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(x,y,position.z,1.);
    vertex_y = y/amplitude; // pass current height to fragment shader
}