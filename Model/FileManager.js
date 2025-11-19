import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

export default class FileManager {
    //CHECK FILE EXIST
    static async exists(filePath) {
        // return fs.promises.access(filePath, fs.constants.R_OK);
        try{
            await fs.promises.access(filePath, fs.constants.R_OK);
            return true;
        }catch(err){
            return false;
        }
    }
    //CHECK FOLDER EXIST
    static async ExistsFolder(folderPath) {
        try {
            await fs.promises.access(folderPath);
            return true;
        } catch {
            return false;
        }
    }

    //CREATE DIRECTORY IF NOT EXISTS
    static async ensureDir(filePath) {
        const dir = path.dirname(filePath);
        try {
            await fs.promises.mkdir(dir, { recursive: true });
            return dir;
        } catch (err) {
            if (err.code !== "EEXIST") throw new Error("ensureDir: " + err);
        }
    }
    //CREATE DIRECTORY
    static async mkDir(folderPath) {
        try {
            await fs.promises.mkdir(folderPath, { recursive: true });
            return folderPath;
        } catch (err) {
            throw err;
        }
    }
    //WRITE - READ - APPEND TEXT
    static async writeText(filePath, content) {
        try {
            await this.ensureDir(filePath);
            await fs.promises.writeFile(filePath, content, { encoding: "utf-8" });
        } catch (err) {
            if (err) throw new Error("writeText: (>.<): " + err);
        }
    }

    static async AppendText(filePath, content) {
        try {
            // if (this.exists(filePath)) {
            //     await fs.promises.appendFile(filePath, content);
            //     return "Nối text thành công!";
            // } else {
            //     return "File không tồn tại!";
            // }
            if (!this.exists(filePath)) throw new Error("File không tồn tại.");
            await fs.promises.appendFile(filePath, content);
        } catch (err) {
            if (err) throw new Error("AppendText: (>.<): " + err);
        }
    }
    static async readText(filePath) {
        try {
            if (this.exists(filePath)) {
                const text = await fs.promises.readFile(filePath, { encoding: "utf-8" }, (err, data) => {
                    if (err) {
                        throw new Error("fs.promises.readFile: (>.<): " + err);
                    } else {
                        return data;
                    }
                });
                return text;
            } else {
                return null;
            }
        } catch (err) {
            if (err) throw new Error("readText: (>.<): " + err);
        }
    }
    //BINARY (BUFFER)
    static async writeBirary(filePath, buffer) {
        try {
            await this.ensureDir(filePath);
            await fs.promises.writeFile(filePath, buffer);
        } catch (err) {
            if (err) throw new Error("writeBirary: (>.<): " + err);
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
            if (err) throw new Error("readBinary: (>.<): " + err);
        }
    }
    //STREAM
    static async writeStream(filePath, readAbleStream) {
        // await this.ensureDir(filePath);
        // return new Promise((resolve, reject) => {
        //     const ws = fs.createWriteStream(filePath);
        //     readAbleStream.pipe(ws);
        //     ws.on("finish", () => {
        //         resolve({ success: true, path: filePath });
        //     });
        //     ws.on("error", err => reject(err));
        //     readAbleStream.on("error", err => reject(err));
        // });
        let tempPath = '';
        try {
            await this.ensureDir(filePath);
            tempPath = filePath + '.part';
            await pipeline(readAbleStream, fs.createWriteStream(tempPath));

            await fs.promises.rename(tempPath, filePath);
            return { success: true, path: filePath };
        } catch (err) {
            if (FileManager.exists(tempPath)) {
                await fs.promises.unlink(tempPath);
            }
            throw err;
        }
    }
    static readStream(filePath) {
        const realPath = path.resolve(filePath);
        if (!this.exists(realPath)) return null;
        return new Promise((resolve, reject) => {
            const rs = fs.createReadStream(realPath);
            rs.on("open", () => {
                resolve({ ready: true, path: realPath, stream: rs });
            })
            rs.on("error", (err) => reject(err));
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
            if (err) throw new Error("readBinary: (>.<): " + err);
        }
    }
    //list file-folder of folder
    static async listOfFolder(folderPath) {
        try {
            if (this.ExistsFolder(folderPath)) {
                return await fs.promises.readdir(folderPath);
            }
        } catch (err) {
            throw err;
        }
    }
    /**
     * Kiểm tra đường dẫn là file hay folder. nếu là file trả về "file".....
     * @param {string} path path
     * @returns {Promise} "file" || "folder" || "other"
     */
    static async checkIsFolderIsFile(path) {
        try {
            const stat = await fs.promises.stat(path);
            if (stat.isFile()) {
                return 'file'
            }
            if (stat.isDirectory()) {
                return 'folder';
            }
            return 'other';
        } catch (err) { return false; }
    }
    static getNameFileNotExt(name_path) {
        return path.basename(name_path, path.extname(name_path));
    }
    // static async _isFileStreamAvailable(filePath) {

    // }
    // static readStream(filePath) {
    //     if (!this.exists(filePath)) return null;
    //     return new Promise((resolve, reject) => {
    //         const rs = fs.createReadStream(filePath);
    //         rs.on("open", () => {
    //             resolve({ ready: true, path: filePath, stream: rs });
    //         })
    //         rs.on("error", (err) => reject(err));
    //     })
    // }
    static fileStreamReady(filePath, interval = 500) {
        return new Promise((resolve, reject) => {
            const timer = setInterval(async () => {
                if (this.exists(filePath)) {
                    // if (await this.readStream(filePath).ready) {
                    //     clearInterval(timer);
                    //     resolve(true);
                    // }
                    clearInterval(timer);
                    resolve(true);
                }
            }, interval);
        });
    }

}
