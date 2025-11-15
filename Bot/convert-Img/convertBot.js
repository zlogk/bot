import convertController from "../../Controllers/convert-Img/convertController.js";
export default class convertBot{
    #bot;
    #userStatus;
    constructor(bot){
        this.#bot = bot;
        this.#userStatus = {};
        this.convertController = new convertController();
    }
    async Run(){
        const table = await this.convertController.convertModel.IntializeTable()
        console.log(table);

        this.#bot.onText(/\/png/,(msg)=>{
            const chatId = msg.chat.id;
            this.#userStatus[chatId] = "await_png";
            this.#bot.sendMessage(chatId, "Xin gửi ảnh tôi sẽ chuyển sang định dạng PNG!");
        });
    }
}