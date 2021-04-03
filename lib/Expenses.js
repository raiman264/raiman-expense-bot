const mysql = require('mysql');

const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME,
} = process.env;

class Expenses {
  connex;

  constructor(token) {
    this.connex = mysql.createConnection({
      host     : DB_HOST,
      user     : DB_USER,
      password : DB_PASS,
      database : DB_NAME
    });
  }

  query(q, args) {
    return new Promise((resolve, reject) => {
      this.connex.query(q, args, (error, results) => {
        if (!error)
          resolve(results);
        else
          reject(error);
      });

    })
  }

  async add(data) {
    const prev = await this.query(`
      SELECT total
      FROM expenses
      WHERE username = ?
      ORDER BY date DESC
      LIMIT 1
    `, data.username)
    const total = (prev[0] ? +prev[0].total : 0) + -data.amount;
    await this.query('INSERT INTO expenses SET ?', {...data, total})

    return total;
  }
}

module.exports = Expenses;
