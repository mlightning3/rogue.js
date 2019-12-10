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
		this._bonus = bonus;
		this._type = type;
	}

	get name() {
		var name = "";
		if(this._bonus >= 0) {
			name = name + "+" + this._bonus;
		} else if(this.bonus < 0) {
			name = name + this._bonus;
		}
		return name;
	}

	get bonus() {
		return this._bonus;
	}

	get type() {
		return this._type;
	}
}

class Action {
	constructor(type, message) {
		this._type = type;
		this._message = message;
	}

	get type() {
		return this._type;
	}

	get message() {
		return this._message;
	}
}
	

class Mob {
	constructor(strength, dexterity, constitution, intelligence, wisdom, level, location, uuid, type) {
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
		this._type = type;
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

	get type() { return this._type; }

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

	hasStaff() {
		if(this.staff != null) {
			return true;
		} else {
			return false;
		}
	}
}

/** Turn generation **/

var npc = [0, 0, 0]; // Number of NPCs per floor (more will be allowed on lower floors)
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
		var place = mobs[i].inititive();
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
		defence = mobs[mobB].spellResist();
	} else if(type == "weapon") {
		defence = mobs[mobB].ac();
	}
	if(attack >= defence) {
		mobs[mobB].hp = mobs[mobB].hp - mobs[mobA].damage(type);
		var xp = 1;
		if(mobs[mobB].hp < 0 && dead.includes(mobB) == false) {
			dead.push(mobB);
			xp = 10;
		}
		mobs[mobA].addXP(xp);
		return "You attack the mob";
	}
	return "You miss the mob";
}

/** 
 * Moves a mob in the direction it wishes to that space if available or starts a fight
 */
function move(mob, dir) {
	var location = new Location(mobs[mob].location.x, mobs[mob].location.y, mobs[mob].location.floor);
	switch(dir) {
	case 'w':
		location.y = location.y - 1;
		break;
	case 'a':
		location.x = location.x - 1;
		break;
	case 's':
		location.y = location.y + 1;
		break;
	case 'd':
		location.x = location.x + 1;
		break;
	case '.':
		var symbol = floors.maps[location.floor].charAt(location.y * 100 + location.x);
		if(symbol == '>') {
			var newfloor = location.floor + 1;
			if(newfloor > floors.maps.length - 1) {
				if(mobs[mob].hasStaff()) {
					return "You look again, but you already found the staff";
				} else {
					mobs[mob].pickUp(new Item(5, "staff"));
					return "Hiding behind the fake stairs was THE STAFF! Return through the stairs on the top floor!";
				}
			}
			mobs[mob].location = new Location(floors.stairs[newfloor].ux, floors.stairs[newfloor].uy, newfloor);
			return "Go down the stairs";
		} else if(symbol == '<') {
			var newfloor = location.floor - 1;
			if(newfloor < 0) {
				if(mobs[mob].hasStaff()) {
					// TODO: Add some flag for exiting dungeon
					return "You exit the dungeon, wielding THE STAFF!";
				} else {
					return "You don't want to give up finding the staff already";
				}
			}
			mobs[mob].location = new Location(floors.stairs[newfloor].dx, floors.stairs[newfloor].dy, newfloor);
			return "Go up the stairs";
		} else {
			return "You don't see any stairs here";
		}
		break;
	default:
		break;
	}
	if(location.x < 0 || location.x > 99 || location.y < 0 || location.y > 39) {
		return "Hit a wall";
	}
	if(floors.maps[location.floor].charAt(location.y * 100 + location.x) == '*') {
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
				if(mobs[mob].action == null) {
					message = "You sit";
				}
				if(mobs[mob] != null && typeof mobs[mob].action !== 'undefined') {
					switch(mobs[mob].action.type) {
					case 'wait':
						message = "You sit";
						break;
					case 'move':
						message = move(mob, mobs[mob].action.message);
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
						message = "You sit";
						break;
					}
				}
			}
			if(mobs[mob] != null) {
				mobs[mob].action = new Action('done', message);
			}
		}
	}
}

/**
 * Generate a message to be sent to client based on character
 *
 * @param character The mob the player is in charge of
 */
function buildPlayerMsg(character) {
	return buildTurnMsg(character, ",\"mobs\":[]");
}

function buildTurnMsg(character, mobmsg) {
	var local = character.location.floor;
	var message = "{\"map\":\"" + floors.maps[local] + "\",";
	message = message + character.stats();
	if(character.action != null) {
		message = message + ",\"msg\":\"" + character.action.message + "\"";
	} else {
		message = message + ",\"msg\":\"\"";
	}
	message += mobmsg;
	return message + "}";
}

/**
 * Send out action results to all players
 */
function sendResults() {
	var mobmsg = ",\"mobs\":[";
	for(var i = 0; i < mobs.length; i++) {
		mobmsg += "{\"x\":" + mobs[i].location.x + ",\"y\":" + mobs[i].location.y + ",\"floor\":" + mobs[i].location.floor + ",\"type\":\"" + mobs[i].type + "\"}";
		if(i != mobs.length - 1) {
			mobmsg += ",";
		}
	}
	mobmsg += "]";
	for(var i = 0; i < mobs.length; i++) {
		if(players.has(mobs[i].uuid)) {
			console.log(new Date().toUTCString() + ' | sending turn data to ' + mobs[i].uuid);
			players.get(mobs[i].uuid).send(buildTurnMsg(mobs[i], mobmsg));
		}
	}
}

/**
 * Removes dead mobs from the mob list
 */
function cleanDungeon() {
	for(var i = 0; i < dead.length; i++) {
		if(mobs[dead[i]] != null && mobs[dead[i]].type !== 'undefined' && mobs[dead[i]].type !== "player") {
			npc[mobs[dead[i]].location.floor] = npc[mobs[dead[i]].location.floor] - 1;
		}
		mobs.splice(dead[i], 1); 
	}
}

/**
 * Gives non-player character actions
 */
function moveNPC(mob) {
	if(mobs[mob] != null && mobs[mob].type !== 'undefined') {
		var action = null;
		switch(mobs[mob].type) {
		case "slime":
			action = new Action("wait", "");
			break;
		case "zombie":
			switch(Math.floor(Math.random() * 5)) {
			case 0:
				action = new Action("wait", "");
				break;
			case 1:
				action = new Action("move", "w");
				break;
			case 2:
				action = new Action("move", "a");
				break;
			case 3:
				action = new Action("move", "s");
				break;
			case 4:
				action = new Action("move", "d");
				break;
			}
			break;
		default:
			mobs[mob].action = new Action("wait", "");
			break;
		}
		mobs[mob].action = action;
	}
}

/**
 * Spawns in new non-player characters on floors that have room for them
 */
function spawnNPC() {
	for(var level = 0; level < floors.maps.length; level++) {
		if(npc[level] < 15 + level * 5 && Math.floor(Math.random() * 6) > 3) {
			// Find a spawn location that is not a wall
			var x = Math.floor(Math.random() * 100);
			var y = Math.floor(Math.random() * 40);
			while(floors.maps[level].charAt(y * 100 + x) == '*') {
				x = Math.floor(Math.random() * 100);
				y = Math.floor(Math.random() * 40);
			}
			// Decide what type of NPC to spawn
			var temp = Math.floor(Math.random() * 6);
			var type = "slime";
			if(temp > 2) {
				type = "zombie";
			}
			var local = new Location(x, y, level);
			var monster = new Mob(genStat(), genStat(), genStat(), genStat(), genStat(), 1, local, uuid(), type);
			mobs.push(monster);
			npc[level] += 1;
			console.log(new Date().toUTCString() + ' | new monster spawned: ' + type + " floor: " + level);
		}
	}
}

/**
 * All the steps that need to be taken in a turn
 */
function genTurn() {
	if(clock != null) {
		clearTimeout(clock);
	}
	console.log(new Date().toUTCString() + ' | generating turn...');
	dead = new Array();
	for(var i = 0; i < mobs.length; i++) {
		if(mobs[i] != null && mobs[i].type !== 'undefined' && mobs[i].type != "player") {
			moveNPC(i);
		}
	}
	spawnNPC();
	var init = getInititive();
	performActions(init);
	sendResults();
	cleanDungeon();
	console.log(new Date().toUTCString() + ' | turn generation done');
	if(players.size > 0) {
		clock = setInterval(genTurn, 5000);
		console.log(new Date().toUTCString() + ' | resetting clock...');
	}
}


/** Websocket stuff **/

const http = require('http');
const WebSocket = require('ws');
const uuid = require('uuid/v4');

// Used to keep track of all the players and their connection
const players = new Map();
const device = new Map();

var clock = null;

const httpServer = http.createServer();
const wsServer = new WebSocket.Server({ noServer: true });

wsServer.on('connection', function connection(ws, request) {
	var id = uuid();
	players.set(id, ws);
	device.set(ws, id);
	var local = new Location(78, 5, 0);
	var character = new Mob(genStat(), genStat(), genStat(), genStat(), genStat(), 1, local, id, "player");
	character.addPotions(5);
	var rand = Math.floor(Math.random() * 19) + 1;
	if(rand > 15) {
		character.pickUp(new Item(1, "weapon"));
	} else if(rand == 1) {
		character.pickUp(new Item(-1, "weapon"));
	} else {
		character.pickUp(new Item(0, "weapon"));
	}
	rand = Math.floor(Math.random() * 19) + 1;
	if(rand > 15) {
		character.pickUp(new Item(1, "armor"));
	} else if(rand == 1) {
		character.pickUp(new Item(-1, "armor"));
	} else {
		character.pickUp(new Item(0, "armor"));
	}
	ws.send(buildPlayerMsg(character));
	mobs.push(character);
	console.log(new Date().toUTCString() + ' | ' + device.get(ws) + ' joins');

	ws.on('open', function join() {
		// Do things on an open, doesn't seem to get hit though
	});
	
	ws.on('message', function message(msg) {
		// Do thing with message from client
		console.log(new Date().toUTCString() + ' | ' + device.get(ws) + ' says \"' + msg + '\"');
		var command = JSON.parse(msg);
		for(var i = 0; i < mobs.length; i++) {
			if(mobs[i].uuid == device.get(ws)) {
				mobs[i].action = new Action(command.action, command.message);
			}
		}
		genTurn();
		if(clock == null) {
			console.log(new Date().toUTCString() + ' | starting clock...');
			clock = setInterval(genTurn, 5000);
		}
	});

	ws.on('close', function leave() {
		console.log(new Date().toUTCString() + ' | ' + device.get(ws) + ' leaves');
		var id = device.get(ws);
		players.delete(id);
		device.delete(ws);
		for(var i = 0; i < mobs.length; i++) {
			if(mobs[i].uuid == id) {
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
