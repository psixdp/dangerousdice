/**
 * 关卡配置文件
 * 定义各个关卡的可投掷次数和目标数字
 */

const levelConfig = [
    {
        level: 1,
        maxRolls: 3, // 最大投掷次数
        targetSum: 8 // 目标数字和
    },
    {
        level: 2,
        maxRolls: 3,
        targetSum: 10
    },
    {
        level: 3,
        maxRolls: 4,
        targetSum: 14
    },
    {
        level: 4,
        maxRolls: 4,
        targetSum: 16
    },
    {
        level: 5,
        maxRolls: 5,
        targetSum: 20
    }
];

// 导出关卡配置
try {
    module.exports = levelConfig;
} catch (e) {
    // 浏览器环境
    window.levelConfig = levelConfig;
}