/* global describe it beforeEach */
const chai = require('chai')
// const chaiAsPromised = require('chai-as-promised')
const Entity = require('../../../core/entity')

// chai.use(chaiAsPromised)
const expect = chai.expect

describe('observer', () => {
  let entity = null

  class SomeEntity extends Entity {
    static get properties () {
      return {
        name: {
          type: String,
          value: 'abc',
          observer: '_onNameChanged'
        }
      }
    }

    _onNameChanged (newName, oldName) {
      this.nameChangedArgs = [newName, oldName]
    }
  }

  beforeEach(() => {
    entity = new SomeEntity()
  })

  it('should not be called on construction on properties with default values',
    () => {
      expect(entity).to.not.have.property('nameChangedArgs')
    })

  it('should not be called on assignment of same value', () => {
    entity.name = 'abc'

    expect(entity).to.not.have.property('nameChangedArgs')
  })

  it('should be called on construction with new value', () => {
    entity = new SomeEntity({name: 'xyz'})

    expect(entity).to.have.property('nameChangedArgs')
    expect(entity.nameChangedArgs).to.be.eql(['xyz', 'abc'])
  })

  it('should be called on assignment of new value', () => {
    entity.name = 'xyz'

    expect(entity).to.have.property('nameChangedArgs')
    expect(entity.nameChangedArgs).to.be.eql(['xyz', 'abc'])
  })
})

describe('itemObserver', () => {
  let entity = null

  class Person extends Entity {
    static get properties () {
      return {
        name: {
          type: String,
          notify: true
        },
        age: {
          type: Number
        }
      }
    }
  }

  class SomeEntity extends Entity {
    static get properties () {
      return {
        person: {
          type: Person,
          value: () => ({ name: 'bob', age: 20 }),
          itemObserver: {
            name: '_onPersonNameChanged',
            age: '_onPersonAgeChanged'
          }
        }
      }
    }

    _onPersonNameChanged (newName, oldName) {
      this.nameChangedArgs = [newName, oldName]
    }

    _onPersonAgeChanged (newAge, oldAge) {
      this.ageChangedArgs = [newAge, oldAge]
    }
  }

  beforeEach(() => {
    entity = new SomeEntity()
  })

  it('should not be called on construction on properties with default values',
    () => {
      expect(entity).to.not.have.property('nameChangedArgs')
    })

  it('should be called on construction with new value', () => {
    entity = new SomeEntity({ person: { name: 'alice' } })

    expect(entity).to.have.property('nameChangedArgs')
    expect(entity.nameChangedArgs).to.be.eql(['alice', undefined])
  })

  it('should be called on notifiable property change', () => {
    entity.person.name = 'alice'

    expect(entity).to.have.property('nameChangedArgs')
    expect(entity.nameChangedArgs).to.be.eql(['alice', 'bob'])
  })

  it('should not be called on non notifiable property change', () => {
    entity.person.age = 10

    expect(entity).to.not.have.property('ageChangedArgs')
  })
})

describe('arrayObserver', () => {
  it('is invalid if declared inside a non Array property', () => {
    class SomeEntity extends Entity {
      static get properties () {
        return {
          items: {
            type: Number,
            arrayObserver: {
              insert: '_onItemInsert',
              delete: '_onItemDelete'
            }
          }
        }
      }
    }

    expect(() => new SomeEntity()).to.throw(
      'Misplaced arrayObserver')
  })

  it('is invalid if insert was not declared', () => {
    class SomeEntity extends Entity {
      static get properties () {
        return {
          items: {
            type: Array,
            arrayObserver: {
              delete: '_onItemDelete'
            }
          }
        }
      }
    }

    expect(() => new SomeEntity()).to.throw("must have 'insert' and 'delete'")
  })

  it('is invalid if delete was not declared', () => {
    class SomeEntity extends Entity {
      static get properties () {
        return {
          items: {
            type: Array,
            arrayObserver: {
              insert: '_onItemInsert'
            }
          }
        }
      }
    }

    expect(() => new SomeEntity()).to.throw("must have 'insert' and 'delete'")
  })

  it('is invalid if insert function does not exists', () => {
    class SomeEntity extends Entity {
      static get properties () {
        return {
          items: {
            type: Array,
            arrayObserver: {
              insert: '_onItemInsert',
              delete: '_onItemDelete'
            }
          }
        }
      }

      _onItemDelete (deletedItem) {}
    }

    expect(() => new SomeEntity()).to.throw(
      'not found in SomeEntity prototype')
  })

  it('is invalid if delete function does not exists', () => {
    class SomeEntity extends Entity {
      static get properties () {
        return {
          items: {
            type: Array,
            arrayObserver: {
              insert: '_onItemInsert',
              delete: '_onItemDelete'
            }
          }
        }
      }

      _onItemInsert (insertedItem) {}
    }

    expect(() => new SomeEntity()).to.throw(
      'not found in SomeEntity prototype')
  })
})

describe('Observed array mutation with', () => {
  let entity = null

  class SomeEntity extends Entity {
    static get properties () {
      return {
        observeCount: {
          type: Object,
          // parenthesis are necessary so the standard linter don't confuse
          // the returned object with a function
          value: () => ({
            insert: [0, 0, 0, 0, 0],
            delete: [0, 0, 0, 0, 0]
          })
        },
        items: {
          type: Array,
          value: () => [ 0, 1, 2 ],
          arrayObserver: {
            insert: '_onItemInsert',
            delete: '_onItemDelete'
          }
        }
      }
    }

    _onItemInsert (insertedItem) {
      this.observeCount.insert[insertedItem]++
    }

    _onItemDelete (deletedItem) {
      this.observeCount.delete[deletedItem]++
    }
  }

  beforeEach(() => {
    entity = new SomeEntity()
  })

  it('new instance should not trigger insert on the default items', () => {
    expect(entity.observeCount.insert).to.be.eql([0, 0, 0, 0, 0])
    expect(entity.observeCount.delete).to.be.eql([0, 0, 0, 0, 0])
  })

  it('push should trigger insert on the added items', () => {
    entity.items.push(3, 4)

    expect(entity.observeCount.insert).to.be.eql([0, 0, 0, 1, 1])
    expect(entity.observeCount.delete).to.be.eql([0, 0, 0, 0, 0])
  })

  it('unshift should trigger, on the added items, one insert, and on the ' +
    'present items, one delete and one insert', () => {
    entity.items.unshift(3, 4)

    expect(entity.observeCount.insert).to.be.eql([1, 1, 1, 1, 1])
    expect(entity.observeCount.delete).to.be.eql([1, 1, 1, 0, 0])
  })

  it('pop should trigger delete on the removed item', () => {
    entity.items.pop()

    expect(entity.observeCount.insert).to.be.eql([0, 0, 0, 0, 0])
    expect(entity.observeCount.delete).to.be.eql([0, 0, 1, 0, 0])
  })

  it('shift should trigger, on the removed item, one delete, and on the ' +
    'present items, one delete and one insert', () => {
    entity.items.shift()

    expect(entity.observeCount.insert).to.be.eql([0, 1, 1, 0, 0])
    expect(entity.observeCount.delete).to.be.eql([1, 1, 1, 0, 0])
  })

  it('assignment should trigger, on the removed item, one delete, and on the' +
    ' present item, one delete', () => {
    entity.items[1] = 3

    expect(entity.observeCount.insert).to.be.eql([0, 0, 0, 1, 0])
    expect(entity.observeCount.delete).to.be.eql([0, 1, 0, 0, 0])
  })

  it('splice removing one item and adding another should behave as an ' +
    'assignment', () => {
    entity.items.splice(1, 1, 3)

    expect(entity.observeCount.insert).to.be.eql([0, 0, 0, 1, 0])
    expect(entity.observeCount.delete).to.be.eql([0, 1, 0, 0, 0])
  })

  it('splice removing one item and adding two should trigger, ' +
    'on the removed item, one delete, on the added items, one insert, ' +
    'and on the present items located after index, one delete and one insert',
    () => {
      entity.items.splice(1, 1, 3, 4)

      expect(entity.observeCount.insert).to.be.eql([0, 0, 1, 1, 1])
      expect(entity.observeCount.delete).to.be.eql([0, 1, 1, 0, 0])
    })

  it('splice removing two items and adding one should trigger, ' +
    'on the removed items, one delete, on the added item, one insert, ' +
    'and on the present items located after index, one delete and one insert',
    () => {
      entity.items.splice(1, 2, 3)

      expect(entity.observeCount.insert).to.be.eql([0, 0, 0, 1, 0])
      expect(entity.observeCount.delete).to.be.eql([0, 1, 1, 0, 0])
    })
})
