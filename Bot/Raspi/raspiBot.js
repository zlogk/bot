import RaspiController from '../../Controllers/Raspi/raspiController.js';

export default class RaspiBot {
    #bot;
    #RaspiController;
    constructor(bot) {
        this.#bot = bot;
        this.#RaspiController = new RaspiController();
    }
    async Run() {
        const table = await this.#RaspiController.raspiModel.IntializeTable();
        console.log(table);
        this.#bot.onText(/\/system/, async (msg) => {
            const info = await this.#RaspiController.GetInfo();
            const [cpu, ram, disk, uptime, ip] = info;

            let mess =
                "🏴‍☠️ " + cpu[2] +
                "\nCPU temp: " + cpu[0]+"°C" +
                " - load: " + cpu[1]+"%" +
                "\nRam: " + ram[0] + "/" + ram[1] + "(" + ram[2] + "%)" +
                "\nDisk: " + disk[0] +"/" + disk[1]+ "(" +disk[3] +"%) " +"Free: "+ disk[2]+
                "\nUptime: " + uptime[0]+
                "\nLAN: " + ip[0] +
                "\nWAN: " + ip[1];
            this.#bot.sendMessage(msg.chat.id, mess);
            let done = await this.#RaspiController.raspiModel.InsertCpuRamDiskUptime(info);
            console.log(done);
        });

    }
}
