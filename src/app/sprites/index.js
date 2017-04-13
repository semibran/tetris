const load = require('image-load')
const extract = require('image-extract')
const pull = require('pull-stream')

const createBlocks = require('./blocks')
const createPieces = require('./pieces')
const colors = require('./colors')
const text = require('./text')
const box = require('./box')

const path = './images/'
const paths = ['backdrop.png', 'chars.png'].map(file => path + file)

const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ '

module.exports = function (size, callback) {
	var blocks = createBlocks(colors.shades, size)
	var pieces = createPieces(blocks, colors.pieces)
	pull(
		pull.values(paths),
		pull.asyncMap(load),
		pull.collect((err, images) => {
			var sprites = { blocks, pieces, images, colors, text: text(extractText(chars, 8, images[1])), box: box(size) }
			callback(sprites)
		})
	)
}

function extractText(chars, size, image) {
	var result = {}
	var sprites = extract(image)(size, size)()
	for (let i = chars.length; i--;) {
		let char = chars[i]
		let sprite = sprites[i]
		result[char] = sprite
	}
	return result
}
