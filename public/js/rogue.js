/*
 * rogue.js
 *
 * Web client for rogue.js multiplayer roguelike game
 *
 * Matt Kohls
 * 2019
 */

function Player(s, d, c, i , w, lvl, x, y, fl, h, a, p, armor, weapon, staff) {
	this.strength = s;
	this.dexterity = d;
	this.constitution = c;
	this.intelligence = i;
	this.wisdom = w;
	this.level = lvl;
	this.x = x;
	this.y = y;
	this.floor = fl;
	this.hp = h;
	this.ac = a;
	this.potions = p;
	this.armor = armor;
	this.weapon = weapon;
	this.staff = staff;
}

function Sprite(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}

var border = [
	new Sprite(6, 28, 16, 16),// Top Right
	new Sprite(5, 28, 16, 16),// Top Left
	new Sprite(8, 28, 16, 16),// Bottom Right
	new Sprite(7, 28, 16, 16),// Bottom left
	new Sprite(3, 28, 16, 16),// Right
	new Sprite(3, 28, 16, 16),// Left
	new Sprite(2, 28, 16, 16),// Top
	new Sprite(2, 28, 16, 16)// Bottom
];

/** World Entities **/

var nothing = new Sprite(1, 6, 16, 16);
var tile = new Sprite(8, 26, 16, 16);
var dirt = new Sprite(3, 34, 16, 16);

var wall = [
	new Sprite(2, 26, 16, 16),
	new Sprite(3, 26, 16, 16),
	new Sprite(4, 26, 16, 16)
];

var stairsdown = new Sprite(12, 26, 16, 16);
var stairsup = new Sprite(13, 26, 16, 16);
var tomb = new Sprite(2, 27, 16, 16);

var water = new Sprite(8, 34, 16, 16);

var door = new Sprite(14, 26, 16, 16);

/** Items **/

var chestclosed = new Sprite(8, 37, 16, 16);
var chestopen = new Sprite(9, 37, 16, 16);

var potion = new Sprite(6, 42, 16, 16);
var scroll = new Sprite(8, 49, 16, 16);
var book = new Sprite(10, 49, 16, 16);

var mace = new Sprite(13, 3, 1);
var dagger = new Sprite(2, 45, 16, 16);
var sword = new Sprite(3, 45, 16, 16);
var staff = new Sprite(2, 49, 16, 16);
var axe = new Sprite(4, 45, 16, 16);
var club = new Sprite(7, 45, 16, 16);
var hammer = new Sprite(8, 45, 16, 16);
var bow = new Sprite(11, 45, 16, 16);
var arrow = new Sprite(12, 45, 16, 16);

var helmet = new Sprite(13, 45, 16, 16);
var boot = new Sprite(2, 46, 16, 16);
var robe = new Sprite(8, 46, 16, 16);
var armor = new Sprite(6, 46, 16, 16);
var shield = new Sprite(10, 45, 16, 16);

var ac = new Sprite(7, 56, 16, 16);
var heart = new Sprite(7, 55, 16, 16);

/** Mobs **/

var players = [
	new Sprite(2, 6, 16, 16),
	new Sprite(2, 7, 16, 16)
];

var necromancer = new Sprite(9, 20, 16, 16);
var goblin = new Sprite(2, 17, 16, 16);
var zombie = new Sprite(2, 20, 16, 16);
var bat = new Sprite(3, 14, 16, 16);
var ember = new Sprite(6, 23, 16, 16);
var slime = new Sprite(2, 23, 16, 16);
var skeleton = new Sprite(4, 20, 16, 16);
var litch = new Sprite(6, 20, 16, 16);
var snake = new Sprite(8, 14, 16, 16);
var rat = new Sprite(2, 14, 16, 16);
var ghost = new Sprite(7, 20, 16, 16);

/** Font **/
var number = new Sprite(2, 59, 8, 16);
var upper = new Sprite(2, 60, 8, 16);
var lower = new Sprite(2, 62, 8, 16);
var symbol = new Sprite(2, 64, 8, 16);
var space = new Sprite(1, 59, 8, 16);

/** Client Logic **/

const messages = document.querySelector('#messages');
const joinGame = document.querySelector('#joingame');
const leaveGame = document.querySelector('#leavegame');
let websocket;

/**
 * Show messages in message bar
 */
function showMessage(message) {
    messages.textContent += `\n${message}`;
    messages.scrollTop = messages.scrollHeight;
}

function parseMessage(message) {
	var msg = JSON.parse(message);
	map = msg.map;
	mobs = msg.mobs;
	player = new Player(msg.strength, msg.dexterity, msg.constitution, msg.intelligence, msg.wisdom, msg.level, msg.x, msg.y, msg.floor, msg.hp, msg.ac, msg.potions, msg.armor, msg.weapon, msg.staff);
	if(msg.msg != "" && msg.msg != "undefined") {
		showMessage(msg.msg);
	}
	drawMap();
	drawPlayerInfo();
	if(msg.msg === "You exit the dungeon, wielding THE STAFF!") {
		drawMessageBox(scroll, "Congrats! You win!", 8, 19);
	}
	if(player.hp <= 0) {
		drawMessageBox(tomb, "G a m e   O v e r", 8, 19);
	}
}

joinGame.onclick = function() {
	if (!websocket) {
		websocket = new WebSocket(`ws://localhost:8080`);
		websocket.onerror = function() {
			showMessage('Communication error');
		};
		websocket.onopen = function() {
			showMessage('Game joined');
		};
		websocket.onclose = function() {
			showMessage('Disconnected from game');
			websocket = null;
		};
		websocket.onmessage = function(event) {
			parseMessage(event.data);
		};
	}
};

leaveGame.onclick = function() {
	if(websocket) {
		showMessage('Disconnecting from game');
		websocket.onerror = websocket.onopen = websocket.onclose = websocket.onmessage = null;
		websocket.close();
	}
	
};

stairs.onclick = function() {
    if (!websocket) {
		showMessage('Connection error');
		return;
    }

    websocket.send("{\"action\":\"move\", \"message\":\".\"}");
};

drink.onclick = function() {
	if (!websocket) {
		showMessage('Connection error');
		return;
    }

    websocket.send("{\"action\":\"drink\", \"message\":\"\"}");
}

up.onclick = function() {
	if (!websocket) {
		showMessage('Connection error');
		return;
    }

    websocket.send("{\"action\":\"move\", \"message\":\"w\"}");
}

down.onclick = function() {
	if (!websocket) {
		showMessage('Connection error');
		return;
    }

    websocket.send("{\"action\":\"move\", \"message\":\"s\"}");
}

left.onclick = function() {
	if (!websocket) {
		showMessage('Connection error');
		return;
    }

    websocket.send("{\"action\":\"move\", \"message\":\"a\"}");
}

right.onclick = function() {
	if (!websocket) {
		showMessage('Connection error');
		return;
    }

    websocket.send("{\"action\":\"move\", \"message\":\"d\"}");
}

wait.onclick = function() {
	if (!websocket) {
		showMessage('Connection error');
		return;
    }

    websocket.send("{\"action\":\"wait\", \"message\":\" \"}");
}

const canvas = document.getElementById('gameboard');
const context = canvas.getContext('2d');
const spritemap = new Image(320, 1264);
spritemap.onload = drawInitialBoard;
spritemap.src = 'scroll-o-sprites-edited.png';

var gamemap;
var mobs;
var player = new Player(10, 10, 10, 10, 10, 1, 0, 0, 1, 100, 15, 0, "none", "none", "none");

function drawInitialBoard() {
	for(var i = 0; i < 32; i++) {
		for(var j = 0; j < 26; j++) {
			drawSprite(nothing, i, j, false);
		}
	}
	for(var i = 0; i < 32; i++) {
		drawSprite(wall[0], i, 0, false);
		drawSprite(wall[0], i, 25, false);
	}
	for(var j = 0; j < 26; j++) {
		drawSprite(wall[0], 0, j, false);
	}

	drawSprite(players[0], 4, 7, false);
	renderText("This is you", 6, 7);
	drawSprite(players[1], 4, 8, false);
	renderText("These are other players", 6, 8);
	drawSprite(zombie, 4, 9, false);
	renderText("Watch out for monsters", 6, 9);

	drawSprite(stairsup, 4, 11, false);
	drawSprite(stairsdown, 4, 12, false);
	renderText("Stairs allow you to move", 6, 11);
	renderText("between floors", 6, 12);

	drawSprite(potion, 4, 14, false);
	renderText("Using a potion heals you", 6, 14);
	drawSprite(sword, 4, 15, false);
	renderText("Moving into someone attacks", 6, 15);
	renderText("them", 6, 16);

	drawSprite(staff, 4, 18, false);
	renderText("Find the staff and return", 6, 18);
	renderText("to the surface", 6, 19);

	drawPlayerInfo();
}

function drawMap() {
	if(!map || map == "") {
		return;
	}
	var startx = player.x - 11;
	var starty = player.y - 13;
	var localX = 0;
	var localY = 0;
	for(var i = 0; i < 31; i++) {
		for(var j = 0; j < 26; j++) {
			drawSprite(nothing, i, j, false);
		}
	}
	for(var i = startx; i < startx + 22; i++) {
		for(var j = starty; j < starty + 26; j++) {
			if(i < 0 || i > 99 || j < 0 || j > 49) {
				drawSprite(wall[1], localX, localY, false);
			} else {
				var symbol = map.charAt(j * 100 + i);
				switch(symbol) {
				case '*':
					drawSprite(wall[0], localX, localY, false);
					break;
				case '<':
					drawSprite(stairsup, localX, localY, false);
					break;
				case '>':
					drawSprite(stairsdown, localX, localY, false);
					break;
				case ' ':
					drawSprite(nothing, localX, localY, false);
					break;
				default:
					break;
				}
			}
			localY++;
		}
		localY = 0;
		localX++;
	}

	for(var i = 0; i < mobs.length; i++) {
		if(mobs[i].floor == player.floor) {
			var mobx = mobs[i].x - player.x;
			var moby = mobs[i].y - player.y;
			var sprite;
			switch(mobs[i].type) {
			case "player":
				sprite = players[1];
				break;
			case "zombie":
				sprite = zombie;
				break;
			case "slime":
				sprite = slime;
				break;
			default:
				sprite = rat;
				break;
			}
			drawSprite(sprite, 11 + mobx, 13 + moby, false);
		}
	}

	drawSprite(players[0], 11, 13, false);
}

/**
 * Draws out the player info on the side of the screen
 *
 */
function drawPlayerInfo() {
	var boxWidth = 10;
	
	for(var i = 0; i < boxWidth; i++) {
		for(var j = 1; j < 25; j++) {
			drawSprite(nothing, 31 - i, j, false);
			if(i == 0) {
				drawSprite(border[5], 31 - boxWidth, j, false);
				drawSprite(border[4], 31, j, false);
			}
		}
		drawSprite(border[6], 31 - i, 0, false);
		drawSprite(border[7], 31 - i, 25, false);
	}
	
	drawSprite(border[1], 31 - boxWidth, 0, false);
	drawSprite(border[0], 31, 0, false);
	drawSprite(border[3], 31 - boxWidth, 25, false);
	drawSprite(border[2], 31, 25, false);

	drawSprite(heart, 31 - boxWidth + 2, 7, false);
	drawSprite(ac, 31 - boxWidth + 2, 8, false);

	renderText("Player  Info", 31 - boxWidth + 2, 1);
	renderText("Str", 31 - boxWidth + 2, 3);
	renderText("Dex", 31 - boxWidth + 2, 4);
	renderText("Con", 31 - boxWidth + 2, 5);
	renderText("Wis", 31 - boxWidth + 6, 3);
	renderText("Int", 31 - boxWidth + 6, 4);
	renderText("Lvl", 31 - boxWidth + 6, 7);
	renderText("Flr", 31 - boxWidth + 6, 8);
	renderText("Equipment", 31 - boxWidth + 2, 10);
	drawSprite(sword, 31 - boxWidth + 3, 12, false);
	drawSprite(staff, 31 - boxWidth + 3, 13, false);
	drawSprite(armor, 31 - boxWidth + 3, 14, false);
	drawSprite(potion, 31 - boxWidth + 3, 15, false);
	
	renderText(player.hp.toString(), 31 - boxWidth + 3, 7);
	renderText(player.ac.toString(), 31 - boxWidth + 3, 8);
	renderText(player.strength.toString(), 31 - boxWidth + 4, 3);
	renderText(player.dexterity.toString(), 31 - boxWidth + 4, 4);
	renderText(player.constitution.toString(), 31 - boxWidth + 4, 5);
	renderText(player.wisdom.toString(), 31 - boxWidth + 8, 3);
	renderText(player.intelligence.toString(), 31 - boxWidth + 8, 4);
	renderText(player.level.toString(), 31 - boxWidth + 8, 7);
	renderText(player.floor.toString(), 31 - boxWidth + 8, 8);
	renderText(player.weapon.toString(), 31 - boxWidth + 5, 12);
	renderText(player.staff.toString(), 31 - boxWidth + 5, 13);
	renderText(player.armor.toString(), 31 - boxWidth + 5, 14);
	renderText(player.potions.toString(), 31 - boxWidth + 5, 15);
}

function drawMessageBox(sprite, message, x, y) {
	for(var i = 0; i < 14; i++) {
		for(var j = 0; j < 5; j++) {
			drawSprite(nothing, 5 + i, 17 + j, false);
			if(i == 0) {
				drawSprite(border[5], 5, 17 + j, false);
				drawSprite(border[4], 19, 17 + j, false);
			}
		}
		drawSprite(border[6], 5 + i, 17, false);
		drawSprite(border[7], 5 + i, 21, false);
	}
	drawSprite(border[1], 5, 17, false);
	drawSprite(border[0], 19, 17, false);
	drawSprite(border[3], 5, 21, false);
	drawSprite(border[2], 19, 21, false);
	drawSprite(sprite, 11, 13, false);
	renderText(message, x, y);

	if(websocket) {
		showMessage('Disconnecting from game');
		websocket.onerror = websocket.onopen = websocket.onclose = websocket.onmessage = null;
		websocket.close();
	}
}

/**
 * Creates a temporary sprite based off an initial sprite, indexed to the right
 * of the original sprite from the spritemap.
 *
 * @param sprite The original sprite to start from
 * @param diff The number of sprites to the right to go on the spritemap
 */
function indexSprite(sprite, diff) {
	var newSprite = new Sprite(sprite.x + diff, sprite.y, sprite.width, sprite.height);
	return newSprite;
}

/**
 * Draws a sprite onto the gameboard at the given location in default color
 *
 * @param sprite The {@code Sprite} to draw
 * @param x The X location to draw to
 * @param y The Y location to draw to
 * @param shift Adds 8 pixels to the final X location (used for the font since is are half as wide)
 */
function drawSprite(sprite, x, y, shift) {
	var xlocal = 32 + ((sprite.x - 2) * sprite.width);
	if(shift) {
		context.drawImage(spritemap, xlocal, sprite.y * 16, sprite.width, sprite.height, x * 16 + 8, y * 16, sprite.width, sprite.height);
	} else {
		context.drawImage(spritemap, xlocal, sprite.y * 16, sprite.width, sprite.height, x * 16, y * 16, sprite.width, sprite.height);
	}
}

/**
 * Prints out a string at a location, using the sprite font
 * This will automatically jump to the next line when it hits the edge of the
 * canvas. Printing will stop when it hits the bottom of the canvas. Also has
 * minimal support for esacpe codes.
 *
 * @param message A string containing the message to write
 * @param x The X location to start at
 * @param y The Y location to start at
 */
function renderText(message, x, y) {
	var startX = x;
	var shift = false;
	for(var i = 0; i < message.length; i++) {
		var sprite = space;
		var character = message.charCodeAt(i);
		if(character === 92 && i + 1 < message.length) {
			switch(message.charCodeAt(i + 1)) {
			case 110: // newline
				y++;
				shift = false;
				continue;
			case 116: // tab
				x += 4;
				shift = false;
				continue;
			case 92: // \ character
				sprite = indexSprite(symbol, 19);
				break;
			default:
				break;
			}
		} else {
			if(character >= 48 && character <= 57) {
				sprite = indexSprite(number, character - 48);
			} else if(character >= 65 && character <= 90) {
				sprite = indexSprite(upper, character - 65);
			} else if(character >= 97 && character <= 122) {
				sprite = indexSprite(lower, character - 97);
			} else if(character == 45) {
				sprite = indexSprite(symbol, 21);
			} else if(character == 43) {
				sprite = indexSprite(symbol, 20);
			} else if(character == 46) {
				sprite = indexSprite(symbol, 5);
			} else if(character == 44) {
				sprite = indexSprite(symbol, 6);
			} else if(character == 33) {
				sprite = indexSprite(symbol, 7);
			} else if(character == 63) {
				sprite = indexSprite(symbol, 8);
			}
			// TODO: Add other symbols
		}
		if(x >= 31) {
			y++;
			x = startX;
			shift = false;
		}
		if(y >= 24) {
			break;
		}
		drawSprite(sprite, x, y, shift);
		if(shift) {
			x++;
		}
		shift = !shift;
	}
}
