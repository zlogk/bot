import TelegramBot from "node-telegram-bot-api";
import RaspiBot from "./Bot/Raspi/raspiBot.js";
import convertBot from "./Bot/convert-Img/convertBot.js";
import dotenv from 'dotenv';
dotenv.config();

const Main = async () => {
    const TOKEN = process.env.BOT_TOKEN;
    const bot = new TelegramBot(TOKEN, { polling: {autoStart:false} });
    await bot.getUpdates({offset: -1});
    bot.startPolling();
    bot.setMyCommands([
        { command: "/system", description: "System" },
        { command: "/png", description: "Chuyển sang định dạng PNG" },
        { command: "/video", description: "Download video từ Youtube, Facebook,..." }
    ]);
    const piInfo = new RaspiBot(bot);
    piInfo.Run();
    const convertImg = new convertBot(bot);
    convertImg.Run();
}
Main();