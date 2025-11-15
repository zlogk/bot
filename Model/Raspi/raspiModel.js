import DatabaseManager from "../DatabaseManager.js";
import * as query from "./query.js";

export default class RaspiModel {
    #dbManager;
    constructor() {
        this.#dbManager = new DatabaseManager('./old.db');
    }
    async IntializeTable() {
        try {
            await this.#dbManager.OpenDatabase();
            await this.#dbManager.CreateTable('raspiCpu', query.table_raspiCpu);
            await this.#dbManager.CreateTable('raspiRam', query.table_raspiRam);
            await this.#dbManager.CreateTable('raspiDisk', query.table_raspiDisk);
            await this.#dbManager.CreateTable('raspiUptime', query.table_raspiUptime);
            await this.#dbManager.CreateTable('raspiNetwork', query.table_raspiNetwork);
            await this.#dbManager.CloseDatabase();
            return "Đã tạo bảng thành công!";
        } catch (err) {
            console.log("IntializeTable (>.<): " + err);
        }
    }
    async InsertCpuRamDiskUptime(arr_rows) {
        try {
            await this.#dbManager.OpenDatabase();
            await this.#dbManager.Insert('raspiCpu', ['temp', 'load', 'created_at'], arr_rows[0]);
            await this.#dbManager.Insert('raspiRam', ['use', 'total', 'mem_percent_used', 'created_at'], arr_rows[1]);
            await this.#dbManager.Insert('raspiDisk', ['use', 'total', 'free', 'disk_percent_used', 'created_at'], arr_rows[2]);
            await this.#dbManager.Insert('raspiUptime', ['uptime', 'created_at'], arr_rows[3]);
            await this.#dbManager.Insert('raspiNetwork', ['public_ip', 'LAN_ip', 'created_at'], arr_rows[4]);
            await this.#dbManager.CloseDatabase();
            return "Ghi dữ liệu thành công!";
        } catch (err) {
            console.log("InsertCpuRamDiskUptime (>.<): " + err);
        }
    }
    Update() {

    }
    Detete() {

    }
    Count() {

    }


}