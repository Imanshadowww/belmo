#!/bin/bash

echo "Starting tailscaled in userspace mode..."
/tmp/tailscale_1.74.0_amd64/tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &
sleep 3

echo "Authenticating Tailscale..."
/tmp/tailscale_1.74.0_amd64/tailscale up --authkey="${TS_AUTHKEY}" --hostname=faable-server --advertise-exit-node &
