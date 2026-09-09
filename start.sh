#!/bin/bash

# پاک کردن متغیر پورت برای جلوگیری از تداخل با سرور وب
unset PORT

# محدودیت رم برای سرور رایگان
export GOMEMLIMIT=100MiB

# ساخت یک پوشه مجاز در tmp برای ذخیره اطلاعات لاگین تیل‌اسکیل
mkdir -p /tmp/tailscale-state

# زمان‌بندی برای اجرای دستور لاگین (۵ ثانیه بعد از روشن شدن هسته)
echo "Scheduling Tailscale Auth..."
(
    sleep 5
    echo "Authenticating Tailscale..."
    /tmp/tailscale_1.74.0_amd64/tailscale up --authkey="${TS_AUTHKEY}" --hostname=faable-server --advertise-exit-node --accept-dns=false
) &

# اجرای هسته تیل‌اسکیل در پیش‌زمینه (Foreground) و تعیین مسیر مجاز
echo "Starting tailscaled..."
exec /tmp/tailscale_1.74.0_amd64/tailscaled --tun=userspace-networking --socks5-server=localhost:1055 --statedir=/tmp/tailscale-state
