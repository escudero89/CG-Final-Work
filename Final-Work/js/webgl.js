// Configuramos nuestro webGL
var gl;
function initGL(canvas) {
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
}

// Esta funcion busca en el arbol DOM de nuestra página HTML algun elemento que
// contenga la ID especifica como parametro de la funcion, extrae todo su
// contenido, y le pasa el codigo a webGL para que compile y pueda ejecutarse.
// Despues el codigo controla cualquier posible error y acaba.

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

var shaderProgram;

function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);
	
	/// Para la posición
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	
	/// Para el color
	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

// Creamos las matrices de "Modelo-Vista" y de "Proyeccion"
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var mvMatrixStack = [];

// Funciones que agrego para hacer push y pop facilmente
function mvPushMatrix() {
	var copy = mat4.create();
	mat4.set(mvMatrix, copy);
	mvMatrixStack.push(copy);
}

function mvPopMatrix() {
	if (mvMatrixStack.length == 0) {
		throw "Invalid popMatrix!";
	}
	mvMatrix = mvMatrixStack.pop();
}

// Funcion de grados a radianes
function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

// Actualizamos las matrices modelo-vista y proyeccion que tenemos en la
// memoria javascript.
function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

/*****************************************************************************
 * TODO LO ANTERIOR ERA PARA INICIALIZAR LA VENTANA Y ESTABLECER ALGUNAS
 * FUNCIONES BÁSICAS DE OPENGL (de manejo de matrices). AHORA VIENE LO
 * DIVERTIDO.
 ****************************************************************************/

// Inicializa todo. Es como el main()
function webGLStart() {
	// Vamos a inicializar WebGL
	var canvas = document.getElementById("my-canvas");

	// Chequea por errores
 	ctx = WebGLDebugUtils.makeDebugContext(canvas.getContext("experimental-webgl"));
	
	// Inicio los canvas y los shaders
	initGL(canvas);
	initShaders();
	
	// Dibujo
	drawCarScene();
}

function webGLStop() {
//	requestAnimFrame();
}
