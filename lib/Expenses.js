const mysql = require('mysql2');

const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME,
} = process.env;

class Expenses {
  connex;

  constructor() {
    this.connex = mysql.createConnection({
      host     : DB_HOST,
      user     : DB_USER,
      password : DB_PASS,
      database : DB_NAME
    }).promise();
  }

  async add(data) {
    const [rows] = await this.connex.query(`
      SELECT total
      FROM expenses
      WHERE username = ?
      ORDER BY date DESC
      LIMIT 1
    `, data.username)
    console.log(rows);
    const total = (rows[0] ? +rows[0].total : 0) + -data.amount;
    const [res] = await this.connex.query('INSERT INTO expenses SET ?', {...data, total})
    console.log(res);

    return total;
  }
}

module.exports = Expenses;
