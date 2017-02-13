	var AWS = require('./aws.js');
	var redis = require('redis');
	var multer  = require('multer');
	var express = require('express');
	var fs      = require('fs');
	var app = express();


	//AWS instance params
	var aws_params = {
	  ImageId: 'ami-01f05461', //'ami-2d39803a', // Amazon Linux AMI x86_64 EBS
	  InstanceType: 't2.micro',
	  MinCount: 1, 
	  MaxCount: 1,
	  KeyName: 'devops-m3',
	  SecurityGroupIds: ['sg-52a9db35'] //['sg-af8715d5']
	};


	// REDIS
	var client = redis.createClient(6379, '54.173.96.236', {});


	//client.on('connect', function(){
	//console.log("Redis Server is connected!!");
	//});

	client.on('error', function(err){
	if(err) throw err;
	});

	// client.lpush(['runningServers', '3000'], function(err){
	// if(err) throw err;
	// });

	/////////////////// WEB ROUTES ///////////////////////////

	// Add hook to make it easier to get all visited URLS.

	app.use(function(req, res, next) 
	{
		console.log(req.method, req.url);
		client.lpush(['recentSites', req.url], function(err, reply){
		if(err)
			console.log("Error pushing recently visited site:", err);
			//else
				//console.log(reply);
		});
		client.ltrim('recentSites', 0, 4, function(err,reply){
			if (err)
				console.log(err);
		});
		next(); // Passing the request to the next handler in the stack.
	});


	app.get('/', function(req, res){
		res.writeHead(200, {'content-type':'text/html'});
		res.write('<h1> Welcome to homepage!\n<h1> <h2> Unity ID: jhjain </h2>');
		res.end();
		//console.log('Homepage of HW 3!');
	});


	app.get('/set', function(req, res){
		client.setex('expiringKey', '10', 'this message will self-destruct in 10 seconds', function(err, reply){
			if(err){
				res.status(500).send('Oops! Error setting key.');
				//console.log("Error setting key:", err);
			}
			else{ 
				res.status(200).send('Your request was successful!');
				//console.log(reply);
			}
		});
	});

	app.get('/get', function(req, res){
		client.get('expiringKey', function(err, reply){
			if(err){
				res.status(500).send('Oops! Error getting key.');
				console.log("Error getting key:", err);
			}
			else{
				if(reply === null)
					res.status(200).send('Key not found!');
				else
					res.status(200).send(reply);
				//console.log(reply);
			}
		});
	});


	app.get('/recent', function(req, res){
		client.lrange('recentSites', 0, -1, function(err, reply){
			if(err){
				res.status(500).send('Error getting recenty visited sites.');
				console.log(err);
			}
			else {
				res.writeHead(200, {'content-type':'text/html'});
				res.write('<h3> Your 5 most recently visited sites are as follows:</h3> <ul>');
				reply.forEach(function(site){
					res.write('<li> ' + site + ' </li>');
				});
				res.write('</ul>');
				res.end();
				//console.log(reply);
			}
		});
	});

	app.get('/upload', function(req, res){
		res.sendFile('uploadImg.html', {root: __dirname});
	});

	app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
		if( req.files.imagefile )
		{
			fs.readFile( req.files.imagefile.path, function (err, data) {
				if (err) throw err;
				var img = new Buffer(data).toString('base64');
				//console.log(img);
				client.lpush(['imageUploads', img], function(error, reply){
					if(error){
						res.status(500).send('Oops! Error uploading image.');
						console.log(error);
					}
					else {res.status(201).send('Image uploaded successfully!').end();
						//console.log('Image upload successful!');
						//console.log(img);
					}
				});
			});
		}
	}]);
	//res.status(204).end()


	app.get('/meow', function(req, res) {

		client.lpop('imageUploads', function(err, reply){
		if (err) throw err;
		if (reply){
			res.writeHead(200, {'content-type':'text/html'});
			res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+ reply +"'/>");
			res.end();
			//console.log('Image retrieved');
		}
		else {
			res.status(200).send('No Image in Stack!');
			//console.log('No new image in queue');
		}
		});
	});


	app.get('/spawn', function(req, res){

		AWS.provisionAWSInstance(aws_params, function(instanceInfo){
			console.log(instanceInfo);
			var json = JSON.stringify(instanceInfo);
			client.lpush(['prodServers', json], function(err, reply){
			if(err) throw err;
			if (reply)
				res.status(200).send('New Instance Started\n');
			});	
		});
	});

	app.get('/listservers', function(req, res){
	client.lrange('runningServers', 0, -1, function(err, data){
		if (err) throw err;
		if (data) {
			console.log(data);
			res.writeHead(200, {'content-type':'text/html'});
			res.write('<h3> Currently running servers:</h3> <ul>');
			data.forEach(function(element){
				var server = JSON.parse(element);
				res.write('<li> ' + server.ipAddr + ' </li>');
			});
			res.write('</ul>');
			res.end();
			//console.log(data);
		}
	});
	});

	app.get('/delete', function(req, res){

			client.llen("runningServers", function(err, servers){
			if(servers <= 1)
			{
				res.status(403).send('Only one webserver running. Undefined behaviour!\n');
			}
			else
			{	
				client.lpop("runningServers", function(err, server){
					if(err) throw err;
					if (server){
						var delServer = JSON.parse(server);
						//console.log(delServer.ipAddr);
						AWS.destroyAWSInstance(delServer.instanceId, function(){
							var resMsg = 'Server deleted at address: ' + delServer.ipAddr + '\n';
							res.status(200).send(resMsg);
						});
					}				
				});
			}
		}); 
	});

	app.get('/hiddenFeature', function(req, res){
		client.get('featureFlag', function(err, flagValue){
			if(err) throw err;
			if(flagValue === 'true')
				res.status(200).send('Congratulations! You can use this new feature.');
			else res.status(200).send('Sorry! This feature is not yet available.');
		});
	});

	app.all('*', function(req, res){
		res.status(404).send('Not Found!');
	});

	// HTTP SERVER
	var server = app.listen(3000, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
	});


	module.exports = server;

