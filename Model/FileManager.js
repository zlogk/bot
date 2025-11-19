import fs from 'fs';
import path, { resolve } from 'path';
import { pipeline } from 'stream/promises';

export default class FileManager {
    //CHECK FILE EXIST
    static exists(filePath) {
        return new Promise(async (resolve, reject) => {
            try {
                await fs.promises.access(filePath, fs.constants.R_OK);
                resolve(true);
            } catch (err) {
                resolve(false);
            }
        });
    }
    //CHECK FOLDER EXIST
    static ExistsFolder(folderPath) {
        return new Promise(async (resolve, reject) => {
            try {
                await fs.promises.access(folderPath);
                resolve(true);
            } catch {
                reject(false);
            }
        });
    }

    //CREATE DIRECTORY IF NOT EXISTS
    static ensureDir(filePath) {
        return new Promise(async (resolve, reject) => {
            const dir = path.dirname(filePath);
            try {
                await fs.promises.mkdir(dir, { recursive: true });
                resolve(dir);
            } catch (err) {
                if (err.code !== "EEXIST") reject("ensureDir: " + err);
            }
        });
    }
    //CREATE DIRECTORY
    static mkDir(folderPath) {
        return new Promise(async (resolve, reject) => {
            try {
                await fs.promises.mkdir(folderPath, { recursive: true });
                resolve(folderPath);
            } catch (err) {
                reject(err);
            }
        });
    }
    //WRITE - READ - APPEND TEXT
    static writeText(filePath, content) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.ensureDir(filePath);
                await fs.promises.writeFile(filePath, content, { encoding: "utf-8" });
                resolve(content);
            } catch (err) {
                reject(err);
            }
        });
    }

    static AppendText(filePath, content) {
        return new Promise(async (resolve, reject) => {
            try {
                const check = await this.exists(filePath);
                if (!check) reject('File not found.');
                await fs.promises.appendFile(filePath, content);
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }
    static readText(filePath) {
        return new Promise(async (resolve, reject) => {
            try {
                const check = await this.exists(filePath);
                if (check) {
                    const text = await fs.promises.readFile(filePath, { encoding: "utf-8" });
                    resolve(text);
                } else {
                    reject('File not found.');
                }
            } catch (err) {
                reject(err);
            }
        });
    }
    //BINARY (BUFFER)
    static writeBirary(filePath, buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.ensureDir(filePath);
                await fs.promises.writeFile(filePath, buffer);
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }
    static readBinary(filePath) {
        return new Promise(async (reolve, reject) => {
            try {
                const check = await this.exists(filePath);
                if (check) {
                    const binary = await fs.promises.readFile(filePath);
                    resolve(binary);
                } else {
                    reject("File not found");
                }
            } catch (err) {
                reject(err);
            }
        });
    }
    //STREAM
    static writeStream(filePath, readAbleStream) {
        return new Promise(async (resolve, reject) => {
            let tempPath = '';
            try {
                await this.ensureDir(filePath);
                tempPath = filePath + '.part';
                await pipeline(readAbleStream, fs.createWriteStream(tempPath));

                await fs.promises.rename(tempPath, filePath);
                resolve({ success: true, path: filePath });
            } catch (err) {
                if (FileManager.exists(tempPath)) {
                    await fs.promises.unlink(tempPath);
                }
                reject(err);
            }
        });
    }
    static readStream(filePath) {
        // const fileExist = await this.exists(filePath);
        // if (!fileExist) {
        //     console.log("File không tồn tại: ", filePath);
        //     return null;
        // }
        // return new Promise((resolve, reject) => {
        //     const rs = fs.createReadStream(filePath);
        //     rs.on("open", () => {
        //         resolve({ ready: true, path: filePath, stream: rs });
        //     })
        //     rs.on("error", () => reject({ ready: false, path: "", stream: undefined }));
        // })
        return new Promise(async (resolve, reject) => {
            const fileExist = await this.exists(filePath);
            if (!fileExist) {
                console.log("File không tồn tại: ", filePath);
                reject(null);
            }
            const rs = fs.createReadStream(filePath);
            rs.on("open", () => {
                resolve({ ready: true, path: filePath, stream: rs });
            })
            rs.on("error", () => reject({ ready: false, path: "", stream: undefined }));

        });
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



}
