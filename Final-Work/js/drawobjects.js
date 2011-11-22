var carJson; // mi variable global json para el auto

// Declaramos variables globales para losbuffers
var pieceVertexPositionBuffer,	
	pieceVertexColorBuffer,
	pieceHasIndex = false, // para el indice de elementos
	pieceVertexIndexBuffer;

function drawPiece(nombre) {
	
	/// POSICIÓN
	
	// creamos un buffer para la posición
	pieceVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pieceVertexPositionBuffer);
	
	// definimos los vértices que lo conforman
	var vertices = carJson[nombre]["vertices"];		
	
	// y lo almacenamos
	gl.bufferData(gl.ARRAY_BUFFER, 
		new Float32Array(vertices), 
		gl.STATIC_DRAW
		);	
	
	// Y creamos dos variables para almacenar los tamaños y cantidad de 
	// vértices
	pieceVertexPositionBuffer.itemSize = 3;
	pieceVertexPositionBuffer.numItems = vertices.length / 3;
		
	/// COLOR
	
	// Creamos un buffer para los colores
	pieceVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pieceVertexColorBuffer);
	
	// Ahora vamos a por definir el color
	var i, j, colors = [],
		iHasta = pieceVertexPositionBuffer.numItems / 
				pieceVertexPositionBuffer.itemSize;
	
	// A todos los vértices los coloreamos igual
	for (i = 0; i < iHasta; i += 1) {
		for (j=0; j < 4; j++) { // 4 por rgba
			colors = colors.concat(carJson[nombre]["colores"][i]);			
		}
	}
     
	gl.bufferData(gl.ARRAY_BUFFER, 
		new Float32Array(colors), 
		gl.STATIC_DRAW
		);
		
	// Y creamos dos variables para almacenar los tamaños y colores
	pieceVertexColorBuffer.itemSize = 4; // por rgba.
	pieceVertexColorBuffer.numItems = colors.length / 4;
	
	/// Hora de definir elementos
	
	// Tiene indice de elementos?
	var pieceVertexIndices = carJson[nombre]["indices"];
	
	if ( pieceVertexIndices.length ) {
		pieceHasIndex = true;
		
		pieceVertexIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pieceVertexIndexBuffer);
		
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 
				new Uint16Array(pieceVertexIndices), 
				gl.STATIC_DRAW);

		pieceVertexIndexBuffer.itemSize = 1;
		pieceVertexIndexBuffer.numItems = pieceVertexIndices.length;		
	}
	
}

function drawEachPiece(nombre) {
	/// ESTABLECEMOS LOS OBJETOS
	// Establecemos los parametros de la pieza
	drawPiece(nombre);
	
	mat4.translate(mvMatrix, carJson[nombre]["translate"]);
	
	// Para la animacion
	mvPushMatrix();

	gl.bindBuffer(gl.ARRAY_BUFFER, pieceVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
			pieceVertexPositionBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, pieceVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
			pieceVertexColorBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);

	setMatrixUniforms();

	// Dibujamos dependiendo de si tiene indice de elementos o no
	if (pieceHasIndex) {
		gl.drawElements(gl.TRIANGLES, 
				pieceVertexIndexBuffer.numItems, 
				gl.UNSIGNED_SHORT, 0);

	} else {
		gl.drawArrays(gl.TRIANGLES, 0, pieceVertexPositionBuffer.numItems);		
	}
	
	mvPopMatrix();
}

function drawCar() {
	
	/// LUEGO DIBUJO

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
	
	drawEachPiece("chasis");
}

/// PARA HACER LA ANIMACION

function animate() {
	var timeNow = new Date().getTime();

	lastTime = timeNow;
}

function tick() {
	//requestAnimFrame(tick);
	drawCar();
	animate();
}

/// FUNCION PRINCIPAL

function drawCarScene() {
	
	// Limpiamos la pantalla
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
	
	// Llamamos a car.json para que nos de una mano almacenando cosas
	$.getJSON('js/car.json', function(data) {
		// Guardamos mi carJson
		carJson = data;
		
		// Una vez que está cargado JSON, llamamos a drawCar()		
		tick();		
	});	
	
}
