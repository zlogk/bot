import convertModel from "../../Model/convert-Img/convertModel.js";
import FileManager from "../../Model/FileManager.js";
import axios from "axios";
import sharp from "sharp";
import rarZipManager from "../../Model/rarZipManager.js";
import path from "path";

export default class convertController {
    constructor() {
        this.convertModel = new convertModel();
    }

    #checkSupport(fileName) {
        const support = ['.jpg', '.jpeg', '.webp', '.avif', '.tiff', '.gif', '.heif', '.raw', '.svg'];
        const fileExt = path.extname(fileName).toLocaleLowerCase();
        if (support.includes(fileExt)) {
            return true;
        }
        return false;
    }
    async convert(bot, chatId, fileName, fileLink, folderInputPath, folderOutputPath) {
        try {
            const response = await axios({
                url: fileLink,
                method: "GET",
                responseType: "stream"
            });
            const fileCompressDownload = folderInputPath + '/' + fileName;
            const stream = await FileManager.writeStream(fileCompressDownload, response.data);
            await FileManager.mkDir(folderOutputPath);
            if (stream.success) {
                const isFolder = folderInputPath + '/' + FileManager.getNameFileNotExt(fileName);
                if (path.extname(fileCompressDownload).toLocaleLowerCase() === '.zip') {
                    await rarZipManager.unzip(fileCompressDownload, folderInputPath);
                    // let test = await FileManager.checkIsFolderIsFile(isFolder) === 'folder';
                    if (await FileManager.checkIsFolderIsFile(isFolder) === 'folder') {
                        const listFile = await FileManager.listOfFolder(isFolder);
                        const outDir = await FileManager.mkDir(folderOutputPath + '/' + FileManager.getNameFileNotExt(fileName))
                        listFile.forEach(async (file) => {
                            if (this.#checkSupport(file)) {
                                await sharp(isFolder + '/' + file).png({ "quality": 100 }).toFile(outDir + '/' + FileManager.getNameFileNotExt(file) + '.png');
                            }
                            // await rarZipManager.zip(folderOutputPath + '/' + FileManager.getNameFileNotExt(fileName), folderOutputPath + '/' + FileManager.getNameFileNotExt(fileName));
                        });
                        return { isFolder: true, path: outDir };
                    } else {
                        const listFile = await FileManager.listOfFolder(folderInputPath);
                        const dir = await FileManager.mkDir(folderOutputPath + '/img');
                        const outFile = dir + '/' + FileManager.getNameFileNotExt(fileName) + '.png';
                        listFile.forEach(async (file) => {
                            if (this.#checkSupport(file)) {
                                await sharp(folderInputPath + '/' + file).png({ "quality": 100 }).toFile(outFile);
                            }
                        });
                        if (FileManager.fileReady(outFile, 200)) {
                            const messEnd = "💾 Bạn muốn nhận file theo dạng nào /toPNG hay /toZIP"
                            bot.sendMessage(chatId, messEnd);
                        }
                        return { isFolder: false, path: outFile };
                    }
                } else {
                }
            }

        } catch (err) {
            console.log(err);
        }
    }
    async sendCompress(bot, chatId) {
        try {
            const fileSendStream = await FileManager.readStream(folderOutputPath + '/' + FileManager.getNameFileNotExt(fileName));
            const fileOptions = {
                filename: fileName,
                caption: `${fileName}`
            };
            return bot.sendDocument(chatId, fileSendStream.stream, fileOptions);
        } catch (err) {
            bot.sendMessage(chatId, "Lỗi gửi File");
        }
    }
    async sendFile(bot, chatId, fileFolderPath) {
        if (FileManager.fileReady(fileFolderPath)) {
            const fileName = fileFolderPath.path.split("/").pop();
            try {
                if (!fileFolderPath.isFolder) {
                    // const fileSendStream = await FileManager.readStream(fileFolderPath.path);
                    const fileSend = await FileManager.readBinary(fileFolderPath);
                    const fileOptions = {
                        filename: fileName,
                        caption: `${fileName}`
                    };
                    // return bot.sendDocument(chatId, fileSendStream.stream, fileOptions);
                    return bot.sendDocument(chatId,fileSend,fileOptions);
                }

            } catch (err) {
                console.log(err);
                bot.sendMessage(chatId, "Lỗi gửi File");
            }
        }

    }

}