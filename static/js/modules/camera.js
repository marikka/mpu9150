var camera;

(function($) {

	var videoStreamActive = false;

	var camera = {

		init : function() {

			// Initialise the interface
			this.initialiseInterface();

		},

		initialiseInterface: function() {

			var maxwidth = 1280;
			var maxheight = 1080;
			var ratio = 0;

			var width = jQuery('#videofeed-widget').width();    // Current image width
			var height = jQuery('#videofeed-widget').height();  // Current image height

			// Check if the current width is larger than the max
			if(width < maxwidth){
	            ratio = width / maxwidth;   // get ratio for scaling image
	            jQuery('#videofeed-widget').css("height", maxheight * ratio);  // Scale height based on ratio
	        }

			cockpit.onSocket( 'videoStatus', function( status ) {
				if( status == 'off' ) {
					camera.showStartButton();
				} else {
					// We have some video
					camera.showVideoFeed( status );
				}
			} );

			cockpit.onSocket( 'videoStarted', function( path ) {
				setTimeout( function() {
					camera.showVideoFeed( path );
				}, 500);

			});

			cockpit.emitSocket( 'videoStatus' );

			cockpit.bindVideoStart( function() {
				camera.startVideo();
			} );

		},

		showStartButton: function() {
			// Add the videostart button
			jQuery('#videofeed-widget').empty().append('<button id="videostart">Start Video <span class="glyphicon glyphicon-facetime-video"></span></button>');
			jQuery('#videostart').addClass('btn btn-primary btn-lg')
								.css( 'top', (jQuery('#videofeed-widget').height() / 2) + 'px' )
								.css( 'left', ((jQuery('#videofeed-widget').width() / 2) - (jQuery('#videostart').width() / 2)) + 'px' )
								.css( 'display', 'block' )
								.click( this.startVideo );

		},

		showVideoFeed: function( path ) {

			var maxwidth = 1280;
			var maxheight = 1080;
			var ratio = 0;

			var width = jQuery('#videofeed-widget').width();    // Current image width
			var height = jQuery('#videofeed-widget').height();  // Current image height

			var address = 'http://' + cockpit.getSocketHost() + path;

		   	jQuery('#videofeed-widget').empty().append('<img />').find('img').attr('src', address);

			// Check if the current width is larger than the max
			if(width < maxwidth){
	            ratio = width / maxwidth;   // get ratio for scaling image
	            jQuery('#videofeed-widget').css("height", maxheight * ratio);  // Scale height based on ratio
	        }

		},

		startVideo: function() {

			jQuery( '#videostart' ).html( 'Starting...  <span class="glyphicon glyphicon-time"></span>' );

			// Send the video start request
			cockpit.emitSocket( 'videoStart' );

		},

	};

	$( document ).ready( function(){ camera.init(); } );

})( jQuery );