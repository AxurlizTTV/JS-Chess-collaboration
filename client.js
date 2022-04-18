//NOTE(Auto): Using a lib for matrix operaion cuz writing our own is pain in the ass
const mat4 = glMatrix.mat4;

//Global gl context
let gl;

main();

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
        let last = 0;

        let vertexLoc = gl.getAttribLocation(renderer, 'aVertexPosition');
        let texcoordLoc = gl.getAttribLocation(renderer, 'aTexCoords');

        const rectVert = [
            0.5, 0.5,       
            0.5, -0.5,      
            -0.5, -0.5,     
            -0.5, -0.5,     
            -0.5, 0.5,      
            0.5, 0.5,          
        ];
        
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectVert), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vertexLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vertexLoc);

        const texcoords = [
            1, 1,
            1, 0,
            0, 0,
            0, 0,
            0, 1,
            1, 1
        ];

        const texcoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordsBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
        gl.vertexAttribPointer(texcoordLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(texcoordLoc);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        let pieceTextures = new Array(PIECES.bK+1);
        pieceTextures[PIECES.wP] = loadTexture('img/pawn_white.png');
        pieceTextures[PIECES.wN] = loadTexture('img/knight_white.png');
        pieceTextures[PIECES.wB] = loadTexture('img/bishop_white.png');
        pieceTextures[PIECES.wR] = loadTexture('img/rook_white.png');
        pieceTextures[PIECES.wQ] = loadTexture('img/queen_white.png');
        pieceTextures[PIECES.wK] = loadTexture('img/king_white.png');
        pieceTextures[PIECES.bP] = loadTexture('img/pawn_black.png');
        pieceTextures[PIECES.bN] = loadTexture('img/knight_black.png');
        pieceTextures[PIECES.bB] = loadTexture('img/bishop_black.png');
        pieceTextures[PIECES.bR] = loadTexture('img/rook_black.png');
        pieceTextures[PIECES.bQ] = loadTexture('img/queen_black.png');
        pieceTextures[PIECES.bK] = loadTexture('img/king_black.png');

        let squareTextureA = loadTexture('img/squareA.png');
        let squareTextureB = loadTexture('img/squareB.png');

        requestAnimationFrame(gameLoop);

        function gameLoop(now)
        {
            let dt = now - last;
            last = now;

            // Set clear color and depth
            gl.clearColor(0.0, 0.5, 0.5, 1.0);
            gl.clearDepth(1.0);
            // Clear the color buffer with specified clear color and also depth buffer
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            const projection = mat4.create();
            mat4.ortho(projection, 0, 640, 640, 0, -1, 1);
            setMat4(renderer, projection, 'projection');

            let startPos = new Vector3(40, 40, 0);
            let sqDim = new Vector3(80, 80, 0);
            let sqCount = 8;

            for(let ranks = RANKS.RANK_1; ranks < sqCount; ++ranks)
            {
                for(let files = FILES.FILE_A; files < sqCount; ++files)
                {
                    let pos = startPos.add(new Vector3(files*sqDim.x, ranks*sqDim.y, 0));
                    let sqIndex = FR2SQ(files, ranks);
                    
                    if(ranks % 2 == 0)
                    {
                        if(files % 2 == 0)
                        {
                            drawRect(renderer, pos.toArr(), sqDim.toArr(), [1, 1, 1, 1], squareTextureA);
                        }
                        else
                        {
                            drawRect(renderer, pos.toArr(), sqDim.toArr(), [1, 1, 1, 1], squareTextureB);
                        }
                    }
                    else
                    {
                        if(files % 2 == 0)
                        {
                            drawRect(renderer, pos.toArr(), sqDim.toArr(), [1, 1, 1, 1], squareTextureB);
                        }
                        else
                        {
                            drawRect(renderer, pos.toArr(), sqDim.toArr(), [1, 1, 1, 1], squareTextureA);
                        }
                    }

                    let piece = GameBoard.pieces[sqIndex];
                    if(piece != PIECES.EMPTY)
                    {
                        drawRect(renderer, pos.toArr(), sqDim.toArr(), [1, 1, 1, 1], pieceTextures[piece]);
                    }
                }
            }

            requestAnimationFrame(gameLoop);
        }
    }
    else
    {
        //NOTE(Auto): if creating renderer failed, display the error message and then abort
        let err = document.createElement('p');
        err.textContent = "ERR: Create renderer failed!";
        return;
    }
}

//NOTE(Auto): Util function for uploading uniform data to the gpu
function setMat4(renderer, matrix, loc)
{
    gl.useProgram(renderer);
    gl.uniformMatrix4fv(gl.getUniformLocation(renderer, loc), false, matrix);
}

//NOTE(Auto): Very simple drawRect function that render a rectangle texture, it takes in the shader, position, dimension, color and the texture
function drawRect(renderer, pos, dim, color, texture)
{
    const model = mat4.create();
    mat4.translate(model, model, pos);
    mat4.scale(model, model, dim);

    gl.useProgram(renderer);
    gl.uniform4fv(gl.getUniformLocation(renderer, 'color'), color);
    setMat4(renderer, model, 'model');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    let textureLoc = gl.getUniformLocation(renderer, 'texture');
    gl.uniform1i(textureLoc, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.disable(gl.BLEND);
}

function loadTexture(src)
{
    function isPowerOf2(value) 
    {
        return (value & (value - 1)) == 0;
    }
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

    const image = new Image();
    image.onload = function() 
    {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        if (isPowerOf2(image.width) && isPowerOf2(image.height)) 
        {
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        } 
        else 
        {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = src;

    return texture;
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