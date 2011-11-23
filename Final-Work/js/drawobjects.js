var rRotacion = 0; // para la rotacion

// Declaramos variables globales para losbuffers
var pieceVertexPositionBuffer,	
	pieceVertexColorBuffer,
	pieceHasIndex = false, // para el indice de elementos
	pieceVertexIndexBuffer,
	/// normales para la iluminacion
	pieceVertexNormalBuffer;

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
		iHasta = pieceVertexPositionBuffer.numItems / 4;
		
	
	// Si tiene un solo color, se lo aplicamos a todas las caras
	if (!carJson[nombre]["colores"]) {
		for (i = 0; i < pieceVertexPositionBuffer.numItems / 2; i += 1){
			colors = colors.concat([1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0 ]);			
		}
	} else {	
		// A todos los vértices los coloreamos igual
		for (i = 0; i < iHasta; i += 1) {
			for (j=0; j < 4; j++) { // 4 por rgba
				colors = colors.concat(carJson[nombre]["colores"][i]);							
			}
		}
		console.log(colors);
	}
     
	gl.bufferData(gl.ARRAY_BUFFER, 
		new Float32Array(colors), 
		gl.STATIC_DRAW
		);
		
	// Y creamos dos variables para almacenar los tamaños y colores
	pieceVertexColorBuffer.itemSize = 4; // por rgba.
	pieceVertexColorBuffer.numItems = colors.length / 4;
		
	/// ELEMENTOS
	
	// Tiene indice de elementos?
	var pieceVertexIndices = carJson[nombre]["indices"];
	
	if ( pieceVertexIndices ) {
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
		
	mat4.translate(mvMatrix, [0.0, 0.0, -7.0]);
	
	// Simplemente la roto para ver que carajo tas dibujando
	mat4.rotate(mvMatrix, degToRad(rRotacion), [1, 1, 0]);
	
	// Para la animacion
	mvPushMatrix();

	/// FIJAMOS LAS POSICIONES
	
	gl.bindBuffer(gl.ARRAY_BUFFER, pieceVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
			pieceVertexPositionBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);

	/// FIJAMOS LOS COLORES
	
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
	
	/// LUEGO ESTABLEZCO LA PANTALLA

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
	
	/// Y DIBUJAMOS
	
	mvPushMatrix();
	
	drawEachPiece(objetoRepresentar);
	
	mvPopMatrix();
}

/// PARA HACER LA ANIMACION

var lastTime = 0;

function animate() {
	var timeNow = new Date().getTime();
	
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;

		rRotacion += (90 * elapsed) / 1000.0;		
	}
	
	lastTime = timeNow;
}

function tick() {
	requestAnimFrame(tick);
	drawCar();
	animate();
}

/// FUNCION PRINCIPAL

function drawCarScene() {
	
	// Limpiamos la pantalla
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
   
    tick();
	
}
