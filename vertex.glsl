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
varying float crash;

// Vertical Component (height)
float wave_y(float x, float t1){
    // the position of the wave relative to our current X
    float p = (x+t1)/thickness; // d is the width of the wave
    float wy = (cos(p-t1) + 1.) * step(abs(t1-p),PI);  // use step to isolate the single sine wave 

    return wy;
}
 
void main(){
    // NOTE I am composing functions, not doing a proper first principles approach
    // this may or may not yield a nice looking result
    
    float time_val = time;

    // track distance to camera per https://stackoverflow.com/a/16137020
    vec4 cs_position = modelViewMatrix * vec4(position,1.);
    distToCamera = -cs_position.z;
    distFromCenter = sqrt(pow(position.x,2.) + pow(position.z,2.));

    // lateral distance from reef (on XZ plane) 
    distFromReef = sqrt(
        pow(reef_location.x - position.x,2.) + 
        pow(reef_location.z - position.z,2.)
    );

    // map the time into a value crossing the relevant X bounds over the given period
    float travel_width = width * 1.25; // the extend we want to travel (a bit off the sides of our visible plane)

    float pos = position.x / (width/2.); // position of wave -1.0 to 1.0
    if(abs(pos) > 1. ){ pos = pos/pos; } // force to be max -1/1
    float zpos = ((position.z+(width/2.))/width); // current vertex position in wave -1 to 1 (e.g. 0 is middle)

    // shape our amplitude relative to z (breadth of wave)
    // for now we are doing a "reef" wave which peaks in the middle like an A-Frame
    float shape = sin( zpos * PI );
    // shape when we crest the wave relative to x (wave path)
    float breakpos = cos(pos * PI) + 1.;

    // how the base wave jacks up at this point
    float pump =  amplitude * (1. + shape)/2. * (1. + breakpos)/2.;

    float y_pos_base = wave_y(position.x,time_val) * pump;

    // make the wave bow around the reef
    float lag = pow(abs(position.z/width),2.);// * distFromReef; // * (1. - (y_pos_base / amplitude));
    lag = 0.; // Disable Lag for now
    float t1 = (travel_width/2.)  - mod( (time_val+lag) * period,travel_width);
    float y_pos = max(wave_y(position.x,t1) * pump, 0.); 

    // calculate vertical component as sine wave, amplified later on by v
    float height_above_reef = (y_pos - reef_location.y)/(amplitude*2.); 

    // twist based on height of wave
    // but scale influence down by xz distance from reef point
    float twist = pow(height_above_reef,2.) * breakpos;
    float theta = twist * PI/4.;
    float y_twist = y_pos * cos(theta) + position.x * sin(theta);
    float x_twist = position.x * cos(theta) - y_pos * sin(theta);

    float twist_amp = 1.;
    float y = clamp((y_twist * twist_amp ),0.,1000.0);
    float x =(x_twist * twist_amp );

    /*if(y_twist < 0.){
        crash = 1.;
    }*/

    //crash = (y_twist < 0. && twist > 0.1)?1.:0.;
    //crash = (y_pos<=-.1)?1.:0.;

    // uncomment to remove breaking wave
    //crash = 0.;
    //y = max(y_pos,0.);
    //x = position.x;

    
    gl_PointSize = 3. * (1. - distToCamera/width);

    // and update our position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(x,y,position.z,1.);
    vertex_y = y/amplitude; // pass current height to fragment shader
}