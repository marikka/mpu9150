var forever = require('forever-monitor');

var child = new (forever.Monitor)('cockpit.js', {
		max: 3,
		silent: process.env.NODE_DEBUG === 'false',
		options: []
	});

child.on('exit', function () {
	console.log('cockpit.js has exited after 3 restarts');
});

child.start();