var express = require('express'),
	router = express.Router();

function timeString(dt){
	return dt.getFullYear() + '-' +
		('00' + (dt.getMonth() + 1)).slice(-2)+
		'-'+ ('00' + dt.getDate()).slice(-2)+ 
		' ' + ('00' + (dt.getHours()+9)).slice(-2) + 
		':' + ('00' + dt.getMinutes()).slice(-2) +
		':' + ('00' + dt.getSeconds()).slice(-2);
}

//예외 발생시 처리
process.on('uncaughtException', function(err){
	logger.debug('Caught exception at mycloset: '+err);
});

// 회원이 헬로젠틀에서 구매하였던 모든 상품들의 정보를 조회
function history_buy(req, res, next) {

	process.nextTick(function() {
		pool.getConnection(function(err, connection){
			// 해당 회원의 상품 구매 내역을 조회
		var query = "select g.gbid, g.user_id, g.outfit, g.explanation, g.req_gb_date, g.final_money, " +
										"(select kakaolink from stylist s where g.stid = s.stid) kakaolink " +
										"from gb g " +
										"where g.user_id = ? and g.con_style = 4 " +
										"order by g.req_gb_date desc";	
			
		connection.query(query,[req.user.user_id], function(err, result){
				if (err) {
					err = new Error("젠틀박스 구매내역 조회에 실패하였습니다.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "젠틀박스 구매내역 조회에 성공하였습니다.",
						"result" : result
					});
				}
			});		 
		});
	});
}

function select_gb_view(req, res, next) {
	var gbid = req.params.gbid;
	
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			var query = "select gc.gbid, p.pdid, p.name, p.color, p.brand, p.price, " +
											"(select pd_img from products_img where gc.pdid = pdid limit 0,1) pd_img " +
											"from gb_con gc join products p on gc.pdid = p.pdid " +
											"where gc.selected = 1 and gbid = ?";
			connection.query(query, gbid, function(err, result) {
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

function getPayment(req, res, next) {
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			var query = "select * " +
											"from history_payment " +
											"where user_id = ? " +
											"order by payment_date desc";
			connection.query(query, req.user.user_id, function(err, result) {
				if (err) {
					err = new Error("결제내역 조회에 실패하였습니다. 잠시 후에 다시 시도해주세요.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "결제내역 조회에 성공하였습니다.",
						"result" : result
					});
				}
			});
		});
	});
}

function setPayment(req, res, next) {
	var nTime = new Date();
	var payment = req.body.payment;
	var payment_date = timeString(nTime);
	
	process.nextTick(function() {
		pool.getConnection(function(err, connection) {
			var query = "insert into history_payment(user_id,payment,payment_date) " +
											"values(?, ?, ?)";
			connection.query(query, [req.user.user_id, payment, payment_date], function(err, result) {
				if (err) {
					err = new Error("상품결제 내역 입력에 실패하였습니다. 잠시 후에 다시 시도해주세요.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "상품결제 내역 입력에 성공하였습니다.",
						"result" : null
					});
				}
			});
		});
	});
}

function view_outfit(req, res, next) {
	
	process.nextTick(function() {
		pool.getConnection(function(err, connection){
			
			/**
			 * attr = pdid : 상품 id, name : 상품 이름, price : 상품 가격, brand : 상품 브랜드명, size : 상품 보유 사이즈, 
			 * color : 상품 보유 색상, outfit_img_id : 아웃핏 이미지 id, p_img : 상품 이미지
			 * 
			 * table = mycloset : 회원의 상품 구매 내역
			 * 						products : 상품 상세 정보
			 */
			/* 스타일리스트가 해당회원이 구매 하였던 상품들을 조합하여 스타일링한 스타일 아웃핏 이미지 조회 및 
			 * 해당 아웃핏에 구성된 상품 목록 조회*/
			var query = "select m.pdid, p.name, p.brand, p.price, p.color, p.size, m.outfit_img_id, " +
											"        (select image from products_img where pdid = m.pdid limit 0,1) p_img " +
											"from mycloset m join products p on m.pdid = p.pdid " +
											"where user_id = ?";
			connection.query(query,[req.user.user_id], function(err, component){
				if (err) {
					err = new Error("아웃핏 구성상품 목록 조회에 실패하였습니다. 잠시 후에 다시 시도해주세요.");
					connection.release();
					next(err);
				} else {
					var query = "select image " +
													"from outfit_img " +
													"where user_id = ?";
					connection.query(query,[req.user.user_id],function(err, outfitImg){
						if (err) {
							err = new Error("아웃핏 이미지 조회에 실패하였습니다. 잠시 후에 다시 시도해주세요.");
							connection.release();
							next(err);
						} else {
							connection.release();
							res.json({
								"error" : false,
								"result" : {
									"component" : component,
									"outfit" : outfitImg 
								}
							});
						}
					});
				}
			});
		});
	});
}

router.get('/', history_buy); // 해당 회원의 상품 구매 내역 조회
router.get('/select_gb_view/:gbid', select_gb_view); // 선택된 젠틀박스의 상품 내역 조회
/*router.route('/payments')
	.get(getPayment)
	.post(setPayment);
router.get('/outfit', view_outfit); // 아웃핏 이미지 조회
*/
module.exports = router;