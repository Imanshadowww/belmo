const { execSync, spawn } = require('child_process');
const fs = require('fs');

const PORT = process.env.PORT || 8080;
const UUID = process.env.UUID || 'a1b2c3d4-e5f6-7890-1234-56789abcdef0';

// تنظیمات به اسم سیستم و مسیرها به اسم API تغییر کرد
const settings = {
  "inbounds": [
    {
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
    }
  ],
  "outbounds": [{"protocol": "freedom"}]
};

// ساخت فایل تنظیمات با یک اسم کاملا عادی
fs.writeFileSync('sys_env.json', JSON.stringify(settings));

console.log("Initializing core components...");

// دانلود، استخراج فایل اصلی، تغییر اسم به app-engine و پاک کردن فایل زیپ
execSync('wget -qO core.zip https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip');
execSync('unzip -o core.zip xray -d .');
execSync('mv xray app-engine'); 
execSync('rm core.zip'); 
execSync('chmod +x app-engine');

console.log("Starting application engine...");
const engine = spawn('./app-engine', ['-config', 'sys_env.json']);

engine.stdout.on('data', data => console.log(`[INFO]: ${data}`));
engine.stderr.on('data', data => console.error(`[ERR]: ${data}`));
