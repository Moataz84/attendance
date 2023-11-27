const fs = require("fs")
const path = require("path")

function readFile(file) {
  const buffer = fs.readFileSync(path.join(__dirname, file), "utf8")
  return JSON.parse(buffer)
}

function getStudents() {
  return readFile("../JSON/students.json")
}

function getUsers() {
  return readFile("../JSON/users.json")
}

function getEntries() {
  return readFile("../JSON/entries.json")
}

function getQueue() {
  return readFile("../JSON/queue.json")
}

function writeQueue(entry) {
  const queue = getQueue()
  fs.writeFileSync(path.join(__dirname, "../JSON/queue.json"), JSON.stringify([...queue, entry], null, 2))
}

function deleteQueue(id) {
  const queue = getQueue()
  fs.writeFileSync(path.join(__dirname, "../JSON/queue.json"), JSON.stringify(queue.filter(entry => entry.id !== id), null, 2))
}

function writeEntry(entry) {
  const entries = getEntries()
  fs.writeFileSync(path.join(__dirname, "../JSON/entries.json"), JSON.stringify([...entries, entry], null, 2))
}

module.exports = { getUsers, getStudents, getEntries, getQueue, writeQueue, deleteQueue, writeEntry }