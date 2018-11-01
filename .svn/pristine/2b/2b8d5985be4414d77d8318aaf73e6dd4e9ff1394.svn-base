var winston = require('winston');

var logger = new winston.Logger({
	transports : [
	              new winston.transports.Console({
	              	level : 'debug'
	              }),
	              new winston.transports.DailyRotateFile({
	              	level : 'debug',
	              	dirname: '../logs',
	              	filename : 'app-debugg',
	              	maxsize : 1024*1024*10,
	                dataPattern : ' .yyyy-MM-dd.log'
	              })
	]
});

module.exports = logger;