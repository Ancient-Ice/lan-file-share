const os = require("os");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

function getLanIPv4s() {
  const nets = os.networkInterfaces();
  const ips = new Set();

  for (const list of Object.values(nets)) {
    if (!list) continue;
    for (const net of list) {
      if (net.family === "IPv4" && !net.internal) {
        ips.add(net.address);
      }
    }
  }

  return [...ips];
}

function commandExists(cmd) {
  const pathExts =
    process.platform === "win32"
      ? (process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM").split(";")
      : [""];
  const pathDirs = (process.env.PATH || "")
    .split(path.delimiter)
    .filter(Boolean);

  for (const dir of pathDirs) {
    for (const ext of pathExts) {
      const fullPath = path.join(dir, cmd + ext);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
  }

  return null;
}

function findChromeCommand() {
  const platform = process.platform;

  if (platform === "win32") {
    const bases = [
      process.env.PROGRAMFILES,
      process.env["PROGRAMFILES(X86)"],
      process.env.LOCALAPPDATA,
    ].filter(Boolean);

    for (const base of bases) {
      const candidate = path.join(
        base,
        "Google",
        "Chrome",
        "Application",
        "chrome.exe"
      );
      if (fs.existsSync(candidate)) {
        return { command: candidate, args: [] };
      }
    }

    return null;
  }

  if (platform === "darwin") {
    if (fs.existsSync("/Applications/Google Chrome.app")) {
      return { command: "open", args: ["-a", "Google Chrome"] };
    }
    return null;
  }

  const linuxCandidates = [
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
  ];

  for (const cmd of linuxCandidates) {
    const resolved = commandExists(cmd);
    if (resolved) {
      return { command: resolved, args: [] };
    }
  }

  return null;
}

function spawnDetached(command, args) {
  const child = spawn(command, args, { stdio: "ignore", detached: true });
  child.on("error", (err) => {
    console.error(`Failed to launch browser: ${err.message}`);
  });
  child.unref();
}

function openDefaultUrl(url) {
  const platform = process.platform;

  if (platform === "win32") {
    spawnDetached("cmd", ["/c", "start", "", url]);
    return;
  }

  if (platform === "darwin") {
    spawnDetached("open", [url]);
    return;
  }

  spawnDetached("xdg-open", [url]);
}

function openInBrowser(url) {
  const chrome = findChromeCommand();

  if (chrome) {
    const child = spawn(chrome.command, [...chrome.args, url], {
      stdio: "ignore",
      detached: true,
    });
    child.on("error", () => {
      openDefaultUrl(url);
    });
    child.unref();
    return;
  }

  openDefaultUrl(url);
}

module.exports = {
  getLanIPv4s,
  openInBrowser,
};
