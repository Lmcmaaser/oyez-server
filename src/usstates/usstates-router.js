const path = require('path')
const express = require('express')
const xss = require('xss')
const USStatesService = require('./usstates-service')

const usstatesRouter = express.Router()
const jsonParser = express.json()

const serializeUSState = usstate => ({
  stateid: usstate.stateid,
  name: xss(usstate.name)
})

usstatesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    USStatesService.getAllUSStates(knexInstance)
      .then(usstates => {
        res.json(usstates.map(serializeUSState))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { name } = req.body
    const newUSState = { name }

    for (const [key, value] of Object.entries(newUSState))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    newUSState.name = name;

    USStatesService.insertUSState(
      req.app.get('db'),
      newUSState
    )
      .then(usstate => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${usstate.stateid}`))
          .json(serializeUSState(usstate))
      })
      .catch(next)
  })

usstatesRouter
  .route('/:usstate_id')
  .all((req, res, next) => {
    USStatesService.getById(
      req.app.get('db'),
      req.params.usstate_id
    )
      .then(usstate => {
        if (!usstate) {
          return res.status(404).json({
            error: { message: `Usstate doesn't exist` }
          })
        }
        res.usstate = usstate
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeUSState(res.usstate))
  })

module.exports = usstatesRouter
