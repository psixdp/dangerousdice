export const CONFIG = {
    // 画布尺寸
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,

    // 对局类型
    MODES: {
        CLASSIC: {
            id: 'CLASSIC',
            name: '经典对局',
            description: '初始积分：10 | 结算：5 + 剩余次数×2 | 利息：20% (Max 5)',
            initialPoints: 10,
            interestRate: 0.2,
            maxInterest: 5,
            refreshCost: 20, // 暂时定为 20
            calcScore: (remThrows, usedThrows) => 5 + remThrows * 2
        },
        SNAKE: {
            id: 'SNAKE',
            name: '贪吃蛇',
            description: '初始积分：5 | 结算：剩余×3 - 已用×1 | 利息：20% (Max 5)',
            initialPoints: 5,
            interestRate: 0.2,
            maxInterest: 5,
            refreshCost: 20,
            calcScore: (remThrows, usedThrows) => remThrows * 3 - usedThrows * 1
        }
    },

    // 初始骰子池
    INITIAL_DICE: [
        {
            id: 'STANDARD_6',
            name: '标准六面骰',
            sides: [1, 2, 3, 4, 5, 6],
            weights: [1, 1, 1, 1, 1, 1],
            type: 'NORMAL'
        },
        {
            id: 'STANDARD_8',
            name: '标准八面骰',
            sides: [1, 2, 3, 4, 5, 6, 7, 8],
            weights: [1, 1, 1, 1, 1, 1, 1, 1],
            type: 'NORMAL'
        },
        {
            id: 'WEIGHTED_6',
            name: '灌铅六面骰',
            sides: [1, 2, 3, 4, 5, 6],
            weights: [3, 1, 1, 1, 1, 3], // 1, 6 权重为 3
            type: 'NORMAL'
        }
    ],

    // 额外骰子池 (仅在商店刷出)
    EXTRA_DICE: [
        {
            id: 'FOUR_SIDED',
            name: '四面骰',
            sides: [1, 2, 3, 4],
            weights: [1, 1, 1, 1],
            type: 'NORMAL',
            price: 15
        },
        {
            id: 'SIX_111666',
            name: '极限六面骰',
            sides: [1, 1, 1, 6, 6, 6],
            weights: [1, 1, 1, 1, 1, 1],
            type: 'NORMAL',
            price: 15
        },
        {
            id: 'MULTIPLIER_6',
            name: '倍率骰',
            sides: [0.8, 0.9, 1.1, 1.2, 1.3, 1.4],
            weights: [1, 1, 1, 1, 1, 1],
            type: 'MULTIPLIER',
            price: 20
        },
        {
            id: 'BLANK_6',
            name: '空白骰',
            sides: [0, 0, 0, 0, 0, 0], // 逻辑中处理
            weights: [1, 1, 1, 1, 1, 1],
            type: 'BLANK',
            price: 18
        }
    ],

    // 升级项
    UPGRADES: [
        {
            id: 'WEIGHT_MAX',
            name: '概率加倍',
            description: '最大数字面权重为原有的两倍',
            price: 10,
            type: 'WEIGHT'
        },
        {
            id: 'SIDE_SWAP',
            name: '面位互换',
            description: '随机一个面改为另一个面的数字',
            price: 12,
            type: 'SWAP'
        },
        {
            id: 'VALUE_ADD',
            name: '点数加成',
            description: '每个面的数字 +1 (倍率骰不适用)',
            price: 15,
            type: 'ADD'
        }
    ],

    // 消耗品 (背包上限 2)
    CONSUMABLES: [
        {
            id: 'ROLLBACK',
            name: '回溯祝福',
            description: '撤销最近一次投掷，不扣次数并重投',
            price: 8,
            type: 'ROLLBACK'
        },
        {
            id: 'GREEDY',
            name: '贪心祝福',
            description: '下次投掷中，最大点数面额外 +1',
            price: 10,
            type: 'GREEDY'
        },
        {
            id: 'POOR',
            name: '穷鬼祝福',
            description: '下次计分时，忽略一颗最小值的骰子',
            price: 6,
            type: 'POOR'
        }
    ],

    // 关卡配置 (根据需求调整)
    LEVELS: [
        { target: 10, throws: 10 },
        { target: 20, throws: 10 },
        { target: 40, throws: 9 },
        { target: 80, throws: 9 },
        { target: 150, throws: 8 },
        { target: 300, throws: 8 },
        { target: 500, throws: 7 },
        { target: 800, throws: 6 }
    ]
};
