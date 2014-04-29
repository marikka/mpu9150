var mpu9150 = require('./../version2.js');

var imu = new mpu9150();
imu.initialize();

if( imu.testConnection() ) {
	console.log('Yay');
}

//imu.setSleepEnabled(1);