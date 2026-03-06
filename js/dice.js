export class Dice {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.sides = [...config.sides];
        this.weights = [...config.weights];
        this.type = config.type; // NORMAL, MULTIPLIER, BLANK
        this.lastRoll = null;
    }

    roll() {
        const totalWeight = this.weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < this.sides.length; i++) {
            if (random < this.weights[i]) {
                this.lastRoll = this.sides[i];
                return this.lastRoll;
            }
            random -= this.weights[i];
        }
        this.lastRoll = this.sides[this.sides.length - 1];
        return this.lastRoll;
    }

    // 升级：最大面权重翻倍
    upgradeWeightMax() {
        const maxVal = Math.max(...this.sides);
        for (let i = 0; i < this.sides.length; i++) {
            if (this.sides[i] === maxVal) {
                this.weights[i] *= 2;
            }
        }
    }

    // 升级：随机面互换
    upgradeSideSwap() {
        const idx1 = Math.floor(Math.random() * this.sides.length);
        const idx2 = Math.floor(Math.random() * this.sides.length);
        this.sides[idx1] = this.sides[idx2];
    }

    // 升级：所有面 +1 (倍率骰不适用)
    upgradeValueAdd() {
        if (this.type === 'NORMAL') {
            this.sides = this.sides.map(s => s + 1);
        }
    }

    clone() {
        return new Dice({
            id: this.id,
            name: this.name,
            sides: this.sides,
            weights: this.weights,
            type: this.type
        });
    }
}

export function calculateScore(rolls, diceTypes) {
    // rolls: 数组，包含每颗骰子的掷出值
    // diceTypes: 数组，包含每颗骰子的类型 (NORMAL, MULTIPLIER, BLANK)
    
    let values = [...rolls];
    
    // 1. 处理空白骰子：取非空白骰中的最大单颗值
    const normalAndMultiplierValues = values.filter((v, i) => diceTypes[i] !== 'BLANK');
    const maxNormalValue = normalAndMultiplierValues.length > 0 ? Math.max(...normalAndMultiplierValues) : 0;
    
    values = values.map((v, i) => {
        if (diceTypes[i] === 'BLANK') return maxNormalValue;
        return v;
    });

    // 2. 求所有非倍率骰之和
    let sum = 0;
    values.forEach((v, i) => {
        if (diceTypes[i] !== 'MULTIPLIER') {
            sum += v;
        }
    });

    // 3. 乘上所有倍率骰的倍率
    let totalMultiplier = 1;
    values.forEach((v, i) => {
        if (diceTypes[i] === 'MULTIPLIER') {
            totalMultiplier *= v;
        }
    });

    return Math.floor(sum * totalMultiplier);
}
