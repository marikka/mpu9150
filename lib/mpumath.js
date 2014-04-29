


module.exports.currentUSecsSinceEpoch = function() {

	var t = new Date();

	return t.getUTCSeconds() * 1000000 + ( t.getUTCMilliseconds() * 1000 );

}