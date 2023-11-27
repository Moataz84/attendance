function showHistory(e) {
  let dateString = ""
  const dates = JSON.parse(e.target.getAttribute("data-history")).map(date => new Date(date).toLocaleString())
  dates.forEach((date, index) => {
    dateString += date
    if (index !== 2) dateString += "\n"
  })
  alert(`Last 3 sign ins for ${e.target.textContent}\n\n${dateString}`)
}

let timeouts = []
const students = document.querySelector(".students")

let present = JSON.parse(students.getAttribute("data-present"))
let queued = JSON.parse(students.getAttribute("data-queued"))

students.removeAttribute("data-present")
students.removeAttribute("data-queued")

function listenForQueueExpiry() {
  timeouts.forEach(timeout => clearTimeout(timeout))
  timeouts = []
  queued.forEach(entry => {
    const expire = entry.unix + 600000
    const timeLeft = expire - new Date().getTime()
    const timeout = setTimeout(() => {
      queued = queued.filter(e => entry.id !== e.id)
      displayEntries()
    }, timeLeft)
    timeouts.push(timeout)
  })
}

function displayEntries() {
  students.innerHTML = "";
  [...present.map(e => ({...e, isPresent: true})), ...queued].forEach(student => {
    students.insertAdjacentHTML(
      "beforeend",
      `<div class="student present">
        <a href="/students/${student.username}">
          <img src="imgs/${student.hasImg? student.username : "noimg"}.jpeg">
        </a>
        <div class="active ${student.isPresent? "green" : "yellow"}"></div>
        <p onclick="showHistory(event)" data-history="[${student.history}]">${student.first} ${student.last}</p>
      </div>`
    )
  })
}

listenForQueueExpiry()

socket.on("scanned", data => {
  present = data.present
  queued = data.queued
  displayEntries()
})

socket.on("student-sent", data => {
  queued = data
  displayEntries()
  listenForQueueExpiry()
})

socket.on("signed-out", data => {
  present = data
  displayEntries()
})