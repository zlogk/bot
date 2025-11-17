import convertController from "../../Controllers/convert-Img/convertController.js";
import path from 'path';

export default class convertBot {
    #bot;
    #userStatus;
    constructor(bot) {
        this.#bot = bot;
        this.#userStatus = {};
        this.convertController = new convertController();
    }
    async Run() {
        const table = await this.convertController.convertModel.IntializeTable()
        console.log(table);

        this.#bot.onText(/\/png/, (msg) => {
            const chatId = msg.chat.id;
            const mess = `| Định dạng hỗ trợ
| -------------------
| ✅**JPEG**
| ✅**JPG**
| ✅**WebP**
| ✅**AVIF**
| ✅**TIFF**
| ✅**GIF**
| ✅**HEIF**
| ✅**RAW**
| ✅**SVG**`;
            this.#userStatus[chatId] = "await_png";
            this.#bot.sendMessage(chatId, mess);
            this.#bot.sendMessage(chatId, "⚠️ Nếu nhiều ảnh bỏ vào 1 Folder nén lại -> .zip/.rar\n⚠️ 1 ảnh chỉ cần nén ảnh -> .zip/.rar");
        });

        this.#bot.on("document", async (msg) => {
            const chatId = msg.chat.id;
            if (this.#userStatus[chatId] !== "await_png") {
                this.#bot.sendMessage(chatId, "Xin hãy dùng lệnh /png trước.");
                return;
            }

            try {
                const fileId = msg.document.file_id;
                const fileName = msg.document.file_name;

                //check file user send
                const ext = path.extname(fileName).toLowerCase();
                if (ext === '.zip' || ext === '.rar') {
                    const mess = "⏳ Đang chuyển đổi...\n💾 Bạn muốn nhận file theo dạng nào /rarFile hay /pngFile"
                    this.#bot.sendMessage(chatId, mess);
                    const fileLink = await this.#bot.getFileLink(fileId);
                    const fileInputPath = `./data/img/${chatId}/source/compress/${Date.now()}_${fileName}`;
                    const folderOutputPath = `./data/img/${chatId}/convert/${chatId}_${Date.now()}`;

                    await this.convertController.convert(chatId, fileLink, fileInputPath, folderOutputPath);

                    this.#bot.onText(/\/rarFile/, async (mesg) => {
                        await this.convertController.sendCompress();
                        
                    });
                    this.#bot.onText(/\/pngFile/, async (mesg) => {
                        await this.convertController.sendFile(this.#bot, chatId, outputDir);

                        delete this.#userStatus[chatId];
                    });


                } else {
                    this.#bot.sendMessage(chatId, "⛔ Xin nén ảnh với định dạng .zip/.rar");
                }

            } catch (err) {
                console.log(err);
                this.#bot.sendMessage(chatId, "Có lỗi khi xử lý ảnh ❗") 
            }
        });

    }
}