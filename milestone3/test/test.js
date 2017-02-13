var request = require('supertest')
var should = require('should')
var server = require('../server')
var sleep = require('sleep')
var fs = require('fs')

describe('Unit Test Cases for MEOW app', function(){

	it('should return 404', function(done){
		request(server)
		.get('/something')
		.expect(404)
		.end(function(err, res){
			res.status.should.equal(404)
			res.text.should.equal('Not Found!')
			done()
		})
	})
	it('should set a key and return 200', function(done){
		request(server)
		.get('/set')
		.expect(200)
		.end(function(err, res){
			// console.log(res);
			res.status.should.equal(200);
			res.text.should.equal('Your request was successful!');
			done()
		})
	})
	it('should return 200 with key', function(done){
		request(server)
		.get('/set')
		.expect(200)
		.end(function(err, res){
			// console.log(res);
			res.status.should.equal(200);
			request(server)
			.get('/get')
			.expect(200)
			.end(function(err, res){
				res.status.should.equal(200);
				res.text.should.equal('this message will self-destruct in 10 seconds')
				done()
			})
		})
	})
	it('should return 200 w/o key', function(done){
		this.timeout(11000)
		request(server)
		.get('/set')
		.expect(200)
		.end(function(err, res){
			// console.log(res);
			res.status.should.equal(200);
			sleep.sleep(10);
			request(server)
			.get('/get')
			.expect(200)
			.end(function(err, res){
				res.status.should.equal(200);
				res.text.should.equal('Key not found!')
				done()
			})
		})
	})
	it('should return recent sites', function(done){
		request(server)
		.get('/recent')
		.expect('Content-type',/text\/html/)
		.expect(200)
		.end(function(err, res){
			res.status.should.equal(200);
			done()
		})
	})
	it('should upload image', function(done){
		// this.timeout(5000);
		var filename = __dirname + '/../img/hairypotter.jpg';
		request(server)
		.post('/upload')
		.attach('imagefile', filename)
		.end(function(err, res){
			res.status.should.equal(201)
			res.text.should.equal('Image uploaded successfully!')
			done()
		});
	})
	it('should retrieve image', function(done){
		request(server)
		.get('/meow')
		.expect('Content-type',/text\/html/)
		.expect(200)
		.end(function(err, res){
			res.status.should.equal(200);
			done()
		})
	})
	it('should get list of running servers', function(done){
		request(server)
		.get('/listservers')
		.expect('Content-type',/text\/html/)
		.expect(200)
		.end(function(err, res){
			res.status.should.equal(200)
			done()
		})
	})
})