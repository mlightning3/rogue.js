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
		value += Math.floor(Math.random() * 6);
	}
	return value;
}

class Location {
	constructor(x, y, floor) {
		this.x = x;
		this.y = y;
		this.floor = floor;
	}

	get x() { return this.x; }
	set x(value) { this.x = value; }
	get y() { return this.y; }
	set y(value) { this.y = value; }
	get floor() { return this.floor; }
	set floor(value) { this.floor = value; }
}

class Item {
	constructor(bonus, type) {
		this.bonus = bonus;
		this.type = type;
	}

	get name() {
		var name = this.type + " ";
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
	constuctor(strength, dexterity, constitution, intelligence, wisdom, level, location) {
		this.strength = strength;
		this.dexterity = dexterity;
		this.constitution = constitution;
		this.intelligence = intelligence;
		this.wisdom = wisdom;
		this.level = level;
		this.location = location;
		this.xp = 0;
		this.hp = level * getBonus(constitution) + Math.floor(Math.random() * 6) * level;
		this.hpMax = this.hp;
		this.potions = 0;
		this.armor = null;
		this.weapon = null;
		this.staff = null;
	}

	addXP(amount) {
		this.xp += amount;
		if(this.xp >= 100) {
			this.xp = 0;
			this.level += 1;
			this.hpMax += getBonus(this.constitution) + Math.floor(Math.random() * 6);
		}
	}

	drinkPotion() {
		if(this.potions > 0) {
			this.potions -= 1;
			var gained = Math.floor(Math.random() * 6) * this.level;
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

	get inititive() {
		return getBonus(this.dexterity) + this.level + 10;
	}

	get ac() {
		if(armor != null) {
			return 10 + getBonus(this.dexterity) + this.armor.bonus;
		}
		return 10 + getBonus(this.dexterity);
	}

	get spellResist() {
		if(staff != null) {
			return 10 + getBonus(this.wisdom) + this.staff.bonus;
		}
		return 10 + getBonus(this.wisdom);
	}

	get hp() {
		return this.hp;
	}

	set hp(value) {
		this.hp = value;
	}

	get location() {
		return this.location;
	}

	set location(value) {
		this.location = value;
	}

	set action(value) {
		this.action = value;
	}

	get action() {
		return this.action;
	}

	attack(type) {
		if(type == "weapon") {
			if(this.weapon != null) {
				return getBonus(this.strength) + this.weapon.bonus + Math.floor(Math.random() * 20);
			}
			return getBonus(this.strength) + Math.floor(Math.random() * 20);
		} else if(type == "staff") {
			if(this.staff != null) {
				return getBonus(this.intelligence) + this.staff.bonus + Math.floor(Math.random() * 20);
			}
			return getBonus(this.intelligence) + Math.floor(Math.random() * 20);
		}
	}

	damage(type) {
		if(type == "weapon") {
			if(this.weapon != null) {
				return getBonus(this.strength) + this.weapon.bonus + Math.floor(Math.random() * 6);
			}
			return getBonus(this.strength) + Math.floor(Math.random() * 6);
		} else if(type == "staff") {
			if(this.staff != null) {
				return getBonus(this.intelligence) + this.staff.bonus + Math.floor(Math.random() * 6);
			}
			return getBonus(this.intelligence) + Math.floor(Math.random() * 6);
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

}

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

function sendResults() {

}


function genTurn() {
	dead = new Array();

	var init = getInititive();
	performActions(init);
	sendResults();

}


/** Websocket stuff **/

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
