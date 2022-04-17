//NOTE(Auto): Using a lib for matrix operaion cuz writing our own is pain in the ass
const mat4 = glMatrix.mat4;

//Global gl context
let gl;

async function main()
{
    //NOTE(Auto): Setup webGL context so we can use the api
    const canvas = document.querySelector('#glCanvas');
    gl = canvas.getContext('webgl');
    if (gl === null) 
    {
        //NOTE(Auto): If the browser don't support it we alert the user and stop running
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    let rendererPromise = await createRenderer('shaders/vertex.glsl', 'shaders/texture.glsl');
    let renderer;

    if(rendererPromise.ok)
    {   
        //NOTE(Auto): if we create the renderer successfully we can use it, for now we will just clear the canvas with blurish-green color
        renderer = rendererPromise.shader;

        // Set clear color and depth
        gl.clearColor(0.0, 0.5, 0.5, 1.0);
        gl.clearDepth(1.0);
        // Clear the color buffer with specified clear color and also depth buffer
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //NOTE(Auto): We will add a gameloop here in the future
        //requestAnimationFrame(gameLoop);
    }
    else
    {
        //NOTE(Auto): if creating renderer failed, display the error message and then abort
        let err = document.createElement('p');
        err.textContent = "ERR: Create renderer failed!";
        return;
    }
}

//NOTE(Auto): Fetch the shaders from server, just localhost in our case 
async function getShader(shader)
{
    const result = await fetch(shader);

    if(result.ok)
    {
        let text = await result.text();
        return {src: text, ok: true};
    }
    else
    {
        return {err: 'FILE NOT FOUND', ok: false};
    }
}

//NOTE(Auto): Create our renderer to draw graphics
async function createRenderer(v, f)
{
    const vsrc = await getShader(v);
    const fsrc = await getShader(f);

    if(vsrc.ok && fsrc.ok) return {shader: createShader(vsrc, fsrc), ok: true};

    return {err: 'create renderer failed!', ok: false};
}

//NOTE(Auto): Creating the shader program 
function createShader(v, f)
{
    let vertexShader = loadShader(gl, gl.VERTEX_SHADER, v.src);
    let fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, f.src);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

//NOTE(Auto): Create and compile shader source code, if it compile successfully we move on to creating the shader program
function loadShader(gl, type, source)
{
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
    {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}