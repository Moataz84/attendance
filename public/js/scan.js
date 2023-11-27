const previewImage = document.querySelector(".preview-image")

let startTime
let difference
let keys = []
let timeout = setTimeout(() => {}, 0)

window.addEventListener("keydown", e => {
  if (!startTime) startTime = new Date().getTime()
  if (e.code.startsWith("Digit")) keys.push(e.key)
  if (e.code === "Enter") {
    difference = new Date().getTime() - startTime
    const keysLength = keys.length === 8 || keys.length === 9
    if (difference < 230 && keysLength) {      
      const id = keys.toString().replace(/,/g, "")
      socket.emit("signed-in", parseInt(id))
      socket.on("show-scanned", data => {
        clearTimeout(timeout)
        previewImage.src = ""
        previewImage.style.display = "none"
        const { hasImg, username } = data
        previewImage.src = `imgs/${hasImg? username : "noimg"}.jpeg`
        previewImage.style.display = "block"
        timeout = setTimeout(() => {
          previewImage.src = ""
          previewImage.style.display = "none"
        }, 2500)
      })
      startTime = difference = null
      keys = []
    }
  }
})