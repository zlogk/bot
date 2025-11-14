import TelegramBot from "node-telegram-bot-api";
import RaspiBot from "./Bot/Raspi/raspiBot.js";
import dotenv from 'dotenv';
dotenv.config();

const Main = async () => {
    const TOKEN = process.env.BOT_TOKEN;
    const bot = new TelegramBot(TOKEN, { polling: true });
    bot.setMyCommands([
        { command: "/raspi", description: "Thông tin hệ thống" },
        { command: "/menu", description: "Hiện menu nút thường" },
        { command: "/inline", description: "Hiện nút inline" }
    ]);
    const piInfo = new RaspiBot(bot);
    piInfo.Run();
}
Main();