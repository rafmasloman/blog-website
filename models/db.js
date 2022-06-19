const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'blog',
});

db.connect();

const dbQuery = (query, data) => {
  return new Promise((resolve, reject) => {
    db.query(query, data, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

module.exports = { db, dbQuery };
