/*
 * rogue.js
 *
 * Web client for rogue.js multiplayer roguelike game
 *
 * Matt Kohls
 * 2019
 */

var gamemap = {};

function Sprite(x, y, size) {
	this.x = x;
	this.y = y;
	this.size = size;
}

var border = [
	new Sprite(13, 9, 1),// Top Right
	new Sprite(12, 10, 1),// Top Left
	new Sprite(11, 9, 1),// Bottom Right
	new Sprite(9, 9, 1),// Bottom left
	new Sprite(12, 12, 1),// Right
	new Sprite(12, 9, 1),// Left
	new Sprite(11, 12, 1),// Top
	new Sprite(10, 9, 1)// Bottom
];
var paper = new Sprite(13, 12, 1);

var nothing = new Sprite(0, 0, 1);
var tile = new Sprite(10, 12, 1);
var dirt = new Sprite(10, 1, 1);

var wall = [
	new Sprite(1, 0, 1),
	new Sprite(2, 0, 1),
	new Sprite(3, 0, 1),
	new Sprite(13, 10, 1),
	new Sprite(13, 11, 1)
];

var stairsdown = new Sprite(4, 0, 1);
var starisup = new Sprite(5, 0, 1);

var lava = [
	new Sprite(0, 0, 1),
	new Sprite(0, 1, 1)
];

var water = [
	new Sprite(4, 1, 1),
	new Sprite(5, 1, 1)
];

var door = [
	new Sprite(11, 1, 1),
	new Sprite(12, 1, 1),
	new Sprite(13, 1, 1),
	new Sprite(14, 1, 1),
	new Sprite(15, 1, 1)
];

var chestclosed = [
	new Sprite(0, 2, 1),
	new Sprite(2, 2, 1)
];

var chestopen = [
	new Sprite(1, 2, 1),
	new Sprite(3, 2, 1)
];

var potion = [
	new Sprite(4, 3, 1),
	new Sprite(5, 3, 1),
	new Sprite(6, 3, 1),
	new Sprite(7, 3, 1),
	new Sprite(8, 3, 1)
];

var book = [
	new Sprite(10, 3, 1),
	new Sprite(11, 3, 1),
	new Sprite(12, 3, 1),
	new Sprite(13, 3, 1)
];

var mace = new Sprite(14, 3, 1);
var rapier = new Sprite(15, 3, 1);
var dagger = new Sprite(0, 4, 1);
var sword = new Sprite(1, 4, 1);
var battleaxe = new Sprite(2, 4, 1);
var axe = new Sprite(7, 4, 1);
var crossbow = new Sprite(3, 4, 1);
var bolt = new Sprite(4, 4, 1);
var bow = new Sprite(5, 4, 1);
var arrow = new Sprite(6, 4, 1);

var helmet = [
	new Sprite(11, 4, 1),
	new Sprite(12, 4, 1),
	new Sprite(13, 4, 1)
];

var boot = [
	new Sprite(15, 4, 1),
	new Sprite(0, 5, 1)
];

var robe = [
	new Sprite(1, 5, 1),
	new Sprite(2, 5, 1)
];

var armor = new Sprite(4, 5, 1);
var heart = new Sprite(7, 9, 1);
var shield = new Sprite(6, 9, 1);

var player = [
	new Sprite(5, 5, 1),
	new Sprite(6, 5, 1),
	new Sprite(7, 5, 1),
	new Sprite(9, 5, 1)
];

var ghoul = new Sprite(8, 5, 1);
var wizard = new Sprite(10, 5, 1);
var necromancer = new Sprite(11, 5, 1);
var specter = new Sprite(12, 5, 1);
var orc = new Sprite(0, 6, 1);
var zombie = new Sprite(1, 6, 1);
var entling = new Sprite(2, 6, 1);
var bat = new Sprite(3, 6, 1);
var ember = new Sprite(4, 6, 1);
var slime = [
	new Sprite(5, 6, 1),
	new Sprite(6, 6, 1)
];
var octopus = [
	new Sprite(7, 6, 1),
	new Sprite(8, 6, 1)
];
var skeleton = new Sprite(9, 6, 1);
var litch = new Sprite(10, 6, 1);
var snake = [
	new Sprite(11, 6, 1),
	new Sprite(12, 6, 1),
	new Sprite(13, 6, 1)
];
var rat = [
	new Sprite(14, 6, 1),
	new Sprite(15, 6, 1)
];
var drake = [
	new Sprite(0, 7, 1),
	new Sprite(1, 7, 1)
];
var ghost = new Sprite(2, 7, 1);

const canvas = document.getElementById('gameboard');
const context = canvas.getContext('2d');
const spritemap = new Image(128, 104);
spritemap.onload = drawInitialBoard;
spritemap.src = 'minirogue-all-edited.png';

function drawInitialBoard() {
	for(var i = 0; i < 64; i++) {
		for(var j = 0; j < 52; j++) {
			drawSprite(nothing, i, j);
		}
	}
	for(var i = 12; i < 30; i++) {
		for(var j = 20; j < 44; j++) {
			drawSprite(tile, i, j);
		}
	}
	for(var i = 0; i < 64; i++) {
		drawSprite(wall[0], i, 0);
		drawSprite(wall[1], i, 51);
	}
	for(var j = 0; j < 52; j++) {
		drawSprite(wall[2], 0, j);
		drawSprite(wall[3], 63, j);
	}
	context.drawImage(this, 0, 0);

	drawPlayerInfo();
}

/**
 * Draws out the player info on the side of the screen
 *
 */
function drawPlayerInfo() {
	var boxWidth = 10;

	for(var i = 0; i < boxWidth; i++) {
		for(var j = 0; j < 51; j++) {
			if(i != 0 && j != 0) {
				drawSprite(paper, 63 - i, j);
			}
			if(i == 0) {
				drawSprite(border[5], 63, j);
				drawSprite(border[4], 63 - boxWidth, j);
			}
		}
		drawSprite(border[6], 63 - i, 0);
		drawSprite(border[7], 63 - i, 51);
	}
	drawSprite(border[1], 63 - boxWidth, 0);
	drawSprite(border[0], 63, 0);
	drawSprite(border[3], 63 - boxWidth, 51);
	drawSprite(border[2], 63, 51);

	drawSprite(heart, 63 - boxWidth + 2, 8);
	drawSprite(shield, 63 - boxWidth + 2, 8);


	context.font = "8px";
	context.strokeText("Player", (63 - boxWidth + 2) * 8, 16);
	context.strokeText("Info", (63 - boxWidth + 6) * 8, 32);
}

/**
 * Draws a sprite onto the gameboard at the given location
 *
 * @param sprite The {@code Sprite} to draw
 * @param x The X location to draw to
 * @param y The Y location to draw to
 */
function drawSprite(sprite, x, y) {
	context.drawImage(spritemap, sprite.x * 8, sprite.y * 8, 8 * sprite.size, 8 * sprite.size, x * 8, y * 8, 8 * sprite.size, 8 * sprite.size);
}
