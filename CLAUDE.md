# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

"千王之王" 是一款基于 HTML/CSS/JS 单页应用构建的 roguelite 骰子游戏。玩家选择骰子，在有限次数内投掷达到目标总和，并在关卡之间赚取积分来升级骰子。

## 运行游戏

启动开发服务器：
```bash
# Windows (批处理)
start_server.bat

# 或直接使用 Python
python -m http.server 8000
```

然后在浏览器中打开 `http://localhost:8000`。

## 架构

### 三视图结构

HTML 通过 `display: none` 切换控制三个主要视图：

1. **主菜单** (`#mainMenu`) - 初始骰子选择和游戏开始
2. **游戏容器** (`#gameContainer`) - 活跃游戏和骰子投掷
3. **模态框** - `#resultModal`（关卡完成）和 `#cheatModal`（升级商店）

### 配置系统

游戏使用 `config/` 目录下的模块化配置系统：

- **`diceconfig.js`** - 定义所有骰子类型及其属性：
  - `type`: 'initial'（开局选择）或 'extra'（可购买）
  - `faces`: 可能值的数组
  - `weights`: 每个面的概率权重（总和不需要为 1）
  - 特殊标记：`isMultiplier`、`isBlank`

- **`levelconfig.js`** - 关卡进度：
  - `maxRolls`: 每关允许的投掷次数
  - `targetSum`: 通过所需分数
  - `scoreRule`: 基础积分 + 剩余投掷次数奖励

- **`cheatconfig.js`** - 升级选项和消耗品：
  - `cheatConfig`: 骰子修改（最大值权重翻倍、替换面等）
  - `consumableConfig`: 一次性物品（回溯、贪心、穷鬼祝福）

### 脚本结构

`js/script.js` 管理：
- **游戏状态**: 当前关卡、积分、选中的骰子库存、消耗品
- **骰子投掷逻辑**: 3D CSS 变换动画、加权随机生成
- **计分计算**: 处理倍率骰（应用于总和）、空白骰（复制最大值）和消耗品效果
- **视图切换**: 所有游戏屏幕的显示/隐藏逻辑

### 核心游戏流程

1. 玩家从 `diceConfig` 中 `type === 'initial'` 的骰子选择初始类型
2. 每个关卡：从库存中选择 1-3 个骰子，最多投掷 `maxRolls` 次
3. 分数 = 骰子值之和（倍率生效，空白复制最大值）
4. 如果 `currentSum >= targetSum`：获得积分，进入出千模态框
5. 出千模态框：花费积分购买升级或新骰子，然后进入下一关

### 骰子特殊行为

- **倍率骰**: 将其他骰子的最终总和相乘（倍率可叠加）
- **空白骰**: 其值变为非空白骰的最大值
- **消耗品"贪心"**: 下次投掷的最大值 +1
- **消耗品"穷鬼"**: 计分时忽略最小值骰子
