/**
 * 骰子配置文件
 * 定义不同类型的骰子及其概率
 */

const diceConfig = [
    {
        id: 'standard6',
        type: 'initial',
        name: '标准六面骰',
        description: '每个面出现的概率均等',
        color: '#ffffff', // 骰子颜色
        borderColor: '#333333', // 边框颜色
        dotColor: '#333333', // 点数颜色
        faces: [1, 2, 3, 4, 5, 6],
        // 概率权重数组，与faces数组对应，总和不需要为1
        weights: [1, 1, 1, 1, 1, 1] // 等权重
    },
    {
        id: 'standard8',
        type: 'initial',
        name: '标准八面骰',
        description: '每个面出现的概率均等',
        color: '#ffffff', // 骰子颜色
        borderColor: '#333333', // 边框颜色
        dotColor: '#333333', // 点数颜色
        faces: [1, 2, 3, 4, 5, 6, 7, 8],
        // 概率权重数组，与faces数组对应，总和不需要为1
        weights: [1, 1, 1, 1, 1, 1, 1, 1] // 等权重
    },
    {
        id: 'loaded6',
        type: 'initial',
        name: '灌铅六面骰',
        description: '数字1和6出现的概率更高',
        color: '#ffcccc', // 骰子颜色（淡红色）
        borderColor: '#cc0000', // 边框颜色（深红色）
        dotColor: '#cc0000', // 点数颜色（深红色）
        faces: [1, 2, 3, 4, 5, 6],
        // 概率权重数组，数字1和6的权重更高
        weights: [3, 1, 1, 1, 1, 3] // 1和6的权重为3，其他为1
    },
    {
        id: 'fourSided',
        type: 'extra',
        name: '四面骰',
        description: '数字为1-4，概率均等',
        color: '#ff6666', // 骰子颜色
        borderColor: '#333333', // 边框颜色
        dotColor: '#333333', // 点数颜色
        faces: [1, 2, 3, 4],
        // 概率权重数组，与faces数组对应，总和不需要为1
        weights: [1, 1, 1, 1], // 等权重
        cost: 10 // 购买成本
    },
    {
        id: 'special6',
        type: 'extra',
        name: '特殊六面骰',
        description: '数字为1,1,1,6,6,6，概率均等',
        color: '#66ff66', // 骰子颜色
        borderColor: '#333333', // 边框颜色
        dotColor: '#333333', // 点数颜色
        faces: [1, 1, 1, 6, 6, 6],
        // 概率权重数组，与faces数组对应，总和不需要为1
        weights: [1, 1, 1, 1, 1, 1], // 等权重
        cost: 15 // 购买成本
    },
    {
        id: 'multiplier',
        type: 'extra',
        name: '倍率骰',
        description: '数字为0.8-1.4，概率均等',
        color: '#6666ff', // 骰子颜色
        borderColor: '#333333', // 边框颜色
        dotColor: '#333333', // 点数颜色
        faces: [0.8, 0.9, 1.1, 1.2, 1.3, 1.4],
        // 概率权重数组，与faces数组对应，总和不需要为1
        weights: [1, 1, 1, 1, 1, 1], // 等权重
        cost: 20, // 购买成本
        isMultiplier: true // 标记为倍率骰
    },
    {
        id: 'blank',
        type: 'extra',
        name: '空白骰子',
        description: '会复制其他骰子的最大数字',
        color: '#cccccc', // 骰子颜色
        borderColor: '#333333', // 边框颜色
        dotColor: '#333333', // 点数颜色
        faces: [0, 0, 0, 0, 0, 0],
        // 概率权重数组，与faces数组对应，总和不需要为1
        weights: [1, 1, 1, 1, 1, 1], // 等权重
        cost: 25, // 购买成本
        isBlank: true // 标记为空白骰子
    }
];

// 导出骰子配置
try {
    module.exports = diceConfig;
} catch (e) {
    // 浏览器环境
    window.diceConfig = diceConfig;
}