// Copyright (C) 2013 - Texas Instruments, Jason Kridner
//
// This is meant to hold some private functions
//
var fs = require('fs');
var child_process = require('child_process');
var bone = require('./bone');

var capemgr;

exports.file_exists = fs.exists;
exports.file_existsSync = fs.existsSync;
if(typeof exports.file_exists == 'undefined') {
    var path = require('path');
    exports.file_exists = path.exists;
    exports.file_existsSync = path.existsSync;
}

exports.file_find = function(path, prefix, attempts) {
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

exports.is_capemgr = function() {
    if(typeof capemgr == 'undefined') {
        capemgr = exports.file_find('/sys/devices', 'bone_capemgr.');
        if(typeof capemgr == 'undefined') capemgr = false;
    }
    return(capemgr);
};

// Note, this just makes sure there was an attempt to load the
// devicetree fragment, not if it was successful
exports.load_dt = function(name) {
    if(!exports.is_capemgr()) return(false);
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

exports.create_dt = function(pin, data, template) {
    template = template || 'bspm';
    var done = 0;
    var fragment = template + '_' + pin.key + '_' + data.toString(16);
    var dtsFilename = '/lib/firmware/' + fragment + '-00A0.dts';
    var dtboFilename = '/lib/firmware/' + fragment + '-00A0.dtbo';
    if(exports.file_existsSync(dtboFilename)) return(exports.load_dt(fragment));
    var templateFilename = require.resolve('bonescript').replace('index.js',
        template + '_template.dts');

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
            exports.load_dt(fragment);
        }
    }
}

exports.eval = function(x) {
    var y;
    try {
        y = eval(x);
    } catch(ex) {
        y = undefined;
        throw('myeval error: ' + ex);
    }
    return(y);
};

exports.require = function(packageName, onfail) {
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

exports.getpin = function(pin) {
    if(typeof pin == 'object') return(pin);
    else if(typeof pin == 'string') return(bone.pins[pin]);
    else if(typeof pin == 'number') return(bone.pinIndex[pin]);
    else throw("Invalid pin: " + pin);
};

exports.wrapCall = function(m, func, funcArgs, cbArgs) {
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

exports.wrapOpen = function(m, openArgs) {
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