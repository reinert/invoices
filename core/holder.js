class Holder {
  constructor (values) {
    this._values = values
  }

  get (property) {
    return this._values[property]
  }

  set (property, value) {
    this._values[property] = value
  }
}

module.exports = Holder
