// telegram-pi-monitor.js
// Bot Telegram gửi thông tin nhiệt độ CPU, RAM, ổ đĩa

const TelegramBot = require("node-telegram-bot-api");
const si = require("systeminformation");

const TOKEN = process.env.BOT_TOKEN || "8328619864:AAEm3LZS45Va5gzQ74EXfTbH9EVNgX8lk2E";

// Tạo bot (polling mode)
const bot = new TelegramBot(TOKEN, { polling: true });

// Format bytes sang GB/MB
function human(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(1)} ${units[i]}`;
}

async function buildStatus() {
  const cpuTemp = await si.cpuTemperature();
  const mem = await si.mem();
  const disk = await si.fsSize();

  let msg = `📡 Raspberry Pi Monitor\n`;
  msg += `🕒 ${new Date().toLocaleString()}\n\n`;

  msg += `🌡️ CPU Temp: ${cpuTemp.main ? cpuTemp.main.toFixed(1) + "°C" : "N/A"}\n`;
  msg += `⚙️ CPU Load: ${(await si.currentLoad()).currentLoad.toFixed(1)}%\n`;
  msg += `🧠 RAM: ${human(mem.used)} / ${human(mem.total)} (${(
    (mem.used / mem.total) *
    100
  ).toFixed(1)}%)\n`;

  if (disk.length > 0) {
    const d = disk[0];
    msg += `💽 Disk: ${human(d.used)} / ${human(d.size)} (${d.use}%)\n`;
  }

  return msg;
}

// Khi nhận lệnh /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Xin chào! 👋\nDùng /status để xem tình trạng Pi.\nDùng /interval N để nhận báo cáo mỗi N phút.\nDùng /stop để dừng."
  );
});

// Lệnh /status
bot.onText(/\/s/, async (msg) => {
  const report = await buildStatus();
  bot.sendMessage(msg.chat.id, report);
});

// Lưu job interval trong RAM
const intervals = {};

bot.onText(/\/interval (\d+)/, (msg, match) => {
  const minutes = parseInt(match[1]);
  const chatId = msg.chat.id;

  if (intervals[chatId]) {
    clearInterval(intervals[chatId]);
  }

  intervals[chatId] = setInterval(async () => {
    const report = await buildStatus();
    bot.sendMessage(chatId, report);
  }, minutes * 60 * 1000);

  bot.sendMessage(chatId, `Bắt đầu gửi báo cáo mỗi ${minutes} phút.`);
});

// Lệnh /stop
bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  if (intervals[chatId]) {
    clearInterval(intervals[chatId]);
    delete intervals[chatId];
    bot.sendMessage(chatId, "Đã dừng gửi định kỳ.");
  } else {
    bot.sendMessage(chatId, "Không có job nào đang chạy.");
  }
});

console.log("Bot đang chạy... Nhấn Ctrl+C để thoát.");

