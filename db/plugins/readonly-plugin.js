const Utils = require('../../node_modules/sequelize/lib/utils')

function readOnlyPlugin (sequelize) {
  sequelize.addHook('beforeCreate', deleteReadOnlyColumns)
  sequelize.addHook('beforeUpdate', deleteReadOnlyColumns)
}

function deleteReadOnlyColumns (instance, options) {
  for (let col in instance._changed) {
    if (instance.rawAttributes[col].readOnly === true) {
      instance.constructor._virtualAttributes.push(col)
      instance.constructor._hasVirtualAttributes = !!instance.constructor._virtualAttributes.length
      instance.constructor._isVirtualAttribute = Utils._.memoize(key => instance.constructor._virtualAttributes.indexOf(key) !== -1)
      instance.tableAttributes = Utils._.omit(instance.rawAttributes, instance.constructor._virtualAttributes)
    }
  }
  console.log(instance)
  console.log(options)
}

module.exports = readOnlyPlugin
