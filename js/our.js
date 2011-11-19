CAAT.modules.initialization= CAAT.modules.initialization || {};

CAAT.modules.initialization.init = function( width, height, runHere, imagesURL, onEndLoading )   {
		/**
		 ** create a director.
		 **/
		var director = new CAAT.Director().initialize (
						100,	// 100 pixels wide
						100,	// 100 pixels across
						document.getElementById('_c1'));

		var scene =director.createScene();

		var circle = new CAAT.ShapeActor().
				setLocation(20,20).
				setSize(60,60).
				setFillStyle('#ff0000').
				setStrokeStyle('#000000');

		scene.addChild(circle);

		director.loop(1);

};
