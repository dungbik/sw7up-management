# Installation

```bash
$ touch lib/db.js (Fill with Example.)
$ npm install
$ npm start
```

<br>

## Example

```js
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "host",
  user: "user",
  database: "database",
  password: "password",
});

connection.connect();

module.exports = connection;
```
