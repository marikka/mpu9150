//http://www.html5rocks.com/en/tutorials/doodles/gamepad/gamepad-tester/tester.html
//useful for testing the buttons and finding the numbers
//
//Requires the https://github.com/kallaspriit/HTML5-JavaScript-Gamepad-Controller-Library
//library.
var GamePad = function() {

	var gamepad = new Gamepad();
	var gp = {};

	var processGamepad = true;

    var padStatus = {
        position: {
            throttle: 0,
            yaw: 0,
            lift: 0
        },
        tilt: 0,
        light: 0
    }

	var ttrim = 0;
    var ltrim = 0;

	var powerLevel = .4;

    var isSupported = function () { };

    var servoTiltHandler = function( value ) { };
    var brightnessHandler = function( value ) { };
    var detectionHandler = function( value ) { };

	var processForward = function( value ) { };
	var processReverse = function( value ) { };
	var processLeft = function( value ) { };
	var processRight = function( value ) { };
	var processSurface = function( value ) { };
	var processDescend = function( value ) { };
	var processPower = function( value ) { };

	var processVideoStart = function( value ) { };

	var processGamepadControl = function( value ) { };

    var ignoreInputUntil = 0;

	var updateStatus = function() {
	   window.requestAnimationFrame(updateStatus);
	}

    //These must be bound to by the code that instantiates the gamepad.
    gp.bindServoTilt = function(callback){
        servoTiltHandler = callback;
    };

    gp.bindBrightness = function(callback){
        brightnessHandler = callback;
    };

    gp.bindDetectionEvent = function(callback){
        detectionHandler = callback;
    };

	// Debug - UI functions
	gp.bindForward = function ( callback ) {
		processForward = callback;
	};

	gp.bindReverse = function ( callback ) {
		processReverse = callback;
	};

	gp.bindLeft = function ( callback ) {
		processLeft = callback;
	};

	gp.bindRight = function ( callback ) {
		processRight = callback;
	};

	gp.bindSurface = function ( callback ) {
		processSurface = callback;
	};

	gp.bindDescend = function ( callback ) {
		processDescend = callback;
	};

	gp.bindPower = function( callback ) {
		processPower = callback;
	}

	gp.bindVideoStart = function( callback ) {
		processVideoStart = callback;
	}

	gp.bindActivateGamepadControl = function( callback ) {
		processGamepadControl = callback;
	}

    gp.getPositions = function() {
        window.requestAnimationFrame(updateStatus);
        return padStatus.position;
    }

	gp.isAvailable = function() {
	    if(gamepad.count() == 0) {
			return false;
		} else {
			return true;
		}
	}

	gp.bindGamepad = function(){
	  	processGamepad = true;
	};

	gp.unbindGamepad = function(){
	  	processGamepad = false;
	}

	gp.activateGaempadControl = function() {

		// Activate binding of keys
		gp.bindGamepad();

		// Run any bound contorls
		processGamepadControl();
	}

    var advancePowerLevels = function(){
        powerLevel+= .2;
        if (powerLevel > 1) powerLevel = .2;

    };

	gamepad.bind(Gamepad.Event.BUTTON_DOWN, function( e ) {

		if( !e.control || ( !processGamepad && e.control != 'SELECT_BACK' ) ) {
			return;
		}

		switch (e.control) {
			case 'RIGHT_TOP_SHOULDER':
				// Increase brightness
				brightnessHandler( 1 );
				break;
			case 'RIGHT_BOTTOM_SHOULDER':
				// Decrease brightness
				brightnessHandler( -1 );
				break;
			case 'START_FORWARD':
				// Video start
				processVideoStart();
				break;
			case 'SELECT_BACK':
				gp.activateGaempadControl();
				break;
			default:
				console.log( e.control );
				break;
		};

	});

	gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {

		if ((new Date().getTime()) < ignoreInputUntil) {
			//avoids inacurrate readings when the gamepad has just been connected from affecting the ROV
			return;
		}

		if( !e.axis || !processGamepad ) {
			return;
		}

	  	switch ( e.axis ) {
	    	case 'LEFT_STICK_X':
				if( e.value < 0 ) {
					// Left
					processLeft( e.value );
				} else if ( e.value > 0 ) {
					// Right
					processRight( e.value );
				}
	      		//padStatus.position.yaw = e.value*powerLevel;
	      		break;

	    	case 'LEFT_STICK_Y':
	      		if ( e.value < 0 ) {
					// Forwards
	        		processForward( e.value );
	      		} else if ( e.value > 0 ) {
					// Backwards
					processReverse( e.value );
	        		//padStatus.position.throttle = -1*e.value*powerLevel;
	      		}
	      		break;

	    	case 'RIGHT_STICK_Y':
	      		if ( e.value < 0 ) {
					// Up
					processSurface( e.value );
	        		//padStatus.position.lift = ltrim
	      		} else if ( e.value > 0 ) {
					// Down
					processDescend( e.value );
	        		//padStatus.position.lift = -1*e.value*powerLevel;
	      		}
	      		break;
	  	}
	});

	gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
	  ignoreInputUntil = new Date().getTime() + 1000;
	  console.log('Controller connected', device);
	  detectionHandler();
	});

	gamepad.bind(Gamepad.Event.DISCONNECTED, function(device) {
	  console.log('Controller disconnected', device);
	  detectionHandler();
	});

	gamepad.bind(Gamepad.Event.UNSUPPORTED, function(device) {
	  console.log('Unsupported controller connected', device);
	});

	if (!gamepad.init()) {
		console.log('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
  	}

  	return gp;
}