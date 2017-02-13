// Required Modules
var AWS = require("aws-sdk");
var sleep = require('sleep');
var redis = require('redis')
var client = redis.createClient(6379, '54.90.183.55');
var os = require('os-utils');
var exec = require('child_process').exec;

// Access and Secret Key
var aws_access = process.env.AWS_ACCESS
var aws_secret = process.env.AWS_SECRET

// Set your region for future requests and the keys.
AWS.config.update({accessKeyId: aws_access, secretAccessKey: aws_secret, region: 'us-east-1'});

var ec2 = new AWS.EC2();

var params = {
  InstanceIds: ["i-00b78510d4ac0c216"]
};

os.cpuUsage(function(v){
    if (v>0.60){
      //Reboot the instance
      client.lrem('ip_address', 0, '54.198.145.39');
      client.lrem('instance_id', 0, 'i-00b78510d4ac0c216');
      exec('python slacknotifystop.py', function(err, out, code)
      {
        console.log("Sending a Slack Notification.");
        if (err instanceof Error)
            throw err;
        if( err )
        console.error( err );
      });
      // Reboot the instance
      ec2.rebootInstances(params, function(err, data) {
        if (err) { console.log("Could not reboot the instance", err); return; }
      });
    }
});