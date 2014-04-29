var widgetdepthgrid;

(function($) {

	var depthgrid;
	var scale = 3;
	
	var width;
	var height;
	var center;

	widgetdepthgrid = {

		init : function() {

			// Initialise the interface
			widgetdepthgrid.outputHTML();
			
			widgetdepthgrid.resizeCanvas();
			
			widgetdepthgrid.drawSelf();
			
			jQuery(window).resize( widgetdepthgrid.resizeCanvas );
			

		},
		
		outputHTML: function() {
			
			widgetlocation = cockpit.getAddWidgetLocation();
	
			if( widgetlocation !== null ) {
				// We have a location to add our widget to
				thehtml = '<li class="widget ui-state-default" id="widget-depthgrid"><div class="nopaddinginner"><canvas id="depthgrid"></canvas></div></li>';
		
				jQuery( thehtml ).appendTo( widgetlocation );
				
				depthgrid = jQuery('#depthgrid');
			}
			
		},
		
		initialiseCanvas: function() {
			
			width = jQuery( '#widget-depthgrid .nopaddinginner').innerWidth();
			height = jQuery( '#widget-depthgrid .nopaddinginner').innerWidth() * 0.15;
			
			center = [ (width / 2), (height / 2) ];
			
			console.log( center );
			
			depthgrid.attr( "width", width );
			depthgrid.attr( "height", height );
			
		},
		
		resizeCanvas: function() {
			
			widgetdepthgrid.initialiseCanvas();
			
			widgetdepthgrid.drawGrid();
			
			widgetdepthgrid.drawSelf();
			
			widgetdepthgrid.drawTrace();
			
		},
		
		drawGrid: function () {
			
			var context = depthgrid.get(0).getContext("2d");
		
			context.beginPath();
			context.lineWidth = 1;

			for (var x = 0; x < width; x += (10 * scale)) {
			  context.moveTo(x, 0);
			  context.lineTo(x, height);
			}

			for (var y = 0; y < height; y += (10 * scale)) {
			  context.moveTo(0, y);
			  context.lineTo(width, y);
			}

			context.strokeStyle = "#333";
			context.stroke();
			context.closePath();
		},
		
		drawSelf: function() {
			// Draw a representation of ourself on the grid - in the middle
			
			var topX, topY, widthX, heightY;
			
			var context = depthgrid.get(0).getContext("2d");
			
			// Main box
			topX = center[0] - (5 * scale);
			topY = center[1] - (2.5 * scale);
			
			widthX = (10 * scale);
			heightY = (5 * scale);
			
			context.beginPath();
			context.lineWidth = 1;
			
			context.strokeStyle = "#ddd";
			context.fillStyle = "#222";
			context.fillRect( topX, topY, widthX, heightY );
			context.strokeRect( topX, topY, widthX, heightY );
			
			// Visible side propeller housing
			topX = center[0] - (6 * scale);
			topY = center[1] + (0.5 * scale);
			
			widthX = (12 * scale);
			heightY = (3 * scale);
			
			context.strokeStyle = "#ddd";
			context.fillStyle = "#222";
			context.fillRect( topX, topY, widthX, heightY );
			context.strokeRect( topX, topY, widthX, heightY );
			
			// Top propeller housing
			topX = center[0] - (2 * scale);
			topY = center[1] - (3.5 * scale);
			
			widthX = (4 * scale);
			heightY = (1 * scale);
			
			context.strokeStyle = "#ddd";
			context.fillStyle = "#222";
			context.fillRect( topX, topY, widthX, heightY );
			context.strokeRect( topX, topY, widthX, heightY );
			
			context.closePath();
			
			
		},
		
		drawTrace: function() {
			// Draw the historical path we have travelled along
			
			var topX, topY, widthX, heightY;
			
			var context = depthgrid.get(0).getContext("2d");
			
			context.beginPath();
			context.lineWidth = 2;
			// Demo line for now
			context.moveTo( center[0] - (5 * scale), center[1] );
			context.lineTo( 0, center[1] );
			
			context.strokeStyle = "#3d931a";
			context.stroke();
			
			context.closePath();
			
			
		},
		
		drawPath: function() {
			// Draw the path we should be following
		}
     
		
	};

	$( document ).ready( function(){ widgetdepthgrid.init(); } );

})( jQuery );