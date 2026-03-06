export const CONFIG = {
    // 画布尺寸
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,

    // 对局类型
    MODES: {
        CLASSIC: {
            id: 'CLASSIC',
            name: '经典对局',
            description: '初始积分：100，目标：1000',
            initialPoints: 100,
            interestRate: 0.2,
            maxInterest: 5,
            refreshCost: 50,
            calcScore: (remThrows, usedThrows) => 5 + remThrows * 2
        },
        SNAKE: {
            id: 'SNAKE',
            name: '贪吃蛇',
            description: '初始积分：50，高难度挑战',
            initialPoints: 50,
            interestRate: 0.2,
            maxInterest: 5,
            refreshCost: 50,
            calcScore: (remThrows, usedThrows) => Math.max(0, remThrows * 3 - usedThrows * 1)
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
            price: 150
        },
        {
            id: 'SIX_111666',
            name: '极端六面骰',
            sides: [1, 1, 1, 6, 6, 6],
            weights: [1, 1, 1, 1, 1, 1],
            type: 'NORMAL',
            price: 150
        },
        {
            id: 'MULTIPLIER_6',
            name: '倍率骰',
            sides: [0.8, 0.9, 1.1, 1.2, 1.3, 1.4],
            weights: [1, 1, 1, 1, 1, 1],
            type: 'MULTIPLIER',
            price: 200
        },
        {
            id: 'BLANK_6',
            name: '空白骰',
            sides: [0, 0, 0, 0, 0, 0], // 逻辑中处理
            weights: [1, 1, 1, 1, 1, 1],
            type: 'BLANK',
            price: 180
        },
        {
            id: 'TWELVE_SIDED',
            name: '十二面骰',
            sides: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            weights: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            type: 'NORMAL',
            price: 150
        }
    ],

    // 升级项
    UPGRADES: [
        {
            id: 'WEIGHT_MAX',
            name: '概率加倍',
            description: '最大数字面权重翻倍',
            price: 100,
            type: 'WEIGHT'
        },
        {
            id: 'SIDE_SWAP',
            name: '幸运强化',
            description: '随机一面对调',
            price: 120,
            type: 'SWAP'
        },
        {
            id: 'VALUE_ADD',
            name: '点数加成',
            description: '所有面点数 +1',
            price: 100,
            type: 'ADD'
        }
    ],

    // 消耗品
    CONSUMABLES: [
        {
            id: 'ROLLBACK',
            name: '重投币',
            description: '回溯上一次投掷',
            price: 80,
            type: 'ROLLBACK'
        },
        {
            id: 'GREEDY',
            name: '幸运花',
            description: '下次投掷最大点数 +1',
            price: 100,
            type: 'GREEDY'
        },
        {
            id: 'POOR',
            name: '穷鬼之眼',
            description: '下次计分忽略最小值',
            price: 60,
            type: 'POOR'
        }
    ],

    // 关卡配置
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
