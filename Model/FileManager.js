import fs from 'fs';
import path, { resolve } from 'path';
import { pipeline } from 'stream/promises';

export default class FileManager {
    //CHECK FILE EXIST
    static async exists(filePath) {
        try {
            await fs.promises.access(filePath, fs.constants.R_OK);
            return true
        } catch {
            return false
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
            if (err.code !== "EEXIST") return err;
        }
    }
    //CREATE DIRECTORY
    static async mkDir(folderPath) {
        try {
            await fs.promises.mkdir(folderPath, { recursive: true });
            return folderPath;
        } catch(err) {
            return err;
        }
    }
    //WRITE - READ - APPEND TEXT
    static async writeText(filePath, content) {
        try {
            await this.ensureDir(filePath);
            await fs.promises.writeFile(filePath, content, { encoding: "utf-8" });
            return true;
        } catch(err) {
            return err;
        }
    }

    static async AppendText(filePath, content) {
        try {
            const check = await this.exists(filePath);
            if (!check) reject('File not found.');
            await fs.promises.appendFile(filePath, content);
            return true;
        } catch (err) {
            return err;
        }
    }
    static async readText(filePath) {
        try {
            const check = await this.exists(filePath);
            if (check) {
                const text = await fs.promises.readFile(filePath, { encoding: "utf-8" });
                return text;
            } else {
                return false;
            }
        } catch(err) {
            return err;
        }
    }
    //BINARY (BUFFER)
    static async writeBirary(filePath, buffer) {
        try {
            await this.ensureDir(filePath);
            await fs.promises.writeFile(filePath, buffer);
            return true;
        } catch(err) {
            return err;
        }
    }
    static async readBinary(filePath) {
        try {
            const check = await this.exists(filePath);
            if (check) {
                const binary = await fs.promises.readFile(filePath);
                return binary;
            } else {
                return "File not found";
            }
        } catch (err) {
            return err;
        }
    }
    //STREAM
    static async writeStream(filePath, readAbleStream) {
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
            return err;
        }
    }
    static async readStream(filePath) {
        const fileExist = await this.exists(filePath);
        if (!fileExist) {
            return "File không tồn tại.";
        }
        return new Promise((resolve, reject) => {
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
