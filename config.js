const path = require("path");

// 访问密码（只有密码，没有用户名）
const PASSWORD = process.env.FILESHARE_PASS || "040805"; // 自行修改

// 共享根目录（改成你自己的目录）
// Windows 示例
const SHARE_DIR = "D:\\Downloads";
// 跨平台示例（共享当前目录下的 shared 文件夹）
// const SHARE_DIR = path.join(__dirname, "shared");

const PORT = 3000;

module.exports = {
  PASSWORD,
  SHARE_DIR,
  PORT,
};
