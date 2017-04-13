const Canvas = require('canvas')
const Draw = require('canvas-draw')

module.exports = sprites => text => {
	var chars = []
	var width = 0
	var height = 0
	for (let i = text.length; i--;) {
		let char = text[i]
		let sprite = sprites[char]
		if (!sprite)
			throw new Error(`Failed to render text: Unrecognized char: ${char}`)
		width += sprite.width
		if (sprite.height > height)
			height = sprite.height
		chars[i] = sprite
	}
	var result = Canvas(width, height)
	var draw = Draw(result)
	var x = 0
	var y = 0
	for (let sprite of chars) {
		let width = sprite.width
		draw.image(sprite)(x, 0)
		x += width
	}
	return result
}
