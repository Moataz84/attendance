const fs = require("fs")
const path = require("path")
const { getQueue, getStudents, getEntries } = require("../utils/db")

function getQueuedStudents() {
  const entries = getEntries()
  const queue = getQueue().filter(q => new Date().getTime() - q.unix < 600000)
  const students = getStudents()
  const queued = queue.filter(entry => {
    const allEntries = queue.filter(e => e.id === entry.id)
    const unix = Math.max(...allEntries.map(e => e.unix))
    if (entry.unix === unix) return entry
  }).map(entry => {
    const signIns = entries.filter(e => e.id === entry.id && e.signedIn).map(e => e.unix).sort((a, b) => a - b)
		const history = signIns.splice(signIns.length - 3, signIns.length)
    const student = students.find(student => student.id === entry.id)
    const hasImg = fs.existsSync(path.join(__dirname, "../public/imgs", `${student.username}.jpeg`))
		return {...student, hasImg, unix: entry.unix, history}
  })
  return queued
}

module.exports = getQueuedStudents