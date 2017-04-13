const Random = require('random')
const push   = Array.prototype.push
module.exports = function Bag(items, seed) {
	items = items.slice()
	var rng = Random(seed)
	var contents = []
	return function draw() {
		if (!contents.length) {
			rng.shuffle(items)
			push.apply(contents, items)
		}
		return contents.pop()
	}
}
