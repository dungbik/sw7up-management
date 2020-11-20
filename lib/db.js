const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
});

function handleDisconnect() {
  connection.connect(function (err) {
    if (err) {
      console.log("error when connecting to db:", err);
      setTimeout(handleDisconnect, 1000);
    }
  });
}

handleDisconnect();

module.exports = connection;
