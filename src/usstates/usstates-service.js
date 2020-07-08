const USStatesService = {
  getAllUSStates(knex) {
    return knex.select('*').from('usstates')
  },

  insertUSState(knex, newUSStates) {
    return knex
      .insert(newUSStates)
      .into('usstates')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },

  getById(knex, stateid) {
    return knex
      .from('usstates')
      .select('*')
      .where('stateid', stateid)
      .first()
  },
}

module.exports = USStatesService
