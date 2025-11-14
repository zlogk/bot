import RaspiModel from '../../Model/Raspi/raspiModel.js';
import si from 'systeminformation';
import https from 'https';


export default class RaspiController {
    #raspiModel;
    constructor() {
        this.#raspiModel = new RaspiModel();
        this.#raspiModel.IntializeTable();
    }

    ConvertBytes(bytes) {
        const units = ["B", "KB", "MB", "GB", "TB"];
        let i = 0;
        while (bytes >= 1024 && i < units.length - 1) {
            bytes /= 1024;
            i++;
        }
        return `${bytes.toFixed(1)} ${units[i]}`;
    }
    GetTime() {
        return new Date().toLocaleString();
    }
    GetPublicIp() {
        return new Promise((resolve, reject) => {
            https.get("https://api.ipify.org?format=json", (res) => {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => {
                    try {
                        const ip = JSON.parse(data).ip;
                        resolve(ip)
                    } catch (err) {
                        resolve("N/A");
                    }
                }).on("err", () => resolve("N/A"));
            });
        });
    }
    async GetInfo() {
        try {
            const [cpuTemp, mem, disk, load, uptime, net, publicIp] = await Promise.all([
                si.cpuTemperature(),
                si.mem(),
                si.fsSize(),
                si.currentLoad(),
                si.time(),
                si.networkInterfaces(),
                this.GetPublicIp()
            ]);
            const cpu_temp = cpuTemp.main ? cpuTemp.main.toFixed(1) : "N/A";
            const cpu_load = load.currentLoad.toFixed(1);

            const mem_used = this.ConvertBytes(mem.used);
            const mem_total = this.ConvertBytes(mem.total);
            const mem_percent_used = ((mem.used/mem.total) * 100).toFixed(1);

            let disk_used;
            let disk_size;
            let disk_percent_used;
            if(disk.length > 0){
                const primary_disk = disk[0];
                disk_used = primary_disk.used;
                disk_size = primary_disk.size;
                disk_percent_used = primary_disk.use;
            }
            const uptime_day = Math.trunc(uptime.uptime()/3600/24);
            const uptime_odd_hour = (uptime.uptime()/3600/24 - Math.trunc(uptime.uptime()/3600/24))*24

        } catch (err) {
            return `Lỗi không lấy được thông tin hệ thống: ${err.message}`;
        }
    }

}