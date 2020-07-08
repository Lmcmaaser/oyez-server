// function that returns an array of reports

function makeReportsArray() {
  return [
    {
      id: 1,
      code: 85308,
      diagnosis_date:'2020-07-03T07:00:00.000Z',
      household: 5,
      diagnosis_type: 'test',
      stateid: 1
    },
    {
      id: 2,
      code: 85308,
      diagnosis_date:'2020-07-05T07:00:00.000Z',
      household: 2,
      diagnosis_type: 'doctor',
      stateid: 2
    },
    {
      id: 3,
      code: 85308,
      diagnosis_date:'2020-07-01T07:00:00.000Z',
      household: 6,
      diagnosis_type: 'self',
      stateid: 3
    },
  ]
}

module.exports = {
  makeReportsArray,
}
