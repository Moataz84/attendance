const params = new URLSearchParams(window.location.search)
const dateQuery = params.get("date")
const nameQuery = params.get("name")

const dateInput = document.querySelector("#date")
const nameInput = document.querySelector("#student-name")

let date = new Date().toLocaleDateString()
if (dateQuery && !isNaN(new Date(dateQuery))) {
  date = new Date(new Date(dateQuery).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleDateString()
}
dateInput.valueAsDate = new Date(date)

let studentName = ""
if (nameQuery) {
  studentName = nameQuery
  nameInput.value = studentName
}

dateInput.addEventListener("change", e => date = e.target.value)
nameInput.addEventListener("change", e => studentName = e.target.value)

function search(e) {
  e.preventDefault()
  const query = {
    name: studentName,
    date
  }
  if (date === new Date().toLocaleDateString()) {
    delete query.date
  }
  if (studentName === "") {
    delete query.name
  }
  const queryString = new URLSearchParams(query).toString()
  if (queryString.length > 0) return window.location.href = `?${queryString}`
  window.location.href = "/dashboard"
}