
const https = require('https');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const http = require('http');

const port = process.env.PORT || 3000;

// ساخت یک محیط ایزوله برای تیل‌اسکیل تا پورت ۳۰۰۰ را نبیند و تداخل نکند
const tsEnv = Object.assign({}, process.env);
delete tsEnv.PORT;
tsEnv.GOMEMLIMIT = '100MiB';

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
            console.log("[Setup] Download complete. Extracting...");

            exec("tar xzf /tmp/ts.tgz -C /tmp", (err) => {
                if (err) {
                    console.error("[Setup] Extraction failed:", err);
                    return;
                }
                console.log("[Setup] Extracted successfully.");
                startTailscale();
            });
        });
    }).on('error', (err) => {
        console.error("[Setup] Download error:", err.message);
    });
}

function startTailscale() {
    console.log("[Tailscale] Starting daemon...");
    exec("mkdir -p /tmp/tailscale-state");

    const daemon = spawn("/tmp/tailscale_1.74.0_amd64/tailscaled", [
        "--tun=userspace-networking",
        "--socks5-server=localhost:1055",
        "--statedir=/tmp/tailscale-state",
        "--socket=/tmp/tailscaled.sock"
    ], { env: tsEnv });

    // چاپ لاگ‌های عادی بدون برچسب ارور اشتباه
    daemon.stdout.on('data', (d) => console.log(`[Daemon] ${d}`.trim()));
    daemon.stderr.on('data', (d) => console.log(`[Daemon] ${d}`.trim()));

    console.log("[Tailscale] Waiting 5 seconds for daemon to initialize...");
    setTimeout(() => {
        console.log("[Tailscale] Authenticating...");
        const auth = spawn("/tmp/tailscale_1.74.0_amd64/tailscale", [
            "--socket=/tmp/tailscaled.sock",
            "up",
            "--authkey=" + process.env.TS_AUTHKEY,
            "--hostname=faable-server",
            "--advertise-exit-node",
            "--accept-dns=false"
        ], { env: tsEnv });

        auth.stdout.on('data', (d) => console.log(`[Auth] ${d}`.trim()));
        auth.stderr.on('data', (d) => console.log(`[Auth] ${d}`.trim()));
    }, 5000);
}
