# 📡 Network Speed Monitor Applet for Cinnamon

<img width="1600" height="908" alt="Untitled" src="https://github.com/user-attachments/assets/30fec654-c36a-421d-bea2-18b0d2d3bdb9" />

This is a simple **network speed monitor** applet for the Cinnamon desktop environment (used in Linux Mint). It displays **real-time upload (Δ)** and **download (∇)** speeds for your active network interface, updated every 3 seconds.

## Features

- Displays current **download** and **upload** speeds in:
  - bps (bits per second)
  - kbps
  - Mbps
  - Gbps
- Automatically detects the active network interface using `ip route`
- Lightweight and efficient — uses native Linux stats from `/proc/net/dev`
- Written in JavaScript using Cinnamon's applet framework
- Clean, readable UI with monospace font formatting

## 🔧 Installation

You can install the applet by cloning the GitHub repository.

```bash
git clone https://github.com/namanraiyani/Network-Speed-Monitor-Applet.git
cd Network-Speed-Monitor-Applet
cp -r network-speed-monitor@yourname ~/.local/share/cinnamon/applets/
```
