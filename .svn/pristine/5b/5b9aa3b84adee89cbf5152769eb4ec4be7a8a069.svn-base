var express = require('express'),
	router = express.Router(),
	hg = require('../lib/hello_gentle');

//예외 발생시 처리
process.on('uncaughtException', function(err){
	logger.debug('Caught exception at md: '+err);
});

function viewlist_md(req, res, next) {
	
	process.nextTick(function() {
		pool.getConnection(function(err, connection){
			
			/**
			 * attr = md_img : main 이미지
			 * 
			 * table = products : 상품 상세 정보
			 */
			/* md 추천 상품 이미지 목록 조회 */
			var query = "select md_img from md";
			
			connection.query(query,function(err, result){
				if (err) {
					err = new Error("상품 이미지 조회에 실패하였습니다. 잠시 후에 다시 시도해주세요.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						"error" : false,
						"result" : result
					});
				}
			});
		});
	});
}

function view_md(req, res, next) {
	var pdid = req.params.pdid;
	
	process.nextTick(function() {
		
		/**
		 * attr = pdid : 상품 id, name : 상품 이름, price : 상품 가격, brand : 상품 브랜드명, size : 상품 보유 사이즈, 
		 * color : 상품 보유 색상, p_img : 상품 이미지
		 * 
		 * table = products : 상품 상세 정보
		 */
		/* 상품의 상세 정보 조회 */
		pool.getConnection(function(err, connection){
			var query = "select pdid, name, brand, price, size, color " +
											"from products p	" +
											"where pdid = ?";
			connection.query(query,pdid,function(err, products_info){
				if (err) {
					err = new Error("상품 정보 불러오기에 실패하였습니다. 잠시 후에 다시 시도해주세요.");
					connection.release();
					next(err);
				} else {
					var query = "select image p_image " +
													"from products_img " +
													"where pdid =?";
					connection.query(query, pdid, function(err, products_img){
						if (err) {
							err = new Error("상품이미지 불러오기에 실패하였습니다. 잠시 후에 다시 시도해주세요.");
							connection.release();
							next(err);
						} else {
							connection.release();
							res.json({
								"error" : false,
								"result" : {
									"component" : products_info,
									"images" : products_img
								}
							});
						}
					});
				}
			});
		});
	});
}

router.get('/', viewlist_md); // md 추천상품 이미지 목록 조회
router.get('/view/:pdid', view_md); // md 추천 상품 개별 상세 조회

module.exports = router;