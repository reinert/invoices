const Entity = require('./entity')

class PersistentEntity extends Entity {
  static get properties () {
    return {
      'id': {
        type: Number,
        readOnly: true
      },
      'createdAt': {
        type: Date,
        readOnly: true
      },
      'updatedAt': {
        type: Date,
        readOnly: true
      }
    }
  }

  toString () {
    return `PersistentEntity: { id: ${this.id} }`
  }
}

module.exports = PersistentEntity
