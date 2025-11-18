const express = require("express");
const path = require("path");
const fs = require("fs/promises");

const app = express();

// 共享的根目录：改成你自己的目录
// 可以用绝对路径，比如：
const SHARE_DIR = "D:\\Downloads"; // 👈 这里改成你要共享的目录
// 或者：const SHARE_DIR = 'D:/Downloads';

async function ensureShareDir() {
  try {
    await fs.mkdir(SHARE_DIR, { recursive: true });
  } catch (e) {
    console.error("创建共享目录失败", e);
  }
}
ensureShareDir();

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
    const entries = await fs.readdir(currentFsPath, { withFileTypes: true });

    let html = `<h1>文件浏览器</h1>`;
    html += `<p>当前路径：/${rel}</p>`;

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

    for (const dir of dirs) {
      const entryRel = rel ? `${rel}/${dir.name}` : dir.name;
      const url = `/browse?path=${encodeURIComponent(entryRel)}`;
      html += `<li>📁 <a href="${url}">${dir.name}</a></li>`;
    }

    for (const file of files) {
      const entryRel = rel ? `${rel}/${file.name}` : file.name;
      const url = `/download?path=${encodeURIComponent(entryRel)}`;
      html += `<li>📄 <a href="${url}">${file.name}</a></li>`;
    }

    html += "</ul>";

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("读取目录失败");
  }
});

// 下载文件
app.get("/download", async (req, res) => {
  const rel = (req.query.path || "").toString();

  let filePath;
  try {
    filePath = getSafePath(rel);
  } catch (e) {
    return res.status(400).send("非法路径");
  }

  res.download(filePath, (err) => {
    if (err) {
      console.error(err);
      if (!res.headersSent) {
        res.status(404).send("文件不存在或无法下载");
      }
    }
  });
});

const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`文件服务器已启动：http://0.0.0.0:${PORT}`);
  console.log(`共享根目录：${SHARE_DIR}`);
});

// 关闭请求超时限制（或设置成一个很大的值）
server.requestTimeout = 0;    // 不超时
server.headersTimeout = 0;    // 可选，同样取消 header 阶段超时
