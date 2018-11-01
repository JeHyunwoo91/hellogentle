var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var mysql = require('mysql');
var logger = require('./logger');

function timeString(dt){
	return dt.getFullYear() + '-' +
		('00' + (dt.getMonth() + 1)).slice(-2)+
		'-'+ ('00' + dt.getDate()).slice(-2) + 
		' ' + ('00' + (dt.getHours())).slice(-2) + 
		':' + ('00' + dt.getMinutes()).slice(-2) +
		':' + ('00' + dt.getSeconds()).slice(-2);
}

//예외 발생시 처리
process.on('uncaughtException', function(err){
	console.log('Caught exception at passport_stylist: '+err);
});

module.exports = function(passport) {
	console.log('pass1_st');
  
  passport.serializeUser(function(stylist, done) {

  	console.log('pass2_st');
    logger.debug('passport.serializeStylist()', stylist);
    done(null, stylist.stid);
  });
  
  passport.deserializeUser(function(stid, done) {  

  	console.log('pass3_st');
    process.nextTick(function() {
    	pool.getConnection(function(err, connection) {
        if (err) {
          return done(err);
        }
        
        /**
         * stid : 스타일리스트 id, account : 스타일리스트 로그인 계정, password : 스타일리스트 비밀번호, 
         * kakaolink : 스타일리스트 옐로아이디 링크, prof_img : 스타일리스트 프로필 이미지, 
         * intro : 스타일리스트 소개글, join_date : 스타일리스트 가입날짜
         */
        // 로그인 된 회원의 정보를 검색
        var selectSql = "select * " +
        										"from stylist " +
        										"where stid = ?";

        connection.query(selectSql, stid, function(err, rows, fields) {
        	if (err) {
        		err = new Error("스타일리스트 정보 불러오기에 실패하였습니다.");
        		connection.release();
						return done(err);
					} else {
						var stylist = {}; // callback으로 넘겨줄 stylist 객체 생성
	          stylist.stid = rows[0].stid; // 스타일리스트 id를 stylist객체에 선언
	          stylist.account = rows[0].account; // 스타일리스트 로그인 id를 stylist객체에 선언
	          stylist.kakaolink = rows[0].kakaolink; // 스타일리스트 옐로우 ID를 stylist객체에 선언
	          stylist.intro = rows[0].intro; // 스타일리스트 소개글을 stylist객체에 선언
	          stylist.join_date = rows[0].join_date; // 스타일리스트 가입날짜를 stylist객체에 선언
	          if (rows[0].prof_img === null) { // 만약 스타일리스트의 프로필 이미지가 없다면
	          	stylist.prof_img = "default_img.png"; // default 이미지 처리
						} else { // 스타일리스트의 프로필 이미지가 존재한다면
							stylist.prof_img = rows[0].prof_img; // 기존 스타일리스트의 프로필 이미지를 stylist객체에 선언
						}
						connection.release();
						logger.debug('passport.deserializeStylist()', stylist);
	          return done(null, stylist); // callback에 user객체를 넘긴다
					}
        }); // end of connection.query
      }); // end of pool.getconnection
		}); // end of process.nexttick 
  }); // end of passport.deserializeUser
  
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'account',
    passwordField: 'password',
    passReqToCallback: true // login_id와 password를 verify에 넘긴다
  },
  function(req, account, password, done) {

  	console.log('local1_st:'+req.stylist.kakaolink+"/"+account+"/"+password);
    process.nextTick(function() {
      pool.getConnection(function(err, connection) {
        if (err) {
          return done(err);
        }
        
        // 스타일리스트가 가입시 사용하고자 하는 로그인 ID가 이미 존재하는지 여부 검사
        var selectSql = "select stid " +
        										"from stylist " +
        										"where account = ?";
        connection.query(selectSql, account, function(err, rows, fields) {
          if (err) {
            connection.release();
            return done(err);
          }
          if (rows.length) { // 이미 요청 로그인 ID가 존재할시
            connection.release();
            return done(null, false, '해당 스타일리스트 계정은 이미 존재합니다. 다른 계정을 입력해주세요.');
          } else {
            async.waterfall([
                function generateSalt(callback) {
                  var rounds = 10;
                  bcrypt.genSalt(rounds, function(err, salt) { // callback으로 generatesalt된 salt를 받는다
                    logger.debug('bcrypt.genSalt() ====> ' + salt + '(' + salt.toString().length +')');
                    callback(null, salt); // hashPassword로 salt를 넘긴다
                  });
                },
                function hashPassword(salt, callback) {
                  bcrypt.hash(password, salt, null, function(err, hashPass) { // callback으로 hash화된 hashpass를 넘겨받는다
                    logger.debug('bcrypt.hash() ====> ' + hashPass + '(' + hashPass.length + ')');
                    var newStylist = {}; // callback으로 회원관련 정보를 넘기기 위해 newStylist 객체 선언
                    newStylist.account = req.body.account; // 회원 이메일을 newStylist 객체에 선언
                    newStylist.password = hashPass; // hash처리된 회원 비밀번호를 newStylist 객체에 선언
                    newStylist.kakaolink = req.body.kakaolink; // 회원 이름을 newStylist 객체에 선언
                    if (req.body.prof_img === undefined) { // 만약 회원의 프로필 이미지가 없다면
                    	newStylist.prof_img = "icon.png"; // default 이미지 처리
          					} else { // 회원의 프로필 이미지가 존재한다면
          						newStylist.prof_img = req.body.prof_img; // 기존 회원의 프로필 이미지를 stylist 객체에 선언
          					}
                    
                		var nTime = new Date();                		
                		newStylist.join_date = timeString(nTime);
                    
                    callback(null, newStylist); // callback으로 newUser 객체를 넘긴다
                  });
                }
            ],
            function(err, newStylist) {
              if (err) {
                connection.release();
                return done(err);
              }
              /**
               * account : 로그인 계정(필수), password : 비밀번호(필수), kakaolink : 옐로우 ID(필수), join_date : 가입일자 및 시각
               */
              // newStylist 객체의 정보를 통해 새로운 스타일리스트 가입 및 정보 추가

              var insertSql = "insert into stylist (account, password, kakaolink, prof_img, join_date) " +
              										"values(?, ?, ?, ?, ?)";
              console.log(newStylist.account+"/"+ newStylist.password+"/"+ newStylist.kakaolink+"/"+ 
                  newStylist.prof_img+"/"+ newStylist.join_date);
              connection.query(insertSql, [newStylist.account, newStylist.password, newStylist.kakaolink, 
                                           newStylist.prof_img, newStylist.join_date], function(err, result) {
                if (err) {
                  connection.release();
                  return done(err);
                } else {
                	newStylist.stid = result.insertId;
									connection.release();
									return done(null, newStylist);
								}
              });
            });
          }
        });
      });
    });
  }));
  
  passport.use('local-login', new LocalStrategy({
    usernameField: 'account',
    passwordField: 'password',
    passReqToCallback: true // login_id와 password를 verify에 넘긴다
  },
  function (req, account, password, done) {
  	process.nextTick(function() {
      pool.getConnection(function(err, connection) {
        if (err) {
          return done(err);
        }
        
        /**
         * stid : 스타일리스트 id, account : 로그인 계정, password : 비밀번호, kakaolink : 옐로우 ID, prof_img : 프로필 이미지
         */
        // req.body로 요청한 로그인 id가 존재할시 해당 회원의 정보를 검색
        var selectSql = "select stid, password, account, kakaolink " +
        										"from stylist " +
        										"where account = ?";
        connection.query(selectSql, account, function(err, rows, fields) {
          if (err) {
            connection.release();
            return done(err);
          }
          if (!rows.length) { // 해당 회원이 존재하지 않을시
            connection.release();
            return done(null, false, 'No stylist found.'); // callback으로 회원이 존재하지 않음을 메세지로 전달
          }
          
          var stylist = {}; // callback으로 스타일리스트 정보를 전달하기 위해 stylist 객체 생성
          stylist.stid = rows[0].stid; // 스타일리스트 id를 stylist 객체에 선언
          stylist.account = rows[0].account; // 스타일리스트 로그인 계정을 stylist 객체에 선언
          stylist.password = rows[0].password; // 스타일리스트 비밀번호를 stylist 객체에 선언
          stylist.kakaolink = rows[0].kakaolink; // 스타일리스트 옐로우 ID를 stylist 객체에 선언
          if (rows[0].prof_img === null) { // 만약 스타일리스트의 프로필 이미지가 없다면
          	stylist.prof_img = "icon.png"; // default 이미지 처리
					} else { // 스타일리스트의 프로필 이미지가 존재한다면
						stylist.prof_img = rows[0].prof_img; // 기존 스타일리스트의 프로필 이미지를 stylist 객체에 선언
					}
          connection.release();
          
          // req.body의 password와 stylist객체의 비밀번호를 복호화 하여 비교
          bcrypt.compare(password, stylist.password, function(err, result) { // 비교 결과 같으면 result는 true, 아니면 false 
            if (!result){ // result : false
              return done(null, false, '비밀번호를 다시한번 확인해주세요.'); // callback으로 비밀번호가 다름을 메시지로 전달
            }
            
            // result : true
            logger.debug('bcrypt.compare() ====> ' + stylist.password + '(' + stylist + ')');
            return done(null, stylist); // callback으로 stylist 객체를 전달한다
          });
        });
      });
    });
  }));
};