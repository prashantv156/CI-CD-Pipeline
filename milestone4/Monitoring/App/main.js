var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
var exec = require('child_process').exec;

// REDIS
var client = redis.createClient(6379, '54.90.183.55');
var update = multer({ dest: './uploads/'});
client.lpush('ip_address', '54.198.145.39');
client.lpush('instance_id', 'i-00b78510d4ac0c216');

// NOTIFY
exec('/usr/bin/python /home/ubuntu/slacknotifystart.py', function(err, out, code)
{
   console.log("Sending a Slack Notification.");
   if (err instanceof Error)
        throw err;
   if( err )
        console.error( err );
});
///////////// WEB ROUTES/////////////
// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next)
{
console.log(req.method, req.url);

client.lpush('visit', req.url, function(err, value){
  client.lrange('visit', 0, 4, function(err, value){
  recent = value
    })
})

next(); // Passing the request to the next handler in the stack.
});

app.get('/', function(req, res) {
  res.send('I am at http://54.198.145.39/')
})

app.get('/set/:key', function(req, res) {
  client.set("key", req.params.key);
  client.expire("key", 10)
  res.send('This key: '+ req.params.key +' will self-destruct in 10 seconds.')
})

app.get('/get/:key', function(req, res) {
  client.get("key", function(err,value){
  if(value == req.params.key){
    res.send('The key is set to '+ value)
  }
  else
  {
    res.send('The key is not set.')
  }
 })
})

app.get('/recent', function(req, res){
  res.send(recent)
})

app.post('/upload',[ update.any() , function(req, res){
//    console.log(req.body) // form fields
//    console.log(req.files) // form files

  if( req.files[0])
  {
    fs.readFile( req.files[0].path, function (err, data) {
   //if (err) throw err;
   var img = new Buffer(data).toString('base64');
//console.log(img);
client.lpush('imgqueue', img);
 });
 }

    res.status(204).end()
 }]);

app.get('/meow', function(req, res) {
 //if (err) throw err;
                client.lpop('imgqueue', function(err, imagedata){
 res.writeHead(200, {'content-type':'text/html'});
   res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+imagedata+"'/>");
    res.end();
});
})

app.get('/listservers', function(req, res) {
  client.lrange('portqueue', 0, -1, function(err, value){
res.send('Spawned apps on Containers at port: '+value)
  })
})

// HTTP SERVER
app.listen(3000);
console.log('Running App');