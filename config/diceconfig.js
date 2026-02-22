/**
 * 骰子配置文件
 * 定义不同类型的骰子及其概率
 */

const diceConfig = [
    {
        id: 'standard',
        name: '标准六面骰子',
        description: '每个面出现的概率均等',
        color: '#ffffff', // 骰子颜色
        borderColor: '#333333', // 边框颜色
        dotColor: '#333333', // 点数颜色
        faces: [1, 2, 3, 4, 5, 6],
        // 概率权重数组，与faces数组对应，总和不需要为1
        weights: [1, 1, 1, 1, 1, 1] // 等权重
    },
    {
        id: 'loaded',
        name: '灌铅骰子',
        description: '数字6出现的概率更高',
        color: '#ffcccc', // 骰子颜色（淡红色）
        borderColor: '#cc0000', // 边框颜色（深红色）
        dotColor: '#cc0000', // 点数颜色（深红色）
        faces: [1, 2, 3, 4, 5, 6],
        // 概率权重数组，数字6的权重更高
        weights: [2, 2, 2, 2, 2, 5] // 6的权重为5，其他为2
    }
];

// 导出骰子配置
try {
    module.exports = diceConfig;
} catch (e) {
    // 浏览器环境
    window.diceConfig = diceConfig;
}