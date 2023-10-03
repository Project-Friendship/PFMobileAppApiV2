const  express = require("express");
const pagination = require("./pagination");
const adapter = require("./adapter");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3001

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
	next();
  });

app.use(express.json());
// app.use(express.urlencoded({ extended: false }))
app.get("/", function (req, res) {
	res.json({message:"Hello World!"});
});
app.use(adapter);
app.use(pagination);

app.use("/users", require('./routes/users'));
app.use("/authenticate", require('./routes/authenticate'));

app.listen(port);
console.log(`Express started on port ${port}`);