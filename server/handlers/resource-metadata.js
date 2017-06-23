const { Repository } = require('../../db')

class ResourceMetadata {
  constructor (Entity, options = {}) {
    if (Entity == null) throw new Error('Entity argument cannot be null.')
    this.type = Entity
    this.id = options.id || 'id'
    this.var = options.var || lowerFirstLetter(Entity.name)
    this.retrieveMethod = options.retrieveMethod || `retrieve${Entity.name}`
    this.parseIdMethod = options.parseIdMethod ||
      `parse${Entity.name}${upperFirstLetter(this.id)}`
    this.getInclude = () => null
    if (options.parent) {
      if (options.parent.metadata == null) {
        throw new Error('parent.metadata cannot be null.')
      }
      if (options.parent.alias == null) {
        throw new Error('parent.alias cannot be null.')
      }
      this.parent = options.parent
      if (!this.parent.fk) this.parent.fk = computeFk(this.parent.metadata)
      this.parent.metadata.fk = this.parent.fk
      if (!this.parent.eager) {
        this.parent.eager = false
      } else {
        this.parent.metadata.getInclude = () => {
          // FIXME: handle nested includes
          return { model: this.type, as: this.parent.alias }
        }
      }
    }
  }

  parseId (req, id) {
    id = this.type.coerce(id, this.id)

    if (!req.options.pk) req.options.pk = {}
    if (this.fk) {
      req.options.pk[this.fk] = id
    } else {
      req.options.pk[this.id] = id
    }

    return id
  }

  retrieve (req, res, id, options = {}) {
    id = this.parseId(req, id)

    if (isParentLocallyAvailable(res, this)) {
      const parentEntity = res.locals[this.parent.metadata.var]
      const entity = parentEntity[this.parent.alias]
        .find(item => item[this.id] === id)
      return Promise.resolve(entity)
    }

    const findOpt = Object.assign(options, { pk: { [this.id]: id } })
    const include = this.getInclude()
    if (include) {
      if (findOpt.include) {
        findOpt.include.push(this.getInclude())
      } else {
        findOpt.include = [ this.getInclude() ]
      }
    }
    return Repository.find(this.type, findOpt)
  }
}

function lowerFirstLetter (string) {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

function upperFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function computeFk (parentMetadata) {
  return parentMetadata.var + upperFirstLetter(parentMetadata.id)
}

function isParentLocallyAvailable (res, metadata) {
  return metadata.parent && metadata.parent.eager &&
    res.locals[metadata.parent.metadata.var]
}

module.exports = ResourceMetadata
