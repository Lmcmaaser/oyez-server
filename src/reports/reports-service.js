const ReportsService = {
  getAllReports(knex) {
    return knex.select('*').from('reports')
  },

  insertReport(knex, newReport) {
    return knex
      .insert(newReport)
      .into('reports')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },

  getById(knex, id) {
    return knex
      .from('reports')
      .select('*')
      .where('id', id)
      .first()
  },

  deleteReport(knex, id) {
    return knex('reports')
      .where({ id })
      .delete()
  },

}

module.exports = ReportsService
