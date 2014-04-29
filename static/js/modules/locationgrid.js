var widgetlocationgrid;

(function($) {

	var locationgrid;
	var scale = 4;
	
	var width;
	var height;
	var center;

	widgetlocationgrid = {

		init : function() {

			// Initialise the interface
			widgetlocationgrid.outputHTML();
			
			widgetlocationgrid.resizeCanvas();
			
			widgetlocationgrid.drawSelf();
			
			jQuery(window).resize( widgetlocationgrid.resizeCanvas );
			

		},
		
		outputHTML: function() {
			
			widgetlocation = cockpit.getAddWidgetLocation();
	
			if( widgetlocation !== null ) {
				// We have a location to add our widget to
				thehtml = '<li class="widget ui-state-default" id="widget-locationgrid"><div class="nopaddinginner"><canvas id="locationgrid"></canvas></div></li>';
		
				jQuery( thehtml ).appendTo( widgetlocation );
				
				locationgrid = jQuery('#locationgrid');
			}
			
		},
		
		initialiseCanvas: function() {
			
			width = jQuery( '#widget-locationgrid .nopaddinginner').innerWidth();
			height = jQuery( '#widget-locationgrid .nopaddinginner').innerWidth() * 0.66;
			
			center = [ (width / 2), (height / 2) ];
			
			console.log( center );
			
			locationgrid.attr( "width", width );
			locationgrid.attr( "height", height );
			
		},
		
		resizeCanvas: function() {
			
			widgetlocationgrid.initialiseCanvas();
			
			widgetlocationgrid.drawGrid();
			
			widgetlocationgrid.drawSelf();
			
			widgetlocationgrid.drawTrace();
			
		},
		
		drawGrid: function () {
			
			var context = locationgrid.get(0).getContext("2d");
		
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
			
			var context = locationgrid.get(0).getContext("2d");
			
			// Left propeller housing
			topX = center[0] - (6 * scale);
			topY = center[1] - (6 * scale);
			
			widthX = (3 * scale);
			heightY = (12 * scale);
			
			context.beginPath();
			
			context.lineWidth = 1;
			context.strokeStyle = "#ddd";
			context.fillStyle = "#222";
			context.fillRect( topX, topY, widthX, heightY );
			context.strokeRect( topX, topY, widthX, heightY );
			
			// Right propeller housing
			topX = center[0] + (3 * scale);	// 3 = 6 - widthX
			topY = center[1] - (6 * scale);
			
			widthX = (3 * scale);
			heightY = (12 * scale);
			
			context.strokeStyle = "#ddd";
			context.fillStyle = "#222";
			context.fillRect( topX, topY, widthX, heightY );
			context.strokeRect( topX, topY, widthX, heightY );
			
			// Main box
			topX = center[0] - (5 * scale);
			topY = center[1] - (5 * scale);
			
			widthX = (10 * scale);
			heightY = (10 * scale);
			
			context.strokeStyle = "#ddd";
			context.fillStyle = "#222";
			context.fillRect( topX, topY, widthX, heightY );
			context.strokeRect( topX, topY, widthX, heightY );
			
			// Top propeller housing
			context.beginPath();
			context.arc( center[0], center[1], (2 * scale), 0, Math.PI*2,true);
			context.stroke();
			
			context.closePath();
			
			
		},
		
		drawTrace: function() {
			// Draw the historical path we have travelled along
			
			var topX, topY, widthX, heightY;
			
			var context = locationgrid.get(0).getContext("2d");
			
			context.beginPath();
			context.lineWidth = 2;
			// Demo line for now
			context.moveTo( center[0], center[1] + (5 * scale) );
			context.lineTo( center[0], height );
			
			context.strokeStyle = "#3d931a";
			context.stroke();
			
			context.closePath();
		},
		
		drawPath: function() {
			// Draw the path we should be following
		}
     
		
	};

	$( document ).ready( function(){ widgetlocationgrid.init(); } );

})( jQuery );