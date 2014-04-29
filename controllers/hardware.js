// Copyright (C) 2011 - Texas Instruments, Jason Kridner
//
//
var CONFIG = require('../config/config.js');

var fs = require('fs');
var child_process = require('child_process');

var bone = require( CONFIG.get( 'internalmodules:hardware:config') );

/* File - my */
var capemgr;

var my = {};

my.file_exists = fs.exists;
my.file_existsSync = fs.existsSync;
if(typeof my.file_exists == 'undefined') {
    var path = require('path');
    my.file_exists = path.exists;
    my.file_existsSync = path.existsSync;
}

my.file_find = function(path, prefix, attempts) {
    if(typeof attempts == 'undefined') attempts = 1;
    for(var i = 0; i < attempts; i++) {
        try {
            var files = fs.readdirSync(path);
            for(var j in files) {
                if(files[j].indexOf(prefix) == 0) {
                    return(path + '/' + files[j]);
                }
            }
        } catch(ex) {
        }
    }
};

my.is_capemgr = function() {
    if(typeof capemgr == 'undefined') {
        capemgr = my.file_find('/sys/devices', 'bone_capemgr.');
        if(typeof capemgr == 'undefined') capemgr = false;
    }
    return(capemgr);
};

// Note, this just makes sure there was an attempt to load the
// devicetree fragment, not if it was successful
my.load_dt = function(name) {
    if(!my.is_capemgr()) return(false);
    var slots = fs.readFileSync(capemgr + '/slots', 'ascii');
    if(slots.indexOf(name) < 0) {
        try {
            fs.writeFileSync(capemgr + '/slots', name);
        } catch(ex) {
            return(false);
        }
    }
    for(var i = 0; i < 10000; i++) {
        slots = fs.readFileSync(capemgr + '/slots', 'ascii');
        if(slots.indexOf(name) >= 0) return(true);
    }
    return(false);
};

my.create_dt = function(pin, data, template) {
    template = template || 'bspm';
    var done = 0;
    var fragment = template + '_' + pin.key + '_' + data.toString(16);
    var dtsFilename = '/lib/firmware/' + fragment + '-00A0.dts';
    var dtboFilename = '/lib/firmware/' + fragment + '-00A0.dtbo';
    if(my.file_existsSync(dtboFilename)) return(my.load_dt(fragment));
	
    var templateFilename = CONFIG.get( 'internalmodules:hardware:' + template );

    var dts = fs.readFileSync(templateFilename, 'utf8');
    dts = dts.replace(/!PIN_KEY!/g, pin.key);
    dts = dts.replace(/!PIN_DOT_KEY!/g, pin.key.replace(/_/, '.'));
    dts = dts.replace(/!PIN_FUNCTION!/g, pin.options[data&7]);
    dts = dts.replace(/!PIN_OFFSET!/g, pin.muxRegOffset);
    dts = dts.replace(/!DATA!/g, '0x' + data.toString(16));
    if(pin.pwm) {
        dts = dts.replace(/!PWM_MODULE!/g, pin.pwm.module);
        dts = dts.replace(/!PWM_INDEX!/g, pin.pwm.index);
        dts = dts.replace(/!DUTY_CYCLE!/g, 500000);
    }
    fs.writeFileSync(dtsFilename, dts);

    var command = 'dtc -O dtb -o ' + dtboFilename + ' -b 0 -@ ' + dtsFilename;

    var dtc = child_process.exec(command, handler);
    return(false);

    function handler(error, stdout, stderr) {
        if(!error) {
            my.load_dt(fragment);
        }
    }
}

my.eval = function(x) {
    var y;
    try {
        y = eval(x);
    } catch(ex) {
        y = undefined;
        throw('myeval error: ' + ex);
    }
    return(y);
};

my.require = function(packageName, onfail) {
    var y = {};
    try {
        y = require(packageName);
        y.exists = true;
    } catch(ex) {
        y.exists = false;
        if(onfail) onfail();
    }
    return(y);
};

my.getpin = function(pin) {
    if(typeof pin == 'object') return(pin);
    else if(typeof pin == 'string') return(bone.pins[pin]);
    else if(typeof pin == 'number') return(bone.pinIndex[pin]);
    else throw("Invalid pin: " + pin);
};

my.wrapCall = function(m, func, funcArgs, cbArgs) {
    if(!m.module.exists) {
        return(function(){});
    }
    funcArgs.unshift('port');
    funcArgs.push('callback');
    var newFunction = function() {
        var args = [];
        var port = arguments[0];
        var callback = false;
        for(var i = 1; i < arguments.length; i++) {

            if(funcArgs[i] == 'callback') {
                callback = arguments[i];
                var wrappedCallback = function() {
                    var cbData = {};
                    for(var j = 0; j < cbArgs.length; j++) {
                        cbData[cbArgs[j]] = arguments[j];
                    }
                    cbData.event = 'callback';

                    callback(cbData);
                }
                args.push(wrappedCallback);
            } else {
                args.push(arguments[i]);
            }
        }
        if(!m.openPorts[port]) {
            if(callback) callback({'err': m.name + ' ' + port + ' not opened'});
            return(false);
        }

        var x = m.openPorts[port][func].apply(
                m.openPorts[port], args);
        if(callback) callback({'event': 'return', 'return': x});
        return(x);
    };
    newFunction.args = funcArgs;
    return(newFunction);
};

my.wrapOpen = function(m, openArgs) {
    if(!m.module.exists) {

        return(function(){});
    }
    openArgs.unshift('port');
    openArgs.push('callback');
    var newFunction = function() {
        var args = {};
        for(var i = 0; i < openArgs.length; i++) {
            args[openArgs[i]] = arguments[i];
        }
        var port = args.port;
        var callback = args.callback;

        if(m.ports[port] && m.ports[port].devicetree) {
            var fragment = m.ports[port].devicetree;
            if(!exports.is_capemgr()) {
                if(callback) callback({err:'Kernel does not include CapeMgr module'});
                return(false);
            }
            if(!exports.load_dt(fragment)) {
                if(callback) callback({'err': 'Devicetree overlay fragment ' +
                    fragment + ' not loaded'});
                return(false);
            }
        }
        m.openPorts[port] = m.doOpen(args);
        if(!m.openPorts[port]) {
            if(callback) callback({'err': 'Unable to ' + m.name});
            return(false);
        }
        for(var e in m.events) {
            var addHandler = function(m, port, e) {
                var handler = function() {
                    arguments.event = e;
                    for(var i = 0; i < arguments.length; i++) {
                        arguments[m.events[e][i]] = arguments[i];
                    }
                    callback(arguments);
                };
                m.openPorts[port].on(e, handler);
            }
            addHandler(m, port, e);
        }
        if(callback) callback({'event':'return', 'value':true});
        return(true);
    };
    newFunction.args = openArgs;
    return(newFunction);
};

/* Parse */
var parse = {};

parse.modeFromStatus = function(pinData, mode) {
    mode = mode || {};
    mode.mux = (pinData & 0x07);
    mode.slew = (pinData & 0x40) ? 'slow' : 'fast';
    mode.rx = (pinData & 0x20) ? 'enabled' : 'disabled';
    var pullup = (pinData & 0x18) >> 3;
    switch(pullup) {
    case 1:
        mode.pullup = 'disabled';
        break;
    case 2:
        mode.pullup = 'pullup';
        break;
    case 0:
        mode.pullup = 'pulldown';
        break;
    case 3:
    default:

    }
    return(mode);
};

parse.modeFromOmapMux = function(readout, mode) {

    mode = mode || {};
    // The format read from debugfs looks like this:
    // name: mcasp0_axr0.spi1_d1 (0x44e10998/0x998 = 0x0023), b NA, t NA
    // mode: OMAP_PIN_OUTPUT | OMAP_MUX_MODE3
    // signals: mcasp0_axr0 | ehrpwm0_tripzone | NA | spi1_d1 | mmc2_sdcd_mux1 | NA | NA | gpio3_16
    var breakdown = '';
    try {
        breakdown = readout.split('\n');
    } catch(ex) {
        return(mode);
    }
    try {
        // Parse the muxmode number, '3' in the above example
        mode.mux = breakdown[1].split('|')[1].substr(-1);
        // Parse the mux register value, '0x0023' in the above example
        var pinData = parseInt(breakdown[0].split('=')[1].substr(1,6));

        mode = modeFromStatus(pinData, mode);
    } catch(ex2) {

    }
    try {
        mode.options = breakdown[2].split('|');
        for(var option in mode.options) {
            var x = ''+mode.options[option];
            try {
                mode.options[option] = x.replace(/ /g, '').replace('signals:', '');
            } catch(ex) {

                mode.options[option] = 'NA';
            }
        }
    } catch(ex3) {

        mode.options = null;
    }
    return(mode);
};

parse.modeFromPinctrl = function(pins, muxRegOffset, muxBase, mode) {

    muxBase = muxBase || 0x44e10800;
    mode = mode || {};
    // The format read from debugfs looks like this:
    // registered pins: 142
    // ...
    // pin 108 (44e109b0) 00000027 pinctrl-single
    // ...
    var pinLines = pins.split('\n');
    var numRegistered = pinLines[0].replace(/registered pins: (\d+)/, "$1");
    var pattern = new RegExp('pin ([0-9]+) .([0-9a-f]+). ([0-9a-f]+) pinctrl-single');
    var muxAddress = muxBase + muxRegOffset;
    for(var i = 0; i < numRegistered; i++) {
        var parsedFields = pattern.exec(pinLines[i + 1]);

        var index = parseInt(parsedFields[1], 10);
        var address = parseInt(parsedFields[2], 16);
        var status = parseInt(parsedFields[3], 16);
        if(address == muxAddress) {
            mode = modeFromStatus(status, mode);
            return(mode);
        }
    }
    //winston.error('Did not find status at ' + muxAddress);
    return(mode);
};

/* Serial */
var serial = {};
serial.name = 'serialport';
serial.module = my.require('serialport');
serial.ports = bone.uarts;
serial.events = {
    'open': [],
    'data': ['data']
};
serial.openPorts = {};
serial.doOpen = function(args) {
    var path = args.port;
    if(serial.ports[args.port].path) path = serial.ports[args.port].path;
    var openPort = new serial.module.SerialPort(path, args.options);
    return(openPort);
};

serial.serialOpen = my.wrapOpen(serial, ['options']);
serial.serialWrite = my.wrapCall(serial, 'write', ['data'], ['err', 'results']);

/* Hardware - index */


var debug = false;

var f = {};
var gOUTPUT = "out";
var gINPUT = "in";
var gINPUT_PULLUP = "in_pullup";
var gHIGH = 1;
var gLOW = 0;
var gLSBFIRST = 1;  // used in: shiftOut(dataPin, clockPin, bitOrder, val)
var gMSBFIRST = 0;
var gCHANGE = "both";
var gRISING = "rising";
var gFALLING = "falling";

// Keep track of allocated resources
var gpio = [];
var pwm = {};

// returned object has:
//  mux: index of mux mode
//  options: array of mode names
//  slew: 'fast' or 'slow'
//  rx: 'enabled' or 'disabled'
//  pullup: 'diabled', 'pullup' or 'pulldown'
//  pin: key string for pin
//  name: pin name
f.getPinMode = function(pin, callback) {
    pin = my.getpin(pin);
    var mode = {'pin': pin.key, 'name': pin.name};
    if(pin.options) mode.options = pin.options;
    var muxFile = '/sys/kernel/debug/omap_mux/' + pin.mux;
    var pinctrlFile = '/sys/kernel/debug/pinctrl/44e10800.pinmux/pins';
    var muxRegOffset = parseInt(pin.muxRegOffset, 16);
    var readOmapMux = function(err, data) {
        mode = parse.modeFromOmapMux(data, mode);
        callback(mode);
    };
    var readPinctrl = function(err, data) {
        mode = parse.modeFromPinctrl(data, muxRegOffset, 0x44e10800, mode);
        callback(mode);
    };
    var tryPinctrl = function(exists) {
        if(exists) {
            fs.readFile(pinctrlFile, 'utf8', readPinctrl);
        } else {
            callback(mode);
        }
    };
    var tryOmapMux = function(exists) {
        if(exists) {
            fs.readFile(muxFile, 'utf8', readOmapMux);
        } else {
            my.file_exists(pinctrlFile, tryPinctrl);
        }
    };
    if(callback) {
        my.file_exists(muxFile, tryOmapMux);
    } else {
        try {
            var data = fs.readFileSync(muxFile, 'utf8');
            mode = parse.modeFromOmapMux(data, mode);
        } catch(ex) {
            try {
                var data2 = fs.readFileSync(pinctrlFile, 'utf8');
                mode = parse.modeFromPinctrl(data2, muxRegOffset, 0x44e10800, mode);
            } catch(ex2) {

            }
        }
        return(mode);
    }
};
f.getPinMode.args = ['pin', 'callback'];

f.pinMode = function(pin, direction, mux, pullup, slew, callback) {
    pin = my.getpin(pin);
    if(direction == gINPUT_PULLUP) pullup = 'pullup';
    pullup = pullup || ((direction == gINPUT) ? 'pulldown' : 'disabled');
    slew = slew || 'fast';
    mux = mux || 7; // default to GPIO mode

    if(!pin.mux) {
        throw('Invalid pin object for pinMode: ' + pin);
    }

    var muxFile = '/sys/kernel/debug/omap_mux/' + pin.mux;
    var gpioFile = '/sys/class/gpio/gpio' + pin.gpio + '/value';
    var n = pin.gpio;

    // Handle case where pin is allocated as a gpio-led
    if(pin.led) {
        if((direction != gOUTPUT) || (mux != 7)) {
            var err = 'pinMode only supports GPIO output for LEDs: ' + pin.key;
            if(callback) callback({value:false, err:err});
            return(false);
        }
        gpioFile = '/sys/class/leds/beaglebone::' + pin.led + '/brightness';
        var pathA = "/sys/class/leds/beaglebone:";
        var pathB = pathA;
        pathA += ":" + pin.led + "/trigger";
        pathB += "green:" + pin.led + "/trigger";
        if(my.file_existsSync(pathA)) {
            fs.writeFileSync(pathA, "gpio");
        } else {
            if(my.file_existsSync(pathB)) {
                fs.writeFileSync(pathB, "gpio");
            } else {
            }
        }
        gpio[n] = {'path': gpioFile};
        if(callback) callback({value:true});
        return(true);
    }

    // Figure out the desired value
    var pinData = 0;
    if(slew == 'slow') pinData |= 0x40;
    if(direction != gOUTPUT) pinData |= 0x20;
    switch(pullup) {
    case 'disabled':
        pinData |= 0x08;
        break;
    case 'pullup':
        pinData |= 0x10;
        break;
    default:
        break;
    }
    pinData |= (mux & 0x07);

    if(my.is_capemgr()) {
        my.create_dt(pin, pinData);
    } else {
        try {
            var fd = fs.openSync(muxFile, 'w');
            fs.writeSync(fd, pinData.toString(16), null);
        } catch(ex) {
            // Don't exit yet --- need to try using pinmux-helper with devicetree
            // ... and it might work if the pin is already muxed to 7
            var currentMode = f.getPinMode(pin);
            if(currentMode.mux != mux) {
                var err2 = 'Unable to configure mux for pin ' + pin.key + ': ' + ex;
                gpio[n] = {};
                if(callback) callback({value:false, err:err2});
                return(false);
            }
        }
    }

    // Enable GPIO, if not already done
    if(mux == 7) {
        if(!gpio[n] || !gpio[n].path) {
            gpio[n] = {'path': gpioFile};

            // Export the GPIO controls
            var exists = my.file_existsSync(gpioFile);
            if(exists) {
                fs.writeFileSync("/sys/class/gpio/gpio" + n + "/direction",
                    direction, null);
            } else {
                try {
                    fs.writeFileSync("/sys/class/gpio/export", "" + n, null);
                    fs.writeFileSync("/sys/class/gpio/gpio" + n + "/direction",
                        direction, null);
                } catch(ex2) {
                    var pmerr = 'Unable to export gpio-' + n + ': ' + ex2;
                    var gpioUsers =
                        fs.readFileSync('/sys/kernel/debug/gpio', 'utf-8');
                    gpioUsers = gpioUsers.split('\n');
                    for(var x in gpioUsers) {
                        var y = gpioUsers[x].match(/gpio-(\d+)\s+\((\S+)\s*\)/);
                        if(y && y[1] == n) {
                            var pmerr2 = 'gpio-' + n + ' consumed by ' + y[2];
                            pmerr += '\n' + pmerr2;
                            winston.error(pmerr);
                        }
                    }
                    gpio[n] = {};
                    if(callback) callback({value:false, err:pmerr});
                    return(false);
                }
            }
        }
    } else {
        gpio[n] = {};
    }

    if(callback) callback({value:true});
    return(true);
};
f.pinMode.args = ['pin', 'direction', 'mux', 'pullup', 'slew', 'callback'];

// Exported variables
exports.OUTPUT = gOUTPUT;
exports.INPUT = gINPUT;
exports.INPUT_PULLUP = gINPUT_PULLUP;
exports.HIGH = gHIGH;
exports.LOW = gLOW;
exports.LSBFIRST = gLSBFIRST;
exports.MSBFIRST = gMSBFIRST;
exports.CHANGE = gCHANGE;
exports.RISING = gRISING;
exports.FALLING = gFALLING;
exports.bone = bone; // this likely needs to be platform and be detected
for(var x in f) {
    exports[x] = f[x];
}

for(var x in serial) {
    exports[x] = serial[x];
}
/*
for(var x in iic) {
    exports[x] = iic[x];
}
*/
// Global variable assignments
// This section is broken out because it will eventually be deprecated
var alreadyRan = false;
function setGlobals() {
    for(var x in exports) {
        global[x] = exports[x];
    }
    global.run = run;
    process.nextTick(run);

    function run() {
        if(alreadyRan) return(false);
        alreadyRan = true;
        // 'setup' and 'loop' are globals that may or may not be defined
        if(typeof global.setup == 'function') global.setup();
        while(1) {
            if(typeof global.loop == 'function') global.loop();
        }
    }
}

exports.setGlobals = setGlobals;