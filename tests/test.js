var mpu9150 = require('./../index.js');

var imu = new mpu9150();
imu.initialize();

if( imu.testConnection() ) {
	
	setInterval( function() {
		console.log(imu.getMotion9());
	}, 1000 );
}

//imu.setSleepEnabled(1);