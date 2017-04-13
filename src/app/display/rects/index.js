const Tetromino = require('tetromino')
const Rect = require('../../sprites/pieces/rect')

var rects = module.exports = {}

for (let type in Tetromino) {
	let rotations = Tetromino[type]
	let rect = rects[type] = Rect.bounds(Array.prototype.concat(...rotations))
	for (let i = rotations.length; i--;) {
		let layout = rotations[i]
		rect[i] = Rect.bounds(layout)
	}
}
