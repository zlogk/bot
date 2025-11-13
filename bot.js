// import raspiConfigApp from "./js/raspi-config/app.js";
// raspiConfigApp();
import TelegramBot from "node-telegram-bot-api";
import RaspiBot from "./Bot/Raspi/raspiBot.js";
import dotenv from 'dotenv';
dotenv.config();

const Main = async () => {
    const TOKEN = process.env.BOT_TOKEN;
    const bot = new TelegramBot(TOKEN, { polling: true });

    const piInfo = new RaspiBot(bot);
    piInfo.run();
}
Main();