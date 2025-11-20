import downloadController from "../../Controllers/download-video/downloadController.js";

export default class downloadBot {
    #bot;
    #waitURL;
    constructor(bot) {
        this.#bot = bot;
        this.downloadController = new downloadController();
        this.#waitURL = {};
    }
    async Run() {
        this.#bot.onText(/\/video/, (msg) => {
            const chatId = msg.chat.id;
            this.#waitURL[chatId] = "wait_video";
            this.#bot.sendMessage(chatId, "Xin gửi link video.");
        });
        this.#bot.on("text", async (msg) => {
            const chatId = msg.chat.id;
            const url = msg.text;
            if (['/png', '/toPNG', '/system', '/video', 'toZIP'].includes(url)) {
                return;
            }
            if (this.#waitURL[chatId] !== "wait_video") {
                this.#bot.sendMessage(chatId, "Xin hãy dùng lệnh /video trước.");
                return;
            }
            try {
                const filePath = await this.downloadController.download(this.#bot, chatId, url, `./data/video/${chatId}/${Date.now()}.mp4`);
                if(filePath){
                    await this.downloadController.sendFile(this.#bot,chatId,filePath);
                }

            } catch (err) {
                console.log(err);
                this.#bot.sendMessage(chatId, "Có lỗi khi download video.");
            }
        });
    }
}