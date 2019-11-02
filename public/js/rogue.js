/*
 * rogue.js
 *
 * Web client for rogue.js multiplayer roguelike game
 *
 * Matt Kohls
 * 2019
 */

const canvas = document.getElementById('gameboard');
const context = canvas.getContext('2d');
const spritemap = new Image(128, 104);
spritemap.onload = drawInitialBoard;
spritemap.src = 'minirogue-all.png';

function drawInitialBoard() {
	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 4; j++) {
			context.drawImage(this, j*128, i*104);
		}
	}
}
