# M1
DevOps - MILESTONE: BUILD

##'Trigger Builds'
We have configured the jobs in jenkins to communicate with the GitHub repo and we configure the Github repo in the settings -> Hooks & service -> Manage Jenkins (GitHub plugin).
The configuration files for the Jenkins Jobs has been provided in the repo and in the Hooks and services we initialize "http://'jenkins-server':8080/github-webhook/"

##'Dependency Management + Build Script Execution'
We have used Apache Maven to perform the Dependency management. We have created a simple HelloWorld.java program and specified the pom.xml file in the repo.
We have also configured the jobs to do a 'clean install' each time as per the requirements.

##'Build Status + External Post-Build Job Triggers', 
To determine the failure or success of the build job, we trigger sending an email notification to the list as specified in the configuration of jobs.
We use the google SMTP server to send the email to the list specified. 

##'Multiple Branches, Multiple Jobs',
We have created two branches as specified the 'dev' and the 'release' branch on the same repo M1. 
We further commit to each branch and see how the failure or the success notification is sent to the configured email addresses. 

##'Build History and Display over HTTP'
For the build history and display over the HTTP, Jenkins provide a build history page for every job with its status. We reference that to complete this task.

## ScreenCast (use UnityID to login):
[ScreenCast] (https://youtu.be/DAK5kY9k4eE)
