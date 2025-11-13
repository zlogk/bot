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
        await this.#dbManager.CloseDatabase();
    }
    async InsertCpu(rows){
        await this.#dbManager.OpenDatabase();
        await this.#dbManager.Insert('raspiCpu',['temp','load','created_at'],rows);
        await this.#dbManager.CloseDatabase();
    }
    Update(){

    }
    Detete(){

    }
    Count(){

    }


}