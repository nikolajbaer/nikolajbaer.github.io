varying float distToCamera;
varying float distFromCenter;
varying float distFromReef;
varying float crash;
varying vec3 vpos;
uniform float width;
uniform float elapsed;

void main() {
    float fade_in = pow(min(elapsed,2.) / 2.,2.); // linear fade in over 3s
    vec4 base_color = vec4(0.,0.,0.,1.);
    if( vpos.x == 0.){
        base_color.z = 1.;
    }
    if( vpos.z == 0.5 ){
        if( vpos.x > 0.){
            base_color.x = 1.;
        }else{
            base_color.y = 1.;
        }
    }
    vec4 color = mix(base_color,vec4(1.),1. - fade_in);
    vec4 fog_color = vec4(1.);

    float fog_amount = pow(distFromCenter/(width),1.);
    if(crash  > 0.){
        gl_FragColor = vec4(1.,1.,1.,0.);
    }else{
        gl_FragColor = mix( color, fog_color, fog_amount);
    }
}