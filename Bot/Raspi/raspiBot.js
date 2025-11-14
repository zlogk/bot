import RaspiModel from '../../Model/Raspi/raspiModel.js';
import RaspiController from '../../Controllers/Raspi/raspiController.js';

export default class RaspiBot {
    #bot;
    #RaspiController;
    constructor(bot) {
        this.#bot = bot;
        this.#RaspiController = new RaspiController();
    }
    async Run() {
        this.#bot.onText(/\/raspi/, async (msg) => {
            const info = await this.#RaspiController.GetInfo();
            const [cpu, ram, disk, uptime, ip] = info;

            let mess =
                "🏴‍☠️ " + cpu[2] +
                "\nCPU temp: " + cpu[0] +
                " - load: " + cpu[1]+"%" +
                "\nRam: " + ram[0] + "/" + ram[1] + "(" + ram[2] + "%)" +
                "\nDisk: " + disk[0] +"/" + disk[1]+ "(" +disk[3] +"%) " +"Free: "+ disk[2]+
                "\nUptime: " + uptime[0]+
                "\nLAN: " + ip[0] +
                "\nWAN: " + ip[1];
            this.#bot.sendMessage(msg.chat.id, mess);
            this.#RaspiController.raspiModel.InsertCpuRamDiskUptime(info);
        });

    }
}
