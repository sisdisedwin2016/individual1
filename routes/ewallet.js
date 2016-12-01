var Nasabah = require('../models/nasabah');
var express = require('express');
var router = express.Router();
var request = require('request');


/*
	[ATTRIBUTE IN DB]
	nasabah_id
	name
	ip_domisili
	balance
	last_update
	created_at
*/

router.post('/register', function(req, res){
	//Check if nasabah with this id is exists
	Nasabah.count({nasabah_id: req.body.user_id}, function(err, count){
		if(count <= 0){//if not exists
			var nasabahinfo = ({
				'nasabah_id': req.body.user_id,
				'name': req.body.nama,
				'ip_domisili': req.body.ip_domisili,
				'balance': req.body.nilai!=null?req.body.nilai:1000000,
				'last_update': new Date().getTime(),
				'created_at': new Date().getTime()
			});

			var nasabah = new Nasabah(nasabahinfo);
			//Save it to DB
			nasabah.save(function(err){
				if (err) {
					return res.json({'error': true, 'message': 'An error has been occured'});
				}
				var reply = ({
					'error': false,
					'message': 'New nasabah has been registered with ID ' + req.body.user_id,
					'status_register': 0
				});
				return res.json(reply);
			});
		}//count
		else{//if exists
			var reply = ({
				'error': true,
				'message': 'ID ' + req.body.user_id + ' has been registered with another nasabah',
				'status_register': -1
			});
			return res.json(reply);
		}
	});
});

router.get('/getsaldo/:id', function(req,res){
	Nasabah.count({nasabah_id:req.params.id}, function(err, count){
		if(count<=0){
			return res.json({'error': true, 'message': 'Nasabah with ID: ' + req.params.id + ' is not exists', 'nilai_saldo': -1});
		}
		else{
			Nasabah.findOne({nasabah_id:req.params.id}, function(err, nasabah){
				if (err) 
					return res.json({'error': true, 'message': 'An error has been occured'});
				var reply = ({
					'error': false,
					'user_id': nasabah.nasabah_id,
					'message': 'success',
					'nilai_saldo': nasabah.balance
				});
				return res.json(reply);
			});
		}
	})
});

router.get('/ping', function(req,res){
	return res.json({pong: 1});
});

//Handle transfer from other node/cabang
router.post('/transfer', function(req,res){

	/*
	   1. If nasabah doesn't exists, return failed transfer status
	   2. If nasabah exists, do transfer.
	*/

	Nasabah.count({nasabah_id:req.body.user_id}, function(err,count){
		if(count<=0){
			return res.json({'error': true, 'message': 'Your account is not registered,	please register first', 'status_transfer':-1});
		}
		else{
			Nasabah.findOne({nasabah_id:req.body.user_id}, function(err, nasabah){
				if(err)
					return res.json({'error': true, 'message': 'An error has been occured', 'status_transfer': -1});
				
				nasabah.balance += parseInt(req.body.nilai, 10);
				nasabah.save(function(err){
					if(err)
						return res.json({'error': true, 'message': 'An error has been occured', 'status_transfer': -1});
					return res.json({'error': false, 'message': 'Transfer success!, your balance now is ' + nasabah.balance, 'status_transfer': 0});
				});
			});
		}
	});
});

//Handle transfer form ourselves
router.post('/transferke', function(req, res){

	/*
		1. If nasabah not registered. Please, register first
		2. If registered, check the balance versus transferred amount. If not sufficient, return error (status_transfer : -1)
		3. If sufficient. Send request to other node/cabang. If return error (status_transfer: -1), prompt error
		4. If success (status_transfer: 0), deduct the balance in our node/cabang. and prompt success
	*/

	Nasabah.count({nasabah_id:req.body.user_id}, function(err, count){
		if (count<=0)//If nasabah not registered
			return res.json({'error': true, 'message': 'Nasabah is not registered, please register first', 'status_transfer': -1});
		else{
			Nasabah.findOne({nasabah_id:req.body.user_id}, function(err, nasabah){
				if (err) 
					return res.json({'error': true, 'message': 'An error has been occured', 'status_transfer': -1}); 
				else if(req.body.nilai > nasabah.balance)//If insulficient balance
					return res.json({'error': true, 'message': 'Insulficient balance', 'status_transfer': -1});
				else{
					var url_tujuan = req.body.ip_tujuan;
					var url_tujuan_transfer = url_tujuan + '/ewallet/transfer';
					var url_tujuan_register = url_tujuan + '/ewallet/register';

					request.post({url:url_tujuan_transfer, form:{user_id:req.body.user_id, nilai: req.body.nilai }}, 
						function(err, response, body){
							var result = JSON.parse(body);
							if(result.status_transfer == -1)//If failed transfer, then register
								// request.post({url:url_tujuan_register, form:{user_id: req.body.user_id, nama: 'Edwin', 
								// 	'ip_domisili': 'https://rahman.sisdis.ui.ac.id/ewallet'}}, function(err, response2, body2){
								// 		if (err) 
								// 			return res.json({'error':true, 'message':'An error has been occured', 'status_register': -1});
								// 		return res.json(body2);
								// 	});

								return res.json({'error': true, 'message': 'Transfer failed, please register first', 'status_transfer': -1});
							else{
								nasabah.balance -= parseInt(req.body.nilai, 10);
								nasabah.save(function(err){
									if(err)
										return res.json({'error': true, 'message': 'An error has been occured', 'status_transfer': -1});
									return res.json({'error': false, 'message': 'Transfer success!, your balance now is ' + nasabah.balance, 'status_transfer': 0});				
								});
							}
						});
					}
			});
		}
	});
});

router.get('/gettotalsaldo/:id', function(req,res){
	var arr = ['https://rahman.sisdis.ui.ac.id/ewallet/getsaldo/', 'https://aziz.sisdis.ui.ac.id/ewallet/getSaldo/',
	'https://atma.sisdis.ui.ac.id/ewallet/getsaldo/', 'https://mardhika.sisdis.ui.ac.id/ewallet/getSaldo/', 
	'https://saprikan.sisdis.ui.ac.id/ewallet/getSaldo/', 'https://izzunaqi.sisdis.ui.ac.id/ewallet/getSaldo/',
	'https://kurnia.sisdis.ui.ac.id/ewallet/getSaldo/', 'https://hadhi.sisdis.ui.ac.id/ewallet/getSaldo/','https://prayogo.sisdis.ui.ac.id/ewallet/getSaldo'];
	var saldo = 0;
	console.log(arr[0]+req.params.id);
	request.get(arr[0]+req.params.id ,function(err,response1,body1){
		if (err || response1.statusCode != 200)
			saldo += 0;
		else{
			var edwin_res = JSON.parse(body1);
			if(edwin_res.nilai_saldo != -1)
				saldo += parseInt(edwin_res.nilai_saldo,10);
		}

		request.get(arr[1]+req.params.id, function(err, response2, body2){
			if (err || response2.statusCode != 200)
				saldo += 0;
			else{
				var aziz_res = JSON.parse(body2);
				if(aziz_res.nilai_saldo != -1)
					saldo += parseInt(aziz_res.nilai_saldo,10);
			}

			request.get(arr[2]+req.params.id, function(err, response3, body3){
				if (err || response3.statusCode != 200)
					saldo += 0;
				else{
					var atma_res = JSON.parse(body3);
					if(atma_res.nilai_saldo != -1)
						saldo += parseInt(atma_res.nilai_saldo,10);
					
				}

				request.get(arr[3]+req.params.id, function(err, response4, body4){
					if (err || response4.statusCode != 200)
						saldo += 0;
					else{
						var mardhika_res = JSON.parse(body4);
						if(mardhika_res.nilai_saldo != -1)
							saldo += parseInt(mardhika_res.nilai_saldo,10);
					}
					console.log(saldo);
					res.send({error:false, nilai_saldo:saldo});
				});
			});
		});
	});
});

module.exports=router; 
