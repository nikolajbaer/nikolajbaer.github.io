varying float distToCamera;
varying float distFromCenter;
uniform float width;
uniform float time;

void main() {
    float fade_in = pow(min(time,2.) / 2.,2.); // linear fade in over 3s
    vec4 color = mix(vec4(0.,0.,0.,1.),vec4(1.),1. - fade_in);
    vec4 fog_color = vec4(1.);

    float fog_amount = pow(distFromCenter/(width*0.5),1.);
    gl_FragColor = mix( color, fog_color, fog_amount);

}