import os
import json
import redis
import smtplib
from email.MIMEText import MIMEText
from email.MIMEMultipart import MIMEMultipart
import sys
import requests
import psutil 
import logging


with open('../redisServer.json') as redisfile:
	data = json.load(redisfile)

host = data['ipAddr']
port = data['port']


# Redis
redis_client = redis.StrictRedis(host=str(host), port=port, db=0)


# Metrics threshold
cpu_threshold_spawn = 50
mem_threshold_spawn = 70
cpu_threshold_destroy = 3
mem_threshold_destroy = 20


def send_email_notification(action, cpu, mem):

	body = 'Action taken: ' + action + '\n' + \
			'CPU Utilization: ' + str(cpu) + '\n' + \
			'Memory Utilization: ' + str(mem) + '\n' 

	fromAddr = 'pvichar@ncsu.edu'
	recipients = ['pvichar@ncsu.edu', 'jhjain@ncsu.edu', 'asood3@ncsu.edu']
	message = MIMEMultipart()
	message['Subject'] = 'ACTION TAKEN: Server metrics at critical levels' 
	message['From'] = fromAddr
	message['To'] = ','.join(recipients)
	message.attach(MIMEText(body, 'plain'))
	
	server = smtplib.SMTP('smtp.gmail.com', 587)
	server.starttls()
	server.login(fromAddr, 'Intelx486*')
	text = message.as_string()
	server.sendmail(fromAddr, recipients, text)
	server.quit()



def main(argv):

	env = argv[1]

	if env == 'canary':
		redis_client.set('canaryAlert', 'false')

	try:

		while True:
	
			cpu_utilization = psutil.cpu_percent(interval=90)
			mem = psutil.virtual_memory()
			mem_utilization = mem[2]
			
			if env == 'canary':
				if cpu_utilization >= cpu_threshold_spawn or mem_utilization >= mem_threshold_spawn:
					redis_client.set('canaryAlert', 'true')
					send_email_notification('Canary Alert', cpu_utilization, mem_utilization)


			if env == 'prod':				
				if cpu_utilization >= cpu_threshold_spawn or mem_utilization >= mem_threshold_spawn:
					response = requests.get("http://localhost:3000/spawn")
					print response.status_code
					if response.status_code == 200:
						print response.text
						logging.info(response.text)
						send_email_notification('Scale Up', cpu_utilization, mem_utilization)
				
				# elif cpu_utilization < cpu_threshold_destroy or mem_utilization < mem_threshold_destroy:
					# response = requests.get("http://localhost:3000/delete")
					# if response.status_code == 200:
						# print response.text
						# logging.info(response.text)
						# send_email_notification('Scale Down', cpu_utilization, mem_utilization)
					# elif response.status_code == 403:
						# print response.text
						# logging.info(response.text)
						# send_email_notification('Scale Down cannot be initiated: Only one production server', cpu_utilization, mem_utilization)
				else:
					send_email_notification('Notification', cpu_utilization, mem_utilization)


	except Exception as e:
		print(type(e).__name__)
		print('Exiting')
		sys.exit(0)



if __name__ == '__main__':
	main(sys.argv)







