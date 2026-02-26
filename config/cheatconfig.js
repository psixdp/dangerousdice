/**
 * 出千配置文件
 * 定义出千系统的修改选项
 */

const cheatConfig = [
    {
        id: 'increase',
        name: '数字+1',
        description: '每个面的数字+1，倍率骰无效',
        icon: '➕',
        cost: 3 // 积分消耗量
    },
    {
        id: 'double-max-weight',
        name: '最大数字概率翻倍',
        description: '增加最大数字的概率权重为原有的两倍',
        icon: '📈',
        cost: 5 // 积分消耗量
    },
    {
        id: 'replace-face',
        name: '替换面数字',
        description: '将一个随机面替换为其他某个面的数字',
        icon: '🔄',
        cost: 4 // 积分消耗量
    },
    {
        id: 'buy-dice',
        name: '购买骰子',
        description: '购买额外的骰子',
        icon: '🎲',
        cost: 0 // 积分消耗量（实际消耗由骰子类型决定）
    }
];

// 消耗品配置
const consumableConfig = [
    {
        id: 'backtrack',
        name: '回溯祝福',
        description: '重新投掷1次骰子，不额外扣除投掷次数',
        icon: '⏪',
        cost: 8 // 积分消耗量
    },
    {
        id: 'greed',
        name: '贪心祝福',
        description: '下次投掷，最大点数额外+1，如果有重复的，都加1',
        icon: '💰',
        cost: 10 // 积分消耗量
    },
    {
        id: 'poor',
        name: '穷鬼祝福',
        description: '下次计分，会忽略掷出最小值的骰子',
        icon: '🤏',
        cost: 6 // 积分消耗量
    }
];

// 导出配置
try {
    module.exports = { cheatConfig, consumableConfig };
} catch (e) {
    // 浏览器环境
    window.cheatConfig = cheatConfig;
    window.consumableConfig = consumableConfig;
}