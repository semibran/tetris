const Canvas = require('canvas')
const Draw = require('canvas-draw')

module.exports = function box(size) {
	return function render(cols, rows) {
		var width  = (cols + 1) * size
		var height = (rows + 1) * size
		var canvas = Canvas(width, height)
		Draw(canvas)
			.fill('white')
			.rect('black', width - size, height - size)(size / 2, size / 2)
			.clear(1, 1)(0, 0)
			.clear(1, 1)(width - 1, 0)
			.clear(1, 1)(0, height - 1)
			.clear(1, 1)(width - 1, height - 1)
		return canvas
	}
}
