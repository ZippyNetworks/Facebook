//super simple rpc server example
var amqp = require('amqp')
, util = require('util');

var login = require('./services/HandleRequest');

var cnn = amqp.createConnection({host:'127.0.0.1'});


cnn.on('ready', function(){

	cnn.queue('login_queue', function(q){
		console.log("listening on login_queue");
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			login.handle_login_request(message, function(err,res){
				
				//return index sent
				cnn.publish(m.replyTo, res, {
					
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
				
			});
		});
	});
	
	

	cnn.queue('friends_queue', function(q){
		console.log("listening on friends_queue");
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			login.handle_friends_request(message, function(err,res){
				
				//return index sent
				cnn.publish(m.replyTo, res, {
					
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
				
			});
		});
	});
	
	cnn.queue('group_queue', function(q){
		console.log("listening on group_queue");
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: "+JSON.stringify(message));
			util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
			login.handle_group_request(message, function(err,res){
				
				//return index sent
				cnn.publish(m.replyTo, res, {
					
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
				
			});
		});
	});
});