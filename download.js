const https = require('https');
const fs = require('fs');
const { execSync, spawn } = require('child_process');
const http = require('http');

const port = process.env.PORT || 3000;

http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Tailscale OK');
}).listen(port, '0.0.0.0', () => {
    console.log(`Dummy server listening on port ${port}`);

    console.log("Downloading Tailscale...");
    const file = fs.createWriteStream("/tmp/ts.tgz");

    https.get("https://pkgs.tailscale.com/stable/tailscale_1.74.0_amd64.tgz", (response) => {
        response.pipe(file);
        file.on("finish", () => {
            file.close();
            console.log("Download complete. Extracting...");
            execSync("tar xzf /tmp/ts.tgz -C /tmp");

            console.log("Executing Tailscale...");
            spawn("bash", ["start.sh"], { stdio: 'inherit' });
        });
    });
});
