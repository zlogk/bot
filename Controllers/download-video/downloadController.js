import ytDlpExec from "yt-dlp-exec";
import FileManager from "../../Model/FileManager.js";
import fs from 'fs';
import { spawn } from "child_process";
export default class downloadController {
    constructor() {

    }
    async download(bot, chatId, url, fileWritePath) {
        await FileManager.ensureDir(fileWritePath);
        //temp file
        const videoTemp = fileWritePath + '.video.temp';
        const audioTemp = fileWritePath + '.audio.tmp';

        let statusMsgId = null;
        let lastUpdate = 0;

        // Hàm gửi hoặc update message
        const sendProgress = async (text) => {
            const now = Date.now();
            if (now - lastUpdate < 1000) return; // update mỗi 1 giây
            lastUpdate = now;

            if (!statusMsgId) {
                const msg = await bot.sendMessage(chatId, text);
                statusMsgId = msg.message_id;
            } else {
                await bot.editMessageText(text, { chat_id: chatId, message_id: statusMsgId });
            }
        };
        //function download via stream
        const streamDownload = (format, dest, name) => {
            return new Promise((resolve, reject) => {
                const writeStream = fs.createWriteStream(dest);
                const proc = ytDlpExec.exec(url, {
                    format,
                    output: "-"
                });
                proc.stdout.pipe(writeStream);
                proc.stderr.on("data", (data) => {
                    console.log("yt-dlp: ", data.toString());
                });

                proc.stderr.on("data", async (data) => {
                    const text = data.toString();

                    const match = text.match(/\[download\]\s+([\d.]+)%\s+of\s+([\d.]+)(MiB|KiB|GiB)\s+at\s+([\d.]+)(MiB|KiB|GiB)\/s/);

                    if (match) {
                        const percent = match[1];
                        const total = match[2] + match[3];
                        const speed = match[4] + match[5];

                        const msg = `🚀 Đang tải ${name}\n` +
                            `Tiến độ: ${percent}%\n` +
                            `Tổng: ${total}\n` +
                            `Tốc độ: ${speed}`;

                        sendProgress(msg);
                    }
                });


                writeStream.on("finish", () => resolve(dest));
                writeStream.on("error", reject);
                proc.on("close", (code) => {
                    if (code !== 0) reject(new Error("yt-dlp exited with code: " + code));
                });
            });
        }
        //download video
        await streamDownload("bestvideo", videoTemp,"video");
        //download audio
        await streamDownload("bestaudio", audioTemp,"audio");
        //merge with ffmpeg
        await new Promise((resolve, reject) => {
            // const ff = spawn("C:\\ffmpeg\\bin\\ffmpeg.exe", [
            const ff = spawn("ffmpeg", [
                "-i", videoTemp,
                "-i", audioTemp,
                "-c", "copy",
                fileWritePath
            ]);
            ff.stderr.on("data", (data) => {
                console.log("ffmpeg: ", data.toString());
            })
            ff.on("close", (code) => {
                if (code === 0) resolve(true);
                else reject(new Error("ffmpeg exited with code: " + code));
            });
        });
        fs.promises.unlink(videoTemp);
        fs.promises.unlink(audioTemp);
        return fileWritePath;

    }
    async sendFile(bot, chatId, filePath){
        const fileName = filePath.split("/").pop();
        try{
            const fileStream = await FileManager.readStream(filePath);
            const fileOptions = {
                fileName: fileName
            };
            bot.sendDocument(chatId, fileStream.stream, fileOptions);
        }catch(err){
            console.log(err);
            bot.sendMessage(chatId, "Lỗi gửi file.");
        }
    }
}