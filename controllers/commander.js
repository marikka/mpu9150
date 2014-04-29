/*
* The controlling functionality - also holds status of ROV in space ( and time ),
*/

// Load the file system
var fs = require( 'fs' );
var b = require( 'bonelite' );

// require the hardware interface
//var b = require( 'bonescript' );

// report that we are up and running
console.log( 'Started Commader' );



var fadingUp = true; 

var level = 0.0;

b.startPWM('pwm_direction_right');
b.startPWM('pwm_direction_left');
b.startPWM('pwm_direction_depth');
b.analogWrite('pwm_direction_right', level); 
b.analogWrite('pwm_direction_left', level); 
b.analogWrite('pwm_direction_depth', level); 

console.log( "after write" );

changeLevel();

function changeLevel() { 
	if (level > 1.0) {
		fadingUp = false; 
	}

	if(level<0){ 
		fadingUp = true;
	}

	if (fadingUp) {
		level = level + 0.01; 
	} else {
		level = level - 0.01;
	}
	
	//b.analogWrite(ledPin, level); 
	b.analogWrite('pwm_direction_right', level); 
	b.analogWrite('pwm_direction_left', level); 
	b.analogWrite('pwm_direction_depth', level); 
	//b.analogWrite(ledPin3, level);

	setTimeout(changeLevel, 10); 

}

/*
var commander = function( eventLoop ) {

	// The main ROV position object
	var rovstatus = {
	    roll	: 0,
	    pitch	: 0,
	    yaw		: 0,
	    thrust	: 0,
		depth 	: 0,
		lat		: 0,
		lng		: 0
	}


	var serial;
  var globalEventLoop = eventLoop;
  var reader = new StatusReader();
  var physics = new ArduinoPhysics();
  var getNewSerial = function(){
        var s = new serialPort.SerialPort(CONFIG.serial, {
        baudrate: CONFIG.serial_baud,
        parser: serialPort.parsers.readline("\r\n")
    });
        s.on( 'close', function (data) {
         logger.log('!Serial port closed');
        });

        s.on( "data", function( data ) {
         var status = reader.parseStatus(data,controller);
	 controller.emit('status',status);
         if ('ver' in status)
           controller.ArduinoFirmwareVersion = status.ver;
	 if ('IMUMatrix' in status) {controller.emit('navdata',stripANGHeader(status.IMUMatrix));
	 }
	 if ('TSET' in status) {
		console.log(status.settings);
		var setparts = status.settings.split(",");
		settingsCollection.smoothingIncriment = setparts[0];
		settingsCollection.deadZone_min = setparts[1];
		settingsCollection.deadZone_max = setparts[2];
		controller.emit('Arduino-settings-reported',settingsCollection)
	 }
	 if ('CAPA' in status) {
	    var s = rovsys;
	    console.log("RovSys: " + status.CAPA)
	    s.capabilities = parseInt(status.CAPA);
	    controller.Capabilities= s.capabilities;
	    controller.emit('rovsys',s);
	 }
	 if ('cmd' in status) {
	    var s = rovsys;
	    console.log("cmd: " + status.cmd)
	 }
	 if ('log' in status) {
	    var s = rovsys;
	    console.log("log: " + status.log)
	 }
        });
        return s;
  };


  setup_serial();

  // ATmega328p is connected to Beaglebone over UART1 (pins TX 24, RX 26)
  if (CONFIG.production) serial = getNewSerial();


  var controller = new EventEmitter();

  controller.ArduinoFirmwareVersion = 0;
  controller.Capabilities = 0;

  controller.requestCapabilities = function(){
    console.log("Sending rcap to arduino");
    var command = 'rcap();';
    if(CONFIG.debug_commands) console.error("command", command);
    if(CONFIG.production) serial.write(command);
  };

  controller.requestSettings = function(){
    var command = 'reportSetting();';
    if(CONFIG.debug_commands) console.error("command", command);
    if(CONFIG.production) serial.write(command);
  };

  controller.updateSetting = function(){
    var command = 'updateSetting(' + CONFIG.preferences.get('smoothingIncriment') + ',' + physics.mapMotor(CONFIG.preferences.get('deadzone_neg')) + ','+ physics.mapMotor(CONFIG.preferences.get('deadzone_pos')) + ');';
    if(CONFIG.debug_commands) console.error("command", command);
    console.log(command);
    if(CONFIG.production) serial.write(command);
  };

  controller.NotSafeToControl = function(){ //Arduino is OK to accept commands
    if (this.ArduinoFirmwareVersion >= .20130314034859) return false;
    if (this.Capabilities != 0) return false; //This feature added after the swap to ms on the Arduino
    console.log('Audrino is at an incompatible version of firmware. Upgrade required before controls will respond');
    console.log(this.ArduinoFirmwareVersion);
    console.log(this.Capabilities);
    return true;
  };


    controller.sendMotorTest = function(port, starbord, vertical) {
        if (this.NotSafeToControl()) return;
        var command = 'go(' + physics.mapRawMotor(port) + ',' + physics.mapRawMotor(vertical) + ',' + physics.mapRawMotor(starbord) + ',1);'; //the 1 bypasses motor smoothing
        if(CONFIG.debug_commands) console.error("command", command);
        if(CONFIG.production) serial.write(command);
    };

    controller.sendCommand = function(throttle, yaw, vertical) {
      if (this.NotSafeToControl()) return;
      var motorCommands = physics.mapMotors(throttle, yaw, vertical);
      var command = 'go(' + motorCommands.port + ',' + motorCommands.vertical + ',' + motorCommands.starbord + ');';
      console.log(command);
      if(CONFIG.debug_commands) console.error("command", command);
      if(CONFIG.production) serial.write(command);
    };

    controller.sendTilt = function(value) {
        if (this.NotSafeToControl()) return;
        var servoTilt = physics.mapTiltServo(value);
        var command = 'tilt(' + servoTilt +');';
        if(CONFIG.debug_commands) console.error("command", command);
        if(CONFIG.production) serial.write(command);
    };

    controller.sendLight = function(value) {
        if (this.NotSafeToControl()) return;
        var light = physics.mapLight(value);
        var command = 'light(' + light +');';
        if(CONFIG.debug_commands) console.error("command", command);
        if(CONFIG.production) serial.write(command);
    };

    controller.stop = function(value) {
        if (this.NotSafeToControl()) return;
        var command = 'stop();';
        if(CONFIG.debug_commands) console.error("command", command);
        if(CONFIG.production) serial.write(command);
    };

    controller.start = function(value) {
        if (this.NotSafeToControl()) return;
        var command = 'start();';
        if(CONFIG.debug_commands) console.error("command", command);
        if(CONFIG.production) serial.write(command);
    };

  globalEventLoop.on('register-ArdunoFirmwareVersion', function(val){
        controller.ArduinoFirmwareVersion = val;
  });

  globalEventLoop.on('register-ArduinoCapabilities', function(val){
        controller.Capabilities = val;
  });


  globalEventLoop.on('serial-stop', function(){
	logger.log("Closing serial connection for firmware upload");
	serial.close();
	 });

  globalEventLoop.on('serial-start', function(){
	serial = getNewSerial();
	controller.updateSetting();
	logger.log("Opened serial connection after firmware upload");
	});

  return controller;
}

module.exports = commander;
*/