const Canvas = require('canvas')
const Draw = require('canvas-draw')
const Tetromino = require('tetromino')
const Rect = require('./rect')

module.exports = function createPieces(blocks, colors) {
	var pieces = {}
	for (let type in Tetromino) {
		let rotations = Tetromino[type]
		let color = colors[type]
		let sprites = pieces[type] = []
		for (let i = rotations.length; i--;) {
			let layout = rotations[i]
			sprites[i] = {
				normal: createPiece(blocks, color, layout),
			  	dark: createPiece(blocks, color, layout, 'dark')
			}
		}
	}
	return pieces
}

function createPiece(blocks, color, layout, type) {
	if (!type)
		type = 'normal'
	var sprites = blocks[color]
	var size = blocks.size
	var bounds = Rect.bounds(layout)
	var piece = Canvas(bounds.width * size, bounds.height * size)
	var draw = Draw(piece)
	for (let { x, y } of layout) {
		let links = [
			layout.find(other => x - 1 === other.x && y === other.y),
			layout.find(other => x === other.x && y - 1 === other.y),
			layout.find(other => x + 1 === other.x && y === other.y),
			layout.find(other => x === other.x && y + 1 === other.y)
		].map(cell => !!cell)
		let index = parseInt(links.map(Number).join(''), 2)
		let sprite = sprites[index][type]
		x -= bounds.x
		y -= bounds.y
		draw.image(sprite)(x * size, y * size, size, size)
	}
	return piece
}
