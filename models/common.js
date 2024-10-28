const db = require("../utils/database");
module.exports = {
  insertData: async (table, where) => {
    return db.query(`insert into ${table} set ? ${where}`);
  },
  updateData: async (table, where, data) => {
    return db.query(`update ${table} SET ${data} ${where}`, [data]);
  },
  getData: async (table, where) => {
    return db.query(`select * from ${table} ${where}`);
  },
  deleteData: async (table, where) => {
    return db.query(`Delete from ${table} ${where}`);
  },
  fetchCount: async (table, where) => {
    return db.query(`select  count(*) as total from ${table} ${where}`);
  },
  getSelectedColumn: async (table, where, column) => {
    return db.query(`select ${column} from ${table} ${where}`);
  },
  // filtertags: async (search) => {
  //   let where = ` WHERE tag_name  LIKE '%${search}%'`;
  //   const query = `SELECT * FROM tags ${where} ORDER BY id DESC`;
  //   return db.query(query);
  // },
  // filtertags : async (search) => {
  //   let where = search ? ` WHERE tag_name LIKE '%${search}%'` : '';
  //   const query = `
  //     SELECT 
  //       t.id, 
  //       t.tag_name,
  //       COUNT(u.id) as user_count
  //     FROM tags t
  //     LEFT JOIN (
  //       SELECT 
  //         id, 
  //         SUBSTRING_INDEX(SUBSTRING_INDEX(tags, ',', numbers.n), ',', -1) as tag 
  //       FROM users
  //       INNER JOIN (
  //         SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 
  //         UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
  //       ) numbers ON CHAR_LENGTH(tags) - CHAR_LENGTH(REPLACE(tags, ',', '')) >= numbers.n - 1
  //     ) u ON t.tag_name = u.tag
  //     ${where}
  //     GROUP BY t.id, t.tag_name
  //     ORDER BY user_count DESC, t.id DESC;
  //   `;
  //   return db.query(query);
  // },
  filterTags : async (search, limit, language) => {    
    let whereClause = search ? ` WHERE ${language} LIKE '%${search}%'` : '';
    
    const query = `
      SELECT 
        t.id, 
        t.${language} as tag_name,
        COUNT(u.id) as user_count
      FROM tags_list t
      LEFT JOIN (
        SELECT 
          id, 
          SUBSTRING_INDEX(SUBSTRING_INDEX(tags, ',', numbers.n), ',', -1) as tag 
        FROM users
        INNER JOIN (
          SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 
          UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
        ) numbers ON CHAR_LENGTH(tags) - CHAR_LENGTH(REPLACE(tags, ',', '')) >= numbers.n - 1
      ) u ON t.${language} = u.tag
      ${whereClause}
      GROUP BY t.id, t.${language}
      ORDER BY user_count DESC, t.id DESC
      LIMIT ${limit};
    `;
    
    return db.query(query);
  },
  insertInvoiceData: async (data) => {
    return db.query("insert into  invoice_detail set ?", [data]);
  },
  get_invoice_detailby_id: async (id) => {
    return db.query("select * from invoice_detail where invoice_no = ?", [id]);
  },
};
