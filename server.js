const  express = require("express");
const pagination = require("./pagination");
const adapter = require("./adapter");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3001
app.listen(port);

app.use(express.json());
// app.use(express.urlencoded({ extended: false }))
app.get("/", function (req, res) {
	res.send("Hello World!");
});
app.use(adapter);
app.use(pagination);
app.use("/users", require('./routes/users'));

console.log(`Express started on port ${port}`);