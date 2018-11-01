var express = require('express'),
	router = express.Router(),
	async = require('async'),
	passport = require('passport'),
	processUploadFiles = require('../lib/hello_gentle').processUploadFiles;


function timeString(dt){
	return dt.getFullYear() + '년 ' +
		('00' + (dt.getMonth() + 1)).slice(-2)+
		'월 '+ ('00' + dt.getDate()).slice(-2) + 
		'일 ' + ('00' + (dt.getHours())).slice(-2) + 
		':' + ('00' + dt.getMinutes()).slice(-2) +
		':' + ('00' + dt.getSeconds()).slice(-2);
}

// process error 처리
process.on('uncaughtException',function(err){
	logger.debug('Caught exception at stylist: '+err);
});

/*function checkaccount(req, res, next) {
	
	*//**
	 * req.body.account : 스타일리스트가 가입하고자 하는 로그인 계정
	 *//*
	var account = req.body.account;
	process.nextTick(function() {
		pool.getConnection(function(err, connection){
		
			*//**
			 * attr = account : 스타일리스트 로그인시 식별 계정
			 * 
			 * table = stylist : 스타일리스트 정보
			 *//*
			 회원이 서비스에 가입하고자 할때 지정하고자하는 로그인 id가 이미 존재하는지 여부 
			var query = "select * " +
											"from stylist " +
											"where account = ?";
			connection.query(query, account, function(err, result){
				if (err) {
					err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요.");
					connection.releasea();
					next(err);
				} else { // 이미 동일한 login_id가 존재할시
					if (result[0] === undefined) {
						connection.release();
						res.json({
							"error" : false,
							"message" : "사용 가능한 계정입니다",
							"result" : null
						});
					} else { // 동일한 login_id가 가입되어있지 않을시
						connection.release();
						res.json({
							"error" : true,
							"message" : "이미 존재하는 계정입니다",
							"result" : null
						});
					}
				}
			});
		});
	});
}

function editstylistprofile(req, res, next) {
	
	if (req.headers['content-type'] === 'application/x-www-form-urlencoded') { // req.header가 urlencoded일 겨우
		var intro = req.body.intro; // 스타일리스트 자기 소개글
		process.nextTick(function() {
			pool.getConnection(function(err, connection){
				
				*//**
				 * attr = address : 회원 주소, phone : 회원 전화번호, age : 나이, job, : 작업, user_id : 회원 id
				 * 
				 * table = stylist : 회원 정보
				 *//*
				// req.body에 들어온 fields 정보들을 통해 회원정보 갱신 
				var query = "update stylist " +
												"set intro	 = ? " +
												"where stid = ?";
				connection.query(query, [intro, req.stylist.stid], function(err, result){
					if (err) {
						err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요.");
						connection.release();
						next(err);
					} else {
						connection.release();
						res.json({
							error : false,
							message : "스타일리스트 정보 수정이 완료되었습니다",
							result : null
						});
					}
				});
			});
		});
	} else { // req.header가 multy part일 경우
		
	*//** 
	 * hello_gentle.js의 form.parse에서 callback으로 넘어온 result 객체를 이용하여 회원정보 변수에 매칭
	 * info : uuid로 변경된 filepath명이 확장자와 함께 넘어온다
	 *//*
		processUploadFiles(req, function(err, result, info){
			var intro = result.formFields.intro,
					 prof_img = info; // 프로필 이미지
			if (err) {
				err = new Error("스타일리스트 정보 갱신에 실패하였습니다. 잠시 후에 다시 시도해주세요.");
				next(err);
			} else {
				process.nextTick(function() {
					pool.getConnection(function(err, connection) {
						
						// form-data로 넘어온 fields와 files의 정보들을 통해 회원 정보 갱신
						*//**
						 * address : 주소, phone : 전화번호, age : 나이, job : 직업, prof_img : 프로필 이미지, user_id : 회원 id
						 *//*
						var query = "update stylist " +
														"set intro = ?, prof_img = ? " +
														"where stid = ?";
						connection.query(query, [intro, prof_img, req.stylist.stid], function(err, success){
							if (err) {
								err = new Error("죄송합니다. 잠시후에 다시 시도해 주세요.");
								connection.release();
								next(err);
							} else {
								connection.release();
								res.json({
									error : false,
									message : "스타일리스트 정보 수정이 완료되었습니다",
									result : null
								});
							}
						});
					});
				});
			}
		});
	}
}*/

/*function authenticateLocalLogin(req, res, next) {
	
	// passport.js의 local-login event 발생후 callback으로 stylist 결과를 받는다
	passport.authenticate('local-login', function(err, stylist, info){
		if (err) {
			logger.debug(err.message);			
			return next(err);
		}
		if (!stylist) { // stylist 결과가 없을 시(로그인 허용 하지 않음)
			logger.debug("not logged in... ");
			logger.debug(info);
      return res.json({
      	error : true,
      	message : "계정과 비밀번호를 다시 한번 확인해 주세요.",
      	result : null
      });
		}
		req.logIn(stylist, function(err){ // 로그인 operation이 완료되면, stylist는 req.stylist로 할당된다
			if (err) {
				return next(err);
			}
			logger.debug("logged in... ");
			next();
		});
	})(req, res, next);
}

function logout(req, res, next) {
	
	/**
	 * account : 스타일리스트 로그인 계정
	 * stid : 스타일리스트 ID
	 *//*
	 	 로그아웃 
	var account = req.stylist.account;
	var stid = req.stylist.stid;
	
	req.logout(); // 로그인된 session에 대해 req.user를 제거함과 동시에 로그인 session clear
	res.json({
		"error" : false,
		"message" : "로그아웃 되었습니다",
		"result" : {
			"account" : account,
			"stid" : stid
		}
	});
}*/

/*function StylistSignup(req, res, next) {
	
	// passport.js의 local-signup 이벤트 발생 및 callback으로 stylist 객체를 받는다
	passport.authenticate('local-signup', function(err, stylist, info) {
		console.log('authenticate1_st'+req.body.kakaolink);
		if (err) {
			logger.debug("local-signup err_st"+err.message);
			return next(err);
		}
		if (!stylist) { // 로그인하고자하는 회원의 stylist 객체가 존재하지 않을시
			logger.debug("not signed up... ");
			return next({message : info}); // err 메시지를 err handler로 전달
		}
		
		// 로그인하고자하는 회원의 stylist 객체가 존재시
		req.logIn(stylist, function(err) {
			console.log('authenticate2_st');
			if (err) {
				logger.debug("req.login err"+err.message);
				return next(err);
			}
			logger.debug("signed up... ");
			next();
		});
	})(req, res, next);
}*/

/*function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	return next({message : "not logged in"});
}
*/

function getProfile(req, res, next) {
	var stid = req.params.stid;
	
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			var query = "select s.stid, s.account, s.kakaolink, s.prof_img, s.intro, sp.pf_img " +
											"from stylist s join st_portfolio sp on s.stid = sp.stid " +
											"where s.stid = ? limit 0,1";
			connection.query(query, stid, function(err, result) {
				if (err) {
					err = new Error("스타일리스트 정보 조회에 실패하였습니다.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "스타일리스트 정보 조회에 성공하였습니다.",
						"result" : {
							"stid" : result[0].stid, // 스타일리스트의 스타일리스트 id
							"account" : result[0].account, // 스타일리스트의 로그인 계정
							"kakaolink" : result[0].kakaolink, // 스타일리스트의 옐로우아이디 계정
							"intro" : result[0].intro,
							"prof_img" : result[0].prof_img, // 스타일리스트의 프로필 이미지
							"pf_img" : result[0].pf_img
						}
					});
				}
			});
		});
	});
}

function getPortfolio(req, res, next) {
	var stid = req.params.stid;
	
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			var query = "select pf_img " +
											"from st_portfolio " +
											"where stid = ?";
			connection.query(query, stid, function(err, result) {
				if (err) {
					err = new Error("스타일리스트 포트폴리오 조회에 실패하였습니다.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "스타일리스트 포트폴리오 조회에 성공하였습니다.",
						"result" : result
					});
				}
			});
		});
	});
}

function getStylists(req, res, next) {
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			var query = "select s.stid, s.account, s.kakaolink, s.prof_img, s.intro, " +
											"(select pf_img from st_portfolio where stid = s.stid limit 0,1) pf_img " +
											"from stylist s";
			connection.query(query,null,function(err, result) {
				if (err) {
					err = new Error("스타일리스트 명단 조회에 실패하였습니다.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "스타일리스트 명단 조회에 성공하였습니다.",
						"result" : result
					});
				}
			});
		});
	});
}

//router.post('/join', StylistSignup, getProfile); // 회원가입
//router.post('/checkaccount', checkaccount); // 로그인 아이디 중복 체크
//router.route('/')
//  .get(isLoggedIn, getProfile) // 회원 프로필 조회
//  .put(editstylistprofile); // 회원 프로필 수정
//
//router.post('/login', authenticateLocalLogin, getProfile); // 회원 로그인
//router.post('/logout', logout); // 회원 로그아웃
router.get('/:stid', getProfile);
router.get('/:stid/view', getPortfolio);
router.get('/', getStylists);

module.exports = router;