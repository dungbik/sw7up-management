var iconvLite = require("iconv-lite");

module.exports = {
  getDownloadFilename: function (req, filename) {
    var header = req.headers["user-agent"];

    if (header.includes("MSIE") || header.includes("Trident")) {
      return encodeURIComponent(filename);
    } else if (header.includes("Chrome")) {
      return encodeURIComponent(filename);
    } else if (header.includes("Opera")) {
      return encodeURIComponent(filename);
    } else if (header.includes("Firefox")) {
      return encodeURIComponent(filename);
    }

    return filename;
  },
  getResult: function (db, sql) {
    return new Promise((resolve, reject) => {
      db.query(sql, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  },
};
