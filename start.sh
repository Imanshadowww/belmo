#!/bin/bash

export GOMEMLIMIT=100MiB

echo "Starting tailscaled..."
/tmp/tailscale_1.74.0_amd64/tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &

sleep 5

echo "Authenticating Tailscale..."
/tmp/tailscale_1.74.0_amd64/tailscale up --authkey="${TS_AUTHKEY}" --hostname=faable-server --advertise-exit-node --accept-dns=false
