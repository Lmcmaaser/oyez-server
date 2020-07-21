const expect = require('chai').expect;
const knex = require('knex');
const app = require('../src/app');
const fixtures = require('./reports.fixtures');
const { makeReportsArray } = require('./reports.fixtures');
const supertest = require('supertest');


describe('Reports Endpoints', function() {
  let db;
  const token = `bearer ` + process.env.API_TOKEN;
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db('reports').truncate());
  afterEach('cleanup', () => db('reports').truncate());

  describe(`GET /api/reports`, () => {
    context(`Given no reports`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/reports')
          .set('Authorization', token)
          .expect(200, [])
      });
    })
    context('Given there are reports in the database', () => {
      const testReports = makeReportsArray();

      beforeEach('insert reports', () => {
        return db
          .into('reports')
          .insert(testReports)
      });
      it (`responds with 200 and all of the reports`, () => {
        return supertest(app)
          .get('/api/reports')
          .set('Authorization', token)
          .expect(200, testReports)
      });
    })
  })

  describe(`GET /api/reports/:reports_id`, () => {
    context(`Given no reports`, () => {
      it (`responds with 404`, () => {
        const reportId = 123456;
        return supertest(app)
          .get(`/api/reports/${reportId}`)
          .set('Authorization', token)
          .expect(404, { error: { message: `Report doesn't exist` } })
      });
    })
    context('Given there are reports in the database', () => {
      const testReports = makeReportsArray();

      beforeEach('insert reports', () => {
        return db
          .into('reports')
          .insert(testReports)
      });

      it('responds with 200 and the specified report', () => {
        const reportid = 2
        const expectedReport = testReports[reportid - 1]
        return supertest(app)
          .get(`/api/reports/${reportid}`)
          .set('Authorization', token)
          .expect(200, expectedReport)
      });
    })
  })
})
