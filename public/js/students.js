const params = new URLSearchParams(window.location.search)
const nameQuery = params.get("name")

const nameInput = document.querySelector("#student-name")

let studentName = ""
if (nameQuery) {
  studentName = nameQuery
  nameInput.value = studentName
}

nameInput.addEventListener("change", e => studentName = e.target.value)

function searchStudents(e) {
  e.preventDefault()
  const query = {
    name: studentName
  }
  if (studentName === "") {
    delete query.name
  }
  const queryString = new URLSearchParams(query).toString()
  if (queryString.length > 0) return window.location.href = `?${queryString}`
  window.location.href = "/students"
}