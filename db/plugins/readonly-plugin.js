function readOnlyPlugin (sequelize) {
  sequelize.addHook('beforeCreate', deleteReadOnlyColumns)
  sequelize.addHook('beforeUpdate', deleteReadOnlyColumns)
}

function deleteReadOnlyColumns (instance, options) {
  for (let col in instance._changed) {
    if (instance.rawAttributes[col].readOnly === true) {
      instance._changed[col] = false
      instance.setDataValue(col, undefined)
    }
  }
  console.log(instance)
  console.log(options)
}

module.exports = readOnlyPlugin
