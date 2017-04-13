module.exports = Grid
Grid.inside = inside
Grid.get = get
Grid.set = set

function Grid(cols, rows, data) {
	if (!data)
		data = Array(cols * rows)
	return { cols: cols, rows: rows, data: data }
}

function inside(grid, x, y) {
	return x >= 0 && y >= 0 && x < grid.cols && y < grid.rows
}

function get(grid, x, y) {
	if (!inside(grid, x, y))
		return null
	return grid.data[y * grid.cols + x]
}

function set(grid, x, y, value) {
	if (!inside(grid, x, y))
		return null
	return grid.data[y * grid.cols + x] = value	
}
