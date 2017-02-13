var AWS = require('../aws.js');
var fs = require('fs');
var redis = require('redis');

//var server = fs.readFileSync(__dirname + '/../redis/redisServer.json');
//var redisServer = JSON.parse(server);
var redisServer={
port: 6379,
ipAddr: '54.173.96.236'
};
var client = redis.createClient(redisServer.port, redisServer.ipAddr, {});

client.on('error', function(err){
  if(err) throw err;
});

var aws_params = {
  ImageId: 'ami-01f05461', //'ami-2d39803a', // Amazon Linux AMI x86_64 EBS
  InstanceType: 't2.micro',
  MinCount: 1,
  MaxCount: 1,
  KeyName: 'devops-m3',
  SecurityGroupIds: ['sg-52a9db35'] //['sg-af8715d5']
};

//Add Redis server
AWS.provisionAWSInstance(aws_params, function(instanceInfo){
	var inventory = "\n"+"prod1 ansible_ssh_host=" + instanceInfo.ipAddr + " ansible_ssh_user=ubuntu ansible_ssh_private_key_file=/home/ubuntu/devops-m3.pem";
  fs.appendFileSync("inventory", inventory);
  var json = JSON.stringify(instanceInfo);
  client.lpush(['prodServers', json], function(err, reply){
    if(err) throw err;
  });
    client.lpush(['runningServers', json], function(err, reply){
    if(err) throw err;
    client.quit();
  });
});