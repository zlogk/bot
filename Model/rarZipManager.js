import fs from 'fs';
import FileManager from './FileManager.js';

import extract from "extract-zip";
import unzipper from "unzipper";
import nodeUnrar, { createExtractorFromFile } from 'node-unrar-js';
import archiver from 'archiver';
import path from 'path';
import { pipeline } from 'stream/promises';


export default class rarZipManager {
    //unzip
    static async unzip(zipPath, outDir) {
        if (!FileManager.exists(zipPath)) throw new Error("File zip không tồn tại.");
        try {
            await FileManager.ensureDir(outDir);
            await extract(zipPath, { dir: path.resolve(outDir) });
            return { success: true, output: outDir };
        } catch (err) {
            throw new Error("unzip: " + err);
        }
    }
    //unzip only large file
    /**
     * ONLY LARGE FILE
     * @param {string} zipPath file or folder zip
     * @param {string} outDir out folder
     */
    static async unzipStream(zipPath, outDir) {
        if (!FileManager.exists(zipPath)) {
            throw new Error("File zip không tồn tại");
        }
        try {
            await FileManager.ensureDir(outDir);
            await pipeline(fs.createReadStream(zipPath), unzipper.Extract({ path: outDir }));
        } catch (err) {
            throw err;
        }
    }
    //compress zip (stream)
    static async zip(sourcePath, outZipPath) {
        const tempPath = outZipPath + ".part";
        try {
            if (!FileManager.exists(sourcePath) || !FileManager.ExistsFolder(sourcePath)) {
                throw new Error("File hoặc thư mục cần nén không tồn tại");
            }

            await FileManager.ensureDir(outZipPath);
            if (FileManager.exists(tempPath)) {
                await fs.promises.unlink(outZipPath);
            }

            const archive = archiver("zip", { zlib: { level: 6 } });
            archive.on("warning", (err) => {
                console.log("Archiver(zip) warning: ", err);
            });
            archive.on("error", (err) => {
                throw err;
            });


            const stat = await fs.promises.stat(sourcePath);
            if (stat.isFile()) {
                archive.file(sourcePath, { name: path.basename(sourcePath) });
            }else{
                archive.directory(sourcePath, false);
            }
            archive.finalize();
            await FileManager.writeStream(tempPath,archive);
            await fs.promises.rename(tempPath,outZipPath);
            return {success: true, path: outZipPath, size: archive.pointer()};

        } catch (err) {
            if(FileManager.exists(tempPath)){
                try{
                    await fs.promises.unlink(tempPath)
                }catch(_){}
            }
            throw new Error(err);
        }
    }
    //unRAR
    static async unrar(rarPath, outDir){
        if(!FileManager.exists(rarPath)){
            throw new Error("File rar không tồn tại.");
        }
        await FileManager.ensureDir(outDir);
        try{
            const extractor = await createExtractorFromFile({
                filepath: rarPath,
                targetPath: outDir
            });
            const extracted = extractor.extract();
            for(const file of extracted.files){
                if(file.fileHeader.packSize < 0){
                    throw new Error("Không thể giải nén: " + file.fileHeader.name);
                }
            }
        }catch(err){
            throw new Error("Lỗi khi giải nén RAR: "+ err.message);
        }
    }
}