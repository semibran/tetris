const MATRIX_COLS = 10
const MATRIX_ROWS = 22
const CELL_SIZE = 8
const SECOND = 60
const INTERVAL_MOVE = SECOND / 10
const INTERVAL_LOCK = SECOND / 4

const sprites = require('./app/sprites')(CELL_SIZE, setup)
const Display = require('./app/display')
const Tetrion = require('./app/tetrion')
const Canvas = require('canvas')
const Draw = require('canvas-draw')
const Keys = require('keys')
const html = require('bel')

function setup(sprites) {

	var timer = 0
	var done, paused, locking, dropping, animating
	done, paused = locking = dropping = animating = false

	var keys = Keys(window)
	var view = Display(sprites)
	var game = Tetrion(MATRIX_COLS, MATRIX_ROWS, (type, ...data) => {
		if (type === 'done') {
			done = true
			setTimeout(reset, 1000)
			return
		}
		if (type === 'line')
			Display.send(view, 'line', data[0])
		if (type === 'lock' || type === 'hold')
			dropping = false
		if (type === 'move' || type === 'rotate' || type === 'hold') {
			let [piece] = data
			if (locking) {
				locking = false
				timer = 0
			}
		}
	})

	document.body.appendChild(view.element)

	Tetrion.start(game)
	Display.render(view, game)
	requestAnimationFrame(update)

	function update() {
		if (keys.ArrowLeft === 1) {
			Tetrion.send(game, 'move', -1, 0)
		}
		if (keys.ArrowRight === 1) {
			Tetrion.send(game, 'move', 1, 0)
		}
		if (keys.ArrowUp === 1) {
			Tetrion.send(game, 'rotate')
		}
		if (keys.ArrowDown) {
			Tetrion.send(game, 'move', 0, 1)
		}
		if (keys.Space === 1) {
			Tetrion.send(game, 'drop')
		}
		if (keys.Escape === 1) {
			Tetrion.send(game, 'hold')
		}
		if (keys.KeyP === 1) {
			pause()
		}
		if (keys.KeyR === 1) {
			reset()
		}
		if (!done && !paused) {
			if (!animating) {
				if (dropping && keys.ArrowDown && keys.ArrowDown.pressed) {
					let moved = Tetrion.send(game, 'move', 0, 1)
					if (moved)
						timer = 0
				}
				timer++
				let interval = locking ? INTERVAL_LOCK : INTERVAL_MOVE
				if (timer >= interval) {
					timer = 0
					Tetrion.update(game)
				}
				locking = game.piece && game.piece.locking
			}
			animating = !!Display.render(view, game)
		}
		requestAnimationFrame(update)
	}

	function pause() {
		paused = !paused
	}

	function reset() {
		done = paused = false
		Tetrion.reset(game)
	}
}
