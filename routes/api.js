const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { getUsers } = require("../utils/db")

router.post("/login", async (req, res) => {
  const user = getUsers().find(user => user.username === req.body.username)
  if (!user) {
    return res.send({msg: "User does not exist"})
  }
  const result = await bcrypt.compare(req.body.password, user.password)
  if (!result) {
    return res.send({msg: "Incorrect password"})
  }
  const accessToken = jwt.sign({username: user.username}, process.env.ACCESS_TOKEN_SECRET)
  res.cookie("JWT-Token", accessToken, {
    maxAge: 1000 * 60 * 60 * 24 * 5
  })
  res.send({msg: "success"})
})

router.post("/logout", (req, res) => {
  res.clearCookie("JWT-Token")
  res.end()
})

module.exports = router