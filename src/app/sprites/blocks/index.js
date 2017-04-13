const Canvas = require('canvas')
const Draw = require('canvas-draw')

module.exports = function createBlocks(shades, size) {
	var blocks = { size }
	for (let name in shades) {
		let color = shades[name]
		let sprites = blocks[name] = []
		for (let i = 16; i--;) {
			let links = getLinks(i)
			let sprite = sprites[i] = {}
			sprite.normal = createBlock(color, links, size)
			sprite.dark = createBlock({ normal: color.dark, light: color.normal, dark: color.dark }, links, size)
		}
	}
	return blocks
}

function getLinks(index) {
	var binary = index.toString(2)
	var id = '0000'.substr(binary.length) + binary
	var links = id.split('').map(x => !!Number(x))
	return links
}

function createBlock(color, links, size) {

	var canvas = Canvas(size, size)
	var draw = Draw(canvas)

	var light = draw.rect.bind(null,color.light)
	var dark = draw.rect.bind(null, color.dark)

	draw.fill(color.normal)

	var [left, top, right, bottom] = links

	if (!left)
		light(1, size - 2)(0, 1)
	else {
		light(1, 1)(0, 0)
		dark(1, 1)(0, size - 1)
	}

	if (!top)
		light(size - 2, 1)(1, 0)
	else {
		light(1, 1)(0, 0)
		dark(1, 1)(size - 1, 0)
	}

	if (!right)
		dark(1, size - 2)(size - 1, 1)
	else {
		light(1, 1)(size - 1, 0)
		dark(1, 1)(size - 1, size - 1)
	}

	if (!bottom)
		dark(size - 2, 1)(1, size - 1)
	else {
		light(1, 1)(0, size - 1)
		dark(1, 1)(size - 1, size - 1)
	}

	return canvas

}
