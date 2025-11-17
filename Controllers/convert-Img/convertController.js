import convertModel from "../../Model/convert-Img/convertModel.js";
import FileManager from "../../Model/FileManager.js";
import axios from "axios";
import sharp from "sharp";
import mime from 'mime';
import rarZipManager from "../../Model/rarZipManager.js";
import path from "path";

export default class convertController {
    constructor() {
        this.convertModel = new convertModel();
    }
    async convert(chatId, fileLink, inputPath, outputDir) {
        try {
            const response = await axios({
                url: fileLink,
                method: "GET",
                responseType: "stream"
            });
            const stream = await FileManager.writeStream(inputPath, response.data);
            if (stream.success) {
                if(path.extname(inputPath).toLocaleLowerCase() === '.zip'){
                    await rarZipManager.unzip(inputPath,outputDir);
                }else{
                    await rarZipManager.unrar(inputPath,outputDir);
                }
                FileManager.ensureDir(outputPath);
                await sharp(inputPath).png({ "quality": 100 }).toFile(outputPath);
            }

        } catch (err) {
            console.log(err);
        }
    }
    async sendFile(bot, chatId, filePath) {
        // const contenttype = mime.getType(filePath) || "application/octet-stream";
        const fileName = filePath.split("/").pop();

        try {
            const fileSendStream = await FileManager.readStream(filePath);
            const fileOptions = {
                filename: fileName,
                caption: `${fileName}`
            };
            return bot.sendDocument(chatId, fileSendStream.stream,fileOptions);
        } catch (err) {
            bot.sendMessage(chatId, "Lỗi gửi File");
        }
    }
    async sendCompress(bot,chatId, filePath){

    }
}