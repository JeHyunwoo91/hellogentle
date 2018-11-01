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
	logger.debug('Caught exception at user: '+err);
});

function checkemail(req, res, next) {
	
	var nTime = new Date(),
			temp = timeString(nTime);
	
	/**
	 * req.body.login_id : 회원이 가입하고자 하는 로그인 아이디
	 */
	var email = req.body.email;
	process.nextTick(function() {
		pool.getConnection(function(err, connection){
		
			/**
			 * attr = email : 회원 로그인시 식별 email
			 * 
			 * table = user : 회원 정보
			 */
			/* 회원이 서비스에 가입하고자 할때 지정하고자하는 로그인 id가 이미 존재하는지 여부 */
			var query = "select * " +
											"from user " +
											"where email = ?";
			connection.query(query, email, function(err, result){
				console.log(temp);
				if (err) {
					err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요.");
					connection.release();
					next(err);
				} else { // 이미 동일한 login_id가 존재할시
					if (result[0] === undefined) {
						connection.release();
						res.json({
							"error" : false,
							"message" : "사용 가능한 E-Mail입니다",
							"result" : null
						});
					} else { // 동일한 login_id가 가입되어있지 않을시
						connection.release();
						res.json({
							"error" : true,
							"message" : "이미 존재하는 E-Mail입니다",
							"result" : null
						});
					}
				}
			});
		});
	});
}

function edituserprofile(req, res, next) {
	
	if (req.headers['content-type'] === 'application/x-www-form-urlencoded') { // req.header가 urlencoded일 겨우
		var zipno = req.body.zipno, // 우편번호
			ads_dong = req.body.ads_dong, // 동주소
			ads_detail = req.body.ads_detail, // 상세주소
			phone = req.body.phone, //  전화번호
			age = req.body.age, // 나이
			job = req.body.job, // 직업
			user_id = req.user.user_id; // 현재 session에 on된 회원 id
		process.nextTick(function() {
			pool.getConnection(function(err, connection){
				
				/**
				 * attr = address : 회원 주소, phone : 회원 전화번호, age : 나이, job, : 작업, user_id : 회원 id
				 * 
				 * table = user : 회원 정보
				 */
				// req.body에 들어온 fields 정보들을 통해 회원정보 갱신 
				var query = "update user " +
												"set zipno = ?, ads_dong = ?, ads_detail = ?, phone = ?, age = ?, job	 = ? " +
												"where user_id = ?";
				connection.query(query, [zipno, ads_dong, ads_detail, phone, age, job, user_id], function(err, result){
					if (err) {
						err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요.");
						connection.release();
						next(err);
					} else {
						connection.release();
						res.json({
							error : false,
							message : "회원 수정이 완료되었습니다",
							result : null
						});
					}
				});
			});
		});
	} else { // req.header가 multy part일 경우
		
	/** 
	 * hello_gentle.js의 form.parse에서 callback으로 넘어온 result 객체를 이용하여 회원정보 변수에 매칭
	 * info : uuid로 변경된 filepath명이 확장자와 함께 넘어온다
	 */
		processUploadFiles(req, function(err, result, info){
			var zipno = result.formFields.zipno,
				ads_dong = result.formFields.ads_dong,
				ads_detail = result.formFields.ads_detail,// 주소
				phone = result.formFields.phone, // 전화번호
				age = result.formFields.age, // 나이
				job = result.formFields.job, // 직업
				prof_img = info, // 프로필 이미지
				user_id = req.user.user_id; // 회원 id
			if (err) {
				err = new Error("회원 정보 갱신에 실패하였습니다. 잠시 후에 다시 시도해주세요.");
				next(err);
			} else {
				process.nextTick(function() {
					pool.getConnection(function(err, connection) {
						
						// form-data로 넘어온 fields와 files의 정보들을 통해 회원 정보 갱신
						/**
						 * address : 주소, phone : 전화번호, age : 나이, job : 직업, prof_img : 프로필 이미지, user_id : 회원 id
						 */
						var query = "update user " +
														"set zipno = ?, ads_dong = ?, ads_detail = ?, phone = ?, age = ?, job = ?, prof_img = ? " +
														"where user_id = ?";
						connection.query(query, [zipno, ads_dong, ads_detail, phone, age, job, prof_img, user_id], function(err, success){
							if (err) {
								err = new Error("죄송합니다. 잠시후에 다시 시도해 주세요.");
								connection.release();
								next(err);
							} else {
								connection.release();
								res.json({
									error : false,
									message : "회원 수정이 완료되었습니다",
									result : null
								});
							}
						});
					});
				});
			}
		});
	}
}

function authenticateLocalLogin(req, res, next) {
			
	// passport.js의 local-login event 발생후 callback으로 user 결과를 받는다
	passport.authenticate('local-login', function(err, user, info){
		if (err) {
			logger.debug(err.message);
			return next(err);
		}
		if (!user) { // user 결과가 없을 시(로그인 허용 하지 않음)
			logger.debug("not logged in... ");
			logger.debug(info);
      return res.json({
      	error : true,
      	message : "Email과 비밀번호를 다시 한번 확인해 주세요.",
      	result : null
      });
		}
		req.logIn(user, function(err){ // 로그인 operation이 완료되면, user는 req.user로 할당된다
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
	 * login_id : 회원 로그인 id
	 * name : 회원 이름
	 */
	/* 로그아웃 */
	var email = req.user.email;
	var name = req.user.name;
	
	req.logout(); // 로그인된 session에 대해 req.user를 제거함과 동시에 로그인 session clear
	res.json({
		"error" : false,
		"message" : "로그아웃 되었습니다",
		"result" : {
			"email" : email,
			"name" : name
		}
	});
}

function picstylist(req, res, next) {
	var stid = req.body.stid,
			 nTime = new Date(),
			 con_date = timeString(nTime);
	
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			var query = "update user " +
											"set stid = ? " +
											"where user_id = ?";
			connection.query(query, [stid, req.user.user_id], function(err, result) {
				if (err) {
					err = new Error("죄송합니다. 잠시후에 다시 시도해주세요");
					connection.release();
					next(err);
				} else {
					var query2= "insert into gb(user_id, stid, con_date) " +
													"values(?, ?, ?)";
					connection.query(query2, [req.user.user_id, stid, con_date], function(err, result) {
						if (err) {
							err = new Error("죄송합니다. 잠시후에 다시 시도해주세요");
							connection.release();
							next(err);
						} else {
							connection.release();
							res.json({
								"error" : false,
								"message" : "스타일리스트 선택 성공!",
								"result" : null
							});
						}
					});
				}
			});
		});
	});
}

function authenticateLocalSignup(req, res, next) {
	
	// passport.js의 local-signup 이벤트 발생 및 callback으로 user 객체를 받는다
	passport.authenticate('local-signup', function(err, user, info) {
		if (err) {
			logger.debug("local-signup err"+err.message);
			return next(err);
		}
		if (!user) { // 로그인하고자하는 회원의 user 객체가 존재하지 않을시
			logger.debug("not signed up... ");
			return next({message : info}); // err 메시지를 err handler로 전달
		}
		
		// 로그인하고자하는 회원의 user 객체가 존재시
		req.logIn(user, function(err) {
			if (err) {
				logger.debug("req.login err"+err.message);
				return next(err);
			}
			logger.debug("signed up... ");
			next();
		});
	})(req, res, next);
}

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	return next({message : "not logged in"});
}

function getProfile(req, res, next) {
	logger.debug("req.session: ", req.session);
	logger.debug("req.session.passport.user: ", req.session.passport.user);
	logger.debug("req.user: ", req.user);
	
	res.json({
		"error" : false,
		"message" : "로그인 되었습니다",
		"result" : {
			"user_id" : req.user.user_id, // session 회원의 회원 id
			"email" : req.user.email, // session 회원의 로그인 id
			"name" : req.user.name, // session 회원의 이름
			"stid" : req.user.stid,
			"gbid" : req.user.gbid,
			"zipno" : req.user.zipno,
			"ads_dong" : req.user.ads_dong,
			"ads_detail" : req.user.ads_detail,
			"phone" : req.user.phone,
			"age" : req.user.age,
			"job" : req.user.job,
			"level" : req.user.level,
			"mainly" : req.user.mainly,
			"want" : req.user.want,
			"worst" : req.user.worst,
			"shoes" : req.user.shoes,
			"problem" : req.user.problem,
			"top" : req.user.top,
			"bottom" : req.user.bottom,
			"jacket_total_length" : req.user.jacket_total_length,
			"jacket_shoulder" : req.user.jacket_shoulder,
			"jacket_chest" : req.user.jacket_chest,
			"jacket_sleeve" : req.user.jacket_sleeve,
			"shirts_total_length" : req.user.shirts_total_length,
			"shirts_shoulder" : req.user.shirts_shoulder,
			"shirts_chest" : req.user.shirts_chest,
			"shirts_sleeve" : req.user.shirts_sleeve,
			"pants_total_length" : req.user.pants_total_length,
			"pants_waist" : req.user.pants_waist,
			"pants_thight" : req.user.pants_thight,
			"pants_rise" : req.user.pants_rise,
			"pants_hem" : req.user.pants_hem,
			"prof_img" : req.user.prof_img // session 회원의 프로필 이미지
		}
	});
}

function setInfo(info) {
	return function (req, res, next) {
		var info_temp = req.body.info;

		process.nextTick(function() {
			pool.getConnection(function(err, connection) {
				if (err) {
					err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요.");
					connection.release();
					next(err);
				} else {
					var query = "update user " +
													"set "+info +" = ? " +
													"where user_id = ? ";
					connection.query(query, [info_temp, req.user.user_id], function(err, result) {
						if (err) {
							err = new Error("회원정보가 등록이 되지 않습니다.");
							connection.release();
							next(err);
						} else {
							connection.release();
							res.json({
								"error" : false,
								"message" : "회원정보가 등록되었습니다.",
								"result" : null
							});
						}
					});
				}
			});
		});
	}
}

function setSize(req, res, next) {
	var jacket_total_length = req.body.jacket_total_length,
			 jacket_shoulder = req.body.jacket_shoulder,
			 jacket_chest = req.body.jacket_chest,
			 jacket_sleeve = req.body.jacket_sleeve,
			 shirts_total_length = req.body.shirts_total_length,
			 shirts_shoulder = req.body.shirts_shoulder,
			 shirts_chest = req.body.shirts_chest,
			 shirts_sleeve = req.body.shirts_sleeve,
			 pants_total_length = req.body.pants_total_length,
			 pants_waist = req.body.pants_waist,
			 pants_thight = req.body.pants_thight,
			 pants_rise = req.body.pants_rise,
			 pants_hem = req.body.pants_hem,
			 top = req.body.top,
			 bottom = req.body.bottom;
			 
			 process.nextTick(function() {
				pool.getConnection(function(err, connection) {
					if (err) {
						err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요.");
						connection.release();
						next(err);
					} else {
						var query = "update user " +
														"set jacket_total_length = ?, jacket_shoulder = ?, jacket_chest = ?, jacket_sleeve = ?, " +
														"shirts_total_length = ?, shirts_shoulder = ?, shirts_chest = ?, shirts_sleeve = ?, " +
														"pants_total_length = ?, pants_waist = ?, pants_thight = ?, pants_rise = ?, pants_hem = ?, " +
														"top = ?, bottom = ? " +
														"where user_id = ?";
						connection.query(query, [jacket_total_length, jacket_shoulder, jacket_chest, jacket_sleeve, 
						                         shirts_total_length, shirts_shoulder, shirts_chest, shirts_sleeve, 
						                         pants_total_length, pants_waist, pants_thight, pants_rise, pants_hem, 
						                         top, bottom, req.user.user_id], function(err, result) {
							if (err) {
								err = new Error("회원정보가 등록 되지 않습니다.");
								connection.release();
								next(err);
							} else {
								connection.release();
								res.json({
									"error" : false,
									"message" : "회원정보가 등록되었습니다.",
									"result" : null
								});
							}
						});
					}
				});
			});
}

function all_gb(req, res, next) {
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			var query = "select * " +
											"from gb " +
											"where user_id = ? order by con_date desc";
			connection.query(query, req.user.user_id, function(err, result) {
				if (err) {
					err = new Error("젠틀박스 내역 불러오기에 실패하였습니다.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "젠틀박스 내역 불러오기에 성공하였습니다.",
						"result" : result
					});
				}
			});
		});
	});
}

function recent_gb(req, res, next) {
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			var query = "select gbid, user_id, stid, consulting, con_style, req_gb, want, item, budget, sum_money " +
											"from gb  " +
											"where user_id = ? order by con_date desc limit 0,1";
			connection.query(query, req.user.user_id, function(err, result) {
				if (err) {
					err = new Error("최근 신청 젠틀박스 내역 조회에 실패하였습니다.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "최근 신청 젠틀박스 내역 조회에 성공하였습니다.",
						"result" : result
					});
				}
			});
		});
	});
}

router.post('/join', authenticateLocalSignup, getProfile); // 회원가입
router.post('/checkemail', checkemail); // 로그인 아이디 중복 체크
router.route('/')
  .get(isLoggedIn, getProfile) // 회원 프로필 조회
  .put(edituserprofile); // 회원 프로필 수정

router.post('/login', authenticateLocalLogin, getProfile); // 회원 로그인
router.post('/logout', logout); // 회원 로그아웃

router.post('/picstylist', picstylist); // 개인 스타일리스트 정하기

router.post('/interest', setInfo('level')); // 패션에 대한 관심 정도
router.post('/mainly', setInfo('mainly'));
router.post('/want', setInfo('want'));
router.post('/worst', setInfo('worst'));
router.post('/shoes', setInfo('shoes'));
router.post('/problem', setInfo('problem'));
router.post('/size', setSize);
router.get('/all_gb', all_gb);
router.get('/recent_gb', recent_gb);

module.exports = router;