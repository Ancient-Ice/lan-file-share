const express = require("express");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");

const app = express();

// 解析表单（用于登录表单 password）
app.use(express.urlencoded({ extended: false }));

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
</head>
<body>
  <h1>文件共享登录</h1>
  <form method="post" action="/login">
    <label>访问密码：
      <input type="password" name="password" />
    </label>
    <button type="submit">登录</button>
  </form>
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
</head>
<body>
  <h1>文件浏览器</h1>
  <p>当前路径：/${rel}</p>
  <p><a href="/logout">退出登录</a></p>
`;

    // 上一级
    if (rel) {
      const idx = rel.lastIndexOf("/");
      const parentRel = idx === -1 ? "" : rel.slice(0, idx);
      const parentUrl = `/browse?path=${encodeURIComponent(parentRel)}`;
      html += `<p><a href="${parentUrl}">⬅ 返回上一级</a></p>`;
    }

    html += "<ul>";

    // 先列目录，再列文件
    const dirs = entries.filter((e) => e.isDirectory());
    const files = entries.filter((e) => e.isFile());

    // 目录：浏览 + 批量下载按钮
    for (const dir of dirs) {
      const entryRel = rel ? `${rel}/${dir.name}` : dir.name;
      const browseUrl = `/browse?path=${encodeURIComponent(entryRel)}`;
      const dataPath = encodeURIComponent(entryRel); // 存在 data-path 中，在前端再 decode

      html += `<li>
        📁 <a href="${browseUrl}">${dir.name}</a>
        - <a href="#" data-path="${dataPath}" onclick="batchDownloadFolder(this.dataset.path); return false;">批量下载</a>
      </li>`;
    }

    // 文件：单个下载
    for (const file of files) {
      const entryRel = rel ? `${rel}/${file.name}` : file.name;
      const url = `/download?path=${encodeURIComponent(entryRel)}`;
      html += `<li>📄 <a href="${url}">${file.name}</a></li>`;
    }

    html += "</ul>";

    // 前端脚本：批量下载（多次请求 /download）
    html += `
<script>
async function batchDownloadFolder(encodedPath) {
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
