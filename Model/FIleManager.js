import fs from 'fs';
import path from 'path';

export default class FileManager {
    //CHECK FILE EXIST
    static exists(filePath) {
        return fs.existsSync(filePath);
    }

    //CREATE DIRECTORY IF NOT EXISTS
    static async ensureDir(filePath) {
        const dir = path.dirname(filePath);
        try {
            await fs.promises.mkdir(dir, { recursive: true });
            return dir;
        } catch (err) {
            if (err.code !== "EEXIST") return "ensureDir: (>.<): " + err;
        }
    }
    //WRITE - READ - APPEND TEXT
    static async writeText(filePath, content) {
        try {
            await this.ensureDir(filePath);
            await fs.promises.writeFile(filePath, content, { encoding: "utf-8" });
        } catch (err) {
            if (err) return "writeText: (>.<): " + err;
        }
    }

    static async AppendText(filePath, content) {
        try {
            if (this.exists(filePath)) {
                await fs.promises.appendFile(filePath, content);
                return "Nối text thành công!";
            } else {
                return "File không tồn tại!";
            }
        } catch (err) {
            if (err) return "AppendText: (>.<): " + err;
        }
    }
    static async readText(filePath) {
        try {
            if (this.exists(filePath)) {
                const text = await fs.promises.readFile(filePath, { encoding: "utf-8" }, (err, data) => {
                    if (err) {
                        return "fs.promises.readFile: (>.<): " + err;
                    } else {
                        return data;
                    }
                });
                return text;
            } else {
                return null;
            }
        } catch (err) {
            if (err) return "readText: (>.<): " + err;
        }
    }
    //BINARY (BUFFER)
    static async writeBirary(filePath, buffer) {
        try {
            let dir = await this.ensureDir(filePath);
            await fs.promises.writeFile(filePath, buffer);
            return "Ghi file tại thư muc: " + dir;
        } catch (err) {
            if (err) return "writeBirary: (>.<): " + err;
        }
    }
    static async readBinary(filePath) {
        try {
            if (this.exists(filePath)) {
                const binary = await fs.promises.readFile(filePath);
                return binary;
            } else {
                return null;
            }
        } catch (err) {
            if (err) return "readBinary: (>.<): " + err;
        }
    }
    //STREAM
    static async writeStream(filePath, readAbleStream){
        await this.ensureDir(filePath);
        return new Promise((resolve,reject)=>{
            const ws = fs.createWriteStream(filePath);
            readAbleStream.pipe(ws);
            ws.on("finish",()=>{
                resolve({success: true, path: filePath});
            });
            ws.on("error",err => reject(err));
            readAbleStream.on("error",err => reject(err));
        });
    }
    // static readStream(filePath){
    //     if(this.exists(filePath)) return null;
    //     return fs.createWriteStream(filePath);
    // }
    static readStream(filePath){
        if(!this.exists(filePath)) return null;
        return new Promise((resolve,reject)=>{
            const rs = fs.createReadStream(filePath);
            rs.on("open",()=>{
                resolve({ready:true, path:filePath, stream: rs});
            })
            rs.on("error",(err)=> reject(err));
        })
    }

    //DELETE 
    static async delete(filePath) {
        try {
            if (this.exists(filePath)) {
                await fs.promises.unlink(filePath);
                return "Xóa file thành công!";
            } else {
                return "File không tồn tại!";
            }
        } catch (err) {
            if (err) return "readBinary: (>.<): " + err;
        }
    }
}
