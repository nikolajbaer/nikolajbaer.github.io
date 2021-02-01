varying float distToCamera;
varying float distFromCenter;
varying float distFromReef;
varying float vertex_y;
varying float crash;
uniform float width;
uniform float elapsed;

void main() {
    float fade_in = pow(min(elapsed,2.) / 2.,2.); // linear fade in over 3s
    float v = 0.; //min(vertex_y,1.)

    vec4 color = mix(vec4(0.,0.,v,1.),vec4(1.),1. - fade_in);
    vec4 fog_color = vec4(1.);

    float fog_amount = pow(distFromCenter/(width*0.5),1.);
    gl_FragColor = mix( (crash > 0.)?vec4(1.):color, fog_color, fog_amount);

}