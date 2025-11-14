import DatabaseManager from "../DatabaseManager.js";
import * as query from "./query.js";

export default class RaspiModel{
    #dbManager;
    constructor(){
        this.#dbManager = new DatabaseManager('./old.db');
    }
    async IntializeTable(){
        await this.#dbManager.OpenDatabase();
        await this.#dbManager.CreateTable('raspiCpu',query.table_raspiCpu);
        await this.#dbManager.CreateTable('raspiRam',query.table_raspiRam);
        await this.#dbManager.CreateTable('raspiDisk',query.table_raspiDisk);
        await this.#dbManager.CreateTable('raspiUptime',query.table_raspiUptime);
        await this.#dbManager.CloseDatabase();
    }
    async InsertCpuRamDiskUptime(arr_rows){
        await this.#dbManager.OpenDatabase();
        await this.#dbManager.Insert('raspiCpu',['temp','load','created_at'],arr_rows[0]);
        await this.#dbManager.Insert('raspiRam',['use','free','mem_percent_used','created_at'],arr_rows[1]);
        await this.#dbManager.Insert('raspiDisk',['use','free','created_at'], arr_rows[2]);
        await this.#dbManager.Insert('raspiUptime',['uptime'],arr_rows[3]);
        await this.#dbManager.Insert('')
        await this.#dbManager.CloseDatabase();
    }
    Update(){

    }
    Detete(){

    }
    Count(){

    }


}