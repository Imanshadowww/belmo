const https = require('https');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const http = require('http');

const port = process.env.PORT || 3000;

// ایجاد محیط ایزوله و محدود کردن شدید مصرف رم برای فرار از SIGTERM
const tsEnv = Object.assign({}, process.env);
delete tsEnv.PORT;
tsEnv.GOMEMLIMIT = '50MiB'; // محدودیت شدیدتر رم
tsEnv.TS_NO_LOGS_NO_SUPPORT = 'true'; // غیرفعال کردن لاگ‌های سنگین تله‌متری

http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Tailscale is running!');
}).listen(port, '0.0.0.0', () => {
    console.log(`[Web] Dummy server listening on port ${port}`);
    setTimeout(setupTailscale, 2000);
});

function setupTailscale() {
    console.log("[Setup] Downloading Tailscale...");
    const file = fs.createWriteStream("/tmp/ts.tgz");

    https.get("https://pkgs.tailscale.com/stable/tailscale_1.74.0_amd64.tgz", (response) => {
        response.pipe(file);
        file.on("finish", () => {
            file.close();
            console.log("[Setup] Extracting...");
            exec("tar xzf /tmp/ts.tgz -C /tmp", (err) => {
                if (err) return console.error("Extract error:", err);
                startTailscale();
            });
        });
    });
}

function startTailscale() {
    console.log("[Tailscale] Starting daemon in ultra-light mode...");
    exec("mkdir -p /tmp/tailscale-state");

    const daemon = spawn("/tmp/tailscale_1.74.0_amd64/tailscaled", [
        "--tun=userspace-networking",
        "--socks5-server=localhost:1055",
        "--statedir=/tmp/tailscale-state",
        "--socket=/tmp/tailscaled.sock",
        "--no-logs-no-support" // جلوگیری از پردازش‌های اضافه
    ], { env: tsEnv });

    daemon.stdout.on('data', (d) => process.stdout.write(`[Daemon] ${d}`));
    daemon.stderr.on('data', (d) => process.stdout.write(`[Daemon] ${d}`));

    // زمان صبر را به ۱۰ ثانیه افزایش دادیم تا سرور رایگان فرصت نفس کشیدن داشته باشد
    setTimeout(() => {
        console.log("[Tailscale] Authenticating...");
        const auth = spawn("/tmp/tailscale_1.74.0_amd64/tailscale", [
            "--socket=/tmp/tailscaled.sock",
            "up",
            "--authkey=" + process.env.TS_AUTHKEY,
            "--hostname=faable-server",
            "--advertise-exit-node",
            "--accept-dns=false",
            "--shields-up" // جلوگیری از کانکشن‌های ورودی ناخواسته
        ], { env: tsEnv });

        auth.stdout.on('data', (d) => process.stdout.write(`[Auth] ${d}`));
        auth.stderr.on('data', (d) => process.stdout.write(`[Auth] ${d}`));
    }, 10000);
}
