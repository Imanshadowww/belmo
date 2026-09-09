#!/bin/bash

unset PORT
export GOMEMLIMIT=100MiB

mkdir -p /tmp/tailscale-state

echo "Scheduling Tailscale Auth..."
(
    sleep 5
    echo "Authenticating Tailscale..."
    /tmp/tailscale_1.74.0_amd64/tailscale --socket=/tmp/tailscaled.sock up --authkey="${TS_AUTHKEY}" --hostname=faable-server --advertise-exit-node --accept-dns=false
) &

echo "Starting tailscaled..."
exec /tmp/tailscale_1.74.0_amd64/tailscaled --tun=userspace-networking --socks5-server=localhost:1055 --statedir=/tmp/tailscale-state --socket=/tmp/tailscaled.sock
