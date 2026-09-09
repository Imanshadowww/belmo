const https = require('https');
const fs = require('fs');
const { execSync, exec } = require('child_process');
const http = require('http');

const port = process.env.PORT || 3000;

http.createServer((req, res) => res.end('Tailscale is running!')).listen(port, '0.0.0.0', () => {
    console.log(`Dummy server listening immediately on port ${port}`);

    console.log("Downloading Tailscale via Node.js...");
    const file = fs.createWriteStream("/tmp/ts.tgz");

    https.get("https://pkgs.tailscale.com/stable/tailscale_1.74.0_amd64.tgz", (response) => {
        response.pipe(file);
        file.on("finish", () => {
            file.close();
            console.log("Download complete. Extracting...");
            execSync("tar xzf /tmp/ts.tgz -C /tmp");

            console.log("Executing Tailscale script asynchronously...");
            exec("bash start.sh", (error, stdout, stderr) => {
                if (stdout) console.log(`Bash Log: ${stdout}`);
                if (stderr) console.error(`Bash Error: ${stderr}`);
                if (error) console.error(`Exec Error: ${error.message}`);
            });
        });
    }).on('error', (err) => {
        console.error("Download error:", err.message);
    });
});
