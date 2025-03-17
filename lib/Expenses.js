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
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME
    }).promise();
  }

  async add(data) {
    const [rows] = await this.connex.query(`
      SELECT total
      FROM expenses
      WHERE list_id = ?
      ORDER BY date DESC
      LIMIT 1
    `, data.list_id)

    const total = (rows[0] ? +rows[0].total : 0) + -data.amount;
    await this.connex.query('INSERT INTO expenses SET ?', { ...data, total })

    return total;
  }

  async getList(resurceId, list) {
    const [rows] = await this.connex.query(`
      SELECT
      list_id AS id
      FROM expenses_lists as el
      INNER JOIN users_lists as ul ON el.id = ul.list_id
      WHERE
        ul.user_id = ?
        ${list
        ? 'AND el.name = ?'
        : 'AND ul.is_default_list = 1'
      }
      LIMIT 1;
    `, [resurceId, list?.trim()])

    const listId = rows.length ? rows[0].id : !list ? await this.createDefaultList(user) : null;

    return listId;
  }

  createDefaultList(user) {
    return this.createList(user.id, user.username || user.first_name || 'default', 1)
  }

  async createList(userId, name, is_default_list = 0) {
    const [rows] = await this.connex.query(`
      INSERT INTO \`expenses_lists\` (\`name\`)
      VALUES (?);
    `, name.trim())

    const listId = rows.insertId;

    await this.connex.query(`
      INSERT INTO \`users_lists\` SET ?;
    `, { user_id: userId, list_id: listId, is_default_list })

    return listId;
  }

  async getLists(resourceId) {
    const [rows] = await this.connex.query(`
      SELECT el.name, ul.is_default_list
      FROM expenses_lists as el
      INNER JOIN users_lists as ul ON el.id = ul.list_id
      WHERE ul.user_id = ?
    `, resourceId)

    return rows;
  }
}

module.exports = Expenses;
