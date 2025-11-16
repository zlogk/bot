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
            this.#bot.sendMessage(chatId, "Xin gửi ảnh tôi sẽ chuyển sang định dạng PNG ✔️");
        });
        this.#bot.on("document", async (msg)=>{
            const chatId = msg.chat.id;
            if(this.#userStatus[chatId] !== "await_png"){
                this.#bot.sendMessage(chatId, "Xin hãy dùng lệnh /png trước.");
                return;
            }
            this.#bot.sendMessage(chatId, "Đang xử lý xin chờ!");
            try{
                const photos = msg.photo;
                const fileId = photos[photos.length -1].file_id;
                const fileLink = await this.#bot.getFileLink(fileId);

                const inputPath = `./data/img/${chatId}/source/${chatId}_${Date.now()}`;
                const outputPath = `./data/img/${chatId}/convert/${chatId}_${Date.now()}.png`;

                await this.convertController.convert(fileLink,inputPath,outputPath);
                await this.convertController.sendFile(this.#bot,chatId,outputPath);

                delete this.#userStatus[chatId];

            }catch(err){
                console.log(err);
                this.#bot.sendMessage(chatId,"Có lỗi khi xử lý ảnh ❗")
            }
        });
    }
}