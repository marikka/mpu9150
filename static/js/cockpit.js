var cockpit;

(function($) {

	var socket;

	var gamepad;
	var keyboard;
	var controller;

	var startVideo = function() {};

	cockpit = {

		init : function() {

			// Initialise the interface
			cockpit.initialiseInterface();

			// Initialise the sortables on the cockpit interface
			cockpit.initialiseSortables();

			// We want the socket to be global so we can use it everywhere
			socket = io.connect();

			socket.on( 'initialise', function( connections ) {

				// Initialise controller
				cockpit.initialiseController( connections );

				// Initialise heartbeat
				cockpit.initialiseHeartBeat();
			});

		},

		bindVideoStart: function( callback ) {
			startVideo = callback;
		},

		detectController: function() {

			if( gamepad.isAvailable() ) {
			  	controller = gamepad;
			} else {
			  	controller = keyboard;

				controller.bindKeys();
			}

		},

		onSocket: function( waitfor, callback ) {

			socket.on( waitfor, callback );

		},

		emitSocket: function( send, data ) {

			socket.emit( send, data );

		},

		getSocketHost: function() {

			return socket.socket.options.host;

		},

		activateKeybaordControl: function() {
			keyboard.bindKeys();
			gamepad.unbindGamepad();

			cockpit.displayActiveControl( 'keyboard' );

			socket.emit( 'takeControl' );
		},

		activateGamepadControl: function() {

			keyboard.unbindKeys();
			gamepad.bindGamepad();

			cockpit.displayActiveControl( 'gamepad' );

			socket.emit( 'takeControl' );
		},

		disableActiveControl: function() {
			keyboard.unbindKeys();
			gamepad.unbindGamepad();

			cockpit.displayActiveControl( 'disable' );
		},

		displayActiveControl: function( type ) {

			var label = jQuery( '#controloption .controlstatus' ).html();

			switch( type ) {
				case 'keyboard': 	label = 'Control : Keypad <b class="caret"></b>';
									break;

				case 'gamepad': 	label = 'Control : Gamepad <b class="caret"></b>';
				 					break;

				case 'disable': 	label = 'Control : Disabled <b class="caret"></b>';
									break;
			}

			jQuery( '#controloption .controlstatus' ).html( label );

		},

		initialiseController: function( connections ) {

			gamepad = new GamePad();
	 		keyboard = new KeyPad();

			controller = keyboard;

			gamepad.bindDetectionEvent( function() {
		      	// Not doing anything yet other than enable the drop down
				jQuery('#controloption .gamepadcontrol').parent().css('display', 'inline');

				// Activate the gamepad
				cockpit.activateGamepadControl();

				// Bind the relevant keys
				gamepad.bindForward( function() {
					jQuery( document ).trigger( 'singleControlSent', ['forward'] ); 
				} );

				gamepad.bindReverse( function() {
					jQuery( document ).trigger( 'singleControlSent', ['reverse'] ); 
				} );

				gamepad.bindLeft( function() {
					jQuery( document ).trigger( 'singleControlSent', ['left'] ); 
				} );

				gamepad.bindRight( function() {
					jQuery( document ).trigger( 'singleControlSent', ['right'] ); 
				} );

				gamepad.bindSurface( function() {
					jQuery( document ).trigger( 'singleControlSent', ['surface'] ); 
				} );

				gamepad.bindDescend( function() {
					jQuery( document ).trigger( 'singleControlSent', ['descend'] ); 
				} );

				gamepad.bindBrightness( function ( value ) {
					if( value > 0 ) {
						jQuery( document ).trigger( 'singleControlSent', ['lightsplus'] ); 
					} else {
						jQuery( document ).trigger( 'singleControlSent', ['lightsminus'] ); 
					}
	            });

				gamepad.bindVideoStart( function() {
					startVideo();
				} );
		    });

		    this.detectController();

			if( connections == 1 ) {
				// We may be on first / only window so default to keyboard control - will override with gamepad via detection
				cockpit.activateKeybaordControl();
			} else {
				cockpit.disableActiveControl();
			}

			keyboard.bindActivateKeyboardControl( function() {
				cockpit.activateKeybaordControl();
			} );

			gamepad.bindActivateGamepadControl( function() {
				cockpit.activateGamepadControl();
			} );

			// Bind the relevant keys
			keyboard.bindForward( function() {
				jQuery( document ).trigger( 'singleControlSent', ['forward'] ); 
			} );

			keyboard.bindReverse( function() {
				jQuery( document ).trigger( 'singleControlSent', ['reverse'] );
			} );

			keyboard.bindLeft( function() {
				jQuery( document ).trigger( 'singleControlSent', ['left'] ); 
			} );

			keyboard.bindRight( function() {
				jQuery( document ).trigger( 'singleControlSent', ['right'] ); 
			} );

			keyboard.bindSurface( function() {
				jQuery( document ).trigger( 'singleControlSent', ['surface'] ); 
			} );

			keyboard.bindDescend( function() {
				jQuery( document ).trigger( 'singleControlSent', ['descend'] ); 
			} );

			keyboard.bindBrightness( function ( value ) {

				if( value > 0 ) {
					jQuery( document ).trigger( 'singleControlSent', ['lightsplus'] ); 
				} else {
					jQuery( document ).trigger( 'singleControlSent', ['lightsminus'] ); 
				}
                //viewmodel.updateBrightness(value);
                //socket.emit('brightness_update',viewmodel.currentBrightness());
            });

			keyboard.bindPower( function() {
				jQuery( document ).trigger( 'singleControlSent', ['power'] ); 
			} );

			keyboard.bindVideoStart( function() {
				startVideo();
			} );

			socket.on( 'releaseControl', function() {
				cockpit.disableActiveControl();
			} );

			jQuery('#controloption .keyboardcontrol').on( 'click', function( e ) {
				e.preventDefault();

				cockpit.activateKeybaordControl();
			});

			jQuery('#controloption .gamepadcontrol').on( 'click', function( e ) {
				e.preventDefault();

				if( gamepad.isAvailable() ) {
					cockpit.activateGamepadControl();
				}

			});

			jQuery('#controloption .disablecontrol').on( 'click', function( e ) {
				e.preventDefault();

				cockpit.disableActiveControl();
			});

		},

		initialiseSortables: function() {

			jQuery( "ul.droptrue" ).sortable({
				connectWith: "ul",
				placeholder: "widgetplaceholder",
				forcePlaceholderSize: true
			});

			jQuery( "ul.sortablewidgets" ).disableSelection();

		},

		initialiseInterface: function() {

			// Get the layout and set the radio
			var layout = this.getCookie( 'cockpitlayout' );
			// Set the default
			jQuery('#layoutradio-default').attr('checked','checked');

			if( typeof layout != 'undefined' ) {
				jQuery('#layoutradio-' + layout).attr('checked','checked');
			}

			jQuery( '#settingsSaveChanges' ).click( function( e ) {

				var newlayout = jQuery( "input[type='radio'][name='layoutradio']:checked").val();

				// Get the current layout
				var origlayout = cockpit.getCookie( 'cockpitlayout' );

				if( origlayout != newlayout ) {
					cockpit.setCookie( 'cockpitlayout', newlayout, Infinity );
					location.reload( true );
				} else {
					jQuery( '#settingsModal' ).modal( 'hide' );
				}

				return true;

			} );


		},

		initialiseHeartBeat: function() {

			socket.on( 'heartbeat', function( msg ) {
				jQuery( '#heartbeat a span' ).removeClass( 'glyphicon-heart-empty' ).addClass( 'glyphicon-heart' );
				setTimeout( function() { jQuery( '#heartbeat a span' ).removeClass( 'glyphicon-heart' ).addClass( 'glyphicon-heart-empty' ); }, 500);
			} );

		},
		
		getAddWidgetLocation: function() {
			
			var containers = jQuery('.sortablewidgets');
			var least_children = null;
			var smallest_container = null;
			
			for(var i = 0; i < containers.length; i++)
			{
			    var container = containers[i];

			    if( least_children === null || container.childElementCount < least_children )
			    {
			        least_children = container.childElementCount;
			        smallest_container = container;
			    }
			};
			
			return smallest_container;
			
		},
		
		removeWidget: function( widget ) {
			
		},
		
		moveWidgetToLocation: function( widget, location ) {
			
		},

		getCookie: function( sKey ) {
			return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
		},

		setCookie: function( sKey, sValue, vEnd, sPath, sDomain, bSecure ) {
		    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }

					var sExpires = "";
				    if (vEnd) {
				      switch (vEnd.constructor) {
				        case Number:
				          sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
				          break;
				        case String:
				          sExpires = "; expires=" + vEnd;
				          break;
				        case Date:
				          sExpires = "; expires=" + vEnd.toUTCString();
				          break;
				}
		     }

	    	document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
	   		return true;
	  	},

	  	removeCookie: function( sKey, sPath, sDomain ) {
	    	if (!sKey || !this.hasItem(sKey)) { return false; }
	    	document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
	    	return true;
	  	},

	  	hasCookie: function( sKey ) {
	    	return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	  	},

	  	cookieKeys: /* optional method: you can safely remove it! */ function() {
	    	var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
	    	for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
	    	return aKeys;
	  	}


	};

	$( document ).ready( function(){ cockpit.init(); } );

})( jQuery );
