var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)
var bodyParser = require('body-parser')

io.set('transports', ['websocket'])

server.listen(3000)

var clients = {}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', function (req, res) {
  res.type('text/plain').status(200).send('MaxCast').end()
})

app.post('/play', function (req, res) {
	var uid = req.body.uid
	var url = req.body.url
	var type = req.body.type
	if(!type) {
		type = 'video/mp4'
	}
	if(typeof clients[uid] == 'undefined') {
		res.status(404).json({
			error: 'Client not found. '
		})
		return
	}
	var client = clients[uid]
	client.emit('play', { url: url, type: type })
	res.status(200).json({
		success: true
	})
})

app.get('/client/:uid', function (req, res) {
	var uid = req.params.uid
	if(typeof clients[uid] == 'undefined') {
		res.status(404).json({
			error: 'Client not found. '
		})
		return
	}
	res.status(200).json({
		success: true
	});
})

app.post('/pause', function (req, res) {
	var uid = req.body.uid
	if(typeof clients[uid] == 'undefined') {
		res.status(404).json({
			error: 'Client not found. '
		})
		return
	}
	var client = clients[uid]
	client.emit('pause')
	res.status(200).json({
		success: true
	})
})

app.post('/resume', function (req, res) {
	var uid = req.body.uid
	if(typeof clients[uid] == 'undefined') {
		res.status(404).json({
			error: 'Client not found. '
		})
		return
	}
	var client = clients[uid]
	client.emit('resume')
	res.status(200).json({
		success: true
	})
})

app.post('/query', function (req, res) {
	var uid = req.body.uid
	if(typeof clients[uid] == 'undefined') {
		res.status(404).json({
			error: 'Client not found. '
		})
		return
	}
	var client = clients[uid]
	client.emit('query')
	client.on('queryResponse', function(data) {
		res.status(200).json({
			success: true,
			response: data
		})
	})
})

io.on('connection', function (socket) {
	var uid = socket.handshake.query.uid
	socket.on('disconnect', function() {
		delete clients[uid]
		console.log('[' + uid + '] Disconnected. ')
	})
	clients[uid] = socket
	console.log('[' + uid + '] A client is connected!')
})
     