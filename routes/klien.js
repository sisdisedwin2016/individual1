var express = require('express');
var router = express.Router();
var request = require('request');
var app = express();
var quorum = {};

router.get('/', function(req,res){
	var atma = 'https://atma.sisdis.ui.ac.id/ewallet/ping';
	var aziz = 'https://aziz.sisdis.ui.ac.id/ewallet/ping';
	var mardhika = 'https://mardhika.sisdis.ui.ac.id/ewallet/ping';
	//var edwin = 'http://192.168.202.102:4000/ping';
	var edwin  = 'https://rahman.sisdis.ui.ac.id/ewallet/ping';
	var saprikan = 'https://saprikan.sisdis.ui.ac.id/ewallet/ping';
	var izzunaqqi = 'https://izzunaqi.sisdis.ui.ac.id/ewallet/ping';
	var prayogo = 'https://prayogo.sisdis.ui.ac.id/ewallet/ping';
	var hadhi = 'https://hadhi.sisdis.ui.ac.id/ewallet/pings';


	quorum.full = true;
	quorum.total = 0;

	request.get(atma,function(err,response1,body1){
		if (err || response1.statusCode != 200){
			quorum.atma = -1;
			quorum.full = false;
		}
		else{
			var atma_res = JSON.parse(body1);
			if(atma_res.pong==1){
				quorum.atma = 0;
				quorum.total += 1;
			}
			else{
				quorum.atma = -1;
				quorum.full = false;
			}
		}

		request.get(aziz, function(err, response2, body2){
			if (err || response2.statusCode != 200){
				quorum.aziz = -1;
				quorum.full = false;
			}
			else{
				var aziz_res = JSON.parse(body2);
				if(aziz_res.pong==1){
					quorum.aziz = 0;
					quorum.total += 1;
				}
				else{
					quorum.aziz = -1;
					quorum.full = false;
				}
			}

			request.get(mardhika, function(err, response3, body3){
				if (err || response3.statusCode != 200){
					quorum.mardhika = -1;
					quorum.full = false;
				}
				else{
					var mardhika_res = JSON.parse(body3);
					if(mardhika_res.pong==1){
						quorum.mardhika = 0;
						quorum.total += 1;
					}
					else{
						quorum.mardhika = -1;
						quorum.full = false;
					}
				}

				request.get(edwin, function(err, response4, body4){
					if (err || response4.statusCode != 200){
						quorum.edwin = -1;
						quorum.full = false;
					}
					else{
						var edwin_res = JSON.parse(body4);
						if(edwin_res.pong==1){
							quorum.edwin = 0;
							quorum.total += 1;
						}
						else{
							quorum.edwin = -1;
							quorum.full = false;
						}
					}

					request.get(saprikan, function(err, response5, body5){
						if (err || response5.statusCode != 200){
							quorum.saprikan = -1;
							quorum.full = false;
						}
						else{
							var saprikan_res = JSON.parse(body5);
							if(saprikan_res.pong==1){
								quorum.saprikan = 0;
								quorum.total += 1;
							}
							else{
								quorum.saprikan = -1;
								quorum.full = false;
							}
						}

						request.get(izzunaqqi, function(err, response6, body6){
							if (err || response6.statusCode != 200){
								quorum.izzunaqi = -1;
								quorum.full = false;
							}
							else{
								var izzunaqi_res = JSON.parse(body6);
								if(izzunaqi_res.pong==1){
									quorum.izzunaqi = 0;
									quorum.total += 1;
								}
								else{
									quorum.izzunaqi = -1;
									quorum.full = false;
								}
							}

							request.get(prayogo, function(err, response7, body7){
								if (err || response7.statusCode != 200){
									quorum.prayogo = -1;
									quorum.full = false;
								}
								else{
									var prayogo_res = JSON.parse(body7);
									if(prayogo_res.pong==1){
										quorum.prayogo = 0;
										quorum.total += 1;
									}
									else{
										quorum.prayogo = -1;
										quorum.full = false;
									}
								}

								request.get(hadhi, function(err, response8, body8){
									if (err || response8.statusCode != 200){
										quorum.hadhi = -1;
										quorum.full = false;
									}
									else{
										var hadhi_res = JSON.parse(body8);
										if(hadhi_res.pong==1){
											quorum.hadhi = 0;
											quorum.total += 1;
										}
										else{
											quorum.hadhi = -1;
											quorum.full = false;
										}
									}

									console.log(quorum);
									quorum.active = 'tab0';
									res.render('index', quorum);
								});
							});
						});
					});
				});
			});
		});
	});
});


//register
router.post('/reg', function(req,res){
	var url_register = req.body.ip_domisili + '/register';
	var url_register_mock = req.body.ip_domisili + '/register';

	request.post({url: url_register, form: {nama: req.body.nama, user_id: req.body.user_id, ip_domisili: req.body.ip_domisili}}
		, function(err, response, body){
			if(err){
				res.render('index',{error:true, active:'tab1'});
			}
			var result = JSON.parse(body);
			if(result.status_register == -1)
				result.message = 'Registration failed. Please register with another user_id';
			else
				result.message = 'Success!';

			result.active = 'tab1';
			result.atma = quorum.atma;
			result.aziz = quorum.aziz;
			result.mardhika = quorum.mardhika;
			result.edwin = quorum.edwin;
			result.hadhi = quorum.hadhi;
			result.saprikan = quorum.saprikan;
			result.izzunaqi = quorum.izzunaqi;
			result.prayogo = quorum.prayogo;
			result.total = quorum.total;
			result.full = quorum.full;
			res.render('index', result);
		});
});


//getsaldo
router.post('/gs', function(req,res){
	var url_getsaldo = 'https://rahman.sisdis.ui.ac.id/ewallet/getsaldo/' + req.body.user_id;
	var url_getsaldo_mock = 'http://192.168.202.102:4000/getsaldo/' + req.body.user_id;

	request.get(url_getsaldo, function(err, response, body){
		if (err){
			res.render('index',{error:true, active:'tab2'});
		}
		var result = JSON.parse(body);
		result.active = 'tab2';
		result.atma = quorum.atma;
		result.aziz = quorum.aziz;
		result.mardhika = quorum.mardhika;
		result.edwin = quorum.edwin;
		result.hadhi = quorum.hadhi;
		result.saprikan = quorum.saprikan;
		result.izzunaqi = quorum.izzunaqi;
		result.prayogo = quorum.prayogo;
		result.total = quorum.total;
		result.full = quorum.full;
		console.log(result);
		res.render('index',result);
	});
});

router.post('/trf', function(req,res){
	var url_transfer = 'https://rahman.sisdis.ui.ac.id/ewallet/transferke';
	var url_transfer_mock = 'http://192.168.202.102:4000/transferKe';

	request.post({url:url_transfer, form:{user_id: req.body.user_id, nilai: req.body.nilai, ip_tujuan: req.body.ip_tujuan}}, 
		function(err, response, body){
			if (err) {
				res.render('index',{error:true, active:'tab4'});
			}
			var result = JSON.parse(body);
			result.active = 'tab4';
			result.atma = quorum.atma;
			result.aziz = quorum.aziz;
			result.mardhika = quorum.mardhika;
			result.edwin = quorum.edwin;
			result.hadhi = quorum.hadhi;
			result.saprikan = quorum.saprikan;
			result.izzunaqi = quorum.izzunaqi;
			result.prayogo = quorum.prayogo;
			result.total = quorum.total;
			result.full = quorum.full;
			console.log(result);
			res.render('index',result);
		});
});

router.post('/gts', function(req,res){
	var url_gts = 'https://rahman.sisdis.ui.ac.id/ewallet/gettotalsaldo/' + req.body.user_id;
	var url_gts_mock = 'http://192.168.202.102:4000/gettotalsaldo/' + req.body.user_id;
	
	request.get(url_gts, function(err, response, body){
		if (err) {
			res.render('index',{error:true, active:'tab3'});
		}
		var result = JSON.parse(body);
		result.active = 'tab3';
		result.atma = quorum.atma;
		result.aziz = quorum.aziz;
		result.mardhika = quorum.mardhika;
		result.edwin = quorum.edwin;
		result.hadhi = quorum.hadhi;
		result.saprikan = quorum.saprikan;
		result.izzunaqi = quorum.izzunaqi;
		result.prayogo = quorum.prayogo;
		result.total = quorum.total;
		result.full = quorum.full;
		console.log(result);
		res.render('index',result);
	});
});

module.exports = router;
