const https = require('https');
const fs = require('fs');
const { execSync, spawn } = require('child_process');

console.log("Downloading Tailscale via Node.js...");
const file = fs.createWriteStream("ts.tgz");

https.get("https://pkgs.tailscale.com/stable/tailscale_1.74.0_amd64.tgz", (response) => {
    response.pipe(file);
    file.on("finish", () => {
        file.close();
        console.log("Download complete. Extracting...");
        execSync("tar xzf ts.tgz");

        console.log("Executing Tailscale script asynchronously...");
        // این خط تغییر کرد تا تمام لاگ‌ها و ارورهای تیل‌اسکیل در کنسول چاپ شود
        spawn("bash", ["start.sh"], { stdio: 'inherit' });

        const http = require('http');
        const port = process.env.SERVER_PORT || process.env.PORT || 8080;
        http.createServer((req, res) => res.end('Tailscale is running!')).listen(port, () => {
            console.log(`Dummy server listening on port ${port}`);
        });
    });
}).on('error', (err) => {
    console.error("Download error:", err.message);
});
