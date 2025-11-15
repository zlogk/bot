import RaspiModel from '../../Model/Raspi/raspiModel.js';
import si from 'systeminformation';
import https from 'https';


export default class RaspiController {
    constructor() {
        this.raspiModel = new RaspiModel();
        // this.raspiModel.IntializeTable();
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
            //cpu
            const cpu_temp = cpuTemp.main ? cpuTemp.main.toFixed(1) : "N/A";
            const cpu_load = load.currentLoad.toFixed(1);
            //ram
            const mem_used = this.ConvertBytes(mem.total - mem.available);
            const mem_total = this.ConvertBytes(mem.total);
            const mem_percent_used = (((mem.total - mem.available) / mem.total) * 100).toFixed(1);
            //disk
            let disk_used;
            let disk_total;
            let disk_free;
            let disk_percent_used;
            if (disk.length > 0) {
                const primary_disk = disk[0];
                disk_used = this.ConvertBytes(primary_disk.used);
                disk_total = this.ConvertBytes(primary_disk.size);
                disk_free = this.ConvertBytes(primary_disk.size - primary_disk.used);
                disk_percent_used = primary_disk.use;
            }
            //uptime
            const uptime_day = Math.trunc(uptime.uptime / 3600 / 24);
            const uptime_odd_hour = Math.trunc((uptime.uptime / 3600 / 24 - Math.trunc(uptime.uptime / 3600 / 24)) * 24);
            const uptime_odd_minute = (((uptime.uptime / 3600 / 24 - Math.trunc(uptime.uptime / 3600 / 24)) * 24
                - Math.trunc((uptime.uptime / 3600 / 24 - Math.trunc(uptime.uptime / 3600 / 24)) * 24)) * 60).toFixed(0);
            const up_time = `${uptime_day} days, ${uptime_odd_hour} hours, ${uptime_odd_minute}'`;
            //ip
            const lan = net.find((n) => n.ip4 && !n.internal);
            const lan2 = lan ? lan.ip4 : "N/A";

            const info = [
                [cpu_temp, cpu_load, this.GetTime()],
                [mem_used, mem_total, mem_percent_used, this.GetTime()],
                [disk_used, disk_total, disk_free, disk_percent_used, this.GetTime()],
                [up_time, this.GetTime()],
                [lan2, publicIp, this.GetTime()]
            ];
            // await this.#raspiModel.InsertCpuRamDiskUptime(info);
            return info;
        } catch (err) {
            return `Lỗi không lấy được thông tin hệ thống: ${err.message}`;
        }
    }

}