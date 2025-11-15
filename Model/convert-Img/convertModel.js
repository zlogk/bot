import DatabaseManager from "../DatabaseManager.js";
import * as query from "./query.js";

export default class convertModel {
    #dbManager;
    constructor() {
        this.#dbManager = new DatabaseManager('./old.db');
    }
    async IntializeTable() {
        try {
            let mess = '';
            mess += await this.#dbManager.OpenDatabase();
            mess += await this.#dbManager.CreateTable('convertImg', query.table_convertImg);
            mess += await this.#dbManager.CloseDatabase();
            return mess;
        } catch (err) {
            console.log("IntializeTable convert-img (>.<): " + err);
        }
    }
    async Insert(rows) {
        try {
            const mess = '';
            mess += await this.#dbManager.OpenDatabase();
            mess += await this.#dbManager.Insert('convert-img', ['userId', 'folder', 'folder_source', 'folder_convert', 'filePath', 'created_at'], rows);
            mess += await this.#dbManager.CloseDatabase();
            return mess;
        } catch (err) {
            console.log("Insert convert-img (>.<): " + err);
        }
    }
}