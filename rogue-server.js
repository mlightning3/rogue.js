/*
 * Server for rogue.js
 *
 * Matt Kohls
 * 2019
 * GPL3
 */

/** General game bits **/

function getBonus(value) {
	if(value % 2 == 1) {
		--value;
	}
	return (value - 10) / 2;
}

function genStat() {
	var value = 0;
	for(var i = 0; i < 3; i++) {
		value += Math.floor(Math.random() * 5) + 1;
	}
	return value + 3;
}

class Location {
	constructor(x, y, floor) {
		this._x = x;
		this._y = y;
		this._floor = floor;
	}

	get x() { return this._x; }
	set x(value) { this._x = value; }
	get y() { return this._y; }
	set y(value) { this._y = value; }
	get floor() { return this._floor; }
	set floor(value) { this._floor = value; }
}

class Item {
	constructor(bonus, type) {
		this.bonus = bonus;
		this.type = type;
	}

	get name() {
		var name = "";
		if(this.bonus > 0) {
			name = name + "+" + this.bonus;
		} else if(this.bonus < 0) {
			name = name + "-" +this. bonus;
		}
		return name;
	}

	get bonus() {
		return this.bonus;
	}

	get type() {
		return this.type;
	}
}

class Action {
	constructor(type, message) {
		this.type = type;
		this.message = message;
	}

	get type() {
		return this.type;
	}

	get message() {
		return this.message;
	}
}
	

class Mob {
	constructor(strength, dexterity, constitution, intelligence, wisdom, level, location, uuid) {
		this.strength = strength;
		this.dexterity = dexterity;
		this.constitution = constitution;
		this.intelligence = intelligence;
		this.wisdom = wisdom;
		this.level = level;
		this._location = location;
		this.xp = 0;
		this._hp = level * getBonus(constitution) + (Math.floor(Math.random() * 5) + 1) * level;
		if(this._hp < 2) {
			this._hp = 2;
		}
		this.hpMax = this._hp;
		this.potions = 0;
		this.armor = null;
		this.weapon = null;
		this.staff = null;
		this._uuid = uuid;
	}

	stats() {
		var message = "\"strength\":" + this.strength;
		message = message + ",\"dexterity\":" + this.dexterity;
		message = message + ",\"constitution\":" + this.constitution;
		message = message + ",\"intelligence\":" + this.intelligence;
		message = message + ",\"wisdom\":" + this.wisdom;
		message = message + ",\"level\":" + this.level;
		message = message + ",\"x\":" + this._location.x;
		message = message + ",\"y\":" + this._location.y;
		message = message + ",\"floor\":" + this._location.floor;
		message = message + ",\"hp\":" + this._hp;
		message = message + ",\"ac\":" + this.ac();
		message = message + ",\"potions\":" + this.potions;
		if(this.armor == null) {
			message = message + ",\"armor\": \"none\"";
		} else {
			message = message + ",\"armor\":\"" + this.armor.name + "\"";
		}
		if(this.weapon == null) {
			message = message + ",\"weapon\": \"none\"";
		} else {
			message = message + ",\"weapon\":\"" + this.weapon.name + "\"";
		}
		if(this.staff == null) {
			message = message + ",\"staff\": \"none\"";
		} else {
			message = message + ",\"staff\":\"" + this.staff.name + "\"";
		}
		return message;
	}

	addXP(amount) {
		this.xp += amount;
		if(this.xp >= 100) {
			this.xp = 0;
			this.level += 1;
			var newhp = getBonus(this.constitution) + Math.floor(Math.random() * 5) + 1;
			if(newhp < 1) {
				newhp = 1;
			}
			this.hpMax += newhp;
		}
	}

	addPotions(value) {
		this.potions += value;
	}

	drinkPotion() {
		if(this.potions > 0) {
			this.potions -= 1;
			var gained = (Math.floor(Math.random() * 5) + 1) * this.level;
			if(this.hp + gained > this.hpMax) {
				this.hp = this.hpMax;
				return "You feel brand new";
			} else {
				this.hp += gained;
				return "That patched you up a bit";
			}
		} else {
			return "No potions to drink";
		}
	}

	inititive() {
		return getBonus(this.dexterity) + this.level + 10;
	}

	ac() {
		if(this.armor != null) {
			return 10 + getBonus(this.dexterity) + this.armor.bonus;
		}
		return 10 + getBonus(this.dexterity);
	}

	spellResist() {
		if(this.staff != null) {
			return 10 + getBonus(this.wisdom) + this.staff.bonus;
		}
		return 10 + getBonus(this.wisdom);
	}

	get hp() {
		return this._hp;
	}

	set hp(value) {
		this._hp = value;
	}

	get location() {
		return this._location;
	}

	set location(value) {
		this._location = value;
	}

	set action(value) {
		this._action = value;
	}

	get action() {
		return this._action;
	}

	get uuid() { return this._uuid; }

	attack(type) {
		if(type == "weapon") {
			if(this.weapon != null) {
				return getBonus(this.strength) + this.weapon.bonus + Math.floor(Math.random() * 19) + 1;
			}
			return getBonus(this.strength) + Math.floor(Math.random() * 19) + 1;
		} else if(type == "staff") {
			if(this.staff != null) {
				return getBonus(this.intelligence) + this.staff.bonus + Math.floor(Math.random() * 19) + 1;
			}
			return getBonus(this.intelligence) + Math.floor(Math.random() * 19) + 1;
		}
	}

	damage(type) {
		if(type == "weapon") {
			var value;
			if(this.weapon != null) {
				value = getBonus(this.strength) + this.weapon.bonus + Math.floor(Math.random() * 5) + 1;
			} else {
				value = getBonus(this.strength) + Math.floor(Math.random() * 5) + 1;
			}
			if(value < 1) {
				return 1;
			}
			return value;
		} else if(type == "staff") {
			var value;
			if(this.staff != null) {
				value = getBonus(this.intelligence) + this.staff.bonus + Math.floor(Math.random() * 5) + 1;
			} else {
				value = getBonus(this.intelligence) + Math.floor(Math.random() * 5) + 1;
			}
			if(value < 1) {
				return 1;
			}
			return value;
		}
	}

	drop(item) {
		if(item.type == "weapon") {
			var temp = this.weapon;
			this.weapon = null;
			return temp;
		} else if(item.type == "staff") {
			var temp = this.staff;
			this.staff = null;
			return temp;
		} else if(item.type == "armor") {
			var temp = this.armor;
			this.armor = null;
			return temp;
		}
	}

	pickUp(item) {
		if(item.type == "potion") {
			this.potions += 1;
			return null;
		} else if(item.type == "weapon") {
			this.drop(item);
			this.weapon = item;
			return "Aquired: " + item.name;
		} else if(item.type == "staff") {
			this.drop(item);
			this.staff = item;
			return "Aquired: " + item.name;
		} else if(item.type == "armor") {
			this.drop(item);
			this.armor = item;
			return "Aquired: " + item.name;
		}
	}
}

/** Turn generation **/

var mobs = [];
var dead = [];
const floors = require('./floors.json');

/**
 * Generates the turn order by placing the index of the mob into an array.
 * 
 */
function getInititive() {
	var init = new Array();
	for(var i = 0; i < 20; i++) {
		init[i] = new Array();
	}
	for(var i = 0; i < mobs.length; i++) {
		var place = mobs[i].inititive;
		if(place > 19) {
			place = 19;
		} else if(place < 0) {
			place = 0;
		}
		init[place].push(i);
	}
	return init
}

/**
 * Performs an attack by mobA against mobB
 */
function attack(mobA, mobB, type) {
	var attack = mobs[mobA].attack(type);
	var defence;
	if(type == "staff") {
		defence = mobs[mobB].spellResist;
	} else if(type == "weapon") {
		defence = mobs[mobB].ac;
	}
	if(attack >= defence) {
		mobs[mobB].hp = mobs[mobB].hp - mobs[mobA].damage(type);
		var xp = 1;
		if(mobs[mobB].hp < 0 && dead.includes(mobB) == false) {
			dead.push(mobB);
			xp = 10;
		}
		mobs[mobA].addXP(xp);
	}
}

/** 
 * Moves a mob in the direction it wishes to that space if available or starts a fight
 */
function move(mob, dir) {
	var location = mobs[mob].location;
	switch(dir) {
	case 'w':
		location.x = location.x - 1;
		break;
	case 'a':
		location.y = location.y - 1;
		break;
	case 's':
		location.y = location.y + 1;
		break;
	case 'd':
		location.x = location.x + 1;
		break;
	case '.':
		var symbol = floors[location.floor].charAt(location.y * 40 + location.x);
		if(symbol == '>') {
			location.floor = location.floor + 1;
			if(location.floor > floors.length - 1) {
				return "Already at bottom floor";
			}
			mobs[mob].location = location;
			return "Go down the stairs";
		} else if(symbol == '<') {
			location.floor = location.floor - 1;
			if(location.floor < 0) {
				return "Already at top floor";
			}
			mobs[mob].location = location;
			return "Go up the stairs";
		}
		break;
	default:
		break;
	}
	if(location.x < 0 || location.x > 99 || location.y < 0 || location.y > 39) {
		return "Hit a wall";
	}
	if(floors[location.floor].charAt(location.y * 40 + location.x) == '*') {
		return "Hit a wall";
	}
	for(var i = 0; i < mobs.length; i++) {
		if(mobs[i].location.floor == location.floor) {
			if(mobs[i].location.x == location.x && mobs[i].location.y == location.y) {
				return attack(mob, i, "weapon");
			}
		}
	}
	mobs[mob].location = location;
}

function cast(mob, dir) {
	// TODO: All that magic jazz
}

/**
 * Runs through all the actions each mob wishes to take
 */
function performActions(init) {
	for(var i = init.length - 1; i > -1; i--) {
		for(var j = 0; j < init[i].length; j++) {
			var mob = init[i][j];
			var message = "";
			if(mobs[mob].hp > 0) {
				switch(mobs[mob].action.type) {
				case 'wait':
					message = "You sit";
					break;
				case 'move':
					move(mob, mobs[mob].action.message);
					break;
				case 'cast':
					cast(mob, mobs[mob].action.message);
					break;
				case 'drink':
					message = mobs[mob].drinkPotion();
					break;
				case 'pick':
					// TODO: Allow for pickups boi
					//message = mobs[init[i][j]].pickUp();
					break;
				case 'drop':
					message = "Item dropped";
					mobs[mob].drop(mobs[mob].action.message);
				default:
					break;
				}
			}
			mobs[mob].action = new Action('done', message);
		}
	}
}

/**
 * Generate a message to be sent to client based on character
 *
 * @param character The mob the player is in charge of
 */
function buildPlayerMsg(character) {
	var local = character.location.floor;
	var message = "{\"map\":\"" + floors[local] + "\",";
	message = message + character.stats();
	if(character.action != null) {
		message = message + ",\"msg\":" + character.action.message;
	} else {
		message = message + ",\"msg\":\"\"";
	}
	return message + "}";
}

/**
 * Send out action results to all players
 */
function sendResults() {
	for(var i = 0; i < mobs.length; i++) {
		if(players.has(mobs[i].uuid)) {
			players.get(mobs[i].uuid).send(buildPlayerMsg(mobs[i]));
		}
	}
}

/**
 * Removes dead mobs from the mob list
 */
function cleanDungeon() {
	for(var i = 0; i < dead.length; i++) {
		mobs.splice(dead[i], 1); 
	}
}

/**
 * All the steps that need to be taken in a turn
 */
function genTurn() {
	dead = new Array();

	var init = getInititive();
	performActions(init);
	sendResults();
	cleanDungeon();
}


/** Websocket stuff **/

const http = require('http');
const WebSocket = require('ws');
const uuid = require('uuid/v4');

// Used to keep track of all the players and their connection
const players = new Map();
const device = new Map();

const httpServer = http.createServer();
const wsServer = new WebSocket.Server({ noServer: true });

wsServer.on('connection', function connection(ws, request) {
	var id = uuid();
	players.set(id, ws);
	device.set(ws, id);
	var local = new Location(78, 5, 0);
	var character = new Mob(genStat(), genStat(), genStat(), genStat(), genStat(), 1, local, id);
	character.addPotions(5);
	ws.send(buildPlayerMsg(character));
	mobs.push[character];
	console.log(new Date().toUTCString() + ' | ' + device.get(ws) + ' joins');

	ws.on('open', function join() {
		// Do things on an open, doesn't seem to get hit though
	});
	
	ws.on('message', function message(msg) {
		// Do thing with message from client
		console.log(new Date().toUTCString() + ' | ' + device.get(ws) + ' says \"' + msg + '\"');
	});

	ws.on('close', function leave() {
		console.log(new Date().toUTCString() + ' | ' + device.get(ws) + ' leaves');
		var id = device.get(ws);
		players.delete(id);
		device.delete(ws);
		for(var i = 0; i < mobs.length; i++) {
			if(mobs[i].uuid = id) {
				dead.push(i);
			}
		}
	});
});

httpServer.on('upgrade', function upgrade(request, socket, head) {
	wsServer.handleUpgrade(request, socket, head, function done(ws) {
		wsServer.emit('connection', ws, request);
	});
});

httpServer.listen(8080);
