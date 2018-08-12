class Holder {
  constructor (values = {}) {
    Object.assign(this, values)
  }

  get (property) {
    return this[property]
  }

  set (property, value) {
    this[property] = value
  }
}

module.exports = Holder
