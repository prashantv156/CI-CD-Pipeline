#!/bin/bash/python

#System Modules
from slacker import Slacker
import urllib2
import requests
import os

def main():
    slack = Slacker('<Slack-API-Token>')
    # Send a message to #general channel
    slack.chat.post_message('#special-milestone', 'Starting Instance http://54.198.145.39:3000')
    
    #Check if any content is received.
    conn = urllib2.urlopen("http://54.198.145.39:3000/").read()
    if len(conn):
        slack.chat.post_message('#special-milestone', 'Test 1 Passed')
    else:
        slack.chat.post_message('#special-milestone', 'Test 1 Failed')

    #Check the response code.
    r = requests.get("http://54.198.145.39:3000/")
    if (r.status_code) == 200:
        slack.chat.post_message('#special-milestone', 'Test 2 Passed')
    else:
        slack.chat.post_message('#special-milestone', 'Test 2 Failed')
        
    #Check if the public IP address is accessible.
    hostname = "54.198.145.39" #IP Address
    response = os.system("ping -c 1 " + hostname)

    #and then check the response...
    if response == 0:
        slack.chat.post_message('#special-milestone', 'Test 3 Passed')
    else:
        slack.chat.post_message('#special-milestone', 'Test 3 Failed')
    return

if __name__ == "__main__":
    """This calls the main function."""
    main()