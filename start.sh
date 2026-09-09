#!/bin/bash

export GOMAXPROCS=1
export GOMEMLIMIT=50MiB
export TS_NO_LOGS_NO_SUPPORT=true

echo "Starting tailscaled in userspace mode..."
./tailscale_1.74.0_amd64/tailscaled --tun=userspace-networking --socks5-server=localhost:1055 --socket=/tmp/tailscaled.sock &

sleep 5

echo "Authenticating Tailscale..."
./tailscale_1.74.0_amd64/tailscale --socket=/tmp/tailscaled.sock up --reset --authkey="${TS_AUTHKEY}" --hostname=Wispbyte-Server --advertise-exit-node --accept-dns=false
