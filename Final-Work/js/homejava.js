/// Para dibujar distintos objetos
var objetoRepresentar,
	objetoPosicion = 0,
	carJson, // mi variable global json para el auto
	step_url = window.location.href,
	currentDiapositiva = 0;

if ( step_url.search("diap&") === -1 ) {
	window.location.href = step_url + "?diap&" + currentDiapositiva;	
}

// para localizar la diapositiva
currentDiapositiva = parseInt(step_url.substr(step_url.search("diap&") + 5, 2));

function cambiarDiapositiva(incremento, first) {

	if (!first) {
		if (incremento) {
			currentDiapositiva += 1;  
		} else if (currentDiapositiva > 0) {
			currentDiapositiva -= 1;
		}
		window.location.href = step_url.substring(0, step_url.search("diap") - 1) + "?diap&" + parseInt(currentDiapositiva);
	}
	$("#diapositiva, #contador").fadeOut('normal', function() {						
		// Llamamos a car.json para que nos de una mano almacenando cosas
		$.getJSON('js/car.json', function(data) {
			// Guardamos mi carJson
			carJson = data;

			$("#diapositiva").load(carJson["orden"][currentDiapositiva], function() {
				if (carJson["orden"][currentDiapositiva] === "page/webgl.html") {
					objetoRepresentar = carJson["objetos"][objetoPosicion]; // inicializamos
					webGLStart(); // una vez cargado, iniciamos el webGL
				} else {
					webGLStop();
				}
				$("#contador").html("#diapositiva: " + (parseInt(currentDiapositiva) + 1));
				$("#diapositiva, #contador").fadeIn('normal');
			});			
		});	
	});		
}
cambiarDiapositiva(true, true);

$(document).keydown(function(e){
	if (e.keyCode === 37 || e.keyCode === 33) { // left key or repag
		cambiarDiapositiva(false);
		return false;
	} else if (e.keyCode === 39 || e.keyCode === 34) { // right key or avpag
		cambiarDiapositiva(true);
		return false;
	}

	if (e.keyCode === 67 || e.keyCode == 99) { // tecla C
		objetoPosicion += 1;
		if (objetoPosicion >= carJson["objetos"].length) {
			objetoPosicion = 0;
		}		
		objetoRepresentar = carJson["objetos"][objetoPosicion];
	}
});
