var express = require('express'),
	router = express.Router(),
	async = require('async'),
	mysql = require('mysql'),
	hg = require('../lib/hello_gentle');

function timeString(dt){
	return dt.getFullYear() + '년 ' +
		('00' + (dt.getMonth() + 1)).slice(-2)+
		'월 '+ ('00' + dt.getDate()).slice(-2) + 
		'일 ' + ('00' + (dt.getHours())).slice(-2) + 
		':' + ('00' + dt.getMinutes()).slice(-2) +
		':' + ('00' + dt.getSeconds()).slice(-2);
}

// 예외 발생시 처리
process.on('uncaughtException', function(err){
	console.log('Caught exception at gentle_box: '+err);
});

/* 현재 로그인된 사용자의 젠틀박스의 아웃핏 이미지 및 구성품 
 * 목록의 정보를 검색하여 제공*/

function gentle_box_view(req, res, next) {
	
	process.nextTick(function() {
		pool.getConnection(function(err, connection){
			
			/**
			 * pdid : 상품 id, name : 상품 이름, brand : 상품 브랜드명, price : 상품 가격,  
			 * color : 상품 보유 색상, p_img : 상품 이미지
			 */
			// 해당 회원에게 커스튬된 젠틀박스의 구성품 목록을 조회
			var query = "select gc.gbid, p.pdid, p.name, p.color, p.brand, p.price, " +
											"(select pd_img from products_img where gc.pdid = pdid limit 0,1) pd_img " +
											"from gb_con gc join products p on gc.pdid = p.pdid " +
											"where gc.selected = 1 and gbid = ?";
			connection.query(query, req.user.gbid, function(err, result) {
				if (err) {
					err = new Error("젠틀박스 구성품 목록 조회에 실패하였습니다.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "젠틀박스 구성품 목록 조회에 성공하였습니다.",
						"result" : result
					});
				}
			});
		});
	});
}

function view_sendback(req, res, next) {
	
	process.nextTick(function() {
		pool.getConnection(function(err, connection){
			
			/**
			 * pdid : 상품 id, name : 상품 이름, brand : 상품 브랜드명, price : 상품 가격,  
			 * color : 상품 보유 색상, p_img : 상품 이미지
			 */
			// 해당 회원에게 커스튬된 젠틀박스의 구성품 목록을 조회
			var query = "select gc.gbid, p.pdid, p.name, p.color, p.brand, p.price, " +
											"(select pd_img from products_img where gc.pdid = pdid limit 0,1) pd_img " +
											"from gb_con gc join products p on gc.pdid = p.pdid " +
											"where gc.selected = 2 and gbid = ?";
			connection.query(query, req.user.gbid, function(err, result) {
				if (err) {
					err = new Error("반품된 상품 목록 조회에 실패하였습니다.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "반품된 상품 목록 조회에 성공하였습니다.",
						"result" : result
					});
				}
			});
		});
	});
}

function skip_sendback(req, res, next) {
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			var query = "update gb " +
											"set con_style = 4 " +
											"where gbid = ?";
			connection.query(query, req.user.gbid, function(err, result) {
				if (err) {
					err = new Error("반품상품 단계 생략설정에 실패하였습니다.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "반품상품 단계 생략설정에 성공하였습니다.",
						"result" : null
					});
				}
			});
		});
	});
}

function product_img_list(req, res, next) {
	var pdid = req.params.pdid;
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			var query = "select * " +
											"from products_img " +
											"where pdid = ?";
			connection.query(query, pdid, function(err, result) {
				if (err) {
					err = new Error("상품 이미지 조회에 실패하였습니다.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "상품 이미지 조회에 성공하였습니다.",
						"result" : result
					});
				}
			});
		});
	});
}

function gb_outfit_view(req, res, next) {
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			var query = "select g.outfit, g.explanation, s.prof_img, s.kakaolink " +
											"from gb g join stylist s on g.stid = s.stid " +
											"where gbid = ?";
			connection.query(query, req.user.gbid, function(err, result) {
				if (err) {
					err = new Error("젠틀박스 아웃핏 조회에 실패하였습니다.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "젠틀박스 아웃핏 조회에 성공하였습니다.",
						"result" : {
							"outfit" : result[0].outfit,
							"explanantion" : result[0].explanation,
							"prof_img" : result[0].prof_img,
							"kakao" : result[0].kakaolink
						}
					});
				}
			});
		});
	});
}


/* 사용자가 스타일리스트 컨설팅을 요청할때*/

function setConsulting(req, res, next) {
	
	process.nextTick(function() {
		pool.getConnection(function(err, connection){
			/**
			 * consulting : 스타일리스트 컨설팅 요청 여부
			 */
			// 해당 회원이 스타일리스트와의 미팅을 요청할때 요청여부를 체크
			var query = "update gb set consulting = 1 where gbid=?";
			connection.query(query, req.user.gbid, function(err, result){
				if (err) {
					err = new Error("스타일리스트 컨설팅 요청에 실패하였습니다. 잠시 후에 다시 시도해주세요");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "스타일 컨설팅 요청 성공!!!",
						"result" : null
					});
				}
			});
		});
	});
}

/* 사용자가 젠틀박스를 요청할때*/

function setRequest(req, res, next) {
	var nTime = new Date(),
			 req_gb_date = timeString(nTime);
	
	process.nextTick(function() {
		pool.getConnection(function(err, connection){
			/**
			 * request : 젠틀박스 요청 여부
			 * gbid : 해당 user_id의 최근 젠틀박스 ID
			 */
			// 해당 회원이 젠틀박스를 요청할때 요청여부를 체크
			var query = "update gb set req_gb = 1, req_gb_date = ? " +
											"where user_id=? and gbid = ?";
			connection.query(query, [req_gb_date, req.user.user_id, req.user.gbid],function(err, result){
				if (err) {
					err = new Error("젠틀박스 요청에 실패하였습니다. 잠시 후에 다시 시도해주세요");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "젠틀박스 요청 성공",
						"result" : null
					});
				}
			});
		});
	});
}

function update_money(info) {
	return function (req, res, next) {
		
		var money = req.body.money;
		
		process.nextTick(function() {
			pool.getConnection(function(err, connection) {
				var query = "update gb " +
												"set "+info +" = ? " +
												"where gbid = ?";
				connection.query(query, [money, req.user.gbid], function(err, result) {
					if (err) {
						err = new Error("결제금액 갱신에 실패하였습니다.");
						connection.release();
						next(err);
					} else {
						connection.release();
						res.json({
							"error" : false,
							"message" : "결제금액 갱신에 성공하였습니다.",
							"result" : null
						});
					}
				});
			});
		});
	}
}

function recentResult(req, res, next) {
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			var query = "select p.pdid, p.name, p.brand, p.color, p.price, p.p_img " +
											"from (history_payment h join mycloset m on h.payment_date = m.purchase_date) " +
											"join products p on p.pdid = m.pdid " +
											"where h.user_id = ?";
			connection.query(query, req.user.user_id, function(err, result) {
				if (err) {
					err = new Error("결재상품 목록 조회에 실패하였습니다. 잠시 후에 다시 시도해주세요.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "결재상품 목록 조회에 성공하였습니다.",
						"result" : result
					});
				}
			});
		});
	});
}

function returnRequest(req, res, next) {
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			var query = "update user " +
											"set request =0, p_pre = 0, p_post = 0, p_complete = 0, p_sendback = 0, deposit = 0 " +
											"where user_id = ?";
			connection.query(query, req.user.user_id, function(err, result) {
				if (err) {
					err = new Error("젠틀박스 재요청에 실패하였습니다. 잠시후에 다시 시도해주세요.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "젠틀박스 재요청에 성공하였습니다.",
						"result" : null
					});
				}
			});
		});
	});
}

function setInfo(req, res, next) {
		var budget = req.body.budget,
				 want = req.body.want,
				 item = req.body.item;
		
		process.nextTick(function() {
			pool.getConnection(function(err, connection) {
				if (err) {
					err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요.");
					connection.release();
					next(err);
				} else {
					var query = "update gb " +
													"set  budget = ?, want = ?, item = ? " +
													"where gbid = ?";
					connection.query(query, [budget, want, item, req.user.gbid], function(err, result) {
						if (err) {
							err = new Error("요청정보가 변경되지 않았습니다.");
							connection.release();
							next(err);
						} else {
							console.log(req.user.gbid+"/"+budget+"/"+want+"/"+item);
							connection.release();
							res.json({
								"error" : false,
								"message" : "요청정보가 변경되었습니다.",
								"result" : null
							});
						}
					});
				}
			});
		});
	}

function com_style(req, res, next) {
	var nTime = new Date(),
		   con_style_date = timeString(nTime);
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			if (err) {
				err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요.");
				connection.release();
				next(err);
			} else {
				var query = "update gb " +
												"set con_style = 1, con_style_date = ? " +
												"where gbid = ?";
				connection.query(query, [con_style_date, req.user.gbid], function(err, result) {
					if (err) {
						err = new Error("스타일링 완성이 등록 되지 않았습니다.");
						connection.release();
						next(err);
					} else {
						connection.release();
						res.json({
							"error" : false,
							"message" : "스타일링 완성이 등록 되었습니다.",
							"result" : null
						});
					}
				});
			}
		});
	});
}

function con_style_set_info(req, res, next) {
	
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			if (err) {
				err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요.	");
				connection.release();
				next(err);
			} else {
				var query = "update gb " +
												"set con_style = con_style + 1 " +
												"where gbid = ?";
				connection.query(query, req.user.gbid, function(err, result) {
					if (err) {
						err = new Error("젠틀박스 상태 등록에 실패하였습니다.");
						connection.release();
						next(err);
					} else {
						connection.release();
						res.json({
							"error" : false,
							"message" : "젠틀박스 상태 등록에 성공하였습니다.",
							"result" : null
						});
					}
				});
			}
		});
	});
}

function chg_post_addr(req, res, next) {
	var postcode = req.body.postcode,
			 addr = req.body.addr;
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			var query = "update gb " +
											"set postcode = ?, addr = ? " +
											"where gbid = ?";
			connection.query(query, [postcode, addr, req.user.gbid], function(err, result) {
				if (err) {
					err = new Error("배송지 변경에 실패하였습니다.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "배송지 변경에 성공하였습니다.",
						"result" : null
					});
				}
			});
		});
	});
}

function construction(req, res, next) {
	var pdids = req.body.pdids,
			 gbid = req.body.gbid;
	
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			connection.beginTransaction(function(err) {
				if (err) {
					err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요.");
					connection.release();
					next(err);
				} else {
					async.each(pdids, function(pdid, callback) {
						
						var query = "insert into gb_con(gbid, pdid) " +
														"values (?, ?)";
						connection.query(query, [gbid, pdid], function(err, result) {
							if (err) {
								err = new Error("상품 스타일링 구성에 실패하였습니다.");
								callback(err);
							} else {
								callback();
							}
						});
					}, function(err) {
						if (err) {
							connection.rollback(function() {
								err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요.");
								next(err);
							});
						} else {
							res.json({
								error : false,
								message : "상품 스타일링 구성에 성공하였습니다.",
								result : null
							});
							connection.commit();
						}
					});
				}
			});
		});
	});
}

function choice_products(req, res, next) {
	var pdids = req.body.pdids;
	
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			connection.beginTransaction(function(err) {
				if (err) {
					err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요");
					connection.release();
					next(err);
				} else {
					async.each(pdids,function(pdid, callback) {
						
						var query = "update gb_con " +
														"set selected = 0 " +
														"where gbid = ? and pdid = ?";
						
						connection.query(query, [req.user.gbid, pdid], function(err, result) {
							if (err) {
								err = new Error("받지않을 상품 선택에 실패하였습니다.");
								callback(err);
							} else {
								callback();
							}
						});
					}, function(err) {
						if (err) {
							connection.rollback(function() {
								err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요.");
								next(err);
							});
						} else {
							res.json({
								err : false,
								message : "받지않을 상품 선택에 성공하였습니다.",
								result : null
							});
							connection.commit();
						}
					});
				}
			});
		});
	});
}

function choice_sendback(req, res, next) {
	var pdids = req.body.pdids;
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			connection.beginTransaction(function(err) {
				if (err) {
					err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요");
					connection.release();
					next(err);
				} else {
					async.each(pdids,function(pdid, callback) {
						
						var query = "update gb_con " +
														"set selected = 2 " +
														"where gbid = ? and pdid = ?";
						
						connection.query(query, [req.user.gbid, pdid], function(err, result) {
							if (err) {
								err = new Error("받지않을 상품 선택에 실패하였습니다.");
								callback(err);
							} else {
								callback();
							}
						});
					}, function(err) {
						if (err) {
							connection.rollback(function() {
								err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요.");
								next(err);
							});
						} else {
							res.json({
								err : false,
								message : "받지않을 상품 선택에 성공하였습니다.",
								result : null
							});
							connection.commit();
						}
					});
				}
			});
		});
	});
}

function checkpost(req, res, next) {
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			var query = "select post " +
											"from gb " +
											"where gbid = ?";
			connection.query(query, req.user.gbid, function(err, result) {
				if (err) {
					err = new Error("젠틀박스 배송현황 조회에 실패하였습니다.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "젠틀박스 배송현황 조회에 성공하였습니다.",
						"result" : result[0].post
					});
				}
			});
		});
	});
}

function confirm_gentlebox(req, res, next) {
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			var query = "update gb " +
											"set post = post + 1 " +
											"where gbid = ?";
			connection.query(query, req.user.gbid, function(err, result) {
				if (err) {
					err = new Error("배송된 젠틀박스 확인에 실패하였습니다.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "배송된 젠틀박스 확인에 성공하였습니다.",
						"result" : null
					});
				}
			});
		});
	});
}

router.get('/', gentle_box_view); // 젠박에 들어잇는 상품목록 조회

router.get('/product_img_list/:pdid', product_img_list); // 선택된 상품의 이미지 리스트
router.get('/gb_outfit', gb_outfit_view); // 젠틀박스 아웃핏

router.post('/consulting', setConsulting); // 상담 신청
router.post('/request', setRequest); // 젠박 신청
router	.post('/update_sum_money', update_money('sum_money')); // 결제금액 최종 갱신
router	.post('/update_final_money', update_money('final_money'));

router.post('/this_concept', setInfo); // 젠틀박스 프로필
router.post('/com_style', com_style); // 스타일리스트 해당 젠박 스타일링 완성

router.post('/feedback', con_style_set_info); // 피드백 및 결제 진행 후
/*router.post('/post', con_style_set_info);
router.post('/sendback', con_style_set_info);
router.post('/complete', con_style_set_info);*/
router.post('/chg_post_addr', chg_post_addr); // 배송지 변경
router.post('/construction', construction); // 스타일링 상품 선택(스타일링 상품)
router.post('/choice_products', choice_products); // 피드백 할 상품 선택(받지않을 상품)
router.post('/choice_sendback', choice_sendback); // 반품 할 상품 선택(받지 않을 상품)
router.get('/view_sendback', view_sendback); // 반품 된 상품 리스트
router.post('/skip_sendback', skip_sendback); // 반품 상품이 없을시 바로 젠틀박스 1회차 종료
router.get('/checkpost', checkpost); // 현재 젠박 배송 현황 조회
router.post('/confirm_gentlebox', confirm_gentlebox) // 고객이 배송되어온 젠틀박스를 확인
module.exports = router;