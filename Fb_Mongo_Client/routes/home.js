var ejs = require("ejs");
var mq_client = require('../rpc/client');
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/session";


////////////////////////////////ENCYRPTION USING BCRYPT////////////////////////////////////////////////////////////////

//Loading the bcrypt module
var bcrypt = require('bcrypt-nodejs');
//Generating a salt
var salt = bcrypt.genSaltSync(10);
//Hash the password with the salt


//////////////////////////////////////MONGO LOGIN ////////////////////////////////////////////////////////////////////

exports.loginCheck = function(req,res){
	var emailid = req.param("emailid");
	var password = req.param("password");
	console.log(password +" is the object");
	console.log(emailid +" is the object");
	
	var msg_payload = { "username": emailid, "password": password , "action" : "loginCheck" };
	console.log("In POST Request = UserName:"+ emailid+" "+password);
	mq_client.make_request('login_queue',msg_payload, function(err,results){

		console.log("Value of results.code " + results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				req.session.firstname = results.output.firstname;
				req.session.lastname = results.output.lastname;
				req.session.username = results.output.email;
				console.log("session has  : " + req.session.username);
				console.log("valid Login");
				res.send({"login":"Success"});
				res.end();
			}
			else {    
				
				console.log("Invalid Login");
				res.send({"login":"Fail"});
			}
		}  
	});
	
};
////////////////////////////////////////////MONGO HOMEPAGE //////////////////////////////////////////////////////////////////////////
exports.homepage = function homepage(req,res)
{
	
	ejs.renderFile('./views/homepage.ejs',function(err, result) {
  		// render on success
        if (!err) {
            res.end(result);
        }
        // render or error
        else {
            res.end('An error occurred');
            console.log(err);
        }
	 });
};

///////////////////////////////////////////MONGO HOMEPAGE //////////////////////////////////////////////////////////////////////////
exports.shows = function shows(req,res)
{
	
	ejs.renderFile('./views/groups.ejs',function(err, result) {
  		// render on success
        if (!err) {
            res.end(result);
        }
        // render or error
        else {
            res.end('An error occurred');
            console.log(err);
        }
	 });
};

//////////////////////////////////////////MONGO SIGN UP WITH ENCRPYTION///////////////////////////////////////////////////////////
exports.signup = function signup(req,res){
	
	var email , pwd , birthdate , firstname, lastname , gender ;
	firstname = req.param("firstname");
	lastname = req.param("lastname");
	email = req.param("email");
	pwd = req.param("pwd");
	gender = req.param("gender");
	birthdate = "19901010";
	
	var hash = bcrypt.hashSync(pwd, salt); // ENCRYPTING PASSWORD USING HASH AND SALT
	console.log("hash pwd " + hash);
	
	var msg_payload = { "firstname": firstname, "lastname": lastname , "email": email,"pwd": hash, "gender": gender,"action" : "signup" };
	console.log("In POST Request for signup = UserName:"+ email);
	mq_client.make_request('login_queue',msg_payload, function(err,results){

		console.log("Value of results.code " + results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				req.session.firstname = results.firstname;
				req.session.lastname = results.lastname;
				req.session.username = results.email;
				console.log("session has  : " + req.session.username);
				console.log("valid Login");
				res.send({"login":"Success"});
				res.end();
			}
			else {    
				
				console.log("Invalid Login");
				res.send({"login":"Fail"});
			}
		}  
	});
	
};

////////////////////////////////////////MONGO LOAD PAGE//////////////////////////////////////////////////////////////

exports.loadpage = function loadpage(req,res)
{  
	var msg_payload = { "username" : req.session.username , "action" : "loadpage"};
	console.log("In POST Request for load page= UserName:"+ req.session.username);
	mq_client.make_request('login_queue',msg_payload, function(err,results){
		console.log("Value of results.code in loadpage " + results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("valid Login ");
				res.send({"user":JSON.stringify(results.output) , "newsfeed":JSON.stringify(results.output2)});
				//res.end();
			}
			else {    
				
				console.log("Invalid Login");
				res.send({"login":"Fail"});
			}
		}  
	});
};

///////////////////////////////////////////MONGO LOG OUT///////////////////////////////////////////////////

exports.logout = function(req,res)
{
	req.session.destroy();
	res.redirect('/');
};


///////////////////////////////////////////MONGO USER PROFILE/////////////////////////////////////////////////////////////////

exports.savechanges = function savechanges(req,res)
{ console.log("In save changes ");
	var msg_payload = { email:req.session.username  , "works" : req.param("works") , "lives" : req.param("lives"),"highschool" : req.param("highschool") ,"aboutme" :req.param("aboutme"), "action" : "savechanges"};
	console.log("In POST Request for edit user profile ");
	mq_client.make_request('login_queue',msg_payload, function(err,results){
		console.log("Value of results.code " + results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("Success Editing");
			//	res.send({"login":"Success"});
				res.end();
			}
			else {    
				
				console.log("Failed Editing");
				//res.send({"login":"Fail"});
			}
		}  
	});
	
};
	/*var works , highschool , lives , firstname, lastname , gender ;
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');
			
		coll.update( { email : req.session.username },
			    {
		      $set: {
		    	  occupation: req.param("works"),
		    	  highschool: req.param("highschool"),
		    	  interests : req.param("interests")
		      }}, function(err, user){
			if (user) {
	
				console.log(req.session.username +" is the session");
				
				console.log("Successful Login");
				res.send({"login":"Success"});

			} else {
				console.log("returned false");
				
				console.log("Invalid Login");
				res.send({"login":"Fail"});
			}
		});
	});
};
*/

//////////////////////////////////////////////////MONGO CREATE GROUP/////////////////////////////////////////////////////

exports.addgroup = function addgroup(req,res)
{
	var msg_payload = { "email" : req.session.username , "firstname" : req.session.firstname,"lastname" : req.session.lastname ,"groupname" :req.param("groupname"),"description": req.param("groupdesc"),"action" : "addgroup"};
	console.log("In POST Request for addGroup ");
	mq_client.make_request('group_queue',msg_payload, function(err,results){
		console.log("Value of results.code " + results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("valid Login");
				res.send({"login":"Success"});
				res.end();
			}
			else {    
				
				console.log("Invalid Login");
				res.send({"login":"Fail"});
			}
		}  
	});
	
};
////////////////////////////////////////LOAD GROUP MONGO//////////////////////////////////	

exports.loadgroup1 = function(req,res){
	var msg_payload = { groupname: req.session.gid , "action" : "loadgroup1" };
	console.log("In POST Request for load group ");
	mq_client.make_request('group_queue',msg_payload, function(err,results){
		console.log("Value of results.code in loadgroup" + results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("Group loaded");
				res.send({"groupdetails":JSON.stringify(results.output1) , "userdetails":JSON.stringify(results.output2)});
				//res.send({"login":"Success"});
				res.end();
			}
			else {    
				
				console.log("Cannot load group");
			//	res.send({"login":"Fail"});
			
			}
		}  
	});
	
};
	
	

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.loadgroup = function loadgroup(req,res)
{ 
	var groupname = req.param("grpname");
	req.session.gid=groupname;
	//console.log("groupid is groupid= " + req.session.gid);
	res.send({"login":"Success"});
	
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.group = function group(req,res)
{
	console.log("inside group");
	ejs.renderFile('./views/group.ejs',function(err, result) {
  		// render on success
        if (!err) {
            res.end(result);
        }
        // render or error
        else {
            res.end('An error occurred');
            console.log(err);
        }
	 });
};

//////////////////////////////////////////MONGO ADD MEMBERS/////////////////////////////////////////////////////////

exports.addgrpmember = function addgrpmember(req,res)
{
	var msg_payload = { "email" : req.param("mid") , groupname: req.session.gid,"action" : "addgrpmember"};
	console.log("In POST Request for addGroupMembers ");
	mq_client.make_request('group_queue',msg_payload, function(err,results){
		console.log("Value of results.code " + results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("Added group member");
				res.send({"gid":JSON.stringify(req.session.gid)});
				res.end();
			}
			else {    
				
				console.log("Error adding group member");
				res.send({"login":"Fail"});
			}
		}  
	});
	
};

//////////////////////////////////MONGO DELETE GROUP MEMBERS//////////////////////////////////////
exports.delgrpmember = function delgrpmember(req,res)
{ 
	var msg_payload = { "email" : req.param("mid") , groupname: req.session.gid,"action" : "delgrpmember"};
	console.log("In POST Request for delgrpmember ");
	mq_client.make_request('group_queue',msg_payload, function(err,results){
		console.log("Value of results.code " + results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("Deleted group member");
				res.send({"gid":JSON.stringify(req.session.gid)});
				res.end();
			}
			else {    
				
				console.log("Error adding group member");
				res.send({"login":"Fail"});
			}
		}  
	});
	
};
	


////////////////////////////////////////MONGO DEL GROUP//////////////////////////////////////////////////////////////////
exports.delgroup = function delgroup(req,res)
{ 
	var msg_payload = { "email" : req.param("mid") , groupname: req.session.gid,"action" : "delgroup"};
	console.log("In POST Request for delgroup ");
	mq_client.make_request('group_queue',msg_payload, function(err,results){
		console.log("Value of results.code " + results.code);
		if(err){
			throw err;
		}
		else 
		{
			  if(results.code == 200){
				console.log("Deleted group member");
				res.send({"gid":JSON.stringify(req.session.gid)});
				res.end();
			}
			else {    
				
				console.log("Error adding group member");
				res.send({"login":"Fail"});
			}
		}  
	});
	
};
	

/////////////////////////////////////////////////FETCH PROFILE PAGE////////////////////////////////////////////////////////////////////////



exports.profile = function profile(req,res)
{
	
	ejs.renderFile('./views/Profile.ejs',function(err, result) {
  		// render on success
        if (!err) {
            res.end(result);
        }
        // render or error
        else {
            res.end('An error occurred');
            console.log(err);
        }
	 });
};

/////////////////////////////////////////////MONGO LOAD PROFILE PAGE/////////////////////////////////////////

exports.loadprofile = function loadprofile(req,res)
{  
	var msg_payload = { "email" : req.session.username , "action" : "loadprofile"};
	console.log("In POST Request for load page= UserName:"+ req.session.username);
	mq_client.make_request('login_queue',msg_payload, function(err,results){
		console.log("Value of results.code in loadpage " + results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("Profile Page loaded ");
				//res.send({"user":JSON.stringify(user), "newsfeed":JSON.stringify(newsfeed)}) ;
				res.send({"users":JSON.stringify(results.output1) , "user2":JSON.stringify(results.output2),"myfeeds":JSON.stringify(results.output3)});
				//res.end();
			}
			else {    
				
				console.log("Profile Page error");
				res.send({"login":"Fail"});
			}
		}  
	});
};


////////////////////////////////////////////////MONGO SHOW FRIEND REQUEST/////////////////////////////////////////////////////////////////////

exports.showfriend = function showfriend(req,res)
{ 
var msg_payload = { "email" : req.session.username , "action" : "showfriend"};
console.log("In POST Request for load page= UserName:"+ req.session.username);
mq_client.make_request('friends_queue',msg_payload, function(err,results){
	console.log("Value of results.code  " + results.code);
	if(err){
		throw err;
	}
	else 
	{
		if(results.code == 200){
			console.log("valid Login ");
			 res.send({"user3":JSON.stringify(results.output1)}) ;
		
		}
		else {    
			
			console.log("Error Showing friend request");
			//res.end();
		}
	}  
});
};
	
	
/////////////////////////////////////////////MONGO ADD FRIENDS//////////////////////////////////////////////////////////////////////////	

exports.addfriend = function addfriend(req,res)

{ 
	var msg_payload = { "email" : req.session.username ,femail : req.param("mid") , "action" : "addfriend"};
	console.log("In POST Request for addfriend");
	mq_client.make_request('friends_queue',msg_payload, function(err,results){
		console.log("Value of results.code in loadpage " + results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("valid Login ");
				res.end();
			}
			else {    
				
				console.log("Invalid Login");
				//res.send({"login":"Fail"});
			}
		}  
	});
};

/////////////////////////////////////////////MONGO ACCEPT FRIEND REQUEST//////////////////////////////////////////////////////////////////////////

exports.accept = function accept(req,res)
{  
	var msg_payload = { "email" : req.session.username,"firstname" : req.session.firstname,"lastname" : req.session.lastname ,femail : req.param("mid") , "action" : "accept"};
	console.log("In POST Request for accept friend request");
	mq_client.make_request('friends_queue',msg_payload, function(err,results){
		console.log("Value of results.code  " + results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("Accepted request ");
				res.end();
			}
			else {    
				
				console.log("Error accepting request");
				res.end();
			}
		}  
	});
};

/////////////////////////////////////////////MONGO DECLINE REQUEST//////////////////////////////////////////////////////////////////////////

exports.decline = function decline(req,res)
{  
	var msg_payload = { "email" : req.session.username , femail : req.param("mid") , "action" : "decline"};
	console.log("In POST Request for decline friend request");
	mq_client.make_request('friends_queue',msg_payload, function(err,results){
		console.log("Value of results.code  " + results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("Declined request ");
				res.end();
			}
			else {    
				
				console.log("Error declining request");
				res.end();
			}
		}  
	});
};
	
////////////////////////////////////////////////MONGO NEWFEED/////////////////////////////////////////////////////////////////////////

exports.postfeed = function postfeed(req,res)
{ 
	
	var msg_payload = { "email" : req.session.username,"firstname" : req.session.firstname,"lastname" : req.session.lastname ,content : req.param("text") ,"action" : "postfeed"};
	console.log("In POST Request for accept friend request");
	mq_client.make_request('friends_queue',msg_payload, function(err,results){
		console.log("Value of results.code  " + results.code);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("Posted newsfeed");
				res.end();
			}
			else {    
				
				console.log("Error posting newsfeed");
				res.end();
			}
		}  
	});
};
