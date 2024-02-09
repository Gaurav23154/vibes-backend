const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose")
const { mongoUrl } = require("./keys")
const cors = require("cors")

app.use(cors())
require("./models/user")
app.use(express.json())
app.use(require("./routes/auth"))
mongoose.connect(mongoUrl)

mongoose.connection.on("connected", () => {
    console.log("successfully connected to mongo")
})

mongoose.connection.on("error", () => {
    console.log("not connected to mongo")
})

app.get("/", (req, res) => {
    res.json("hello word")
})

// app.get("/about", (req, res) => {
//     res.json(data)
// })

app.listen(PORT, () => {
    console.log("server is running on " + PORT)
})