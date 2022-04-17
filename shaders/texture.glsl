precision mediump float;

uniform vec4 color;

varying vec2 v_texcoord;
uniform sampler2D texture;

void main()
{
    vec4 tex_color = texture2D(texture, v_texcoord) * color;
    if(tex_color.a < 0.1)
        discard;
    gl_FragColor = tex_color; 
}