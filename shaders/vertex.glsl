attribute vec4 aVertexPosition;
attribute vec2 aTexCoords;

uniform mat4 model;
uniform mat4 projection;

varying vec2 v_texcoord;

void main() 
{
    gl_Position = projection * model * aVertexPosition;

    v_texcoord = aTexCoords;
}