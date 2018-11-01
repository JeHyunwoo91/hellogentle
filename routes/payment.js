var express = require('express');
var router = express.Router(); // router 생성

/* GET home page. */
//router.get('/', function(req, res) {
//  res.render('payment.html');
//});

function req_payment(req, res, next) {
	var pay_method = req.params.pay_method,
			 user_id = req.params.user_id,
			 amount = req.params.amount,
			 name = req.params.name,
			 email = req.params.email,
			 phone = req.params.phone,
			 addr = req.params.addr,
			 postcode = req.params.postcode;
			 
	/*process.nextTick(function() {
		pool.getConnection(function(err, connection) {

		});
	});*/
	var payment_info = {
			 pay_method : pay_method,
			 merchant_uid : 'hg_'+user_id,
			 name : 'hello_gentle',
			 amount : amount,
			 buyer_name : name,
			 buyer_email : email,
			 buyer_tel : phone,
			 buyer_addr : addr,
			 buyer_postcode : postcode
	};
	res.render('payment.html',{payment_info:payment_info});
}

//function res_payment(req, res, next) {
//	
//}

//router.route('/')
//	.get(res_payment)
//	.post(req_payment);

router.get('/:pay_method/:user_id/:amount/:name/:email/:phone/:addr/:postcode', req_payment);

module.exports = router;
