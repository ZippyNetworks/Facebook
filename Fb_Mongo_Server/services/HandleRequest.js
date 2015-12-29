var ejs = require("ejs");
//var mysql = require('./mysql');
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/docs";
var Member_userId;
var userid;
var bcrypt = require('bcrypt-nodejs');


//////////////////////////////////////MONGO LOGIN//////////////////////////////////////////////////
	
exports.handle_login_request = function(msg,callback){
	
	var res = {};
	console.log("In login queue's handle request:action " + msg.action);
	
	
	if (msg.action == "loginCheck") {
		console.log("In handle request:" + msg.username);
		
		mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');
		
		coll.findOne({email: msg.username}, function(err, user){	
			if (user) {
				var c= bcrypt.compareSync(msg.password,user.password);  //COMPARING ENCRYPTED PWD 
				if (c){
					console.log("Successful Login");
					res.output = user;
					res.code = 200;
					callback(null, res);
					}
					else{
						console.log("Incorrect Login");
						res.code = 400;
						res.value = "Login fail";
						callback(null, res);
						}
					}
				 
				else {
					console.log("Failed Login");
					res.code = 400;
					res.value = "Login fail";
				  callback(null, res);
				}
		});
	});
	}	

////////////////////////////////////////MONGO LOAD PAGE//////////////////////////////////////////////////////
if (msg.action == "loadpage") {
	mongo.connect(mongoURL, function(){
		var coll = mongo.collection('users');	
		var col2 = mongo.collection('newsfeed');	
		coll.findOne( { email : msg.username}, function(err, user){
			if (user) {
				 		  var arr = [];
				 		  arr.push(msg.username);
						  for (var i =0 ; i < user.friends.length; i++)
							{
							  arr.push(user.friends[i].femail);
							}
						  	col2.find({email : {$in : arr}}).toArray(function(err, newsfeed){
						  		console.log("successful load page" + msg.username);	  
								 //res.send({"user":JSON.stringify(user), "newsfeed":JSON.stringify(newsfeed)}) ;
						  		res.output= user;
						  		res.output2 = newsfeed;
						  		res.code = 200; 
						  		console.log("Value of res " + res.output + res.output2 + res.code);
						  		callback(null, res);
						  	});
				}
			else {
				res.code = 400;
				console.log("returned false load page");
		    	callback(null, res);
			}
		});
		//callback(null, res);
		});
	}

///////////////////////////////////////LOAD PROFILE PAGE///////////////////////////////////////////////////////////

if (msg.action == "loadprofile") {
	var arr = [];
   mongo.connect(mongoURL, function(){
	var coll = mongo.collection('users');
	var col2 = mongo.collection('newsfeed');
	coll.findOne( { email : msg.email }, function(err, user){
		if (user) {
	
			coll.find({request :  msg.email}, function(err, op){
				for(var k ;  k < op.length ; k++){
						arr.push(op[k].email);
				}
			});
			   arr.push( msg.email);
			   for (var i =0 ; i < user.friends.length; i++)
				{
				 arr.push(user.friends[i].femail);
				}
			   for (var j =0 ; j < user.request.length; j++)
				{
				 arr.push(user.request[j]);
				}
				  coll.find({email : {$nin : arr}}).toArray(function(err, user2){
					  if (user2)
						  {
							col2.find( { email : msg.email }).toArray(function(err, user3){
								if(user3){
									console.log("my newsfeed" + user3);
						    res.output1 = user;
							res.output2 = user2;
							res.output3 = user3;
							res.code =200;
							res.value= "loaded Group";
							callback(null, res);
								}
							});
			//				  console.log(user2);
							  //res.send({"users":JSON.stringify(user),"user2":JSON.stringify(user2)}) ;
						  }
				  });
			} 
		else {
			res.code =400;
			res.value= "Error loading profile";
			callback(null, res);
		}
	});
});
}
//////////////////////////////////////////MONGO SIGN UP////////////////////////////////////////////////////

if (msg.action == "signup") {	
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');
		coll.insert({firstname : msg.firstname, lastname:msg.lastname, email:msg.email, password : msg.pwd , gender : msg.gender , friends : [] , request : []}, function(err, user){
			if (user) {
			//	coll.findOne({email: msg.username, password:msg.password}, function(err, user2){
				console.log("Successful SignUp");
				res.firstname = msg.firstname;
				res.lastname = msg.lastname;
				res.email = msg.email;
				res.code = 200;
				callback(null, res);
			//	});
			} 
			else {
				console.log("Failed Signup");
				res.code = 400;
				res.value = "Login fail";
			  callback(null, res);
			}
		});
	});
}

///////////////////////////////////////////MONGO USER PROFILE/////////////////////////////////////////////////////////////////

if (msg.action == "savechanges") {
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');
		coll.update( { email : msg.email },
			    {
		      $set: {
		    	  occupation: msg.works,
		    	  highschool: msg.highschool,
		    	  lives : msg.lives,
		    	  aboutme : msg.aboutme
		      }}, function(err, user){
			if (user) {
				console.log("Successful Editing User Profile");
				res.code = 200;
				callback(null, res);

			} else {
				console.log("Error Editing User Profile");
				res.code = 400;
				callback(null, res);
			}
		});
	});
}
};
//////////////////////////////////////////////////GROUP///////////////////////////////////////////////////////////////

//////////////////////////////////////////////////MONGO CREATE GROUP/////////////////////////////////////////////////////


exports.handle_group_request = function(msg,callback){
	
	var res = {};
	console.log("In group queue's handle request:action " + msg.action);
	
	if (msg.action == "addgroup") {
	mongo.connect(mongoURL, function(){
		var coll = mongo.collection('groups');
		var col2 = mongo.collection('users');	
		coll.insert( { groupname :msg.groupname ,description: msg.description , admin : msg.email , members1 : [ { memberemail : msg.email , memberfirstname : msg.firstname , memberlastname : msg.lastname }]  } , function(err, user){
			console.log("Inisde create grp" + user + "Id" + user.insertedIds );
			if (user)
			
			{
				col2.update( { email : msg.email },
					    {
					$addToSet: { mygroup:  msg.groupname
				    	  
				      }}, function(err, user2){
						if (user2) {
							console.log("Added group to user profile");
							res.groupid = user.insertedIds;
							res.code =200;
							res.value= "Added Group";
							callback(null, res);
							 } 
						else {
							console.log("returned false");
							res.code =400;
							res.value= "Error in adding Group";
							callback(null, res);
						}
					});

				console.log("Added Group to Group list" + user.insertedIds);
			
			} 
			
			else {
				console.log("returned false");
			}
		});
	});
	}

////////////////////////////////////////LOAD GROUP MONGO///////////////////////////////////////////////////////////////////

	if (msg.action == "loadgroup1") {
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at loadgroup1: ' + mongoURL);
		var coll = mongo.collection('groups');
		var col2 = mongo.collection('users');			
		coll.findOne({groupname: msg.groupname}, function(err, user){
			if (user) {
				console.log(user);
				console.log(" User members " + user.members1);
				col2.find({mygroup : {$ne : msg.groupname}}).toArray (function(err, user2){
					if (user2) {
						console.log("this is users " + user2);	
						res.output1 = user;
						res.output2 = user2;
						res.code =200;
						res.value= "loaded Group";
						callback(null, res);
					
					}
					else {
						res.code =400;
						res.value= "Error loading group";
						callback(null, res);
					}
				});
			}
			
			else {
				res.code =400;
				res.value= "Error loading group";
				callback(null, res);
			}
		});
	});
	}


//////////////////////////////////////////MONGO ADD MEMBERS/////////////////////////////////////////////////////////

if (msg.action == "addgrpmember") {
 	mongo.connect(mongoURL, function(){
		var coll = mongo.collection('groups');
		var col2 = mongo.collection('users');	
		col2.findOne({email : msg.email },function(err, user2){
				if (user2) {
					coll.update( { groupname : msg.groupname }, {$push : {members1 : { memberemail :msg.email , memberfirstname : user2.firstname , memberlastname : user2.lastname }}} , function(err, user){
						if (user) {
								col2.update( { email : msg.email }, {$addToSet : {mygroup : msg.groupname}} , function(err, user3){
									if (user3) {
										//	console.log(user);
											console.log("Added group to user profile");
										//	res.send({"gid": JSON.stringify(req.session.gid) });
											res.code =200;
											res.value= "Added Group Member";
											callback(null, res);
											
									} 
									else {
									
										res.code =400;
										res.value= "Error Adding Group Member";
										callback(null, res);
										}
								});		
						} 
						else {
							res.code =400;
							res.value= "Error Adding Group Member";
							callback(null, res);
						throw err;
							}
					});					}
				else {
					res.code =400;
					res.value= "Error Adding Group Member";
					callback(null, res);
				}
		});
	});
} 


//////////////////////////////////MONGO DELETE GROUP MEMBER//////////////////////////////////////
if (msg.action == "delgrpmember") {
mongo.connect(mongoURL, function(){
		var coll = mongo.collection('groups');
		var col2 = mongo.collection('users');	
		col2.findOne({email : msg.email },function(err, user2){
				if (user2) {
					coll.update( { groupname : msg.groupname}, {$pull : {members1 : { memberemail : msg.email}}} , function(err, user){
						if (user) {
								col2.update( { email :  msg.email }, {$pull : {mygroup : msg.groupname}} , function(err, user3){
									if (user3) {
											console.log("Removed member from group");
											res.code =200;
											res.value= "Added Group Member";
											callback(null, res);
									} 
									else {
										res.code =400;
										res.value= "Error Removing member from group";
										callback(null, res);
									
										}
								});		
						} 
						else {
							res.code =400;
							res.value= "Error Removing member from group";
							callback(null, res);
							}
					});					}
				else {
					res.code =400;
					res.value= "Error Removing member from group";
					callback(null, res);
				}
		});
	});
}


////////////////////////////////////////MONGO DEL GROUP//////////////////////////////////////////////////////////////////
if (msg.action == "delgroup") {
	mongo.connect(mongoURL, function(){
		var coll = mongo.collection('groups');
		var col2 = mongo.collection('users');	
		coll.findOne({groupname : msg.groupname },function(err, user2){
				if (user2) {
					coll.remove( { groupname : msg.groupname} , function(err, user){
						if (user) {
								col2.update({}, {$pull : {mygroup :msg.groupname}},{multi:true} , function(err, user3){
									if (user3) {
											res.code =200;
											res.value= "Removed group from user profile";
											callback(null, res);
																						
									} 
									else {
										res.code =400;
										res.value= "Error Removing group";
										callback(null, res);
										}
								});		
						} 
						else {
							res.code =400;
							res.value= "Error Removing group";
							callback(null, res);
							}
					});					}
				else {
					res.code =400;
					res.value= "Error Removing group";
					callback(null, res);
				}
		});
	});
}
};
///////////////////////////////////////////////// FRIENDS/////////////////////////////////////////////////////////////////////////// 

/////////////////////////////////////////////MONGO ADD FRIENDS//////////////////////////////////////////////////////////////////////////	
exports.handle_friends_request = function(msg,callback){
	
	var res = {};
	console.log("In friends queue's handle request:action " + msg.action);
	if (msg.action == "addfriend") 
{ 
	mongo.connect(mongoURL, function(){
		var col2 = mongo.collection('users');	
		col2.findOne({email : msg.femail },function(err, user2){
				if (user2) {
					col2.update( { email : msg.femail }, {$addToSet : {request :msg.email }} , function(err, user){
						if (user) {
							res.code =200;
							res.value= "Request Sent";
							callback(null, res);		
									} 
						else {
							res.code =400;
							res.value= "Error sending req";
							callback(null, res);
							}
					});					}
				else {
					res.code =400;
					res.value= "Error sending req";
					callback(null, res);
				}
		});
	});
}


////////////////////////////////////////////////MONGO SHOW FRIEND REQUEST/////////////////////////////////////////////////////////////////////

	if (msg.action == "showfriend")
{  
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at loadgroup1: ' + mongoURL);
		var col2 = mongo.collection('users');			
		col2.findOne({email: msg.email}, function(err, user){
			if (user) {
				 var arr = [];
				  for (var i =0 ; i < user.request.length; i++)
					{
					  arr.push(user.request[i]);
					 console.log("Array contains" +arr[i]);
					}
				  col2.find({email : {$in : arr}}).toArray(function(err, user3){
					  if (user3)
						  {
							  console.log(user3);
							  res.output1 = user3;
							  res.code =200;
							  res.value= "Show friend Request";
							  callback(null, res);	
						  } 
					else {
						res.code =400;
						  res.value= "Error Showing friend Request";
						  callback(null, res);	
					}
				});
			}
			
			else {
				res.code =400;
				  res.value= "Error Showing friend Request";
				  callback(null, res);	
			}
		});
	});
}



/////////////////////////////////////////////MONGO ACCEPT REQUEST//////////////////////////////////////////////////////////////////////////

	if (msg.action == "accept")
	{  
		mongo.connect(mongoURL, function(){
			var col2 = mongo.collection('users');	
		//	col2.findAndModify({ query : { email : req.param("mid") }, update: { $addToSet: { mygroup: req.session.gid }}}, function(err, user2){
			col2.findOne({email : msg.femail },function(err, user2){
					if (user2) {
						col2.update( { email : msg.email }, {$push : {friends : { femail :msg.femail , ffname : user2.firstname , flname : user2.lastname }}} , function(err, user){
							if (user) {
									col2.update( { email : msg.femail }, {$push : {friends : { femail :msg.email , ffname : msg.firstname , flname : msg.lastname }}} , function(err, user3){
										if (user3) {
											col2.update( { email : msg.email }, {$pull : {request : msg.femail }} , function(err, user5){
												if(user5){
												console.log("Added friend" + msg.femail);
												res.code =200;
												 res.value= "Accepted friend Request";
												 callback(null, res);
													
												}
												
											});
											//	res.send({"gid": JSON.stringify(req.session.gid) });	
											
										} 
										else {
											res.code =400;
											  res.value= "Error Accepting friend Request";
											  callback(null, res);
											}
									});		
							} 
							else {
								res.code =400;
								  res.value= "Error Accepting friend Request";
								  callback(null, res);
								}
						});					}
					else {
						res.code =400;
						  res.value= "Error Accepting friend Request";
						  callback(null, res);
					}
			});
		});	
}


/////////////////////////////////////////////MONGO DECLINE REQUEST//////////////////////////////////////////////////////////////////////////
if (msg.action == "decline")
{  
		mongo.connect(mongoURL, function(){
			var col2 = mongo.collection('users');	
						col2.update( { email : msg.email }, {$pull : {request : msg.femail }} , function(err, user){
							if (user) {
								  res.code =200;
								  res.value= "Request declined";
								  callback(null, res);
								//res.end();
							}
					else {
						res.code =400;
						  res.value= "Error Declining friend Request";
						  callback(null, res);
					}
			});
		});	
}

////////////////////////////////////////////////MONGO NEWFEED/////////////////////////////////////////////////////////////////////////

if (msg.action == "postfeed")
{  
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('newsfeed');
			
		coll.insert({firstname: msg.firstname, lastname:msg.lastname, email:msg.email, content : msg.content , timestamp : Date()}, function(err, user){
			if (user) {
				res.code =200;
				  res.value= "Posted newsfeed";
				  callback(null, res);

			} 
			else {
				res.code =400;
				  res.value= "Error Psoting newsfeed";
				  callback(null, res);
			}
		});
	});
}  
};



 