import RaspiController from '../../Controllers/Raspi/raspiController.js';

export default class RaspiBot {
    #bot;
    #RaspiController;
    constructor(bot) {
        this.#bot = bot;
        this.#RaspiController = new RaspiController();
    }
    run() {
        this.#bot.onText(/\/start/, (msg) => {
            this.#bot.sendMessage(
                msg.chat.id,
                "Xin chào! 👋\n" +
                "Lệnh khả dụng:\n" +
                "• /status → Xem tình trạng Pi\n" +
                "• /interval N → Nhận báo cáo mỗi N phút\n" +
                "• /stop → Dừng báo cáo định kỳ"
            );
        });
        this.#bot.onText(/\/s/, async (msg) => {
            const cpu = await this.#RaspiController.GetCpuInfo();
            this.#bot.sendMessage(msg.chat.id,cpu.toString());
        });
    }


}