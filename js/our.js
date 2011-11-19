/** Creo al director */

var director = new CAAT.Director().initialize(
		100, // ancho
		100, // largo
		document.getElementById('_c1'));

var scene = director.createScene();

/* Creo un circulo */
var circle = new CAAT.ShapeActor().
	setLocation(20,20).
	setSize(60,60).
	setFillStyle('#ff0000').
	setStrokeStyle('#000000');

scene.addChild(circle);

director.loop(1);

