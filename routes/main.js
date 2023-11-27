const express = require("express")
const router = express.Router()
const fs = require("fs")
const path = require("path")
const { validateJWT, checkLoggedIn } = require("../utils/middleware")
const getPresent = require("../utils/getPresent")
const getQueuedStudents = require("../utils/getQueue")
const { getEntries, getStudents, getQueue } = require("../utils/db")

function getTimeRange(unix = new Date()) {
  const min = new Date(unix)
  const max = new Date(unix)
  min.setHours(0)
  max.setHours(16)
  return {min: min.getTime(), max: max.getTime()}
}

router.get("/", validateJWT, (req, res) => {
  const present = getPresent().map(s => ({...s, isPresent: true}))
  const queued = getQueuedStudents()
  const students = [...present, ...queued]
	res.render("index", {students, queued: JSON.stringify(queued), present: JSON.stringify(present), loggedIn: checkLoggedIn})
})

router.get("/login", validateJWT, (req, res) => res.render("login", {loggedIn: checkLoggedIn}))

router.get("/dashboard", validateJWT, (req, res) => {
  const { date, name } = req.query
  let { min, max } = getTimeRange()
  let studentName = ""
  if (name) studentName = name.toLowerCase()
  if (!isNaN(new Date(date))) {
    ({ min, max } = getTimeRange(new Date(`${date}T0${new Date().getTimezoneOffset() / 60}:00:00.000Z`).getTime()))
  }
  const data = getStudents()
  const students = getEntries().filter(entry => entry.unix > min && entry.unix < max).filter(entry => {
    const student = data.find(student => student.id === entry.id)
    const first = student.first.toLowerCase()
    const last = student.last.toLowerCase()
    return first.includes(studentName) || 
    last.includes(studentName) || 
    `${first} ${last}`.includes(studentName) || 
    student.username.includes(studentName)
  }).map(entry => {
    const student = data.find(student => student.id === entry.id)
    const hasImg = fs.existsSync(path.join(__dirname, "public/imgs", `${student.username}.jpeg`))
    return {...student, ...entry, hasImg}
  }).sort((a, b) => b.unix - a.unix)
  res.render("dashboard", {students, loggedIn: checkLoggedIn})
})

router.get("/students", (req, res) => {
  const { name } = req.query
  let studentName = ""
  if (name) studentName = name.toLowerCase()
  const students = getStudents().filter(student => {
    const first = student.first.toLowerCase()
    const last = student.last.toLowerCase()
    return first.includes(studentName) || 
    last.includes(studentName) || 
    `${first} ${last}`.includes(studentName) || 
    student.username.includes(studentName)
  }).map(student => {
    const hasImg = fs.existsSync(path.join(__dirname, "../public/imgs", `${student.username}.jpeg`))
    return {...student, hasImg}
  })
  res.render("students", {students, loggedIn: checkLoggedIn})
})

router.get("/students/:username", (req, res) => {
  const student = getStudents().find(student => student.username === req.params.username)
  if (!student) return res.sendStatus(404)
  const hasImg = fs.existsSync(path.join(__dirname, "../public/imgs", `${student.username}.jpeg`))
  const entries = getEntries().filter(entry => entry.id === student.id).sort((a, b) => b.unix - a.unix)
  res.render("student", {entries, student: {...student, hasImg}, loggedIn: checkLoggedIn})
})

module.exports = router