// Dependencies
const Canvas = require('canvas')
const Draw = require('canvas-draw')
const Tetromino = require('tetromino')
const Rect = require('../sprites/pieces/rect')
const rects = require('./rects')
const html = require('bel')
// Rows hidden
const hidden = 2

module.exports = Display
Display.render = render
Display.send = send

function Display(sprites) {

	var [backdrop] = sprites.images

	var title = sprites.text('TETRIS')
	title.className = 'title'

	var score = sprites.text('00000000')
	score.className = 'score'

	var element = html`
		<main>
			<header>
				${title}
				${score}
			</header>
			<section class='background'>
				${backdrop}
			</section>
			<section class='foreground'>
				<div class='hold wrap'>
					<div class='hold box'>
						<section class='foreground'></section>
						<section class='background'>
							${sprites.box(4, 4)}
						</section>
					</div>
					${sprites.text('HOLD')}
				</div>
				<div class='view'>
					<section class='foreground'></section>
					<section class='background'></section>
				</div>
				<div class='next wrap'>
					<div class='next box'>
						<section class='foreground'></section>
						<section class='background'>
							${sprites.box(4, 4)}
						</section>
					</div>
					${sprites.text('NEXT')}
				</div>
			</section>
		</main>`

	onResize()
	window.addEventListener('resize', onResize)

	return { sprites, element, drawn: { score: 0, blocks: [], pieces: new Map }, tetrion: null, next: null, hold: null, animation: null }

	function onResize() {
		scale = Math.min(
			window.innerWidth  / 256,
			window.innerHeight / 240
		)
		element.style.transform = `scale(${scale})`
	}
}

function render(display, tetrion) {
	// Unpack relevant variables
	var root = display.element
	var next = root.querySelector('.next .foreground')
	var hold = root.querySelector('.hold .foreground')
	var view = root.querySelector('.view')
	var fore = view.querySelector('.foreground')
	var back = view.querySelector('.background')
	var size = display.sprites.blocks.size
	// Animation shenanigans
	var animation = display.animation
	if (animation) {
		let data = animation.data
		if (!animation.frame) {
			data.width = Math.ceil(tetrion.cols * size / (animation.duration / 2))
			data.elements = []
			for (let piece of tetrion.pieces) {
				let drawn = display.drawn.pieces.get(piece)
				drawn.element.classList.remove('falling')
			}
			for (let y of animation.data.lines) {
				let canvas = Canvas(tetrion.cols * size, size)
				canvas.style.position = 'absolute'
				canvas.style.top = ((y - hidden) * size) + 'px'
				fore.appendChild(canvas)
				data.elements.push(canvas)
			}
		}
		for (let canvas of data.elements) {
			let draw = Draw(canvas)
			if (!data.clearing)
			 	draw = draw.rect('white')
			else
				draw = draw.clear
			let x = data.width * (animation.frame % (animation.duration / 2))
			draw(x, 0, data.width, size)
		}
		animation.frame++
		if (animation.frame >= animation.duration / 2) {
			data.clearing = true
			for (let [piece, drawn] of display.drawn.pieces)
				if (!tetrion.pieces.includes(piece)) {
					fore.removeChild(drawn.element)
					display.drawn.pieces.delete(piece)
				}
			for (let piece of tetrion.pieces) {
				let drawn = display.drawn.pieces.get(piece)
				let bounds = Rect.bounds(piece.cells)
				let preset = rects[piece.type]
				let offset = preset[piece.rotation]
				if (!drawn)
					continue
				// Lock
				drawn.locked = true
				drawn.element.classList.add('locked')
				// Position
				let x = bounds.x
				let y = bounds.y - data.lines.length
				// Resize
				let shade  = display.sprites.colors.pieces[piece.type]
				let blocks = display.sprites.blocks[shade]
				drawn.element.width  = offset.width  * size
				drawn.element.height = offset.height * size
				// Draw stuff
				let cells = piece.cells
				for (let { x, y } of cells) {
					let links = [
						cells.find(other => x - 1 === other.x && y === other.y),
						cells.find(other => x === other.x && y - 1 === other.y),
						cells.find(other => x + 1 === other.x && y === other.y),
						cells.find(other => x === other.x && y + 1 === other.y)
					].map(cell => !!cell)
					let index = parseInt(links.map(Number).join(''), 2)
					let block = blocks[index]
					let sprite = block.dark
					x -= bounds.x
					y -= bounds.y
					Draw(drawn.element).image(sprite)(x * size, y * size)
				}
				drawn.x = x
				drawn.y = y
				drawn.element.style.left = `${x * size}px`
				drawn.element.style.top  = `${(y - hidden) * size}px`
			}
		}
		if (animation.frame >= animation.duration) {
			animation.done = true
			display.animation = null
			for (let piece of tetrion.pieces) {
				let drawn = display.drawn.pieces.get(piece)
				if (drawn.locked)
					drawn.element.classList.add('falling')
			}
			for (let canvas of data.elements)
				fore.removeChild(canvas)
		}
		return true
	}
	var reset = false
	// Adjust to tetrion
	if (display.tetrion !== tetrion) {
		display.tetrion = tetrion
		let width  = tetrion.cols
		let height = tetrion.rows - hidden
		let sprite = display.sprites.box(width, height)
		back.appendChild(sprite)
		fore.style.width  = `${ width * size}px`
		fore.style.height = `${height * size}px`
	}
	if (!tetrion.piece) {
		if (!tetrion.score) {
			reset = true
			display.drawn.score = 0
			while (next.lastChild)
				next.removeChild(next.lastChild)
		}
	}
	// Hold piece
	if (!tetrion.hold)
		while (hold.lastChild)
			hold.removeChild(hold.lastChild)
	else if (display.hold !== tetrion.hold) {
		display.hold = tetrion.hold
		let prev = hold.lastChild
		if (prev) {
			prev.className = 'leave'
			prev.addEventListener('animationend', event => hold.removeChild(prev))
		}
		let sprite = display.sprites.pieces[tetrion.hold][0].normal
		let canvas = Canvas(4 * size, 4 * size)
		canvas.className = 'enter'
		hold.appendChild(canvas)
		Draw(canvas)
			.clear()
			.image(sprite)(canvas.width / 2 - sprite.width / 2, canvas.height / 2 - sprite.height / 2)
	}
	// Next piece
	if (display.next !== tetrion.next) {
		display.next = tetrion.next
		let prev = next.lastChild
		if (prev) {
			prev.className = 'leave'
			prev.addEventListener('animationend', event => next.removeChild(prev))
		}
		let sprite = display.sprites.pieces[tetrion.next][0].normal
		let canvas = Canvas(4 * size, 4 * size)
		canvas.className = 'enter'
		next.appendChild(canvas)
		Draw(canvas)
			.clear()
			.image(sprite)(canvas.width / 2 - sprite.width / 2, canvas.height / 2 - sprite.height / 2)
	}
	// Update score
	display.drawn.score = tetrion.score // += (tetrion.score - display.drawn.score) / 10
	var score = Math.round(display.drawn.score).toString()
	score = '00000000'.substr(score.length) + score
	var sprite = display.sprites.text(score)
	Draw(root.querySelector('.score'))
		.clear()
		.image(sprite)(0, 0)
	// Remove obsolete pieces
	for (let [piece, drawn] of display.drawn.pieces)
		if (!tetrion.pieces.includes(piece)) {
			fore.removeChild(drawn.element)
			display.drawn.pieces.delete(piece)
		}
	// Draw pieces
	var blocks = []
	for (let piece of tetrion.pieces) {
		blocks.push(...piece.cells)
		let drawn = display.drawn.pieces.get(piece)
		let bounds = Rect.bounds(piece.cells)
		let preset = rects[piece.type]
		let offset = preset[piece.rotation]
		if (!drawn) {

			let sprite = display.sprites.pieces[piece.type][piece.rotation].normal
			let element = Canvas(preset.width * size, preset.height * size)
			element.className = 'piece'
			element.addEventListener('animationend', onAnimationEnd)
			fore.appendChild(element)

			Draw(element).image(sprite)((offset.x - preset.x) * size, (offset.y - preset.y) * size)

			drawn = { element, x: null, y: null, rotating: false, rotation: piece.rotation, rotations: 0, locked: false }
			display.drawn.pieces.set(piece, drawn)

		}

		if ((drawn.rotation + drawn.rotations) % Tetromino[piece.type].length !== piece.rotation)
			drawn.rotations++

		if (!drawn.rotating && drawn.rotations) {
			drawn.rotating = true
			drawn.element.offsetWidth
			drawn.element.classList.add('rotating')
		}

		let x, y
		if (!piece.locked) {
			x = piece.x + preset.x
			y = piece.y + preset.y
			drawn.element.style.left = `${x * size}px`
			drawn.element.style.top  = `${(y - hidden) * size}px`
		} else {
			// Position
			x = bounds.x
			y = bounds.y
			if (!drawn.locked || drawn.y !== y) {
				// Lock
				drawn.locked = true
				drawn.element.classList.add('locked')
				// Resize
				let shade  = display.sprites.colors.pieces[piece.type]
				let blocks = display.sprites.blocks[shade]
				drawn.element.width  = offset.width  * size
				drawn.element.height = offset.height * size
				// Draw stuff
				let cells = piece.cells
				for (let { x, y } of cells) {
					let links = [
						cells.find(other => x - 1 === other.x && y === other.y),
						cells.find(other => x === other.x && y - 1 === other.y),
						cells.find(other => x + 1 === other.x && y === other.y),
						cells.find(other => x === other.x && y + 1 === other.y)
					].map(cell => !!cell)
					let index = parseInt(links.map(Number).join(''), 2)
					let block = blocks[index]
					let sprite = block.dark
					x -= bounds.x
					y -= bounds.y
					Draw(drawn.element).image(sprite)(x * size, y * size)
				}
			}
		}

		drawn.x = x
		drawn.y = y
		drawn.element.style.left = `${x * size}px`
		drawn.element.style.top  = `${(y - hidden) * size}px`

		function onAnimationEnd() {

			drawn.element.classList.remove('rotating')

			var target = (drawn.rotation + 1) % Tetromino[piece.type].length
			var offset = preset[target]
			var sprite = display.sprites.pieces[piece.type][target].normal

			Draw(drawn.element)
				.clear()
				.image(sprite)((offset.x - preset.x) * size, (offset.y - preset.y) * size)

			drawn.rotating = false
			drawn.rotation = target
			drawn.rotations--

		}
	}
	display.drawn.blocks = blocks
}

function send(display, ...input) {
	var [type, ...data] = input
	if (type === 'line') {
		let [lines] = data
		display.animation = {
			name: 'lines',
			frame: 0,
			duration: 30,
			done: false,
			data: { lines }
		}
	}
}
