const path = require('path');
const express = require('express');
const xss = require('xss');
const ReportsService = require('./reports-service');

const reportsRouter = express.Router();
const jsonParser = express.json();
const logger = require('../logger');

const serializeReport = report => ({
  id: report.id,
  code: report.code,
  diagnosis_date: report.diagnosis_date,
  household: report.household,
  diagnosis_type: report.diagnosis_type,
  stateid: report.stateid,
});

reportsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    ReportsService.getAllReports(knexInstance)
      .then(reports => {
        res.json(reports.map(serializeReport))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { code, diagnosis_date, household, diagnosis_type, stateid} = req.body;
    const newReport = { code, diagnosis_date, household, diagnosis_type, stateid };

    for (const [key, value] of Object.entries(newReport)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    newReport.code = code;
    newReport.diagnosis_date = diagnosis_date;
    newReport.household = household;
    newReport.diagnosis_type = diagnosis_type;
    newReport.stateid = stateid;

    ReportsService.insertReport(
      req.app.get('db'),
      newReport
    )
      .then(report => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${report.id}`))
          .json(serializeReport(report))
      })
      .catch(next)
  })

reportsRouter
  .route('/:id')
  .all((req, res, next) => {
    ReportsService.getById(
      req.app.get('db'),
      req.params.id
    )
      .then(report => {
        if (!report) {
          return res.status(404).json({
            error: { message: `Report doesn't exist` }
          });
        }
        res.report = report
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeReport(res.report))
  })
  .delete((req, res, next) => {
    ReportsService.deleteReport(
      req.app.get('db'),
      req.params.id
    )
      .then(numRowsAffected => {
        logger.info(`Report with id ${req.params.id} deleted.`)
        res.status(204).end()
      })
      .catch(next)
  })


module.exports = reportsRouter;
