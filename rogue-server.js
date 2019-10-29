/*
 * Server for rogue.js
 *
 * Matt Kohls
 * 2019
 * GPL3
 */

const http = require('http');
const WebSocket = require('ws');
const uuid = require('uuid/v4');

// Used to keep track of all the players and their connection
const players = new Map();

const httpServer = http.createServer();
const wsServer = new WebSocket.Server({ noServer: true });

wsServer.on('connection', function connection(ws, request) {
	players.set(ws, uuid());
	console.log(new Date().toUTCString() + ' | ' + players.get(ws) + ' joins');

	ws.on('open', function join() {
		// Do things on an open, doesn't seem to get hit though
	});
	
	ws.on('message', function message(msg) {
		// Do thing with message from client
		console.log(new Date().toUTCString() + ' | ' + players.get(ws) + ' says \"' + msg + '\"');
	});

	ws.on('close', function leave() {
		console.log(new Date().toUTCString() + ' | ' + players.get(ws) + ' leaves');
		clients.delete(ws);
	});
});

httpServer.on('upgrade', function upgrade(request, socket, head) {
	wsServer.handleUpgrade(request, socket, head, function done(ws) {
		wsServer.emit('connection', ws, request);
	});
});

httpServer.listen(8080);
