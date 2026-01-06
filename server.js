const express = require("express");
const { PORT, PASSWORD } = require("./config");
const { ensureShareDir } = require("./services/share");
const { getLanIPv4s, openInBrowser } = require("./services/browser");
const routes = require("./routes");

const app = express();

// 解析表单（用于登录表单 password）
app.use(express.urlencoded({ extended: false }));

app.use(routes);

ensureShareDir();

// ========= 启动服务 =========

const server = app.listen(PORT, () => {
  const localhostUrl = `http://127.0.0.1:${PORT}`;
  const lanIps = getLanIPv4s();

  if (lanIps.length) {
    console.log("LAN URLs:");
    lanIps.forEach((ip) => console.log(`  http://${ip}:${PORT}`));
  } else {
    console.log("LAN URLs: (none detected)");
  }

  const openUrl = lanIps[0] ? `http://${lanIps[0]}:${PORT}` : localhostUrl;
  openInBrowser(openUrl);
  console.log(`访问密码: ${PASSWORD}`);
});

// 取消超时限制，避免大文件下载被中断
server.requestTimeout = 0;
server.headersTimeout = 0;
