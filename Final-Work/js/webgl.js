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

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	// Para el color
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

// Declaramos dos variables globales para mantener los buffer
var triangleVertexPositionBuffer;
var triangleVertexColorBuffer;

var squareVertexPositionBuffer;
var squareVertexColorBuffer; 

// Para la animacion
var rTri = 0, rSquare = 0;

function initBuffers() {
	// Creamos un buffer para la posicion del triangulo.
	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);

	// Definimos los vertices del triangulo
	var vertices = [
		0.0, 1.0, 0.0,
		-1.0, -1.0, 0.0,
		1.0, -1.0, 0.0
			];

	// Creamos un objeto del tipo Float32Array basado en nuestra lista de
	// vertices en javascript, y le decimos a weGL que la use para rellenar el
	// buffer actual.
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems = 3;

	// Especificamos sus colores
	triangleVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	var colors = [
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0
			];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	triangleVertexColorBuffer.itemSize = 4;
	triangleVertexColorBuffer.numItems = 3;

	// Ahora vamos a por el cuadrado
	squareVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);

	vertices = [
		1.0,  1.0,  0.0,
		-1.0,  1.0,  0.0,
		1.0, -1.0,  0.0,
		-1.0, -1.0,  0.0
			];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	squareVertexPositionBuffer.itemSize = 3;
	squareVertexPositionBuffer.numItems = 4;

	// Color en el cuadrado
	squareVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
	colors = []
		for (var i=0; i < 4; i++) {
			colors = colors.concat([0.5, 0.5, 1.0, 1.0]);
		}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	squareVertexColorBuffer.itemSize = 4;
	squareVertexColorBuffer.numItems = 4;
}

// Hacemos la funcion que dibuja la escena
function drawScene() {
	// Decimos a webGL sobre el size del canvas que estamos usando
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Here we’re setting up the perspective with which we want to view the
	// scene.  By default, WebGL will draw things using orthographic
	// projection. Para esta escena, decimos que nuestro field of view es de
	// 45º, y que no queremos ver cosas que estan mas cerca de 0.1 unidades de
	// nuestro viewpoint. Y no queremos ver cosas mas lejos que 100 unidades.

	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

	// Establecemos parametros de dibujo.
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
	
	// Para la animacion
	mvPushMatrix();
	mat4.rotate(mvMatrix, degToRad(rTri), [0, 1, 0]);

	// Dibujamos. En orden de usar un buffer, lo especificamos con
	// gl.bindBuffer, y luego llamamos el codigo que lo opera.
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
			triangleVertexPositionBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
			triangleVertexColorBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);

	setMatrixUniforms();
	
	// Dibuja el array de vertices que te di como triangulos
	gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
	
	mvPopMatrix();

	// Ahora vamos a por el cuadrado
	mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);
	
	// Para la animacion
	mvPushMatrix();
	mat4.rotate(mvMatrix, degToRad(rSquare), [1, 0, 0]);

	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
			squareVertexPositionBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
			squareVertexColorBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);

	setMatrixUniforms();

	// Dibujamos el cuadrado usando triangle_strip
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);

	mvPopMatrix();

}

// Animacion 

var lastTime = 0;
function animate() {
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;

		rTri += (90 * elapsed) / 1000.0;
		rSquare += (75 * elapsed) / 1000.0;
	}
	lastTime = timeNow;
}


// Se encarga de la animacion
function tick() {
	requestAnimFrame(tick);
	drawScene();
	animate();
}

// Inicializa todo. Es como el main()
function webGLStart() {
	// Vamos a inicializar WebGL
	var canvas = document.getElementById("my-canvas");
	initGL(canvas);
	initShaders();
	initBuffers();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	// En vez de llamar a drawScene(), llamamos a tick() que se encargara de
	// darle movimiento a las cosas.
	tick();
}
