const express = require("express");
const app = express();
//const cors = require("cors");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api/accounts", require("./routes/accounts"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/registration", require("./routes/registration"));
app.use("/api/reports", require("./routes/reports"));

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server Listening on ${port}`);
});
