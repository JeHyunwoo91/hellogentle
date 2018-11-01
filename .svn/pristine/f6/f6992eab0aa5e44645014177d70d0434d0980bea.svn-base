var express = require('express'),
	router = express.Router();
	logger = require('../configue/logger'),
	path = require('path'),
	mime = require('mime'),
	fs = require('fs');
	
//예외 발생시 처리
	process.on('uncaughtException', function(err){
		logger.debug('Caught exception at images: '+err);
	});

function view_img(file_path) {
	return function(req, res, next) {
		var imgpath = req.params.imgpath; // url의 동적 param 정보(이미지 명)
		var filepath = path.normalize(__dirname+file_path+imgpath);
		logger.debug('imagepath: '+imgpath);
		logger.debug('filepath: '+filepath);
		fs.exists(filepath, function(exists){ // 경로 존재여부 검사 exists - true or false
			if (exists) {
				res.status(200);
				res.set('Content-Type', mime.lookup(filepath));
				var rs = fs.createReadStream(filepath);
				rs.pipe(res);
			} else {
				res.json(404, {
					"error" : true,
					"message" : "해당사진이 존재하지 않습니다!!"
				});
			}
		});
	}
}

router.get('/product/:imgpath', view_img('/../images/products/')); // 상품 이미지 로드
router.get('/outfit/:imgpath', view_img('/../images/outfit/')); // 아웃핏 이미지 로드
router.get('/profile/:imgpath', view_img('/../images/profile/')); // 프로필 이미지 로드
router.get('/portfolio/:imgpath', view_img('/../images/portfolio/')); // 스타일리스트 포트폴리오 로드
router.get('/md/:imgpath', view_img('/../images/md/')); // md main 이미지 로드


module.exports = router;