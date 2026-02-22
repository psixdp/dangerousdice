# 启动本地服务器脚本
# 用于快速启动骰子游戏的本地服务器

Write-Host "正在启动骰子游戏服务器..."
Write-Host "请稍候..."

# 尝试使用 Python 启动 HTTP 服务器
try {
    python -m http.server 8000
} catch {
    Write-Host "尝试使用 python3 命令..."
    try {
        python3 -m http.server 8000
    } catch {
        Write-Host "启动失败！请确保 Python 已安装并添加到环境变量中。"
        Read-Host "按 Enter 键退出..."
    }
}
