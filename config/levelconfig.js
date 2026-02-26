/**
 * 关卡配置文件
 * 定义各个关卡的可投掷次数和目标数字
 */

const levelConfig = [
    {
        level: 1,
        maxRolls: 3, // 最大投掷次数
        targetSum: 8, // 目标数字和
        initialScore: 0, // 初始积分
        scoreRule: {
            type: 'default', // 计分方式类型
            basePoints: 10, // 基础胜利积分
            bonusPointsPerRoll: 2 // 剩余投掷次数的奖励积分
        }
    },
    {
        level: 2,
        maxRolls: 3,
        targetSum: 10,
        scoreRule: {
            type: 'default',
            basePoints: 15,
            bonusPointsPerRoll: 2
        }
    },
    {
        level: 3,
        maxRolls: 4,
        targetSum: 14,
        scoreRule: {
            type: 'default',
            basePoints: 20,
            bonusPointsPerRoll: 2
        }
    },
    {
        level: 4,
        maxRolls: 4,
        targetSum: 16,
        scoreRule: {
            type: 'default',
            basePoints: 25,
            bonusPointsPerRoll: 2
        }
    },
    {
        level: 5,
        maxRolls: 5,
        targetSum: 20,
        scoreRule: {
            type: 'default',
            basePoints: 30,
            bonusPointsPerRoll: 2
        }
    }
];

// 导出关卡配置
try {
    module.exports = levelConfig;
} catch (e) {
    // 浏览器环境
    window.levelConfig = levelConfig;
}