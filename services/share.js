const fsp = require("fs/promises");
const path = require("path");
const { SHARE_DIR } = require("../config");

async function ensureShareDir() {
  try {
    await fsp.mkdir(SHARE_DIR, { recursive: true });
    console.log("共享根目录：", SHARE_DIR);
  } catch (e) {
    console.error("创建共享目录失败", e);
  }
}

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

module.exports = {
  ensureShareDir,
  getSafePath,
};
