#define PI 3.141592653589793
#define E 2.718281828459045
uniform float time;
uniform float width;
uniform float period;
uniform float amplitude;
varying float distToCamera;
varying float distFromCenter;

// Vertical Component (height)
float wave_y(float x, float t1, float d, float a){
    float p = (x+t1)/d; // the position of the wave relative to our current X
    return a * (cos(p-t1) + 1.) * step(abs(t1-p),PI); 
}
 
// Horizontal Component (translates on X or the path of the wave)
// Currently disabled until i figure out a better way to do this
float wave_x(float x,float z,float t1,float d, float a){
    return x;
}

void main(){
    // NOTE I am composing functions, not doing a proper first principles approach
    // this may or may not yield a nice looking result

    gl_PointSize = 2.;

    float time_val = time;
    // map the time into a value crossing the relevant X bounds over the given period
    float travel_width = width * 1.25; // the extend we want to travel (a bit off the sides of our visible plane)
    float t1 = (travel_width/2.)  - mod(time_val * period,travel_width);

    // shape our amplitude relative to z (breadth of wave)
    float a = sin( ((position.z+(width/2.))/width) * PI ) * amplitude;

    // shape when we crest the wave relative to x (wave path)
    float pos = (position.x + (width/2.)) / width; // position of wave 0-1.0
    float v = (1. - pos)  * a;

    float d = 2.; // the "depth" or width of the wave (how wide it is )

    // calculate vertical component as sine wave, amplified later on by v
    // TODO and later by A if we focus like a reef a-frame
    float y = wave_y(position.x,t1,d,v);

    // calculate horizontal drift amplified by v along path, and a long breadth
    float x = wave_x(position.x,position.z,t1,d,v);

    // track distance to camera per https://stackoverflow.com/a/16137020
    vec4 cs_position = modelViewMatrix * vec4(position,1.);
    distToCamera = -cs_position.z;

    distFromCenter = sqrt(pow(position.x,2.) + pow(position.z,2.));

    // and update our position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(x,y,position.z,1.);
}