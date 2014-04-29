var widgetdebug;

(function($) {

	var gamepad;
	var keyboard;
	var controller;

	widgetdebug = {

		init : function() {

			// Initialise the interface
			widgetdebug.outputHTML();
			
			cockpit.onSocket( 'control', function( data ) {
				jQuery( '#widget-debug .' + data +' .received' ).addClass( 'green' );
				setTimeout( function() { jQuery( '#widget-debug .' + data + ' .received' ).removeClass( 'green' ); }, 500);
			} );
			
			jQuery( document ).on( 'singleControlSent', function( e, operation ) {
				widgetdebug.highlightOperation( operation );
			});

		},
		
		outputHTML: function() {
			
			widgetlocation = cockpit.getAddWidgetLocation();
	
			if( widgetlocation !== null ) {
				// We have a location to add our widget to
				thehtml = '<li class="widget ui-state-default" id="widget-debug"><div class="inner"><h4>Debug Mode</h4><ul><li class="left">Left<span class="received">Received</span></li><li class="right">Right<span class="received">Received</span></li><li class="forward">Forward<span class="received">Received</span></li><li class="reverse">Reverse<span class="received">Received</span></li><li class="surface">Surface<span class="received">Received</span></li><li class="descend">Descend<span class="received">Received</span></li><li class="lightsplus">Lights Brighter<span class="received">Received</span></li><li class="lightsminus">Lights Dimmer<span class="received">Received</span></li><li class="power">Power<span class="received">Received</span></li></ul></div></li>';
		
				jQuery( thehtml ).appendTo( widgetlocation );
			}
			
		},
		
		highlightOperation: function( operation ) {

			jQuery( '#widget-debug .' + operation ).addClass( 'green' );
			cockpit.emitSocket( 'control', operation );
			setTimeout( function() { jQuery( '#widget-debug .' + operation ).removeClass( 'green' ); }, 500);

		}
		
	};

	$( document ).ready( function(){ widgetdebug.init(); } );

})( jQuery );