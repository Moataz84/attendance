const fs = require("fs")
const path = require("path")
const { getEntries, getStudents } = require("../utils/db")

function getPresent() {
  const entries = getEntries()
	const students = getStudents()
	const present = entries.filter(entry => {
		const allEntries = entries.filter(e => e.id === entry.id)
		const unix = Math.max(...allEntries.map(e => e.unix))
		if (entry.unix === unix) return entry
	}).filter(entry => entry.signedIn).map(entry => {
		const signIns = entries.filter(e => e.id === entry.id && e.signedIn).map(e => e.unix).sort((a, b) => a - b)
		const history = signIns.splice(signIns.length - 3, signIns.length)
		const student = students.find(student => student.id === entry.id)
		const hasImg = fs.existsSync(path.join(__dirname, "../public/imgs", `${student.username}.jpeg`))
		return {...student, hasImg, unix: entry.unix, history}
	})
  return present
}

module.exports = getPresent