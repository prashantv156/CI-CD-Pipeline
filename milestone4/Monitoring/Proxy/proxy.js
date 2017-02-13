var http = require('http')
var httpProxy = require('http-proxy')
var proxy  = httpProxy.createProxyServer({});
var redis = require('redis')
var client = redis.createClient(6379, '54.90.183.55');

//PROXY SERVER
var server = http.createServer(function(req, res) {
client.rpoplpush('ip_address','ip_address',function(err,value){
client.rpoplpush('instance_id','instance_id');
console.log("Routing at http://"+value+":3000");
        proxy.web(req, res, { target: 'http://'+value+':3000'});
});
});

server.listen(4000)
console.log('Running Proxy');