# SW7UP Management

<div align="center">
  <img src="https://img.shields.io/github/license/dungbik/sw7up-management?style=plastict" alt="">
</div>

# Installation

```bash
$ touch lib/db.js (Fill with Example.)
$ npm install
```

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

<br>

# Test

```bash
$ npm start
```
