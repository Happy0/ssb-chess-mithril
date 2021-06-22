const Value = require('mutant/value')
const computed = require('mutant/computed')
const human = require('human-time')

// Taken from https://github.com/ssbc/patchcore/blob/7dc9300dea6a9c3b6b2fcf98b60b464b08b34624/lib/timeAgo.js
module.exports = function timeAgo (timestamp) {
  var timer
  var value = Value(Time(timestamp))
  return computed([value], (a) => a, {
    onListen: () => {
      timer = setInterval(refresh, 30e3)
      refresh()
    },
    onUnlisten: () => {
      clearInterval(timer)
    }
  }, {
    idle: true
  })

  function refresh () {
    value.set(Time(timestamp))
  }
}

function Time (timestamp) {
  return human(new Date(timestamp))
    .replace(/minute/, 'min')
    .replace(/second/, 'sec')
}