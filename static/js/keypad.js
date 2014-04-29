var KEYS = {
	9: {	// Tab - video start }
		command: 'video'
	},
	32: { // space (all-stop)
		command: 'stop'
	},
	13: { // Enter (enable keyboard control)
		command: 'activatekeyboardcontrol'
	},
	38: { // up (forward)
	  	command: 'command',
		position: 'throttle',
		value: -1
	},
	40: { // down (aft)
	  	command: 'command',
	  	position: 'throttle',
	  	value: 1
	},
	37: { // left (turn left)
	  	command: 'command',
	  	position: 'yaw',
	  	value: -1
	},
	39: { // right (turn right)
	  	command: 'command',
	  	position: 'yaw',
	  	value: 1
	},
	16: { // shift (lift up)
	  	command: 'command',
	  	position: 'lift',
	  	value: -1 //default 1
	},
	17: { //ctrl (lift down)
	  	command: 'command',
	  	position: 'lift',
	  	value: 1 //default -1
	},
	49: { //1 (power-1)
	  	command: 'power',
	  	value: .05 //def .1
	},
	50: { //2 (power-2)
	  	command: 'power',
	  	value: .1 //def .25
	},
	51: { //3 (power-3)
	  	command: 'power',
	  	value: .2 //def .5
	},
	52: { //4 (power-4)
	  	command: 'power',
	  	value: .5 //def .75
	},
	53: { //5 (power-5)
	  	command: 'power',
	  	value: 1 //def 1
	},
	55: { //7 (vtrim)
	  	command: 'vtrim',
	  	value: 1
	},
	56: { //8 (vttrim)
	  	command: 'vtrim',
	  	value: -1
	},
	57: { //9 (ttrim -)
	  	command: 'ttrim',
	  	value: -1
	},
	48: { //0 (ttrim +)
	  	command: 'ttrim',
	  	value: 1
	},
	81: { //Q (tilt up)
	  	command: 'tilt',
	  	value: 1
	},
	65: { //A (tilt fwd)
	  	command: 'tilt',
	  	value: 0
	},
	90: { //Z (tilt down)
	  	command: 'tilt',
	  	value: -1
	},
	80: { //p (brightness up)
	   	command: 'light',
	   	value: 1
	},
	79: { //o (brightness down)
	   	command: 'light',
	   	value: -1
	}
}

var KeyPad = function() {

	var power = .5; //default to mid power
	var vtrim = 0; //default to no trim
	var ttrim = 0;

	var kp = {};

	var processKeys = true;

	var positions = {
    	throttle: 0,
    	yaw: 0,
    	lift: 0
  	};

	var servoTiltHandler = function( value ) { };
	var brightnessHandler = function( value ) { };

	var processForward = function( value ) { };
	var processReverse = function( value ) { };
	var processLeft = function( value ) { };
	var processRight = function( value ) { };
	var processSurface = function( value ) { };
	var processDescend = function( value ) { };
	var processPower = function( value ) { };

	var processVideoStart = function( value ) { };

	var processKeyboardControl = function( value ) { };

	kp.bindServoTilt = function( callback ) {
	    servoTiltHandler = callback;
	};

	kp.bindBrightness = function( callback ) {
		brightnessHandler = callback;
	};

	// Debug - UI functions
	kp.bindForward = function ( callback ) {
		processForward = callback;
	};

	kp.bindReverse = function ( callback ) {
		processReverse = callback;
	};

	kp.bindLeft = function ( callback ) {
		processLeft = callback;
	};

	kp.bindRight = function ( callback ) {
		processRight = callback;
	};

	kp.bindSurface = function ( callback ) {
		processSurface = callback;
	};

	kp.bindDescend = function ( callback ) {
		processDescend = callback;
	};

	kp.bindPower = function( callback ) {
		processPower = callback;
	}

	kp.bindVideoStart = function( callback ) {
		processVideoStart = callback;
	}

	kp.bindActivateKeyboardControl = function( callback ) {
		processKeyboardControl = callback;
	}

	kp.bindKeys = function(){
	  	processKeys = true;
	};

	kp.unbindKeys = function(){
	  	processKeys = false;
	}

	kp.getPositions = function() {
	  return positions;
	}

	kp.isAvailable = function() {
	  return true;
	}

	var vtrimHandler = function(value){
	  	vtrim += value;
	  	positions.lift = (1/1000) * vtrim;
	};

	var ttrimHandler = function(value){
	  	ttrim += value;
	  	positions.throttle = (1/1000) * ttrim;
	};

	var stopHandler = function(){
	  	vtrim = 0;
	  	ttrim = 0;
	  	positions.throttle = 0;
	  	positions.yaw = 0;
	  	positions.lift = 0;
	};

	kp.activateKeyboardControl = function() {

		// Activate binding of keys
		kp.bindKeys();

		// Run any bound contorls
		processKeyboardControl();
	}

	jQuery( window ).keydown( function( e ) {

	  	var info = KEYS[ e.keyCode ];

		if ( !info || ( !processKeys && info.command != 'activatekeyboardcontrol') ) {
			return;
		}

		e.preventDefault();

		switch( info.command ) {
			case 'command': 	switch( info.position ) {
									case 'throttle': 	if( info.value < 0 ) {
															processForward( info.value );
														} else {
															processReverse( info.value );
														}
														break;

									case 'yaw': 		if( info.value > 0 ) {
															processRight( info.value );
														} else {
															processLeft( info.value );
														}
														break;

									case 'lift': 		if( info.value > 0 ) {
															processDescend( info.value );
														} else {
															processSurface( info.value );
														}
														break;
								}

								positions[ info.position ] = info.value * power;

								break;

			case 'tilt': 		servoTiltHandler( info.value );
								break;

			case 'light':		brightnessHandler( info.value );
								break;

			case 'power': 		processPower( info.value );
								power = info.value;
								break;

			case 'vtrim': 		vtrimHandler( info.value );
								break;

			case 'ttrim': 		ttrimHandler( info.value );
								break;

			case 'stop': 		stopHandler();
								break;

			case 'activatekeyboardcontrol':
								kp.activateKeyboardControl();
								break;

			case 'video': 		processVideoStart();
			 					break;

		}

	});

	jQuery( window ).keyup( function( e ) {

		var info = KEYS[ e.keyCode ];

		if ((!info) || (!processKeys)) return;

	  	e.preventDefault();

		switch( info.command ) {
			case 'command': 	positions[info.position] = 0;
								if (info.position == 'throttle') {
							       positions.throttle = (1/1000) * ttrim;
								}

								if (info.position == 'lift') {
							       positions.lift = (1/1000) * vtrim;
								}
								break;


			case 'tilt': 		servoTiltHandler( info.value );
								break;
		}
	});


	return kp;
}
