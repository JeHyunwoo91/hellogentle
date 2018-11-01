var express = require('express'),
	hg = require('../lib/hello_gentle'),
	logger = require('../configue/logger'),
	async = require('async'),
	router = express.Router();

//예외 발생시 처리
process.on('uncaughtException', function(err){
	console.log('Caught exception at mycart: '+err);
});

function view_mycart(req, res, next) {
	process.nextTick(function() {
		pool.getConnection(function(err, connection){
			var query = "select p.pdid, name, brand, price, size, color, " +
											"        (select image from products_img where p.pdid=pdid limit 0,1) p_img " +
											"from mycart m join products p on m.pdid = p.pdid " +
											"where user_id=?";
			connection.query(query, req.user.user_id, function(err, result){
				if (err) {
					err = new Error("상품정보 불러오기에 실패하였습니다. 잠시 후에 다시 시도해주세요.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"message" : "",
						"result" : result
					});
				}
			});
		});
	});
}

function capture(req, res, next){
	var pdid = req.body.pdid;
	var ntime = new Date();
	process.nextTick(function() {
		pool.getConnection(function(err, connection){
			if (err) {
				err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요.");
				connection.release();
				next(err);
			} else {
				var query = "insert into mycart(user_id, pdid, capture_date) values (?,?,?)";
				connection.query(query, [req.user.user_id, pdid,ntime], function(err, result){
					if (err) { // 추가하고자하는 상품이 mycart에 이미 등록되었을시
						err = new Error("이미 mycart에 등록된 상품입니다");
						connection.release();
						next(err);
					} else {
						connection.release();
						res.json({
							"error" : false,
							"message" : "해당상품이 mycart에 담겼습니다.",
							"result" : null
						});
					}
				});
			}
		});
	});
}

function delete_mycart(req, res, next) {
	var pdids = req.body.pdids;
	process.nextTick(function() {
		pool.getConnection(function(err, connection){
			connection.beginTransaction(function(err){ 
				if (err) {
					err = new Error("mycart 상품 꺼내기에 실패하였습니다. 잠시 후에 다시 시도해주세요");
					connection.release();
					next(err);
				} else {
					async.each(pdids, function(pdid, callback){ // callback은 error를 처리하기 위해
						console.log(pdid); //
						var query = "delete from mycart " +
														"where user_id=? and pdid = ?";
						connection.query(query, [req.user.user_id, pdid], function(err, result){
							if (err) {
								err = new Error("상품구매에 실패하였습니다. 잠시 후에 다시 시도해주세요.");
								callback(err);
							} else {
								callback();
							}
						});	
					},function(err){
						if (err) {
							connection.rollback(function() {
								err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요.");
								next(err);
							});
						} else {
							res.json({
								error : false,
								message : "선택 상품들이 삭제 되었습니다.",
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

function buy_at_mycart(req, res, next) {
	var pdids = req.body.pdids;
	
	process.nextTick(function() {
		pool.getConnection(function(err, connection){
			connection.beginTransaction(function(err){
				if (err) {
					err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요.");
					connection.release();
					next(err);
				} else {
					async.each(pdids, function(pdid, callback){
						
						var query = "insert into mycloset(user_id, pdid) " +
														"values (?,?)";
						connection.query(query, [req.user.user_id, pdid], function(err, result){
							if (err) {
								err = new Error("상품구매에 실패하였습니다. 잠시 후에 다시 시도해주세요");
								callback(err);
							} else {
								callback();
							}
						});
					},function(err){
						if (err) {
							connection.rollback(function() {
								err = new Error("죄송합니다. 잠시 후에 다시 시도해주세요.");
								next(err);
							});
						} else {
							res.json({
								error : false,
								message : "선택 상품구매에 성공하였습니다.",
								result : null,
							});
							connection.commit();
						}
					});
				}
			});
		});
	});
}

router.route('/')
  .get(view_mycart)
  .post(capture);

router.post('/buy', buy_at_mycart);
router.post('/pop',delete_mycart);

module.exports = router;