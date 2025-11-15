import TelegramBot from "node-telegram-bot-api";
import RaspiBot from "./Bot/Raspi/raspiBot.js";
import convertBot from "./Bot/convert-Img/convertBot.js";
import dotenv from 'dotenv';
dotenv.config();

const Main = () => {
    const TOKEN = process.env.BOT_TOKEN;
    const bot = new TelegramBot(TOKEN, { polling: true });
    bot.setMyCommands([
        { command: "/system", description: "System" },
        { command: "/png", description: "Chuyển sang định dạng PNG" },
        { command: "/jpg", description: "Chuyển sang định dạng JPG" }
    ]);
    const piInfo = new RaspiBot(bot);
    piInfo.Run();
    const convertImg = new convertBot(bot);
    convertImg.Run();
}
Main();