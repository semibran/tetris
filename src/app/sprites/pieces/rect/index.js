module.exports = Rect
Rect.bounds = bounds

function Rect(x, y, width, height) {
	return { x, y, width, height }
}

function bounds(cells) {
	var left, top, right, bottom
	left = top = Infinity
	right = bottom = -Infinity
	for (let { x, y } of cells) {
		if (x < left)
			left = x
		if (y < top)
			top = y
		if (x > right)
			right = x
		if (y > bottom)
			bottom = y
	}
	var width = right - left + 1
	var height = bottom - top + 1
	return Rect(left, top, width, height)
}
