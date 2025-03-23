const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
// 获取当前文件夹路径
const currentDir = "/www/wwwroot/software/mysql/data/";
let fileList = [];
let completeFileList = [];
let remain = 100;

function deleteFile() {
    fileList = []
    completeFileList = []
    // 读取当前文件夹内容
    fs.readdir(currentDir, (err, files) => {
        if (err) {
            console.error(`无法读取文件夹：${err.message}`);
            return;
        }
        // 输出文件列表
        console.log(`当前文件夹（${currentDir}）中的文件：`);
        files.forEach((file) => {
            const filePath = path.join(currentDir, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
                console.log(`📄 文件：${file}`);
                if (file.includes("binlog.")) {
                    const name = file.replace("binlog.", "") * 1;
                    if (!isNaN(name)) {
                        fileList.push(name);
                        completeFileList.push(`${currentDir}${file}`);
                    }
                }
            } else if (stats.isDirectory()) {
                console.log(`📁 文件夹：${file}`);
            }
        });
        if (completeFileList.length > remain) {
            fileList = fileList.sort((a, b) => a - b);
            fileList = fileList.splice(0, fileList.length - remain);
            completeFileList.forEach((item) => {
                fileList.forEach((name) => {
                    if (item.includes(name)) {
                        try {
                          fs.unlinkSync(item);
                          console.log(`${item} 被删除`);
                        } catch(error) {
                          console.error(`删除错误：${error}`)
                        }
                    }
                });
            });
        }
    });
}


deleteFile();
// 每 2 天执行一次的任务
cron.schedule(
    "0 0 0 */2 * *",
    () => {
        console.log("每 2 天执行一次的任务开始运行...");
        // 在这里编写你的任务逻辑
        deleteFile();
        console.log("任务执行完成！");
    },
    {
        timezone: "Asia/Shanghai", // 设置时区（可选）
    }
);
