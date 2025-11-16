import convertModel from "../../Model/convert-Img/convertModel.js";
import FileManager from "../../Model/FIleManager.js";
import axios from "axios";
import sharp from "sharp";
import mime from 'mime';

export default class convertController {
    constructor() {
        this.convertModel = new convertModel();
    }
    async convert(fileLink, inputPath, outputPath) {
        try {
            const response = await axios({
                url: fileLink,
                method: "GET",
                responseType: "stream"
            });
            const stream = await FileManager.writeStream(inputPath, response.data);
            if (stream.success) {
                FileManager.ensureDir(outputPath);
                const ph = await sharp(inputPath).png({ "quality": 100 }).toFile(outputPath);
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
}