var aws = require('aws-sdk');
var fs = require('fs');
aws.config.update({region:'us-west-2'});
var ec2 = new aws.EC2();
    
// var params = {
//   ImageId: 'ami-d732f0b7', // Amazon Linux AMI x86_64 EBS
//   InstanceType: 't2.micro',
//   MinCount: 1, 
//   MaxCount: 1,
//   KeyName: 'devops-hw1',
// };

//provisionAWSInstance(params);

module.exports = {

  provisionAWSInstance: function(params, callback) {

    ec2.runInstances(params, function(err, data) {
      if (err) {
        console.log("Could not create instance\n", err);
      }
      if (data) {
        //console.log(data);
        var instanceId = data.Instances[0].InstanceId;
        //console.log("Created instance with id", instanceId);
        ec2.waitFor('instanceRunning', {InstanceIds: [instanceId]}, function(err, data) {
          if (err) {
          console.log(err);
          }
          if (data) {
            //console.log(data);
            publicIpAddress = data.Reservations[0].Instances[0].PublicIpAddress;
            console.log("Public Ip Address of the AWS VM is", publicIpAddress);
            var instanceInfo = {
                instanceId: instanceId,
                ipAddr: publicIpAddress
            };
            callback(instanceInfo);
          } 
        });
      }
    });
},

  destroyAWSInstance: function(instanceId, callback) {
    ec2.terminateInstances({ InstanceIds: [instanceId] }, function(err, data) {
        if(err) {
            console.log(err);
        }
        if(data) {
            console.log(data);
            callback();
        }
    });
  }
}

/*ec2.describeRegions({}, function(err, data) {
  if (err) console.log(err, err.stack); 
  else     console.log(data);          
});

ec2.describeInstances({InstanceIds: [instanceId]}, function(err, data) {
    if(err) {
        console.log(err);
    }
    if (data){
        //console.log(data);
        console.log(data.Reservations[0].Instances[0].PublicIpAddress);
    }
  });

function killInstance(instanceId){
    ec2.terminateInstances({ InstanceIds: [instanceId] }, function(err, data) {
        if(err) {
            console.log(err);
        }
        if (data) {
            console.log(data)
        }
    });
}
*/

