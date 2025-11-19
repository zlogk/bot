import convertController from "../../Controllers/convert-Img/convertController.js";
import path from 'path';

export default class convertBot {
    #bot;
    #fileFolderPath;
    #userStatus;
    constructor(bot) {
        this.#bot = bot;
        this.#userStatus = {};
        this.#fileFolderPath = {};
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
            this.#bot.sendMessage(chatId, "⚠️ Nếu nhiều ảnh bỏ vào 1 Folder nén lại -> .zip/.rar\n" +
                "⚠️ Tên file nén và tên folder phải giống nhau\n" +
                "⚠️ 1 ảnh chỉ cần nén ảnh -> .zip/.rar");
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
                    const messStart = "⏳ Đang chuyển đổi..."
                    this.#bot.sendMessage(chatId, messStart);
                    const fileLink = await this.#bot.getFileLink(fileId);
                    const folderInputPath = `./data/img/${chatId}/source/${chatId}_${Date.now()}`;
                    const folderOutputPath = `./data/img/${chatId}/convert/${chatId}_${Date.now()}`;

                    this.#fileFolderPath[chatId] = await this.convertController.convert(fileName, fileLink, folderInputPath, folderOutputPath);

                    const messEnd = "💾 Bạn muốn nhận file theo dạng nào /toPNG hay /toZIP"
                    this.#bot.sendMessage(chatId, messEnd);

                } else {
                    this.#bot.sendMessage(chatId, "⛔ Xin nén ảnh với định dạng .zip/.rar");
                }

            } catch (err) {
                console.log(err);
                this.#bot.sendMessage(chatId, "Có lỗi khi xử lý ảnh ❗")
            }
        });
        this.#bot.onText(/\/toZip/, async (msg) => {
            const chatId = msg.chat.id;
            await this.convertController.sendCompress(this.#bot, chatId, this.#fileFolderPath);
            delete this.#userStatus[chatId];
        });
        this.#bot.onText(/\/toPNG/, async (msg) => {
            const chatId = msg.chat.id;
            if (this.#userStatus[chatId] !== "await_png") {
                this.#bot.sendMessage(chatId, "Xin hãy dùng lệnh /png trước.");
                return;
            }
            try {
                if (this.#fileFolderPath[chatId]) {
                    await this.convertController.sendFile(this.#bot, chatId, this.#fileFolderPath[chatId]);
                    delete this.#userStatus[chatId];
                    this.#fileFolderPath[chatId] = null;
                    return;
                }

                this.#bot.sendMessage(chatId, "Xin hãy dùng lệnh /png trước.");
                return;

            } catch (err) {
                return err
            }
        });

    }
}