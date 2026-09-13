/**
 * Chrome treats document/window touch & wheel listeners as passive by default.
 * Legacy DIY editor (diy.min.js / vue-scroll) calls preventDefault during drag,
 * which triggers Intervention spam. Force non-passive unless explicitly requested.
 */
(function () {
  if (typeof EventTarget === 'undefined' || !EventTarget.prototype.addEventListener) {
    return
  }

  var nativeAdd = EventTarget.prototype.addEventListener
  var forceActive = {
    touchstart: true,
    touchmove: true,
    wheel: true,
    mousewheel: true,
  }

  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (!forceActive[type]) {
      return nativeAdd.call(this, type, listener, options)
    }

    var next
    if (options == null || typeof options === 'boolean') {
      next = { capture: !!options, passive: false }
    } else if (options.passive === true) {
      next = options
    } else {
      next = {}
      for (var key in options) {
        if (Object.prototype.hasOwnProperty.call(options, key)) {
          next[key] = options[key]
        }
      }
      next.passive = false
    }
    return nativeAdd.call(this, type, listener, next)
  }
})()
