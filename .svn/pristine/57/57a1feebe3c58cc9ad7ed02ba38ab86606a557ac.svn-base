var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var mysql = require('mysql');
var logger = require('./logger');

function timeString(dt){
	return dt.getFullYear() + '년 ' +
		('00' + (dt.getMonth() + 1)).slice(-2)+
		'월 '+ ('00' + dt.getDate()).slice(-2) + 
		'일 ' + ('00' + (dt.getHours())).slice(-2) + 
		':' + ('00' + dt.getMinutes()).slice(-2) +
		':' + ('00' + dt.getSeconds()).slice(-2);
}

//예외 발생시 처리
process.on('uncaughtException', function(err){
	console.log('Caught exception at passport: '+err);
});

module.exports = function(passport) {
	
  passport.serializeUser(function(user, done) {

    logger.debug('passport.serializeUser()', user);
    done(null, user.user_id);
  });
  
  passport.deserializeUser(function(user_id, done) { 

    process.nextTick(function() {
    	pool.getConnection(function(err, connection) {
        if (err) {
          return done(err);
        }
        
        /**
         * user_id : 회원 id, login_id : 회원 로그인 id, password : 회원 비밀번호, name : 회원 이름, 
         * stid : 스타일리스트 id, prof_img : 회원 프로필 이미지
         */
        // 로그인 된 회원의 정보를 검색
        var selectSql = "select user_id, email, name, stid, age, job, phone, zipno, ads_dong, " +
        										"ads_detail, level, mainly, want, worst, shoes, problem, jacket_total_length, " +
        										"jacket_shoulder, jacket_chest, jacket_sleeve, shirts_total_length, shirts_shoulder, " +
        										"shirts_chest, shirts_sleeve, pants_total_length, pants_waist, pants_thight, pants_rise, " +
        										"pants_hem, top, bottom, prof_img, join_date " +
        										"from user " +
        										"where user_id = ?";
        connection.query(selectSql, user_id, function(err, rows, fields) {
        	if (err) {
        		err = new Error("회원 정보 불러오기에 실패하였습니다.");
        		connection.release();
						return done(err);
					} else {
						var user = {}; // callback으로 넘겨줄 user 객체 생성
	          user.user_id = rows[0].user_id; // 회원 id를 user객체에 선언
	          user.email = rows[0].email; // 회원 로그인 id를 user객체에 선언
	          user.stid = rows[0].stid;
	          user.name = rows[0].name; // 회원 이름을 user객체에 선언
	          user.zipno = rows[0].zipno;
	          user.ads_dong = rows[0].ads_dong;
	          user.ads_detail = rows[0].ads_detail;
	          user.age = rows[0].age; // 회원 나이
	          user.job = rows[0].job; // 회원 직업
	          user.phone = rows[0].phone; // 회원 전화번호를 user객체에 선언
	          user.level = rows[0].level; // 패션 관심정도
	          user.mainly = rows[0].mainly; // 일할때 패션
	          user.want = rows[0].want; // 원하는 스타일 
	          user.worst = rows[0].worst; // 싫어하는 스타일
	          user.shoes  = rows[0].shoes; // 신발스타일
	          user.problem = rows[0].problem; // 신체상 문제점
	          user.jacket_total_length = rows[0].jacket_total_length; // 회원 몸무게를 user객체에 선언
	          user.jacket_shoulder = rows[0].jacket_shoulder; // 회원 키를 user객체에 선언
	          user.jacket_chest = rows[0].jacket_chest; // 회원 상체 사이즈를 user객체에 선언
	          user.jacket_sleeve = rows[0].jacket_sleeve; // 회원 상체 사이즈를 user객체에 선언
	          user.shirts_total_length = rows[0].shirts_total_length; // 회원 발 사이즈 user객체에 선언
	          user.shirts_shoulder = rows[0].shirts_shoulder;
	          user.shirts_chest = rows[0].shirts_chest;
	          user.shirts_sleeve = rows[0].shirts_sleeve;
	          user.pants_total_length = rows[0].pants_total_length;
	          user.pants_waist = rows[0].pants_waist;
	          user.pants_thight = rows[0].pants_thight;
	          user.pants_rise = rows[0].pants_rise;
	          user.pants_hem = rows[0].pants_hem;
	          user.top = rows[0].top;
	          user.bottom = rows[0].bottom;
	          user.join_date = rows[0].join_date;
	          if (rows[0].prof_img === null) { // 만약 회원의 프로필 이미지가 없다면
	          	user.prof_img = "default_img.png"; // default 이미지 처리
						} else { // 회원의 프로필 이미지가 존재한다면
							user.prof_img = rows[0].prof_img; // 기존 회원의 프로필 이미지를 user 객체에 선언
						}
	          
	          var query = "select gbid " +
	          								"from gb " +
	          								"where gbid = (select gbid from gb where user_id = ? " +
	          								"order by con_date desc limit 0,1)";
	          connection.query(query, user.user_id, function(err, result) {
	          	if (result.length) {
			          connection.release();
			          user.gbid = result[0].gbid;
			          logger.debug('passport.deserializeUser()', user);
			          return done(null, user); // callback에 user객체를 넘긴다
							} else {
								connection.release();
								logger.debug('passport.deserializeUser()', user);
			          return done(null, user); // callback에 user객체를 넘긴다
							}
	          });
					}
        }); // end of connection.query
      }); // end of pool.getconnection
		}); // end of process.nexttick 
  }); // end of passport.deserializeUser
  
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // login_id와 password를 verify에 넘긴다
  },
  function(req, email, password, done) {

    process.nextTick(function() {
      pool.getConnection(function(err, connection) {
        if (err) {
          return done(err);
        }
        
        // 사용자가 로그인시 사용하고자 하는 로그인 ID가 이미 존재하는지 여부 검사
        var selectSql = "select user_id " +
        										"from user " +
        										"where email = ?";
        connection.query(selectSql, [email], function(err, rows, fields) {
          if (err) {
            connection.release();
            return done(err);
          }
          if (rows.length) { // 이미 요청 로그인 ID가 존재할시
            connection.release();
            return done(null, false, '해당 Email은 이미 존재합니다. 다른 Email을 입력해주세요.');
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
                    var newUser = {}; // callback으로 회원관련 정보를 넘기기 위해 newUser 객체 선언
                    newUser.email = req.body.email; // 회원 이메일을 newUser 객체에 선언
                    newUser.password = hashPass; // hash처리된 회원 비밀번호를 newUser 객체에 선언
                    newUser.name = req.body.name; // 회원 이름을 newUser 객체에 선언
                    if (req.body.prof_img === undefined) { // 만약 회원의 프로필 이미지가 없다면
                    	newUser.prof_img = "icon.png"; // default 이미지 처리
          					} else { // 회원의 프로필 이미지가 존재한다면
          						newUser.prof_img = req.body.prof_img; // 기존 회원의 프로필 이미지를 user 객체에 선언
          					}
                    
                		var nTime = new Date();
                		
                    newUser.join_date = timeString(nTime);
                    
                    callback(null, newUser); // callback으로 newUser 객체를 넘긴다
                  });
                }
            ],
            function(err, newUser) {
              if (err) {
                connection.release();
                return done(err);
              }
              /**
               * email : 로그인 email(필수), password : 비밀번호(필수), name : 이름(필수), join_date : 가입일자 및 시각
               */
              // newUser 객체의 정보를 통해 새로운 회원 가입 및 회원 정보 추가

              var insertSql = "insert into user (email, password, name, prof_img, join_date) " +
              										"values(?, ?, ?, ?, ?)";
              connection.query(insertSql, [newUser.email, newUser.password, newUser.name, newUser.prof_img, newUser.join_date], function(err, result) {
                if (err) {
                  connection.release();
                  return done(err);
                } else {
                	newUser.user_id = result.insertId;
									connection.release();
									return done(null, newUser);
								}
              });
            });
          }
        });
      });
    });
  }));
  
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // login_id와 password를 verify에 넘긴다
  },
  function (req, email, password, done) {
  	process.nextTick(function() {
      pool.getConnection(function(err, connection) {
        if (err) {
          return done(err);
        }
        
        /**
         * user_id : 회원 id, email : 로그인 email, password : 비밀번호, name : 이름, prof_img : 프로필 이미지
         */
        // req.body로 요청한 로그인 id가 존재할시 해당 회원의 정보를 검색
        var selectSql = "select user_id, password, email, name " +
        										"from user " +
        										"where email = ?";
        connection.query(selectSql, [email], function(err, rows, fields) {
          if (err) {
            connection.release();
            return done(err);
          }
          if (!rows.length) { // 해당 회원이 존재하지 않을시
            connection.release();
            return done(null, false, 'No user found.'); // callback으로 회원이 존재하지 않음을 메세지로 전달
          }
          
          var user = {}; // callback으로 회원 정보를 전달하기 위해 user 객체 생성
          user.user_id = rows[0].user_id; // 회원 id를 user 객체에 선언
          user.email = rows[0].email; // 회원 로그인 id를 user 객체에 선언
          user.password = rows[0].password; // 회원 비밀번호를 user 객체에 선언
          user.name = rows[0].name; // 회원 이름을 user 객체에 선언
          if (rows[0].prof_img === null) { // 만약 회원의 프로필 이미지가 없다면
          	user.prof_img = "default_img.png"; // default 이미지 처리
					} else { // 회원의 프로필 이미지가 존재한다면
						user.prof_img = rows[0].prof_img; // 기존 회원의 프로필 이미지를 user 객체에 선언
					}
          connection.release();
          
          // req.body의 password와 user객체의 비밀번호를 복호화 하여 비교
          bcrypt.compare(password, user.password, function(err, result) { // 비교 결과 같으면 result는 true, 아니면 false 
            if (!result){ // result : false
              return done(null, false, '비밀번호를 다시한번 확인해주세요.'); // callback으로 비밀번호가 다름을 메시지로 전달
            }
            
            // result : true
            logger.debug('bcrypt.compare() ====> ' + user.password + '(' + user + ')');
            return done(null, user); // callback으로 user 객체를 전달한다
          });
        });
      });
    });
  }));
};