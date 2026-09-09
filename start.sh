#!/bin/bash

echo "Starting tailscaled in userspace mode..."
./tailscale_1.74.0_amd64/tailscaled --tun=userspace-networking --socks5-server=localhost:1055 --socket=/tmp/tailscaled.sock &
sleep 3

echo "Authenticating Tailscale..."
./tailscale_1.74.0_amd64/tailscale --socket=/tmp/tailscaled.sock up --authkey="${TS_AUTHKEY}" --hostname=faable-server --advertise-exit-node
