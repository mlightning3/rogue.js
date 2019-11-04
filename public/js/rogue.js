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
}

function drawSprite(sprite, x, y) {
	context.drawImage(spritemap, sprite.x * 8, sprite.y * 8, 8 * sprite.size, 8 * sprite.size, x * 8, y * 8, 8 * sprite.size, 8 * sprite.size);
}
