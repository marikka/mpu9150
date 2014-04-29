/*
 * Configuration file.  Manage frame rate, port, etc.
 */
var fs = require('fs');
var nconf = require('nconf');

// Load the configuration values
nconf.argv()
       .env()
       .file({ file: './config/config.json', format: nconf.formats.json });

module.exports = nconf;