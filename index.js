const express = require("express")
const http = require("http")
const cookieParser = require("cookie-parser")
const fs = require("fs")
const path = require("path")
const mainRoutes = require("./routes/main")
const apiRoutes = require("./routes/api")
const { getStudents, writeEntry, getEntries, writeQueue, getQueue, deleteQueue } = require("./utils/db")
const getPresent = require("./utils/getPresent")
const getQueuedStudents = require("./utils/getQueue")

if (process.env.NODE_ENV !== "production") require("dotenv").config()

const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server)
const port = 3000

app.set("view engine", "ejs")
app.set('views', path.join(__dirname, 'views'))
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static(path.join(__dirname, "/public")))

app.use("/", mainRoutes)
app.use("/api", apiRoutes)

io.on("connection", socket => {
  socket.on("signed-in", id => {
    const students = getStudents()
    if (!students.map(student => student.id).includes(id)) return
    const entries = getEntries().filter(entry => entry.id === id)
    let signedIn = entries[entries.length - 1]?.signedIn
    if (signedIn === undefined) signedIn = false
    writeEntry({id, unix: new Date().getTime(), signedIn: !signedIn})
    deleteQueue(id)

    const username = students.find(student => student.id === id).username
    const hasImg = fs.existsSync(path.join(__dirname, "public/imgs", `${username}.jpeg`))
    socket.emit("show-scanned", {hasImg, username})
    
    const queued = getQueuedStudents()
    const present = getPresent()
    io.emit("scanned", {present, queued})
  })

  socket.on("send-student", username => {
    const id = getStudents().find(student => student.username === username).id
    const isPresent = getEntries().filter(entry => entry.id === id).splice(-1)[0]?.signedIn
    const studentEntries = getQueue().filter(e => e.id === id)
    let lastTime = studentEntries.splice(-1)[0]?.unix
    if (!lastTime) lastTime = new Date().getTime() - 700000
    if (!isPresent && new Date().getTime() - lastTime > 600000) {
      writeQueue({id, unix: new Date().getTime()})
    }
    const queue = getQueuedStudents()
    io.emit("student-sent", queue)
  })
})

server.listen(port, () => console.log(`http://localhost:${port}`))