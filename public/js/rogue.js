/*
 * rogue.js
 *
 * Web client for rogue.js multiplayer roguelike game
 *
 * Matt Kohls
 * 2019
 */

var gamemap = {};

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
var starisup = new Sprite(13, 26, 16, 16);

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

var heart = new Sprite(7, 55, 16, 16);

/** Mobs **/

var player = [
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

const canvas = document.getElementById('gameboard');
const context = canvas.getContext('2d');
const spritemap = new Image(320, 1264);
spritemap.onload = drawInitialBoard;
spritemap.src = 'scroll-o-sprites-edited.png';

function drawInitialBoard() {
	for(var i = 0; i < 32; i++) {
		for(var j = 0; j < 26; j++) {
			drawSprite(nothing, i, j, false);
		}
	}
	for(var i = 5; i < 30; i++) {
		for(var j = 2; j < 10; j++) {
			drawSprite(dirt, i, j, false);
		}
	}
	for(var i = 0; i < 32; i++) {
		drawSprite(wall[0], i, 0, false);
		drawSprite(wall[1], i, 25, false);
	}
	for(var j = 0; j < 26; j++) {
		drawSprite(wall[2], 0, j, false);
		drawSprite(wall[2], 31, j, false);
	}

	drawPlayerInfo();
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
	drawSprite(shield, 31 - boxWidth + 2, 8, false);

	renderText("Player  Info", 31 - boxWidth + 2, 1);
	renderText("100", 31 - boxWidth + 3, 7);
	renderText("15", 31 - boxWidth + 3, 8);
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
