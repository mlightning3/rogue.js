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

/** Client Logic **/

const canvas = document.getElementById('gameboard');
const context = canvas.getContext('2d');
const spritemap = new Image(320, 1264);
spritemap.onload = drawInitialBoard;
spritemap.src = 'scroll-o-sprites-edited.png';

function drawInitialBoard() {
	for(var i = 0; i < 32; i++) {
		for(var j = 0; j < 26; j++) {
			drawSprite(nothing, i, j);
		}
	}
	for(var i = 5; i < 30; i++) {
		for(var j = 2; j < 10; j++) {
			drawSprite(dirt, i, j);
		}
	}
	for(var i = 0; i < 32; i++) {
		drawSprite(wall[0], i, 0);
		drawSprite(wall[1], i, 25);
	}
	for(var j = 0; j < 26; j++) {
		drawSprite(wall[2], 0, j);
		drawSprite(wall[2], 31, j);
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
			drawSprite(nothing, 31 - i, j);
			if(i == 0) {
				drawSprite(border[5], 31 - boxWidth, j);
				drawSprite(border[4], 31, j);
			}
		}
		drawSprite(border[6], 31 - i, 0);
		drawSprite(border[7], 31 - i, 25);
	}
	
	drawSprite(border[1], 31 - boxWidth, 0);
	drawSprite(border[0], 31, 0);
	drawSprite(border[3], 31 - boxWidth, 25);
	drawSprite(border[2], 31, 25);

	drawSprite(heart, 31 - boxWidth + 2, 7);
	drawSprite(shield, 31 - boxWidth + 2, 8);
}

/**
 * Draws a sprite onto the gameboard at the given location in default color
 *
 * @param sprite The {@code Sprite} to draw
 * @param x The X location to draw to
 * @param y The Y location to draw to
 */
function drawSprite(sprite, x, y) {
	context.drawImage(spritemap, sprite.x * 16, sprite.y * 16, sprite.width, sprite.height, x * 16, y * 16, sprite.width, sprite.height);
}
