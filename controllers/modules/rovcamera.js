/*
 *
 * Description:
 * This script creates a directory and sends that as an argument to a spawned process (capture.cpp).
 * Then, it sends a request to capture a frame with file name of current time at a given interval.
 * Lastly, when (capture.cpp) responds with the file name (meaning save completed), it reads the file
 * and then emits the content to the Node.js server in base64 (string) format.
 *
 */

var CONFIG = require('../../config/config.js');

var spawn = require('child_process').spawn;
var util = require('util');

var request = require('request');

var eventemitter = require('events').EventEmitter;

var fs = require('fs');

var path = require('path');

var moment = require('moment');


var rovcamera = function () {

  	var camera = new eventemitter();
	var capture_process;

	// Open mjpg_streamer app as a child process
	var cmd = 'mjpg_streamer';

	var _capturing = false;

	var args= [ '-i' ,
	            '/usr/local/lib/input_uvc.so -r ' + CONFIG.get( 'modules:rovcamera:video_resolution' ) + ' -f ' + CONFIG.get( 'modules:rovcamera:video_frame_rate' ),
	            '-o',
	            '/usr/local/lib/output_http.so -p ' + CONFIG.get( 'modules:rovcamera:video_port' ),
				''
	          ];

	// Actual camera capture starting mjpg-stremer
	camera.initialise = function (callback) {

		if( _capturing ) {
			// We are already streaming so we don't need to do anything else
			camera.emit( 'videoStarted',  ':' + CONFIG.get('modules:rovcamera:video_port') + '/?action=stream' );
		} else {
			// if camera working, should be at options.device (most likely /dev/video0 or similar)
			fs.exists( CONFIG.get( 'modules:rovcamera:video_device' ), function( exists ) {
			// Check if the camera exists
				if (!exists) {
					return callback(new Error( CONFIG.get( 'modules:rovcamera:video_device' ) + ' does not exist'));
				}

				_capturing = true; // then remember that we're capturing

				capture_process = spawn(cmd, args);

				console.log('camera started');

				capture_process.on('close', function (data) {
		  			//console.log('closed event fired');
					camera.emit('videoStarted', ':' + CONFIG.get('modules:rovcamera:video_port') + '/?action=stream');
				});

				capture_process.stdout.on('data', function (data) {
		  			//console.log('stdout: ' + data);
				});

				capture_process.stderr.on('data', function (data) {
					//console.log('stderr: ' + data);
					camera.emit('videoStarted', ':' + CONFIG.get('modules:rovcamera:video_port') + '/?action=stream');
				});

				capture_process.on('exit', function (code) {
					console.log('child process exited with code ' + code);
				});
			});
		}

	}

	camera.status = function( callback ) {

		if( _capturing ) {
			return ':' + CONFIG.get('modules:rovcamera:video_port') + '/?action=stream';
		} else {
			return 'off';
		}
	}

	// End camera process gracefully
	camera.close = function() {
	  	if ( !_capturing ) {
	    	return;
	  	}

	  	_capturing = false;

	  	process.kill( capture_process.pid, 'SIGHUP' );
	}

	camera.snapshot = function(callback) {
	  	if ( !_capturing ) {
	    	return;
	  	}

	  	var filename = CONFIG.get( 'modules:rovcamera:photo_directory' ) + '/ROV'+ moment().format("YYYYMMDDHHmmss") +'.jpg';

	  	request( 'http://localhost:' + CONFIG.get( 'modules:rovcamera:video_port' ) +'/?action=snapshot' ).pipe( fs.createWriteStream( filename ) );

	  	callback( filename );

	}

	return camera;
};

module.exports = rovcamera;