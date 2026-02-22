/**
 * 出千配置文件
 * 定义出千系统的修改选项
 */

const cheatConfig = [
    {
        id: 'increase',
        name: '数字+1',
        description: '随机选择一个面，数字+1',
        icon: '➕'
    },
    {
        id: 'randomize',
        name: '随机修改',
        description: '随机修改一个面的数字',
        icon: '🎲'
    },
    {
        id: 'double-weight',
        name: '概率翻倍',
        description: '指定修改一个面的概率权重，将其*2',
        icon: '📈'
    }
];

// 导出出千配置
try {
    module.exports = cheatConfig;
} catch (e) {
    // 浏览器环境
    window.cheatConfig = cheatConfig;
}