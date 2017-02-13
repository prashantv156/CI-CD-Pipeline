#! /bin/sh
echo "Setting up Redis Server"
cd redis
node infrastructure.js
sleep 1m
ansible-playbook redis_deploy.yaml -i inventory
cd ../prod
echo "Setting up Production Server"
node infrastructure.js
sleep 1m
ansible-playbook prod_setup.yaml -i inventory
cd ../canary
echo "Setting up Canary Server"
node infrastructure.js
sleep 1m
ansible-playbook canary_setup.yaml -i inventory
cd ../proxy
echo "Setting up Proxy Server"
node infrastructure.js
sleep 1m
ansible-playbook proxy_setup.yaml -i inventory

