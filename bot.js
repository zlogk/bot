// telegram-pi-monitor.js
// Bot Telegram gửi thông tin nhiệt độ CPU, RAM, ổ đĩa, uptime, IP

const TelegramBot = require("node-telegram-bot-api");
const si = require("systeminformation");
const https = require("https");

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

// Lấy IP công cộng
function getPublicIP() {
  return new Promise((resolve) => {
    https
      .get("https://api.ipify.org?format=json", (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const ip = JSON.parse(data).ip;
            resolve(ip);
          } catch (e) {
            resolve("N/A");
          }
        });
      })
      .on("error", () => resolve("N/A"));
  });
}

async function buildStatus() {
  try {
    const [cpuTemp, mem, disk, load, uptime, net, publicIP] = await Promise.all([
      si.cpuTemperature(),
      si.mem(),
      si.fsSize(),
      si.currentLoad(),
      si.time(),
      si.networkInterfaces(),
      getPublicIP(),
    ]);

    let msg = `📡 Raspberry Pi Monitor\n`;
    msg += `🕒 ${new Date().toLocaleString()}\n\n`;

    msg += `🌡️ CPU Temp: ${cpuTemp.main ? cpuTemp.main.toFixed(1) + "°C" : "N/A"}\n`;
    msg += `⚙️ CPU Load: ${load.currentLoad.toFixed(1)}%\n`;
    msg += `🧠 RAM: ${human(mem.used)} / ${human(mem.total)} (${(
      (mem.used / mem.total) * 100
    ).toFixed(1)}%)\n`;

    if (disk.length > 0) {
      const d = disk[0];
      msg += `💽 Disk: ${human(d.used)} / ${human(d.size)} (${d.use}%)\n`;
    }

    msg += `⏳ Uptime: ${(uptime.uptime / 3600).toFixed(1)} giờ\n`;

    // Lấy IP LAN (IPv4 không phải internal)
    const lan = net.find((n) => n.ip4 && !n.internal);
    msg += `🌐 LAN IP: ${lan ? lan.ip4 : "N/A"}\n`;
    msg += `🌍 WAN IP: ${publicIP}\n`;

    return msg;
  } catch (err) {
    return `❌ Lỗi khi lấy thông tin hệ thống: ${err.message}`;
  }
}

// Khi nhận lệnh /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Xin chào! 👋\n" +
      "Lệnh khả dụng:\n" +
      "• /status → Xem tình trạng Pi\n" +
      "• /interval N → Nhận báo cáo mỗi N phút\n" +
      "• /stop → Dừng báo cáo định kỳ"
  );
});

// Lệnh /status
bot.onText(/\/ss/, async (msg) => {
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

  bot.sendMessage(chatId, `✅ Bắt đầu gửi báo cáo mỗi ${minutes} phút.`);
});

// Lệnh /stop
bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  if (intervals[chatId]) {
    clearInterval(intervals[chatId]);
    delete intervals[chatId];
    bot.sendMessage(chatId, "🛑 Đã dừng gửi định kỳ.");
  } else {
    bot.sendMessage(chatId, "ℹ️ Không có job nào đang chạy.");
  }
});

console.log("🚀 Bot đang chạy... Nhấn Ctrl+C để thoát.");
