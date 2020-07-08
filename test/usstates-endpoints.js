const expect = require('chai').expect;
const knex = require('knex')
const app = require('../src/app')
const fixtures = require('./usstates.fixtures')
const { makeUSStatesArray } = require('./usstates.fixtures')
const supertest = require('supertest')

describe('USStates Endpoints', function() {
  let db
  const token = `bearer ` + process.env.API_TOKEN;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())
  before('clean the table', () => db.raw('TRUNCATE usstates, reports CASCADE'))
  afterEach('cleanup', () => db.raw('TRUNCATE usstates, reports CASCADE'))

  describe(`GET /api/usstates`, () => {
    context(`Given no usstates`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/usstates')
          .set('Authorization', token)
          .expect(200, [])
      })
    })

    context('Given there are usstates in the database', () => {
      const testUSStates = makeUSStatesArray();

      beforeEach('insert usstates', () => {
        return db
          .into('usstates')
          .insert(testUSStates)
      })
      it(`responds with 200 and all of the usstates`, () => {
        return supertest(app)
          .get('/api/usstates')
          .set('Authorization', token)
          .expect(200, testUSStates)
      })
    })

    context(`Given an XSS attack`, () => {
      const testUSStates = makeUSStatesArray();
      const { maliciousUSState, expectedUSState } = fixtures.makeMaliciousUSState()

      beforeEach('insert malicious usstate', () => {
        return db
          .into('usstates')
          .insert([ maliciousUSState ])
      })
      it('removes XSS attack content', () => {
        return supertest(app)
          .get('/api/usstates')
          .set('Authorization', `bearer ${process.env.API_TOKEN}`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedUSState.name)
          })
      })
    })
  })

  describe(`GET /api/usstates/:stateid`, () => {
    context(`Given no usstates`, () => {
      it(`responds with 404`, () => {
        const stateid = 12345
        return supertest(app)
          .get(`/api/usstates/${stateid}`)
          .set('Authorization', token)
          .expect(404, { error: { message: `Usstate doesn't exist` } })
      })
    })

    context('Given there are usstates in the database', () => {
      const testUSStates = fixtures.makeUSStatesArray()
      beforeEach('insert usstates', () => {
        return db
          .into('usstates')
          .insert(testUSStates)
      })
      it('responds with 200 and the specified usstate', () => {
        const stateid = 2
        const expectedUSState = testUSStates[stateid - 1]
        return supertest(app)
          .get(`/api/usstates/${stateid}`)
          .set('Authorization', token)
          .expect(200, expectedUSState)
      })
    })

    context(`Given an XSS attack usstate`, () => {
      const { maliciousUSState, expectedUSState } = fixtures.makeMaliciousUSState()

      beforeEach('insert malicious usstate', () => {
        return db
          .into('usstates')
          .insert([ maliciousUSState ])
      })
      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/usstates/${maliciousUSState.stateid}`)
          .set('Authorization', `bearer ${process.env.API_TOKEN}`)
          .expect(200)
          .expect(res => {
            expect(res.body.name).to.eql(expectedUSState.name)
          })
      })
    })
  })
});
