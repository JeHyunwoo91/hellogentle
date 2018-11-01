var express = require('express');
var router = express.Router();

process.on('uncaughtException',function(err){
	logger.debug('Caught exception at reply: '+err.message);
});


function view_reply_list(req, res, next) {
	var story_id = req.params.story_id;
	process.nextTick(function() {
		pool2.getConnection(function(err, connection) {
			var query = "select u.name, r.enroll_time, r.content " +
											"from reply r join user u on r.user_id=u.user_id " +
											"where r.story_id=? order by r.enroll_time desc";
			connection.query(query, [story_id], function(err, result) {
				if (err) {
					err = new Error("댓글 목록 불러오기에 실패하였습니다. 잠시후에 다시 시도해주세요.");
					connection.release();
					next(err);
				} else {
					connection.release();
					res.json({
						error : false,
						message : "댓글 목록 불러오기 성공",
						result : result
					});
				}
			});
		});
	});
}

function enroll_reply(req, res, next) {
	var story_id = req.body.story_id;
	var name = req.body.name;
	var content = req.body.content;
	var user;
	var enroll_time = getNowDate();
	process.nextTick(function() {
		pool2.getConnection(function(err, connection) {
			var search_query = "select user_id " +
											"from user " +
											"where name = ?";
			connection.query(search_query, name, function(err, search_result) {
				if (err) {
					err = new Error("회원찾기 오류");
					connection.release();
					next(err);
				} else {
					if (search_result.length == 0) { // 회원 존재안하면 user에 추가 하고 게시글 등록
						var join_query = "insert into user(name) " +
																	"values(?)";
						connection.query(join_query, name, function(err, join_result) {
							if (err) {
								err = new Error("회원가입 오류");
								connection.release();
								next(err);
							} else {
								var enroll_story = "insert into reply(story_id, user_id, content, enroll_time) " +
																				"values(?, ?, ?, ?)";
								connection.query(enroll_story, [story_id, join_result.insertId, content, enroll_time], function(err, enroll_story_result) {
									if (err) {
										err = new Error("댓글 등록에 실패하였습니다. 잠시 후에 다시 시도해주세요.");
										connection.release();
										next(err);
									} else {
										connection.release();
										res.json({
											error : false,
											message : "댓글등록 성공",
											result : null
										});
									}
								});
							}
						});
					} else { // 이미 회원이 존재하면 게시글 추가
						user = search_result[0].user_id;
						var enroll_story_query = "insert into reply(story_id, user_id, content, enroll_time) " +
																						"values(?, ?, ?, ?)";
						connection.query(enroll_story_query, [story_id, user, content, enroll_time], function(err, enroll_s_result) {
							if (err) {
								err = new Error("댓글 등록에 실패하였습니다. 잠시 후에 다시 시도해주세요.");
								connection.release();
								next(err);
							} else {
								connection.release();
								res.json({
									error : false,
									message : "댓글등록 성공",
									result : null
								});
							}
						});
					}
				}
			});
		});
	});
}

function getNowDate() {
	var date = new Date();
	var yyyy = date.getFullYear().toString();
	var mm = (date.getMonth()+1).toString();
	var dd = date.getDate().toString();
	var hour = (date.getHours()+9).toString();
	var minute = date.getMinutes().toString();
	var second = date.getSeconds().toString();
	return yyyy+"-"+mm+"-"+dd+" "+hour+":"+minute+":"+second
}

router.get('/:story_id', view_reply_list);
router	.post('/', enroll_reply);
module.exports = router;