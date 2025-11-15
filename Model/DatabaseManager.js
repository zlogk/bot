import sqlite3 from 'sqlite3';

export default class DatabaseManager {
    #db;
    constructor(path_database) {
        this.path = path_database;
        this.#db = null;
    }
    #GetDb() {
        return new Promise((res, rej) => {
            const db = new sqlite3.Database(this.path, sqlite3.OPEN_READWRITE, (err) => {
                if (err) return rej(err);
                res(db);
            });
        });
    }
    async OpenDatabase() {
        try {
            this.#db = await this.#GetDb();
        } catch (err) {
            console.log("Không thể kết nối database: " + err);
        }
    }
    async CloseDatabase() {
        await this.#db.close((err) => {
            console.log("Thông tin đóng database: " + err);
        });
    }
    #ExecuteQuery(sql) {
        return new Promise((res, rej) => {
            this.#db.exec(sql, (err) => {
                if (err) return rej(err);
                res('success!');
            });
        });
    }

    async CreateTable(tableName, name_type_constraints) {
        try {
            const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${name_type_constraints});`;
            return await this.#ExecuteQuery(sql);
        } catch (err) {
            return err;
        }
    }
    /**
     * Insert data into table.
     * @param {string} table table name
     * @param {Array} cols columns
     * @param {Array} rows row
     */
    Insert(table, cols, rows) {
        if (!Array.isArray(cols) || !Array.isArray(rows)) {
            throw new Error("column and rows must be an Array (>.<)");
        }
        if (cols.length !== rows.length) {
            throw new Error("column and rows must be equal (>.<)");
        }
        const colsStr = cols.join(', ');
        const placeholders = rows.map(() => '?').join(', ');
        const sql = `INSERT INTO ${table}(${colsStr}) VALUES (${placeholders})`;
        return new Promise((res, rej) => {
            this.#db.run(sql, rows, (err) => {
                if (err) return rej(err);
                res('Done (>.<)');
            });
        });
    }
    Update() {

    }
    Delete() {

    }

    // async fetchAll(db, { columns, }) {
    //     return new Promise((res, rej) => {
    //         let sql = `SELECT ${columns} FROM ${table} WHERE ${colWhere} LIKE ?`;
    //         db.all(sql, params, (err, rows) => {
    //             if (err) return rej(err);
    //             res(rows);
    //         });
    //     });
    // }
    GetAll() {

    }
    GetRecentData(limit) {

    }
    FindById(id) {

    }
    FindByName() {

    }
}
