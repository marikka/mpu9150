// Some default settings
var MPU = require('./defines');

module.exports.GyroAccelLpf = MPU.MPU9150_LPF_20;
module.exports.GyroAccelSampleRate = 50;

module.exports.GyroFsr = MPU.MPU9150_GYROFSR_1000;
module.exports.AccelFsr = MPU.MPU9150_ACCELFSR_8;

module.exports.PI = Math.PI;