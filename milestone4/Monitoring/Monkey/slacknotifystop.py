#!/bin/bash/python

#System Modules
from slacker import Slacker

def main():
    slack = Slacker('<Slack-API-Token>')
    # Send a message to #general channel
    slack.chat.post_message('#special-milestone', 'Shutting Down Instance http://54.198.145.39:3000')
    return

if __name__ == "__main__":
    """This calls the main function."""
    main()