import DatabaseManager from "../DatabaseManager.js";

export default class convertModel{
    #dbManager;
    constructor(){
        this.#dbManager = new DatabaseManager('./old.db');
    }
    async IntializeTable(){
        await this.#dbManager.OpenDatabase();
        
    }
}