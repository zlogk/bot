import fs from 'fs';
import path from 'path';

class FileManager{
    //tao thu muc neu chua ton tai
    static async ensureDir(filePath){
        const dir = path.dirname(filePath);
        try{
            await fs.promises.mkdir(dir,{recursive:true});
        }catch(err){
            if(err.code !== "EEXIST") throw err;
        }
    }
    //ghi file text
    static async writeText(filePath, content){
        try{
            await this.ensureDir(filePath);
        }catch(err){
            console.log(err);
        }
    }
}

