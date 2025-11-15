import DatabaseManager from "../DatabaseManager.js";
import * as query from "./query.js";

export default class RaspiModel {
    #dbManager;
    constructor() {
        this.#dbManager = new DatabaseManager('./old.db');
    }
    async IntializeTable() {
        try {
            let msg = '';
            msg += await this.#dbManager.OpenDatabase();
            msg += await this.#dbManager.CreateTable('raspiCpu', query.table_raspiCpu);
            msg += await this.#dbManager.CreateTable('raspiRam', query.table_raspiRam);
            msg += await this.#dbManager.CreateTable('raspiDisk', query.table_raspiDisk);
            msg += await this.#dbManager.CreateTable('raspiUptime', query.table_raspiUptime);
            msg += await this.#dbManager.CreateTable('raspiNetwork', query.table_raspiNetwork);
            msg += await this.#dbManager.CloseDatabase();
            return msg;
        } catch (err) {
            console.log("IntializeTable raspi (>.<): " + err);
        }
    }
    async InsertCpuRamDiskUptime(arr_rows) {
        try {
            let msg ='';
            msg += await this.#dbManager.OpenDatabase();
            msg += await this.#dbManager.Insert('raspiCpu', ['temp', 'load', 'created_at'], arr_rows[0]);
            msg += await this.#dbManager.Insert('raspiRam', ['use', 'total', 'mem_percent_used', 'created_at'], arr_rows[1]);
            msg += await this.#dbManager.Insert('raspiDisk', ['use', 'total', 'free', 'disk_percent_used', 'created_at'], arr_rows[2]);
            msg += await this.#dbManager.Insert('raspiUptime', ['uptime', 'created_at'], arr_rows[3]);
            msg += await this.#dbManager.Insert('raspiNetwork', ['public_ip', 'LAN_ip', 'created_at'], arr_rows[4]);
            msg += await this.#dbManager.CloseDatabase();
            return msg;
        } catch (err) {
            console.log("InsertCpuRamDiskUptime raspi (>.<): " + err);
        }
    }
    Update() {

    }
    Detete() {

    }
    Count() {

    }


}