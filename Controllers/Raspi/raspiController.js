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
    async GetCpuInfo() {
        const [cpuTemp, load] = await Promise.all([
        si.cpuTemperature(),
        si.currentLoad()
        ]);
        const info = [cpuTemp.main,load.currentLoad.toFixed(1),this.GetTime()];
        // const db = info.push(this.GetTime());
        this.#raspiModel.InsertCpu(info);
        return info;
    }

}