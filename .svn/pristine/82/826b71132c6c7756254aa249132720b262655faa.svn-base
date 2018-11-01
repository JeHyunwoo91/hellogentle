var express = require('express'),
	path = require('path'),
	favicon = require('serve-favicon'),
	app_logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	mysql = require('mysql'),
	passport = require('passport'),
	flash = require('connect-flash'),
	session = require('express-session'),
	SessionStore = require('express-mysql-session');

var dbconfig = require('./configue/database'); // db setting
var dbconfig2 = require('./configue/skhu_server_database');
/* db server 연동을 외부 모듈에서도 쓰일수 있게 global로 선언 */
global.pool = mysql.createPool(dbconfig);
global.pool2 = mysql.createPool(dbconfig2);
/* logger를 외부 모듈에서도 쓰일수 있게 global로 선언*/
global.logger = require('./configue/logger');

require('./configue/passport')(passport);

var payment = require('./routes/payment');
var user = require('./routes/user');
var stylist = require('./routes/stylist');
var md = require('./routes/md');
var gb = require('./routes/gb');
var mycloset = require('./routes/mycloset');
var mycart = require('./routes/mycart');
var images = require('./routes/images');

var app = express();

/////////////////////////////////////////
//view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.set('view engine', 'ejs');
app.engine('html',require('ejs').renderFile);
/////////////////////////////////////////

app.use(app_logger('dev')); // 개발자들을 위해 경우에따라 색상을 달리하여 응답 출력

/* 어떠한 형식의 encode가 들어와도 수용 및 json으로 return */
app.use(bodyParser.json());

/* urlencoded body들의 middleware를 return, qs 모듈 구문의 확장 */
app.use(bodyParser.urlencoded({ extended: true }));

/* header 정보 구문 분석 */
app.use(cookieParser());

/* session option setting */
app.use(session({
	store : new SessionStore(dbconfig), // session store 구성
	secret : 'hello_gentle', // session cookie 서명
	cookie : { // session cookie setting
		maxAge : 86400000 // session 기한을 하루로
	},
	resave : true, // 수정되지 않을때도 저장되도록 
	saveUninitialized : true // ??
}));
app.use(passport.initialize()); // passport 초기화
app.use(passport.session()); // 로그인 session 지속
app.use(flash()); // session이 사용되는 특정 구역에 메세지를 저장하기 위해
app.use(express.static(path.join(__dirname, 'public')));

// mount 
app.use('/user', user);
app.use('/stylist', stylist);
app.use('/md', md);
app.use('/gb', gb);
app.use('/mycloset', mycloset);
app.use('/mycart', mycart);
app.use('/images', images);
app.use('/payment', payment);


// Not Found
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        global.logger.error(err.message);
        /*res.render('error.html', {
        	message : err.message,
        	error : err
        });*/
        res.json({
        	"error" : true,
        	"message" : err.message,
        	"result" : err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
		console.log(err);
    res.status(err.status || 500);
    /*res.render('error.html', {
    	message : err.message,
    	error : {}
    });*/
    res.json({
    	"error" : true,
    	"message" : err.message,
    	"result" : null
    });
});


module.exports = app;
