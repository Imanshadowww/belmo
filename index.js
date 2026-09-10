const { spawn } = require('child_process');
const fs = require('fs');
const axios = require('axios');
const extract = require('extract-zip');

const PORT = process.env.PORT || 9720;
const UUID = process.env.UUID || 'e659b8be-5654-47e0-b6f7-b64ecfdfdc8e';

// ساخت تنظیمات بدون نام‌های حساس
const settings = {
  "inbounds": [{
    "port": parseInt(PORT),
    "protocol": "vless",
    "settings": {
      "clients": [{"id": UUID}],
      "decryption": "none"
    },
    "streamSettings": {
      "network": "ws",
      "wsSettings": {"path": "/api/stream"}
    }
  }],
  "outbounds": [{"protocol": "freedom"}]
};

fs.writeFileSync('sys_env.json', JSON.stringify(settings));

async function startEngine() {
  try {
    // بررسی اینکه آیا موتور قبلا نصب شده یا نه (برای جلوگیری از دانلود الکی)
    if (!fs.existsSync('app-engine')) {
      console.log("[INFO]: Fetching core components...");
      
      const response = await axios({
        url: 'https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip',
        method: 'GET',
        responseType: 'stream'
      });
      
      const writer = fs.createWriteStream('core.zip');
      response.data.pipe(writer);
      
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log("[INFO]: Extracting modules...");
      await extract('core.zip', { dir: process.cwd() });
      
      fs.renameSync('xray', 'app-engine');
      fs.chmodSync('app-engine', '755');
      fs.unlinkSync('core.zip'); // پاک کردن ردپای فایل زیپ
    }

    console.log("[INFO]: Starting application engine on port " + PORT);
    const engine = spawn('./app-engine', ['-config', 'sys_env.json']);

    engine.stdout.on('data', data => console.log(`[SYS]: ${data}`));
    engine.stderr.on('data', data => console.error(`[ERR]: ${data}`));

  } catch (error) {
    console.error("[FATAL]: Initialization failed!", error.message);
  }
}

startEngine();
