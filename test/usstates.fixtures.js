function makeUSStatesArray() {
  return [
    {
      stateid: 1,
      name: "Alabama"
    },
    {
      stateid: 2,
      name: "Alaska"
    },
    {
      stateid: 3,
      name: "Arizona"
    },
  ]
}

function makeMaliciousUSState() {
  const maliciousUSState = {
    stateid: 911,
    name: 'Naughty naughty very naughty <script>alert("xss");</script>'
  }
  const expectedUSState = {
    ...maliciousUSState,
    name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
  }
  return {
    maliciousUSState,
    expectedUSState
  }
}

module.exports = {
  makeUSStatesArray,
  makeMaliciousUSState
}
