#!/bin/bash

# محدود کردن شدید منابع برای فرار از سقف ۱۵ درصدی پردازنده
export GOMAXPROCS=1
export GOMEMLIMIT=50MiB
export TS_NO_LOGS_NO_SUPPORT=true

echo "Starting tailscaled in ultra-light mode..."
./tailscale_1.74.0_amd64/tailscaled --tun=userspace-networking --socks5-server=localhost:1055 --socket=/tmp/tailscaled.sock --no-logs-no-support &
sleep 3

echo "Authenticating Tailscale..."
./tailscale_1.74.0_amd64/tailscale --socket=/tmp/tailscaled.sock up --authkey="${TS_AUTHKEY}" --hostname=Wispbyte-Server --advertise-exit-node --accept-dns=false --shields-up
