#DevOps - Milestone 3
In this milestone we extend the deployment pipeline to start deploying the software in the production environments.

### Ability to deploy application to the production environment after the build passes.
After the build, testing and analysis is completed, the code is deployed to the Amazon AWS instances. We have added our deployment logic as a post build step in Jenkins. We are using ansible to run playbook to setup the AWS instances. The AWS instances are created in the deploy stage before the playbooks are executed. Once these instances are created, we deploy the code which succeeded in the build stage using ansible playbook and it's git module.

### Ability to configure the production environment automatically.
All the infrastructure components the proxy, redis, etc are deployed using the Ansible playbook and HW1 code was re-used for instance creation. Configuration relevant playbooks and code can be found in the folders proxy, prod, redis and canary. 4 instances are created as part of deploy stage, proxy instance, production instance, redis instance and canary instance.

### Ability to monitor the deployed application and send alerts.
The two metrics used to monitor the deployed app in our case is the CPU utilization and the Memory Utilization. 
The alert is sent using email with the predefined rule.
[monitor.py](https://github.ncsu.edu/jhjain/DevOps-M3/tree/master/monitoring/monitor.py) is the script that we have used to monitor the environment. We monitor the environment at frequecy of every 90seconds.

![](https://github.ncsu.edu/jhjain/DevOps-M3/blob/master/screenshot/alert.PNG)

### Ability to autoscale the individual components of the production.
Depending on the monitored parameters, the auto scale is triggered based on the upper and the lower threshold.
If the upper threshold is exceeded, a new Amazon AWS instance is spawned to redirect the traffic and if the value of the parameter goes below the 
lower threshold, the latest spawned instance is destroyed. Also the serverlist is updated each time the threshold is breached for the proxy server to redirect 
the traffic.

### Ability to use the feature flags.
Redis is used to deploy the feature flag with the toggle functionality of the deployed feature in production. If the feature flag is set to True, the
hidden feature is activated in the route /hiddenfeature and if the feature flag is set to False, the route /hiddenfeature is disbled.

### Ability to perform a canary release.
Using a new instansce of Amazon AWS as the canary server, we route some percentage (1/3) of traffic to the newly staged version and the rest (2/3) 
to the production server. If a Canary Alert is raised (using the CanaryAlert flag in redis), we stop routing the traffic to the canary server and the
whole traffic is routed only via the production server.

###Screencast Link 
[Screencast on Monitoring Application and Feature Flags](https://drive.google.com/open?id=0B4QmUm8JkAl8bzlMRVRtZkxsOXM)  
[Screencast on Automated Deployment and Continuous Integration with Ansible](https://drive.google.com/open?id=0B4QmUm8JkAl8dmtOeG02SFlNWUk)  
[Screencast on Load Balancing, Canary Release and Autoscaling](https://drive.google.com/open?id=0B4QmUm8JkAl8TkktaEp0RS1YY1U)
