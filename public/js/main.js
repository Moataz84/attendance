const socket = io("/")

async function logout() {
  await fetch("/api/logout", {method: "POST"})
  window.location.href = "/"
}

function sendStudent(e) {
  e.preventDefault()
  const username = window.location.href.split("/").splice(-1)[0]
  socket.emit("send-student", username)
  window.location.href = "/"
}

function signOutStudent(e) {
  e.preventDefault()
  const username = window.location.href.split("/").splice(-1)[0]
  socket.emit("sign-out-student", username)
  window.location.href = "/"
}