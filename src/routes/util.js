export function createLookup(Repository) {
  return (req, res, next) => {
    Repository.findById(req.params.id)
      .then((entity) => {
        if (entity) {
          req.entity = entity
          next()
        } else {
          res.sendStatus(404)
        }
      })
      .catch(next)
  }
}
