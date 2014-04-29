//
//  Copyright (c) 2014 Dark Water Foundation C.I.C.
//
//  Based on a C library by richards-tech - https://github.com/richards-tech/RTIMULib/blob/master/RTIMULib/RTIMUMPU9150.h
//
//  This file is part of RTIMULib
//
//  RTIMULib is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  RTIMULib is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with RTIMULib.  If not, see <http://www.gnu.org/licenses/>.
//

module.exports.MPU9150_ADDRESS0 		   =  0x68;
module.exports.MPU9150_ADDRESS1 		   =  0x69;
module.exports.MPU9150_ID       		   =  0x68;

module.exports.AK8975_ADDRESS   		   =  0x0c;

//  Register map
module.exports.MPU9150_YG_OFFS_TC        =  0x01;
module.exports.MPU9150_SMPRT_DIV         =  0x19;
module.exports.MPU9150_LPF_CONFIG        =  0x1a;
module.exports.MPU9150_GYRO_CONFIG       =  0x1b;
module.exports.MPU9150_ACCEL_CONFIG      =  0x1c;
module.exports.MPU9150_FIFO_EN           =  0x23;
module.exports.MPU9150_I2C_MST_CTRL      =  0x24;
module.exports.MPU9150_I2C_SLV0_ADDR     =  0x25;
module.exports.MPU9150_I2C_SLV0_REG      =  0x26;
module.exports.MPU9150_I2C_SLV0_CTRL     =  0x27;
module.exports.MPU9150_I2C_SLV1_ADDR     =  0x28;
module.exports.MPU9150_I2C_SLV1_REG      =  0x29;
module.exports.MPU9150_I2C_SLV1_CTRL     =  0x2a;
module.exports.MPU9150_I2C_SLV4_CTRL     =  0x34;
module.exports.MPU9150_INT_PIN_CFG       =  0x37;
module.exports.MPU9150_INT_ENABLE        =  0x38;
module.exports.MPU9150_INT_STATUS        =  0x3a;
module.exports.MPU9150_ACCEL_XOUT_H      =  0x3b;
module.exports.MPU9150_GYRO_XOUT_H       =  0x43;
module.exports.MPU9150_EXT_SENS_DATA_00  =  0x49;
module.exports.MPU9150_I2C_SLV1_DO       =  0x64;
module.exports.MPU9150_I2C_MST_DELAY_CTRL=  0x67;
module.exports.MPU9150_USER_CTRL         =  0x6a;
module.exports.MPU9150_PWR_MGMT_1        =  0x6b;
module.exports.MPU9150_PWR_MGMT_2        =  0x6c;
module.exports.MPU9150_FIFO_COUNT_H      =  0x72;
module.exports.MPU9150_FIFO_R_W          =  0x74;
module.exports.MPU9150_WHO_AM_I          =  0x75;

//  sample rate defines (applies to gyros and accels, not mags)
module.exports.MPU9150_SAMPLERATE_MIN    =  5;                      // 5 samples per second is the lowest
module.exports.MPU9150_SAMPLERATE_MAX    =  1000;                   // 1000 samples per second is the absolute maximum

//  compass rate defines
module.exports.MPU9150_COMPASSRATE_MIN   =  1;                      // 1 samples per second is the lowest
module.exports.MPU9150_COMPASSRATE_MAX   =  100;                   // 100 samples per second is maximum

//  LPF options (gyros and accels)
module.exports.MPU9150_LPF_256           =  0;                       // gyro: 256Hz, accel: 260Hz
module.exports.MPU9150_LPF_188           =  1;                       // gyro: 188Hz, accel: 184Hz
module.exports.MPU9150_LPF_98            =  2;                       // gyro: 98Hz, accel: 98Hz
module.exports.MPU9150_LPF_42            =  3;                       // gyro: 42Hz, accel: 44Hz
module.exports.MPU9150_LPF_20            =  4;                       // gyro: 20Hz, accel: 21Hz
module.exports.MPU9150_LPF_10            =  5;                       // gyro: 10Hz, accel: 10Hz
module.exports.MPU9150_LPF_5             =  6;                       // gyro: 5Hz, accel: 5Hz

//  Gyro FSR options
module.exports.MPU9150_GYROFSR_250       =  0;                       // +/- 250 degrees per second
module.exports.MPU9150_GYROFSR_500       =  8;                       // +/- 500 degrees per second
module.exports.MPU9150_GYROFSR_1000      =  0x10;                    // +/- 1000 degrees per second
module.exports.MPU9150_GYROFSR_2000      =  0x18;                    // +/- 2000 degrees per second

//  Accel FSR options
module.exports.MPU9150_ACCELFSR_2        =  0;                       // +/- 2g
module.exports.MPU9150_ACCELFSR_4        =  8;                       // +/- 4g
module.exports.MPU9150_ACCELFSR_8        =  0x10;                    // +/- 8g
module.exports.MPU9150_ACCELFSR_16       =  0x18;                    // +/- 16g


//  AK8975 compass registers
module.exports.AK8975_DEVICEID           =  0x0;                     // the device ID
module.exports.AK8975_ST1                =  0x02;                    // status 1
module.exports.AK8975_CNTL               =  0x0a;                    // control reg
module.exports.AK8975_ASAX               =  0x10;                    // start of the fuse ROM data

//  FIFO transfer size
module.exports.MPU9150_FIFO_CHUNK_SIZE   =  12;                      // gyro and accels take 12 bytes

/*
// Set up the standard addresses for the breakout board - soldered = 0x68, unsoldered = 0x69
MPU9150.ADDRESS_AD0_LOW = 0x68; // address pin low (GND);
MPU9150.ADDRESS_AD0_HIGH = 0x69; // address pin high (VCC)
MPU9150.DEFAULT_ADDRESS = MPU9150.ADDRESS_AD0_LOW;

MPU9150.RA_MAG_ADDRESS_00   =   0x0C;
MPU9150.RA_MAG_ADDRESS_01   =   0x0D;
MPU9150.RA_MAG_ADDRESS_10   =   0x0E; // default for InvenSense MPU-6050 evaluation board
MPU9150.RA_MAG_ADDRESS_11   =   0x0F;
MPU9150.RA_MAG_DEFAULT_ADDRESS = MPU9150.RA_MAG_ADDRESS_00;

// WHO_AM_I register

MPU9150.RA_WHO_AM_I = 0x75;
MPU9150.WHO_AM_I_BIT = 6;
MPU9150.WHO_AM_I_LENGTH = 6;

// GYRO_CONFIG register

MPU9150.RA_GYRO_CONFIG = 0x1B;
MPU9150.GCONFIG_FS_SEL_BIT = 4;
MPU9150.GCONFIG_FS_SEL_LENGTH = 2;
MPU9150.GYRO_FS_250  = 0x00;
MPU9150.GYRO_FS_500  = 0x01;
MPU9150.GYRO_FS_1000 = 0x02;
MPU9150.GYRO_FS_2000 = 0x03;

// ACCEL_CONFIG register

MPU9150.RA_ACCEL_CONFIG = 0x1C;
MPU9150.ACONFIG_AFS_SEL_BIT = 4;
MPU9150.ACONFIG_AFS_SEL_LENGTH = 2;
MPU9150.ACCEL_FS_2  = 0x00;
MPU9150.ACCEL_FS_4  = 0x01;
MPU9150.ACCEL_FS_8  = 0x02;
MPU9150.ACCEL_FS_16 = 0x03;

// ACCEL_*OUT_* registers

MPU9150.RA_ACCEL_XOUT_H = 0x3B;
MPU9150.RA_ACCEL_XOUT_L = 0x3C;
MPU9150.RA_ACCEL_YOUT_H = 0x3D;
MPU9150.RA_ACCEL_YOUT_L = 0x3E;
MPU9150.RA_ACCEL_ZOUT_H = 0x3F;
MPU9150.RA_ACCEL_ZOUT_L = 0x40;

// GYRO_*OUT_* registers

MPU9150.RA_GYRO_XOUT_H = 0x43;
MPU9150.RA_GYRO_XOUT_L = 0x44;
MPU9150.RA_GYRO_YOUT_H = 0x45;
MPU9150.RA_GYRO_YOUT_L = 0x46;
MPU9150.RA_GYRO_ZOUT_H = 0x47;
MPU9150.RA_GYRO_ZOUT_L = 0x48;


//Magnetometer Registers
MPU9150.RA_INT_PIN_CFG  =   0x37

MPU9150.RA_MAG_XOUT_L   =   0x03
MPU9150.RA_MAG_XOUT_H   =   0x04
MPU9150.RA_MAG_YOUT_L   =   0x05
MPU9150.RA_MAG_YOUT_H   =   0x06
MPU9150.RA_MAG_ZOUT_L   =   0x07
MPU9150.RA_MAG_ZOUT_H   =   0x08

MPU9150.RA_CNTL         =   0x0A;
MPU9150.RA_MODE_SINGLE  =   0x01;


MPU9150.INTCFG_I2C_BYPASS_EN_BIT    =   1;

MPU9150.MAG_RA_ST1      =   0x02;
MPU9150.MAG_ST1_READY   =   0x01;

// For the compass test function
MPU9150.RA_WIA   =   0x00;

// PWR_MGMT_1 register

MPU9150.RA_PWR_MGMT_1 = 0x6B;
MPU9150.PWR1_DEVICE_RESET_BIT = 7;
MPU9150.PWR1_SLEEP_BIT = 6;
MPU9150.PWR1_CYCLE_BIT = 5;
MPU9150.PWR1_TEMP_DIS_BIT = 3;
MPU9150.PWR1_CLKSEL_BIT = 2;
MPU9150.PWR1_CLKSEL_LENGTH = 3;

*/