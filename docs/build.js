(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var document = require('global/document')
var hyperx = require('hyperx')
var onload = require('on-load')

var SVGNS = 'http://www.w3.org/2000/svg'
var XLINKNS = 'http://www.w3.org/1999/xlink'

var BOOL_PROPS = {
  autofocus: 1,
  checked: 1,
  defaultchecked: 1,
  disabled: 1,
  formnovalidate: 1,
  indeterminate: 1,
  readonly: 1,
  required: 1,
  selected: 1,
  willvalidate: 1
}
var COMMENT_TAG = '!--'
var SVG_TAGS = [
  'svg',
  'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor',
  'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile',
  'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix',
  'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting',
  'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB',
  'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode',
  'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting',
  'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face',
  'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri',
  'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line',
  'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath',
  'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect',
  'set', 'stop', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref',
  'tspan', 'use', 'view', 'vkern'
]

function belCreateElement (tag, props, children) {
  var el

  // If an svg tag, it needs a namespace
  if (SVG_TAGS.indexOf(tag) !== -1) {
    props.namespace = SVGNS
  }

  // If we are using a namespace
  var ns = false
  if (props.namespace) {
    ns = props.namespace
    delete props.namespace
  }

  // Create the element
  if (ns) {
    el = document.createElementNS(ns, tag)
  } else if (tag === COMMENT_TAG) {
    return document.createComment(props.comment)
  } else {
    el = document.createElement(tag)
  }

  // If adding onload events
  if (props.onload || props.onunload) {
    var load = props.onload || function () {}
    var unload = props.onunload || function () {}
    onload(el, function belOnload () {
      load(el)
    }, function belOnunload () {
      unload(el)
    },
    // We have to use non-standard `caller` to find who invokes `belCreateElement`
    belCreateElement.caller.caller.caller)
    delete props.onload
    delete props.onunload
  }

  // Create the properties
  for (var p in props) {
    if (props.hasOwnProperty(p)) {
      var key = p.toLowerCase()
      var val = props[p]
      // Normalize className
      if (key === 'classname') {
        key = 'class'
        p = 'class'
      }
      // The for attribute gets transformed to htmlFor, but we just set as for
      if (p === 'htmlFor') {
        p = 'for'
      }
      // If a property is boolean, set itself to the key
      if (BOOL_PROPS[key]) {
        if (val === 'true') val = key
        else if (val === 'false') continue
      }
      // If a property prefers being set directly vs setAttribute
      if (key.slice(0, 2) === 'on') {
        el[p] = val
      } else {
        if (ns) {
          if (p === 'xlink:href') {
            el.setAttributeNS(XLINKNS, p, val)
          } else if (/^xmlns($|:)/i.test(p)) {
            // skip xmlns definitions
          } else {
            el.setAttributeNS(null, p, val)
          }
        } else {
          el.setAttribute(p, val)
        }
      }
    }
  }

  function appendChild (childs) {
    if (!Array.isArray(childs)) return
    for (var i = 0; i < childs.length; i++) {
      var node = childs[i]
      if (Array.isArray(node)) {
        appendChild(node)
        continue
      }

      if (typeof node === 'number' ||
        typeof node === 'boolean' ||
        typeof node === 'function' ||
        node instanceof Date ||
        node instanceof RegExp) {
        node = node.toString()
      }

      if (typeof node === 'string') {
        if (el.lastChild && el.lastChild.nodeName === '#text') {
          el.lastChild.nodeValue += node
          continue
        }
        node = document.createTextNode(node)
      }

      if (node && node.nodeType) {
        el.appendChild(node)
      }
    }
  }
  appendChild(children)

  return el
}

module.exports = hyperx(belCreateElement, {comments: true})
module.exports.default = module.exports
module.exports.createElement = belCreateElement

},{"global/document":5,"hyperx":8,"on-load":12}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
module.exports = function Draw(canvas) {

	var context = canvas.getContext('2d')
	var methods =
    { fill
    , clear
    , rect
    , circle
    , arc
    , image
    , pixels
    }

	return methods

  // fill(color)
	function fill(color) {
    rect(color, canvas.width, canvas.height)(0, 0)
		return methods
	}

  // clear(width, height)(x, y)
	function clear(width, height) {
		if (!arguments.length)
      return clear(canvas.width, canvas.height)(0, 0)
    return function at(x, y) {
  		context.clearRect(x, y, width, height)
  		return methods
    }
	}

  // rect(color, width, height)(x, y)
	function rect(color, width, height) {
    return function at(x, y) {
      context.fillStyle = color
  		context.fillRect(x, y, width, height)
  		return methods
    }
	}

  // circle(color, radius)(x, y)
  function circle(color, radius) {
    return arc(color, radius, 0, 360)
  }

  // arc(color, radius, startAngle, endAngle, anticlockwise)(x, y)
  function arc(color, radius, startAngle, endAngle, anticlockwise) {
    startAngle = (startAngle - 90) * Math.PI / 180
    endAngle = (endAngle - 90) * Math.PI / 180
    return function at(x, y) {
      context.fillStyle = color
      context.beginPath()
      context.arc(x, y, radius, startAngle, endAngle, anticlockwise)
      context.lineTo(x, y)
      context.fill()
    }
  }

  // image(image, width, height)(x, y)
	function image(image, width, height) {
		if (arguments.length === 1) {
			width = image.width
			height = image.height
		}
    return function at(x, y) {
  		context.drawImage(image, x, y, width, height)
  		return methods
    }
	}

  function pixels(imageData) {
    if (!imageData)
      return context.getImageData(0, 0, canvas.width, canvas.height)
    context.putImageData(imageData, 0, 0)
    return methods
  }
}

},{}],4:[function(require,module,exports){
module.exports = function Canvas(width, height) {
	var canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height
	return canvas
}

},{}],5:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":2}],6:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
module.exports = attributeToProperty

var transform = {
  'class': 'className',
  'for': 'htmlFor',
  'http-equiv': 'httpEquiv'
}

function attributeToProperty (h) {
  return function (tagName, attrs, children) {
    for (var attr in attrs) {
      if (attr in transform) {
        attrs[transform[attr]] = attrs[attr]
        delete attrs[attr]
      }
    }
    return h(tagName, attrs, children)
  }
}

},{}],8:[function(require,module,exports){
var attrToProp = require('hyperscript-attribute-to-property')

var VAR = 0, TEXT = 1, OPEN = 2, CLOSE = 3, ATTR = 4
var ATTR_KEY = 5, ATTR_KEY_W = 6
var ATTR_VALUE_W = 7, ATTR_VALUE = 8
var ATTR_VALUE_SQ = 9, ATTR_VALUE_DQ = 10
var ATTR_EQ = 11, ATTR_BREAK = 12
var COMMENT = 13

module.exports = function (h, opts) {
  if (!opts) opts = {}
  var concat = opts.concat || function (a, b) {
    return String(a) + String(b)
  }
  if (opts.attrToProp !== false) {
    h = attrToProp(h)
  }

  return function (strings) {
    var state = TEXT, reg = ''
    var arglen = arguments.length
    var parts = []

    for (var i = 0; i < strings.length; i++) {
      if (i < arglen - 1) {
        var arg = arguments[i+1]
        var p = parse(strings[i])
        var xstate = state
        if (xstate === ATTR_VALUE_DQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_SQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_W) xstate = ATTR_VALUE
        if (xstate === ATTR) xstate = ATTR_KEY
        p.push([ VAR, xstate, arg ])
        parts.push.apply(parts, p)
      } else parts.push.apply(parts, parse(strings[i]))
    }

    var tree = [null,{},[]]
    var stack = [[tree,-1]]
    for (var i = 0; i < parts.length; i++) {
      var cur = stack[stack.length-1][0]
      var p = parts[i], s = p[0]
      if (s === OPEN && /^\//.test(p[1])) {
        var ix = stack[stack.length-1][1]
        if (stack.length > 1) {
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === OPEN) {
        var c = [p[1],{},[]]
        cur[2].push(c)
        stack.push([c,cur[2].length-1])
      } else if (s === ATTR_KEY || (s === VAR && p[1] === ATTR_KEY)) {
        var key = ''
        var copyKey
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_KEY) {
            key = concat(key, parts[i][1])
          } else if (parts[i][0] === VAR && parts[i][1] === ATTR_KEY) {
            if (typeof parts[i][2] === 'object' && !key) {
              for (copyKey in parts[i][2]) {
                if (parts[i][2].hasOwnProperty(copyKey) && !cur[1][copyKey]) {
                  cur[1][copyKey] = parts[i][2][copyKey]
                }
              }
            } else {
              key = concat(key, parts[i][2])
            }
          } else break
        }
        if (parts[i][0] === ATTR_EQ) i++
        var j = i
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_VALUE || parts[i][0] === ATTR_KEY) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][1])
            else cur[1][key] = concat(cur[1][key], parts[i][1])
          } else if (parts[i][0] === VAR
          && (parts[i][1] === ATTR_VALUE || parts[i][1] === ATTR_KEY)) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][2])
            else cur[1][key] = concat(cur[1][key], parts[i][2])
          } else {
            if (key.length && !cur[1][key] && i === j
            && (parts[i][0] === CLOSE || parts[i][0] === ATTR_BREAK)) {
              // https://html.spec.whatwg.org/multipage/infrastructure.html#boolean-attributes
              // empty string is falsy, not well behaved value in browser
              cur[1][key] = key.toLowerCase()
            }
            break
          }
        }
      } else if (s === ATTR_KEY) {
        cur[1][p[1]] = true
      } else if (s === VAR && p[1] === ATTR_KEY) {
        cur[1][p[2]] = true
      } else if (s === CLOSE) {
        if (selfClosing(cur[0]) && stack.length) {
          var ix = stack[stack.length-1][1]
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === VAR && p[1] === TEXT) {
        if (p[2] === undefined || p[2] === null) p[2] = ''
        else if (!p[2]) p[2] = concat('', p[2])
        if (Array.isArray(p[2][0])) {
          cur[2].push.apply(cur[2], p[2])
        } else {
          cur[2].push(p[2])
        }
      } else if (s === TEXT) {
        cur[2].push(p[1])
      } else if (s === ATTR_EQ || s === ATTR_BREAK) {
        // no-op
      } else {
        throw new Error('unhandled: ' + s)
      }
    }

    if (tree[2].length > 1 && /^\s*$/.test(tree[2][0])) {
      tree[2].shift()
    }

    if (tree[2].length > 2
    || (tree[2].length === 2 && /\S/.test(tree[2][1]))) {
      throw new Error(
        'multiple root elements must be wrapped in an enclosing tag'
      )
    }
    if (Array.isArray(tree[2][0]) && typeof tree[2][0][0] === 'string'
    && Array.isArray(tree[2][0][2])) {
      tree[2][0] = h(tree[2][0][0], tree[2][0][1], tree[2][0][2])
    }
    return tree[2][0]

    function parse (str) {
      var res = []
      if (state === ATTR_VALUE_W) state = ATTR
      for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i)
        if (state === TEXT && c === '<') {
          if (reg.length) res.push([TEXT, reg])
          reg = ''
          state = OPEN
        } else if (c === '>' && !quot(state) && state !== COMMENT) {
          if (state === OPEN) {
            res.push([OPEN,reg])
          } else if (state === ATTR_KEY) {
            res.push([ATTR_KEY,reg])
          } else if (state === ATTR_VALUE && reg.length) {
            res.push([ATTR_VALUE,reg])
          }
          res.push([CLOSE])
          reg = ''
          state = TEXT
        } else if (state === COMMENT && /-$/.test(reg) && c === '-') {
          if (opts.comments) {
            res.push([ATTR_VALUE,reg.substr(0, reg.length - 1)],[CLOSE])
          }
          reg = ''
          state = TEXT
        } else if (state === OPEN && /^!--$/.test(reg)) {
          if (opts.comments) {
            res.push([OPEN, reg],[ATTR_KEY,'comment'],[ATTR_EQ])
          }
          reg = c
          state = COMMENT
        } else if (state === TEXT || state === COMMENT) {
          reg += c
        } else if (state === OPEN && /\s/.test(c)) {
          res.push([OPEN, reg])
          reg = ''
          state = ATTR
        } else if (state === OPEN) {
          reg += c
        } else if (state === ATTR && /[^\s"'=/]/.test(c)) {
          state = ATTR_KEY
          reg = c
        } else if (state === ATTR && /\s/.test(c)) {
          if (reg.length) res.push([ATTR_KEY,reg])
          res.push([ATTR_BREAK])
        } else if (state === ATTR_KEY && /\s/.test(c)) {
          res.push([ATTR_KEY,reg])
          reg = ''
          state = ATTR_KEY_W
        } else if (state === ATTR_KEY && c === '=') {
          res.push([ATTR_KEY,reg],[ATTR_EQ])
          reg = ''
          state = ATTR_VALUE_W
        } else if (state === ATTR_KEY) {
          reg += c
        } else if ((state === ATTR_KEY_W || state === ATTR) && c === '=') {
          res.push([ATTR_EQ])
          state = ATTR_VALUE_W
        } else if ((state === ATTR_KEY_W || state === ATTR) && !/\s/.test(c)) {
          res.push([ATTR_BREAK])
          if (/[\w-]/.test(c)) {
            reg += c
            state = ATTR_KEY
          } else state = ATTR
        } else if (state === ATTR_VALUE_W && c === '"') {
          state = ATTR_VALUE_DQ
        } else if (state === ATTR_VALUE_W && c === "'") {
          state = ATTR_VALUE_SQ
        } else if (state === ATTR_VALUE_DQ && c === '"') {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_SQ && c === "'") {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_W && !/\s/.test(c)) {
          state = ATTR_VALUE
          i--
        } else if (state === ATTR_VALUE && /\s/.test(c)) {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE || state === ATTR_VALUE_SQ
        || state === ATTR_VALUE_DQ) {
          reg += c
        }
      }
      if (state === TEXT && reg.length) {
        res.push([TEXT,reg])
        reg = ''
      } else if (state === ATTR_VALUE && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_DQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_SQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_KEY) {
        res.push([ATTR_KEY,reg])
        reg = ''
      }
      return res
    }
  }

  function strfn (x) {
    if (typeof x === 'function') return x
    else if (typeof x === 'string') return x
    else if (x && typeof x === 'object') return x
    else return concat('', x)
  }
}

function quot (state) {
  return state === ATTR_VALUE_SQ || state === ATTR_VALUE_DQ
}

var hasOwn = Object.prototype.hasOwnProperty
function has (obj, key) { return hasOwn.call(obj, key) }

var closeRE = RegExp('^(' + [
  'area', 'base', 'basefont', 'bgsound', 'br', 'col', 'command', 'embed',
  'frame', 'hr', 'img', 'input', 'isindex', 'keygen', 'link', 'meta', 'param',
  'source', 'track', 'wbr', '!--',
  // SVG TAGS
  'animate', 'animateTransform', 'circle', 'cursor', 'desc', 'ellipse',
  'feBlend', 'feColorMatrix', 'feComposite',
  'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap',
  'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR',
  'feGaussianBlur', 'feImage', 'feMergeNode', 'feMorphology',
  'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile',
  'feTurbulence', 'font-face-format', 'font-face-name', 'font-face-uri',
  'glyph', 'glyphRef', 'hkern', 'image', 'line', 'missing-glyph', 'mpath',
  'path', 'polygon', 'polyline', 'rect', 'set', 'stop', 'tref', 'use', 'view',
  'vkern'
].join('|') + ')(?:[\.#][a-zA-Z0-9\u007F-\uFFFF_:-]+)*$')
function selfClosing (tag) { return closeRE.test(tag) }

},{"hyperscript-attribute-to-property":7}],9:[function(require,module,exports){
module.exports = function use(image) {
	return function config(width, height) {
		var cols = image.width  / width
		var rows = image.height / height
		return function extract(x, y) {
			if (isNaN(x)) {
				var sprites = []
				for (var y = rows; y--;)
					for (var x = cols; x--;)
						sprites[y * cols + x] = extract(x, y)
				return sprites
			}
			if (!y) {
				var i = x
				x = i % cols
				y = (i - x) / cols
			}
			var canvas = document.createElement('canvas')
			var context = canvas.getContext('2d')
			canvas.width = width
			canvas.height = height
			context.drawImage(image, -x * width, -y * height)
			return canvas
		}
	}
}

},{}],10:[function(require,module,exports){
module.exports = function load(path, callback) {
	var image = new Image
	image.src = path
	if (callback) {
		image.onload = function () {
			callback(null, image)
		}
		image.onerror = function () {
			callback(new Error('Failed to load image from path \'' + path + '\': 404 (Not Found)'))
		}
	}
	return image
}

},{}],11:[function(require,module,exports){
module.exports = function Keys(element) {

	var keys = {}
	var updating = false

	element.addEventListener('keydown', onKey)
	element.addEventListener('keyup', onKey)

	return keys

	function update() {
		requestAnimationFrame(update)
		for (var name in keys)
			if (keys[name])
				keys[name]++
	}

	function onKey(event) {
		var name = event.code
		if (event.type === 'keydown') {
			if (!keys[name])
				keys[name] = 1
		} else
			keys[name] = 0
		if (!updating) {
			updating = true
			update()
		}
	}
}

},{}],12:[function(require,module,exports){
/* global MutationObserver */
var document = require('global/document')
var window = require('global/window')
var watch = Object.create(null)
var KEY_ID = 'onloadid' + (new Date() % 9e6).toString(36)
var KEY_ATTR = 'data-' + KEY_ID
var INDEX = 0

if (window && window.MutationObserver) {
  var observer = new MutationObserver(function (mutations) {
    if (Object.keys(watch).length < 1) return
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === KEY_ATTR) {
        eachAttr(mutations[i], turnon, turnoff)
        continue
      }
      eachMutation(mutations[i].removedNodes, turnoff)
      eachMutation(mutations[i].addedNodes, turnon)
    }
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [KEY_ATTR]
  })
}

module.exports = function onload (el, on, off, caller) {
  on = on || function () {}
  off = off || function () {}
  el.setAttribute(KEY_ATTR, 'o' + INDEX)
  watch['o' + INDEX] = [on, off, 0, caller || onload.caller]
  INDEX += 1
  return el
}

function turnon (index, el) {
  if (watch[index][0] && watch[index][2] === 0) {
    watch[index][0](el)
    watch[index][2] = 1
  }
}

function turnoff (index, el) {
  if (watch[index][1] && watch[index][2] === 1) {
    watch[index][1](el)
    watch[index][2] = 0
  }
}

function eachAttr (mutation, on, off) {
  var newValue = mutation.target.getAttribute(KEY_ATTR)
  if (sameOrigin(mutation.oldValue, newValue)) {
    watch[newValue] = watch[mutation.oldValue]
    return
  }
  if (watch[mutation.oldValue]) {
    off(mutation.oldValue, mutation.target)
  }
  if (watch[newValue]) {
    on(newValue, mutation.target)
  }
}

function sameOrigin (oldValue, newValue) {
  if (!oldValue || !newValue) return false
  return watch[oldValue][3] === watch[newValue][3]
}

function eachMutation (nodes, fn) {
  var keys = Object.keys(watch)
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] && nodes[i].getAttribute && nodes[i].getAttribute(KEY_ATTR)) {
      var onloadid = nodes[i].getAttribute(KEY_ATTR)
      keys.forEach(function (k) {
        if (onloadid === k) {
          fn(k, nodes[i])
        }
      })
    }
    if (nodes[i].childNodes.length > 0) {
      eachMutation(nodes[i].childNodes, fn)
    }
  }
}

},{"global/document":5,"global/window":6}],13:[function(require,module,exports){
'use strict'

var sources  = require('./sources')
var sinks    = require('./sinks')
var throughs = require('./throughs')

exports = module.exports = require('./pull')

for(var k in sources)
  exports[k] = sources[k]

for(var k in throughs)
  exports[k] = throughs[k]

for(var k in sinks)
  exports[k] = sinks[k]


},{"./pull":14,"./sinks":19,"./sources":26,"./throughs":35}],14:[function(require,module,exports){
'use strict'

module.exports = function pull (a) {
  var length = arguments.length
  if (typeof a === 'function' && a.length === 1) {
    var args = new Array(length)
    for(var i = 0; i < length; i++)
      args[i] = arguments[i]
    return function (read) {
      if (args == null) {
        throw new TypeError("partial sink should only be called once!")
      }

      // Grab the reference after the check, because it's always an array now
      // (engines like that kind of consistency).
      var ref = args
      args = null

      // Prioritize common case of small number of pulls.
      switch (length) {
      case 1: return pull(read, ref[0])
      case 2: return pull(read, ref[0], ref[1])
      case 3: return pull(read, ref[0], ref[1], ref[2])
      case 4: return pull(read, ref[0], ref[1], ref[2], ref[3])
      default:
        ref.unshift(read)
        return pull.apply(null, ref)
      }
    }
  }

  var read = a

  if (read && typeof read.source === 'function') {
    read = read.source
  }

  for (var i = 1; i < length; i++) {
    var s = arguments[i]
    if (typeof s === 'function') {
      read = s(read)
    } else if (s && typeof s === 'object') {
      s.sink(read)
      read = s.source
    }
  }

  return read
}

},{}],15:[function(require,module,exports){
'use strict'

var reduce = require('./reduce')

module.exports = function collect (cb) {
  return reduce(function (arr, item) {
    arr.push(item)
    return arr
  }, [], cb)
}

},{"./reduce":22}],16:[function(require,module,exports){
'use strict'

var reduce = require('./reduce')

module.exports = function concat (cb) {
  return reduce(function (a, b) {
    return a + b
  }, '', cb)
}

},{"./reduce":22}],17:[function(require,module,exports){
'use strict'

module.exports = function drain (op, done) {
  var read, abort

  function sink (_read) {
    read = _read
    if(abort) return sink.abort()
    //this function is much simpler to write if you
    //just use recursion, but by using a while loop
    //we do not blow the stack if the stream happens to be sync.
    ;(function next() {
        var loop = true, cbed = false
        while(loop) {
          cbed = false
          read(null, function (end, data) {
            cbed = true
            if(end = end || abort) {
              loop = false
              if(done) done(end === true ? null : end)
              else if(end && end !== true)
                throw end
            }
            else if(op && false === op(data) || abort) {
              loop = false
              read(abort || true, done || function () {})
            }
            else if(!loop){
              next()
            }
          })
          if(!cbed) {
            loop = false
            return
          }
        }
      })()
  }

  sink.abort = function (err, cb) {
    if('function' == typeof err)
      cb = err, err = true
    abort = err || true
    if(read) return read(abort, cb || function () {})
  }

  return sink
}

},{}],18:[function(require,module,exports){
'use strict'

function id (e) { return e }
var prop = require('../util/prop')
var drain = require('./drain')

module.exports = function find (test, cb) {
  var ended = false
  if(!cb)
    cb = test, test = id
  else
    test = prop(test) || id

  return drain(function (data) {
    if(test(data)) {
      ended = true
      cb(null, data)
    return false
    }
  }, function (err) {
    if(ended) return //already called back
    cb(err === true ? null : err, null)
  })
}





},{"../util/prop":42,"./drain":17}],19:[function(require,module,exports){
'use strict'

module.exports = {
  drain: require('./drain'),
  onEnd: require('./on-end'),
  log: require('./log'),
  find: require('./find'),
  reduce: require('./reduce'),
  collect: require('./collect'),
  concat: require('./concat')
}


},{"./collect":15,"./concat":16,"./drain":17,"./find":18,"./log":20,"./on-end":21,"./reduce":22}],20:[function(require,module,exports){
'use strict'

var drain = require('./drain')

module.exports = function log (done) {
  return drain(function (data) {
    console.log(data)
  }, done)
}

},{"./drain":17}],21:[function(require,module,exports){
'use strict'

var drain = require('./drain')

module.exports = function onEnd (done) {
  return drain(null, done)
}

},{"./drain":17}],22:[function(require,module,exports){
'use strict'

var drain = require('./drain')

module.exports = function reduce (reducer, acc, cb ) {
  if(!cb) cb = acc, acc = null
  var sink = drain(function (data) {
    acc = reducer(acc, data)
  }, function (err) {
    cb(err, acc)
  })
  if (arguments.length === 2)
    return function (source) {
      source(null, function (end, data) {
        //if ended immediately, and no initial...
        if(end) return cb(end === true ? null : end)
        acc = data; sink(source)
      })
    }
  else
    return sink
}

},{"./drain":17}],23:[function(require,module,exports){
'use strict'

module.exports = function count (max) {
  var i = 0; max = max || Infinity
  return function (end, cb) {
    if(end) return cb && cb(end)
    if(i > max)
      return cb(true)
    cb(null, i++)
  }
}



},{}],24:[function(require,module,exports){
'use strict'
//a stream that ends immediately.
module.exports = function empty () {
  return function (abort, cb) {
    cb(true)
  }
}

},{}],25:[function(require,module,exports){
'use strict'
//a stream that errors immediately.
module.exports = function error (err) {
  return function (abort, cb) {
    cb(err)
  }
}


},{}],26:[function(require,module,exports){
'use strict'
module.exports = {
  keys: require('./keys'),
  once: require('./once'),
  values: require('./values'),
  count: require('./count'),
  infinite: require('./infinite'),
  empty: require('./empty'),
  error: require('./error')
}

},{"./count":23,"./empty":24,"./error":25,"./infinite":27,"./keys":28,"./once":29,"./values":30}],27:[function(require,module,exports){
'use strict'
module.exports = function infinite (generate) {
  generate = generate || Math.random
  return function (end, cb) {
    if(end) return cb && cb(end)
    return cb(null, generate())
  }
}



},{}],28:[function(require,module,exports){
'use strict'
var values = require('./values')
module.exports = function (object) {
  return values(Object.keys(object))
}



},{"./values":30}],29:[function(require,module,exports){
'use strict'
var abortCb = require('../util/abort-cb')

module.exports = function once (value, onAbort) {
  return function (abort, cb) {
    if(abort)
      return abortCb(cb, abort, onAbort)
    if(value != null) {
      var _value = value; value = null
      cb(null, _value)
    } else
      cb(true)
  }
}



},{"../util/abort-cb":41}],30:[function(require,module,exports){
'use strict'
var abortCb = require('../util/abort-cb')

module.exports = function values (array, onAbort) {
  if(!array)
    return function (abort, cb) {
      if(abort) return abortCb(cb, abort, onAbort)
      return cb(true)
    }
  if(!Array.isArray(array))
    array = Object.keys(array).map(function (k) {
      return array[k]
    })
  var i = 0
  return function (abort, cb) {
    if(abort)
      return abortCb(cb, abort, onAbort)
    if(i >= array.length)
      cb(true)
    else
      cb(null, array[i++])
  }
}

},{"../util/abort-cb":41}],31:[function(require,module,exports){
'use strict'

function id (e) { return e }
var prop = require('../util/prop')

module.exports = function asyncMap (map) {
  if(!map) return id
  map = prop(map)
  var busy = false, abortCb, aborted
  return function (read) {
    return function next (abort, cb) {
      if(aborted) return cb(aborted)
      if(abort) {
        aborted = abort
        if(!busy) read(abort, cb)
        else read(abort, function () {
          //if we are still busy, wait for the mapper to complete.
          if(busy) abortCb = cb
          else cb(abort)
        })
      }
      else
        read(null, function (end, data) {
          if(end) cb(end)
          else if(aborted) cb(aborted)
          else {
            busy = true
            map(data, function (err, data) {
              busy = false
              if(aborted) {
                cb(aborted)
                abortCb(aborted)
              }
              else if(err) next (err, cb)
              else cb(null, data)
            })
          }
        })
    }
  }
}



},{"../util/prop":42}],32:[function(require,module,exports){
'use strict'

var tester = require('../util/tester')
var filter = require('./filter')

module.exports = function filterNot (test) {
  test = tester(test)
  return filter(function (data) { return !test(data) })
}

},{"../util/tester":43,"./filter":33}],33:[function(require,module,exports){
'use strict'

var tester = require('../util/tester')

module.exports = function filter (test) {
  //regexp
  test = tester(test)
  return function (read) {
    return function next (end, cb) {
      var sync, loop = true
      while(loop) {
        loop = false
        sync = true
        read(end, function (end, data) {
          if(!end && !test(data))
            return sync ? loop = true : next(end, cb)
          cb(end, data)
        })
        sync = false
      }
    }
  }
}


},{"../util/tester":43}],34:[function(require,module,exports){
'use strict'

var values = require('../sources/values')
var once = require('../sources/once')

//convert a stream of arrays or streams into just a stream.
module.exports = function flatten () {
  return function (read) {
    var _read
    return function (abort, cb) {
      if (abort) { //abort the current stream, and then stream of streams.
        _read ? _read(abort, function(err) {
          read(err || abort, cb)
        }) : read(abort, cb)
      }
      else if(_read) nextChunk()
      else nextStream()

      function nextChunk () {
        _read(null, function (err, data) {
          if (err === true) nextStream()
          else if (err) {
            read(true, function(abortErr) {
              // TODO: what do we do with the abortErr?
              cb(err)
            })
          }
          else cb(null, data)
        })
      }
      function nextStream () {
        _read = null
        read(null, function (end, stream) {
          if(end)
            return cb(end)
          if(Array.isArray(stream) || stream && 'object' === typeof stream)
            stream = values(stream)
          else if('function' != typeof stream)
            stream = once(stream)
          _read = stream
          nextChunk()
        })
      }
    }
  }
}


},{"../sources/once":29,"../sources/values":30}],35:[function(require,module,exports){
'use strict'

module.exports = {
  map: require('./map'),
  asyncMap: require('./async-map'),
  filter: require('./filter'),
  filterNot: require('./filter-not'),
  through: require('./through'),
  take: require('./take'),
  unique: require('./unique'),
  nonUnique: require('./non-unique'),
  flatten: require('./flatten')
}




},{"./async-map":31,"./filter":33,"./filter-not":32,"./flatten":34,"./map":36,"./non-unique":37,"./take":38,"./through":39,"./unique":40}],36:[function(require,module,exports){
'use strict'

function id (e) { return e }
var prop = require('../util/prop')

module.exports = function map (mapper) {
  if(!mapper) return id
  mapper = prop(mapper)
  return function (read) {
    return function (abort, cb) {
      read(abort, function (end, data) {
        try {
        data = !end ? mapper(data) : null
        } catch (err) {
          return read(err, function () {
            return cb(err)
          })
        }
        cb(end, data)
      })
    }
  }
}

},{"../util/prop":42}],37:[function(require,module,exports){
'use strict'

var unique = require('./unique')

//passes an item through when you see it for the second time.
module.exports = function nonUnique (field) {
  return unique(field, true)
}

},{"./unique":40}],38:[function(require,module,exports){
'use strict'

//read a number of items and then stop.
module.exports = function take (test, opts) {
  opts = opts || {}
  var last = opts.last || false // whether the first item for which !test(item) should still pass
  var ended = false
  if('number' === typeof test) {
    last = true
    var n = test; test = function () {
      return --n
    }
  }

  return function (read) {

    function terminate (cb) {
      read(true, function (err) {
        last = false; cb(err || true)
      })
    }

    return function (end, cb) {
      if(ended)            last ? terminate(cb) : cb(ended)
      else if(ended = end) read(ended, cb)
      else
        read(null, function (end, data) {
          if(ended = ended || end) {
            //last ? terminate(cb) :
            cb(ended)
          }
          else if(!test(data)) {
            ended = true
            last ? cb(null, data) : terminate(cb)
          }
          else
            cb(null, data)
        })
    }
  }
}

},{}],39:[function(require,module,exports){
'use strict'

//a pass through stream that doesn't change the value.
module.exports = function through (op, onEnd) {
  var a = false

  function once (abort) {
    if(a || !onEnd) return
    a = true
    onEnd(abort === true ? null : abort)
  }

  return function (read) {
    return function (end, cb) {
      if(end) once(end)
      return read(end, function (end, data) {
        if(!end) op && op(data)
        else once(end)
        cb(end, data)
      })
    }
  }
}

},{}],40:[function(require,module,exports){
'use strict'

function id (e) { return e }
var prop = require('../util/prop')
var filter = require('./filter')

//drop items you have already seen.
module.exports = function unique (field, invert) {
  field = prop(field) || id
  var seen = {}
  return filter(function (data) {
    var key = field(data)
    if(seen[key]) return !!invert //false, by default
    else seen[key] = true
    return !invert //true by default
  })
}


},{"../util/prop":42,"./filter":33}],41:[function(require,module,exports){
module.exports = function abortCb(cb, abort, onAbort) {
  cb(abort)
  onAbort && onAbort(abort === true ? null: abort)
  return
}


},{}],42:[function(require,module,exports){
module.exports = function prop (key) {
  return key && (
    'string' == typeof key
    ? function (data) { return data[key] }
    : 'object' === typeof key && 'function' === typeof key.exec //regexp
    ? function (data) { var v = key.exec(data); return v && v[0] }
    : key
  )
}

},{}],43:[function(require,module,exports){
var prop = require('./prop')

function id (e) { return e }

module.exports = function tester (test) {
  return (
    'object' === typeof test && 'function' === typeof test.test //regexp
    ? function (data) { return test.test(data) }
    : prop (test) || id
  )
}

},{"./prop":42}],44:[function(require,module,exports){
module.exports = Object.assign(Random, Random())

function Random(initialSeed) {

  if (isNaN(initialSeed))
    initialSeed = Math.random() * Number.MAX_SAFE_INTEGER

  var currentSeed = initialSeed

  return {
    get: get,
    choose: choose,
    chance: chance,
    shuffle: shuffle,
    seed: seed
  }

  function get(min, max) {
    var a = arguments.length
    if (a === 0) {
      var x = Math.sin(currentSeed++) * Number.MAX_SAFE_INTEGER
      return x - Math.floor(x)
    } else if (a === 1)
      max = min, min = 0
    return Math.floor(get() * (max - min)) + min
  }

  function choose(items) {
    return items[get(items.length)]
  }

  function shuffle(items) {
    return items.sort(byRandom)
  }

  function chance(chance) {
    if (isNaN(chance))
      chance = 2
    return !get(chance)
  }

  function seed(newSeed) {
    if (!isNaN(newSeed))
      initialSeed = currentSeed = newSeed
    return currentSeed
  }

  function byRandom(a, b) {
    return get() < 0.5
  }
}

},{}],45:[function(require,module,exports){
module.exports={I:[[{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:3,y:1}],[{x:2,y:0},{x:2,y:1},{x:2,y:2},{x:2,y:3}],[{x:0,y:2},{x:1,y:2},{x:2,y:2},{x:3,y:2}],[{x:1,y:0},{x:1,y:1},{x:1,y:2},{x:1,y:3}]],J:[[{x:0,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1}],[{x:1,y:0},{x:2,y:0},{x:1,y:1},{x:1,y:2}],[{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:2,y:2}],[{x:1,y:0},{x:1,y:1},{x:0,y:2},{x:1,y:2}]],L:[[{x:2,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1}],[{x:1,y:0},{x:1,y:1},{x:1,y:2},{x:2,y:2}],[{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:0,y:2}],[{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:1,y:2}]],O:[[{x:1,y:0},{x:2,y:0},{x:1,y:1},{x:2,y:1}]],S:[[{x:1,y:0},{x:2,y:0},{x:0,y:1},{x:1,y:1}],[{x:1,y:0},{x:1,y:1},{x:2,y:1},{x:2,y:2}],[{x:1,y:1},{x:2,y:1},{x:0,y:2},{x:1,y:2}],[{x:0,y:0},{x:0,y:1},{x:1,y:1},{x:1,y:2}]],T:[[{x:1,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1}],[{x:1,y:0},{x:1,y:1},{x:2,y:1},{x:1,y:2}],[{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:1,y:2}],[{x:1,y:0},{x:0,y:1},{x:1,y:1},{x:1,y:2}]],Z:[[{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:2,y:1}],[{x:2,y:0},{x:1,y:1},{x:2,y:1},{x:1,y:2}],[{x:0,y:1},{x:1,y:1},{x:1,y:2},{x:2,y:2}],[{x:1,y:0},{x:0,y:1},{x:1,y:1},{x:0,y:2}]]}
},{}],46:[function(require,module,exports){
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

},{"../sprites/pieces/rect":55,"./rects":47,"bel":1,"canvas":4,"canvas-draw":3,"tetromino":45}],47:[function(require,module,exports){
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

},{"../../sprites/pieces/rect":55,"tetromino":45}],48:[function(require,module,exports){
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

},{"canvas":4,"canvas-draw":3}],49:[function(require,module,exports){
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

},{"canvas":4,"canvas-draw":3}],50:[function(require,module,exports){
module.exports = {
	shades: require('./shades'),
	pieces: require('./pieces')
}

},{"./pieces":51,"./shades":52}],51:[function(require,module,exports){
module.exports = {
	I: 'cyan',
	J: 'blue',
	L: 'orange',
	O: 'yellow',
	S: 'green',
	T: 'purple',
	Z: 'red'
}

},{}],52:[function(require,module,exports){
module.exports = {
	red: {
		normal: '#e40058',
		light: '#fce0a8',
		dark: '#940084'
	},
	orange: {
		normal: '#e45c10',
		light: '#f0d0b0',
		dark: '#a80020'
	},
	yellow: {
		normal: '#f8b800',
		light: '#fcfcfc',
		dark: '#503000'
	},
	green: {
		normal: '#00a844',
		light: '#b8f818',
		dark: '#005800'
	},
	cyan: {
		normal: '#3cbcfc',
		light: '#fcfcfc',
		dark: '#004058'
	},
	blue: {
		normal: '#0058f8',
		light: '#a4e4fc',
		dark: '#0000bc'
	},
	purple: {
		normal: '#d800cc',
		light: '#f8d8f8',
		dark: '#4428bc'
	}
}

},{}],53:[function(require,module,exports){
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

},{"./blocks":48,"./box":49,"./colors":50,"./pieces":54,"./text":56,"image-extract":9,"image-load":10,"pull-stream":13}],54:[function(require,module,exports){
const Canvas = require('canvas')
const Draw = require('canvas-draw')
const Tetromino = require('tetromino')
const Rect = require('./rect')

module.exports = function createPieces(blocks, colors) {
	var pieces = {}
	for (let type in Tetromino) {
		let rotations = Tetromino[type]
		let color = colors[type]
		let sprites = pieces[type] = []
		for (let i = rotations.length; i--;) {
			let layout = rotations[i]
			sprites[i] = {
				normal: createPiece(blocks, color, layout),
			  	dark: createPiece(blocks, color, layout, 'dark')
			}
		}
	}
	return pieces
}

function createPiece(blocks, color, layout, type) {
	if (!type)
		type = 'normal'
	var sprites = blocks[color]
	var size = blocks.size
	var bounds = Rect.bounds(layout)
	var piece = Canvas(bounds.width * size, bounds.height * size)
	var draw = Draw(piece)
	for (let { x, y } of layout) {
		let links = [
			layout.find(other => x - 1 === other.x && y === other.y),
			layout.find(other => x === other.x && y - 1 === other.y),
			layout.find(other => x + 1 === other.x && y === other.y),
			layout.find(other => x === other.x && y + 1 === other.y)
		].map(cell => !!cell)
		let index = parseInt(links.map(Number).join(''), 2)
		let sprite = sprites[index][type]
		x -= bounds.x
		y -= bounds.y
		draw.image(sprite)(x * size, y * size, size, size)
	}
	return piece
}

},{"./rect":55,"canvas":4,"canvas-draw":3,"tetromino":45}],55:[function(require,module,exports){
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

},{}],56:[function(require,module,exports){
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

},{"canvas":4,"canvas-draw":3}],57:[function(require,module,exports){
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

},{"random":44}],58:[function(require,module,exports){
const Bag = require('./bag')
const Piece = require('./piece')
const Grid = require('./piece/grid')

const starters = ['I', 'J', 'L', 'T']

module.exports = Tetrion
Tetrion.start = start
Tetrion.reset = reset
Tetrion.update = update
Tetrion.send = send

function Tetrion(cols, rows, dispatch) {

	var area = cols * rows
	var data = Array(area)
	for (let i = area; i--;) {
		let x = i % cols
		let y = (i - x) / cols
		data[i] = { x, y }
	}

	var tetrion = { cols, rows, data, pieces: [], piece: null, bag: null, next: null, hold: null, held: false, score: 0, done: false, dispatch }

	return tetrion

}

function start(tetrion, seed) {
	reset(tetrion, seed)
	update(tetrion)
}

function reset(tetrion, seed) {
	tetrion.done = false
	tetrion.piece = null
	tetrion.pieces.length = 0
	for (let i = tetrion.cols * tetrion.rows; i--;)
		tetrion.data[i].piece = null
	do {
		tetrion.bag = Bag(Piece.types, seed)
		tetrion.next = tetrion.bag()
	} while (!starters.includes(tetrion.next))
	tetrion.hold = null
	tetrion.held = false
	tetrion.score = 0
	emit(tetrion, 'reset')
}

function update(tetrion) {
	if (tetrion.done)
		return
	var piece = tetrion.piece
	if (!piece) {
		let type = tetrion.next
		let piece = Piece(type)
		let spawned = spawn(tetrion, piece)
		if (spawned)
			tetrion.next = tetrion.bag()
		return
	}
	var moved = Piece.move(piece)
	if (!moved) {
		if (!piece.locking) {
			piece.locking = true
			emit(tetrion, 'locking', piece)
		} else {
			piece.locking = false
			piece.locked = true
			emit(tetrion, 'lock', piece)
			var lines = getLines(tetrion)
			if (lines.length) {
				for (let y = lines[lines.length - 1], d = 0; y; y--) {
					if (lines.includes(y)) {
						for (let x = tetrion.cols; x--;) {
							let cell = Grid.get(tetrion, x, y)
							let piece = cell.piece
							let cells = piece.cells
							cell.piece = null
							remove(cells, cell)
							if (!cells.length)
								remove(tetrion.pieces, piece)
						}
						d++
						continue
					}
					for (let x = tetrion.cols; x--;) {
						let cell = Grid.get(tetrion, x, y)
						let next = Grid.get(tetrion, x, y + d)
						next.piece = cell.piece
						if (cell.piece) {
							let index = cell.piece.cells.indexOf(cell)
							cell.piece.cells[index] = next
							cell.piece = null
						}
					}
				}
				tetrion.score += score(lines.length)
				emit(tetrion, 'line', lines)
			}
			tetrion.piece = null
			tetrion.held = false
		}
	} else {
		piece.locking = false
		tetrion.score += 10
		emit(tetrion, 'drop', piece)
	}
}

function spawn(tetrion, piece) {
	let spawned = Piece.spawn(piece, tetrion)
	if (spawned) {
		tetrion.piece = piece
		emit(tetrion, 'spawn', piece)
	} else {
		tetrion.done = true
		emit(tetrion, 'done')
	}
	return spawned
}

function score(lines) {
	switch (lines) {
		case 1:
			return 1000
		case 2:
			return 3000
		case 3:
			return 5000
		case 4:
			return 10000
	}
}

function getLines(tetrion) {
	var lines = []
	for (let { y } of tetrion.piece.cells) {
		if (lines.includes(y))
			continue
		lines.push(y)
	}
	for (let i = lines.length; i--;) {
		let y = lines[i]
		for (let x = tetrion.cols; x--;) {
			let block = Grid.get(tetrion, x, y)
			if (!block.piece) {
				lines.splice(i, 1)
				break
			}
		}
	}
	return lines
}

function hold(tetrion, piece) {
	if (tetrion.held)
		return false
	tetrion.held = true
	Piece.kill(piece)
	if (piece === tetrion.piece) {
		tetrion.piece = null
		let type = tetrion.hold
		if (type) {
			let piece = Piece(type)
			spawn(tetrion, piece)
		}
	}
	tetrion.hold = piece.type
	emit(tetrion, 'hold', piece)
	return true
}

function emit(tetrion, ...event) {
	if (tetrion.dispatch)
		tetrion.dispatch(...event)
}

function send(tetrion, ...command) {
	var piece = tetrion.piece
	if (tetrion.done || !piece)
		return null
	var [type, ...data] = command
	var success = execute(tetrion, command)
	if (success) {
		if (piece.locking)
			piece.locking = false
		emit(tetrion, type, piece)
	}
	return success
}

function execute(tetrion, command) {
	var [type, ...data] = command
	var piece = tetrion.piece
	if (piece) {
		switch (type) {
			case 'move':
				return Piece.move(piece, ...data)
			case 'rotate':
				return Piece.rotate(piece, ...data)
			case 'hold':
				return hold(tetrion, piece)
		}
	}
	return null
}

function remove(array, item) {
	var index = array.indexOf(item)
	if (index === -1)
		return false
	array.splice(index, 1)
	return true
}

},{"./bag":57,"./piece":60,"./piece/grid":59}],59:[function(require,module,exports){
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

},{}],60:[function(require,module,exports){
const Tetromino = require('tetromino')
const Grid = require('./grid')

const LEFT  = { x: -1, y:  0 }
const UP    = { x:  0, y: -1 }
const RIGHT = { x:  1, y:  0 }
const DOWN  = { x:  0, y:  1 }
const directions = [LEFT, UP, RIGHT, DOWN]

module.exports = Piece
Piece.types = Object.keys(Tetromino)
Piece.spawn = spawn
Piece.kill = kill
Piece.move = move
Piece.rotate = rotate

function Piece(type) {
	return { type, cells: [], matrix: null, x: null, y: null, rotation: 0, locking: false, locked: false }
}

function spawn(piece, matrix) {
	var x = matrix.cols / 2 - 2
	var y = 0
	var layout = Tetromino[piece.type][piece.rotation]
	for (let i = layout.length; i--;) {
		var cell = layout[i]
		var other = Grid.get(matrix, x + cell.x, y + cell.y)
		if (other.piece) {
			piece.cells.length = 0
			return false
		}
		piece.cells[i] = other
	}
	for (let cell of piece.cells)
		cell.piece = piece
	piece.x = x
	piece.y = y
	piece.matrix = matrix
	matrix.pieces.push(piece)
	return true
}

function kill(piece) {
	if (!piece.matrix)
		return false
	var index = piece.matrix.pieces.indexOf(piece)
	if (index === -1)
		return false
	for (let cell of piece.cells)
		cell.piece = null
	piece.cells.length = 0
	piece.matrix.pieces.splice(index, 1)
	piece.matrix = null
	piece.x = null
	piece.y = null
	return true
}

function move(piece, ...direction) {
	var dx = 0
	var dy = 1
	if (direction.length)
		[dx, dy] = direction
	var cells = piece.cells.map(cell => Grid.get(piece.matrix, cell.x + dx, cell.y + dy))
	if (!validate(piece, cells))
		return false
	piece.x += dx
	piece.y += dy
	for (let cell of piece.cells)
		cell.piece = null
	for (let i = cells.length; i--;) {
		let cell = cells[i]
		cell.piece = piece
		piece.cells[i] = cell
	}
	return true
}

function rotate(piece, direction) {
	if (!direction)
		direction = 1
	var rotation = piece.rotation
	var rotations = Tetromino[piece.type]
	var max = rotations.length - 1
	if (!max)
		return false
	rotation += direction
	if (rotation < 0)
		rotation = max
	if (rotation > max)
		rotation = 0
	let offset, cells
	for (let step = 0; step < 3 && !cells; step++) {
		for (let direction of directions) {
			offset = { x: step * direction.x, y: step * direction.y }
			cells = rotations[rotation].map(cell => Grid.get(piece.matrix, piece.x + offset.x + cell.x, piece.y + offset.y + cell.y))
			if (validate(piece, cells))
				break
			offset = cells = null
			if (!step)
				break
		}
	}
	if (!cells)
		return false
	piece.x += offset.x
	piece.y += offset.y
	piece.rotation = rotation
	for (let cell of piece.cells)
		cell.piece = null
	for (let i = cells.length; i--;) {
		let cell = cells[i]
		cell.piece = piece
		piece.cells[i] = cell
	}
	return true
}

function validate(piece, cells) {
	for (let cell of cells)
		if (!cell || cell.piece && cell.piece !== piece)
			return false
	return true
}

},{"./grid":59,"tetromino":45}],61:[function(require,module,exports){
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

},{"./app/display":46,"./app/sprites":53,"./app/tetrion":58,"bel":1,"canvas":4,"canvas-draw":3,"keys":11}]},{},[61]);
