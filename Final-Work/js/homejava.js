var currentDiapositiva = -1,
	carJson; // mi variable global json para el auto

function cambiarDiapositiva(incremento) {

	$("#diapositiva").fadeOut('normal', function() {

		if (incremento) {
			currentDiapositiva += 1;  
		} else if (currentDiapositiva > 0) {
			currentDiapositiva -= 1;
		}

		// Llamamos a car.json para que nos de una mano almacenando cosas
		$.getJSON('js/car.json', function(data) {
			// Guardamos mi carJson
			carJson = data;

			$("#diapositiva").load(carJson["orden"][currentDiapositiva], function() {
				if (carJson["orden"][currentDiapositiva] === "page/webgl.html") {
					webGLStart(); // una vez cargado, iniciamos el webGL
				} else {
					webGLStop();
				}
			});
		});	

		$("#diapositiva").fadeIn('normal');
	});		
}

cambiarDiapositiva(true);

$(document).keydown(function(e){
	if (e.keyCode === 37 || e.keyCode === 33) { // left key or repag
		cambiarDiapositiva(false);
		return false;
	} else if (e.keyCode === 39 || e.keyCode === 34) { // right key or avpag
		cambiarDiapositiva(true);
		return false;
	}
});
