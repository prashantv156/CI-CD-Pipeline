var AWS = require('../aws.js');
var fs = require('fs');

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
	var inventory = "\n"+"redis ansible_ssh_host=" + instanceInfo.ipAddr + " ansible_ssh_user=ubuntu ansible_ssh_private_key_file=/home/ubuntu/devops-m3.pem";
  fs.appendFileSync("inventory", inventory);
  var server = {
  	ipAddr: instanceInfo.ipAddr,
  	port: 6379
  };
  var json = JSON.stringify(server);
  fs.writeFileSync("redisServer.json", json);
 });