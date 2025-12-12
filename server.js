const express = require("express");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");

const app = express();

// 解析表单（用于登录表单 password）
app.use(express.urlencoded({ extended: false }));

// 共享的基础样式（登录页与文件浏览页复用）
const BASE_STYLES = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #0b1220;
  --panel: #0d1526;
  --card: #111b30;
  --accent: #5eead4;
  --accent-strong: #22d3ee;
  --text: #e5e7eb;
  --muted: #9ca3af;
  --border: #1f2937;
  --shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  --radius: 14px;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Space Grotesk', 'Segoe UI', 'PingFang SC', 'Helvetica Neue', sans-serif;
  background: radial-gradient(circle at 20% 20%, rgba(94, 234, 212, 0.18), transparent 35%),
              radial-gradient(circle at 80% 0%, rgba(34, 211, 238, 0.16), transparent 30%),
              linear-gradient(135deg, #0b1220 0%, #0f172a 60%, #0b1220 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 18px;
  color: var(--text);
}
a { color: var(--accent); text-decoration: none; }
a:hover { color: var(--accent-strong); }
.shell { width: min(1100px, 100%); }
.glass {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 24px;
  position: relative;
  overflow: hidden;
}
.header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.header h1 {
  margin: 4px 0 4px;
  font-size: 28px;
  letter-spacing: 0.01em;
}
.eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}
.muted { color: var(--muted); font-size: 14px; }
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-weight: 600;
  color: #041023;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.2s;
  box-shadow: 0 10px 30px rgba(34, 211, 238, 0.25);
}
.btn:hover { transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
.btn-secondary {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
  box-shadow: none;
}
.btn-ghost {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  border: 1px solid var(--border);
}
.list {
  list-style: none;
  padding: 0;
  margin: 18px 0 0;
  display: grid;
  gap: 10px;
}
.item {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  transition: transform 0.12s ease, border-color 0.12s ease, background 0.12s;
}
.item:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.35);
  background: rgba(255, 255, 255, 0.05);
}
.item-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.item-link { color: inherit; text-decoration: none; display: flex; align-items: center; gap: 12px; min-width: 0; }
.item-link:hover { color: var(--accent-strong); }
.icon { font-size: 20px; line-height: 1; }
.name { font-weight: 600; color: var(--text); word-break: break-all; }
.meta { font-size: 13px; color: var(--muted); }
.actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.path-bar {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px dashed var(--border);
  background: rgba(255, 255, 255, 0.02);
  color: var(--muted);
}
.form { display: flex; flex-direction: column; gap: 14px; margin-top: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; color: var(--text); }
input[type="password"] {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
}
.notice { margin-top: 8px; font-size: 13px; color: var(--muted); }
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(94, 234, 212, 0.08);
  color: var(--accent);
  border: 1px solid rgba(94, 234, 212, 0.3);
  font-size: 13px;
}
@media (max-width: 720px) {
  body { padding: 18px 14px; }
  .header { flex-direction: column; }
  .actions { width: 100%; flex-wrap: wrap; }
  .actions .btn, .actions .btn-secondary, .actions .btn-ghost { flex: 1 1 auto; justify-content: center; }
  .item { flex-direction: column; align-items: flex-start; }
  .actions { width: 100%; justify-content: flex-start; }
}
</style>
`;

// ========= 配置区域 =========

// 访问密码（只有密码，没有用户名）
const PASSWORD = process.env.FILESHARE_PASS || "040805"; // 自行修改

// 共享根目录（改成你自己的目录）
// Windows 示例：
const SHARE_DIR = "D:\\Downloads";
// 跨平台示例（共享当前目录下的 shared 文件夹）：
// const SHARE_DIR = path.join(__dirname, "shared");

// ========= 初始化共享目录 =========

async function ensureShareDir() {
  try {
    await fsp.mkdir(SHARE_DIR, { recursive: true });
    console.log("共享根目录：", SHARE_DIR);
  } catch (e) {
    console.error("创建共享目录失败", e);
  }
}
ensureShareDir();

// ========= 工具函数 =========

/**
 * 根据相对路径（相对于 SHARE_DIR）计算安全的绝对路径
 * URL 里用 `/` 分隔，我们在这里拆成数组再 join
 */
function getSafePath(relPath = "") {
  const parts = relPath.split("/").filter(Boolean); // 去掉空串
  const absPath = path.resolve(SHARE_DIR, ...parts);
  if (!absPath.startsWith(SHARE_DIR)) {
    throw new Error("非法路径");
  }
  return absPath;
}

// 简单解析 Cookie
function getCookies(req) {
  const header = req.headers.cookie;
  const cookies = {};
  if (!header) return cookies;
  header.split(";").forEach((part) => {
    const [k, ...rest] = part.trim().split("=");
    const key = k;
    const value = rest.join("=");
    cookies[key] = decodeURIComponent(value || "");
  });
  return cookies;
}

// 只使用“密码”的登录校验（用 Cookie 记录是否已登录）
function authMiddleware(req, res, next) {
  // 登录/登出页面不需要先验证
  if (req.path === "/login" || req.path === "/logout") {
    return next();
  }

  const cookies = getCookies(req);
  if (cookies.auth === "ok") {
    return next(); // 已登录
  }

  // 未登录 → 跳转到登录页
  return res.redirect("/login");
}

// ========= 登录相关路由（不走 authMiddleware） =========

// 登录页：只输入密码
app.get("/login", (req, res) => {
  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>登录 - 文件共享</title>
  ${BASE_STYLES}
</head>
<body>
  <main class="shell">
    <div class="glass">
      <header class="header">
        <div>
          <div class="eyebrow">LAN File Share</div>
          <h1>登录</h1>
          <p class="muted">输入访问密码即可浏览共享文件</p>
        </div>
      </header>

      <form class="form" method="post" action="/login">
        <label class="field">
          <span>访问密码</span>
          <input type="password" name="password" placeholder="请输入访问密码" required />
        </label>
        <button class="btn" type="submit">进入</button>
        <p class="notice">提示：同一局域网内的设备可通过浏览器访问本页面。</p>
      </form>
    </div>
  </main>
</body>
</html>
  `;
  res.send(html);
});

// 提交密码
app.post("/login", (req, res) => {
  const pwd = (req.body.password || "").toString();
  if (pwd === PASSWORD) {
    // 设置一个简单的 Cookie 标记已登录
    // HttpOnly 防止前端 JS 访问，Path=/ 保证全站有效
    res.setHeader("Set-Cookie", "auth=ok; HttpOnly; Path=/");
    return res.redirect("/browse");
  }

  return res.send('密码错误，请重试。<br><a href="/login">返回登录页</a>');
});

// 退出登录（清除 Cookie）
app.get("/logout", (req, res) => {
  res.setHeader("Set-Cookie", "auth=; Max-Age=0; Path=/");
  res.redirect("/login");
});

// ========= 从这里开始，所有路由都需要密码 =========
app.use(authMiddleware);

// 首页重定向到 /browse
app.get("/", (req, res) => {
  res.redirect("/browse");
});

// 浏览目录
app.get("/browse", async (req, res) => {
  const rel = (req.query.path || "").toString(); // 例如 "", "子目录", "子目录/下一层"
  let currentFsPath;

  try {
    currentFsPath = getSafePath(rel);
  } catch (e) {
    return res.status(400).send("非法路径");
  }

  try {
    const entries = await fsp.readdir(currentFsPath, { withFileTypes: true });

    let html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>文件浏览器</title>
  ${BASE_STYLES}
</head>
<body>
  <main class="shell">
    <div class="glass">
      <header class="header">
        <div>
          <div class="eyebrow">LAN File Share</div>
          <h1>文件浏览器</h1>
          <p class="muted">当前路径：/${rel || ""}</p>
        </div>
        <div class="actions">
          <a class="btn-secondary" href="/logout">退出登录</a>
        </div>
      </header>
`;

    // 上一级
    if (rel) {
      const idx = rel.lastIndexOf("/");
      const parentRel = idx === -1 ? "" : rel.slice(0, idx);
      const parentUrl = `/browse?path=${encodeURIComponent(parentRel)}`;
      html += `<div class="path-bar">当前位置：/${
        rel || ""
      } · <a href="${parentUrl}">返回上一级</a></div>`;
    } else {
      html += `<div class="path-bar">当前位置：/（根目录）</div>`;
    }

    html += `<div class="notice">提示：批量下载会打开多个标签页，如果被拦截请在浏览器地址栏放行弹窗。</div>`;

    html += `<ul class="list">`;

    // 先列目录，再列文件
    const dirs = entries.filter((e) => e.isDirectory());
    const files = entries.filter((e) => e.isFile());

    // 目录：浏览 + 批量下载按钮
    for (const dir of dirs) {
      const entryRel = rel ? `${rel}/${dir.name}` : dir.name;
      const browseUrl = `/browse?path=${encodeURIComponent(entryRel)}`;
      const dataPath = encodeURIComponent(entryRel); // 存在 data-path 中，在前端再 decode

      html += `<li class="item">
        <a class="item-link" href="${browseUrl}">
          <span class="icon">📁</span>
          <div>
            <div class="name">${dir.name}</div>
            <div class="meta">文件夹 · 点击进入，右侧可批量下载</div>
          </div>
        </a>
        <div class="actions">
          <button class="btn-secondary" type="button" data-path="${dataPath}" onclick="event.stopPropagation(); batchDownloadFolder(this.dataset.path);">批量下载</button>
        </div>
      </li>`;
    }

    // 文件：单个下载
    for (const file of files) {
      const entryRel = rel ? `${rel}/${file.name}` : file.name;
      const url = `/download?path=${encodeURIComponent(entryRel)}`;
      html += `<li class="item">
        <div class="item-left">
          <span class="icon">📄</span>
          <div class="name">${file.name}</div>
        </div>
        <div class="actions">
          <a class="btn" href="${url}">下载</a>
        </div>
      </li>`;
    }

    if (!dirs.length && !files.length) {
      html += `<div class="notice">这个目录是空的，试着返回上一级或放一些文件进来吧。</div>`;
    }

    html += "</ul>";

    // 前端脚本：批量下载（多次请求 /download）
    html += `
<script>
let hasShownBatchPopupHint = false;
async function batchDownloadFolder(encodedPath) {
  if (!hasShownBatchPopupHint) {
    alert("首次批量下载前，请在浏览器地址栏放行此站点的弹窗（用于唤起多个下载）。");
    hasShownBatchPopupHint = true;
  }

  const relPath = decodeURIComponent(encodedPath || "");
  if (!confirm("确定要批量下载该文件夹及其所有子文件吗？\\n\\n路径: /" + relPath)) {
    return;
  }

  try {
    const resp = await fetch("/api/folder-files?path=" + encodeURIComponent(relPath));
    if (!resp.ok) {
      alert("获取文件列表失败");
      return;
    }
    const data = await resp.json();
    const files = data.files || [];

    if (!files.length) {
      alert("该文件夹下没有文件");
      return;
    }

    let idx = 0;
    function next() {
      if (idx >= files.length) {
        alert("任务已开始，请查看浏览器的下载列表。");
        return;
      }
      const a = document.createElement("a");
      a.href = "/download?path=" + encodeURIComponent(files[idx]);
      a.target = "_blank";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      idx++;
      // 下载间隔：默认 1 秒，每完成 10 次后间隔 10 秒
      const delay = (idx % 10 === 0) ? 10000 : 1000;
      setTimeout(next, delay);
    }

    next();
  } catch (e) {
    console.error(e);
    alert("批量下载出错: " + e.message);
  }
}
</script>
</div>
  </main>
</body>
</html>
`;
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("读取目录失败");
  }
});

// 递归列出某文件夹下所有文件（供批量下载用）
app.get("/api/folder-files", async (req, res) => {
  const rel = (req.query.path || "").toString(); // 例如 "", "子目录", "子目录/下一层"

  let folderPath;
  try {
    folderPath = getSafePath(rel);
  } catch (e) {
    return res.status(400).json({ error: "非法路径" });
  }

  try {
    const stat = await fsp.stat(folderPath);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: "目标不是文件夹" });
    }
  } catch (e) {
    console.error(e);
    return res.status(404).json({ error: "文件夹不存在" });
  }

  // 递归遍历目录，收集所有文件的“相对路径”
  async function walk(absDir, relPrefix) {
    const result = [];
    const entries = await fsp.readdir(absDir, { withFileTypes: true });

    for (const entry of entries) {
      const childAbs = path.join(absDir, entry.name);
      const childRel = relPrefix ? relPrefix + "/" + entry.name : entry.name;

      if (entry.isDirectory()) {
        const sub = await walk(childAbs, childRel);
        result.push(...sub);
      } else if (entry.isFile()) {
        result.push(childRel); // 例如 "folder/file.txt" 或 "folder/sub/file.iso"
      }
    }

    return result;
  }

  try {
    const files = await walk(folderPath, rel);
    res.json({ files });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "遍历目录失败" });
  }
});

// 单文件下载
app.get("/download", async (req, res) => {
  const rel = (req.query.path || "").toString();

  let filePath;
  try {
    filePath = getSafePath(rel);
  } catch (e) {
    return res.status(400).send("非法路径");
  }

  // 使用 res.download，内部是流式读取，不会一次性读入内存
  res.download(filePath, (err) => {
    if (err) {
      console.error(err);
      if (!res.headersSent) {
        res.status(404).send("文件不存在或无法下载");
      }
    }
  });
});

// ========= 启动服务 =========

const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`文件服务器已启动：http://0.0.0.0:${PORT}`);
  console.log(`访问密码: ${PASSWORD}`);
});

// 取消超时限制，避免大文件下载被中断
server.requestTimeout = 0;
server.headersTimeout = 0;
