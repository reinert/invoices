class LeanEventEmitter {
  on (event, listener) {
    if (!this.hasOwnProperty(event)) {
      this[event] = []
    }

    this[event].push(listener)
  }

  emit (event, ...args) {
    if (!this.hasOwnProperty(event)) {
      return false
    }

    for (let listener of this[event]) {
      listener(...args)
    }

    return true
  }

  getListeners (event) {
    if (!this.hasOwnProperty(event)) {
      return []
    }

    return this[event]
  }
}

module.exports = LeanEventEmitter
