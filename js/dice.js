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

    /**
     * 升级 a: 增加最大数字面的概率权重为原有的两倍
     */
    upgradeWeightMax() {
        const maxVal = Math.max(...this.sides);
        for (let i = 0; i < this.sides.length; i++) {
            if (this.sides[i] === maxVal) {
                this.weights[i] *= 2;
            }
        }
    }

    /**
     * 升级 b: 系统随机选择该骰子的一个面，将其数字改为同一颗骰子上另一个面的数字
     */
    upgradeSideSwap() {
        const targetIdx = Math.floor(Math.random() * this.sides.length);
        const sourceIdx = Math.floor(Math.random() * this.sides.length);
        this.sides[targetIdx] = this.sides[sourceIdx];
    }

    /**
     * 升级 c: 每个面的数字 +1。倍率骰不适用此升级
     */
    upgradeValueAdd() {
        if (this.type !== 'MULTIPLIER') {
            this.sides = this.sides.map(s => s + 1);
        }
    }

    clone() {
        const d = new Dice({
            id: this.id,
            name: this.name,
            sides: this.sides,
            weights: this.weights,
            type: this.type
        });
        d.lastRoll = this.lastRoll;
        return d;
    }
}

/**
 * 计分引擎 (遵循 dice.md)
 * 1. 确定每颗骰子的值（空白骰替换为当前非空白中的最大单颗值）
 * 2. 求所有非倍率骰之和
 * 3. 再乘上所有倍率骰的倍率之积
 * 
 * @param {Array} rolls - 本次投掷的基础点数
 * @param {Array} diceTypes - 对应骰子的类型
 */
export function calculateFinalScore(rolls, diceTypes) {
    let values = [...rolls];
    
    // 1. 处理空白骰子 (空白骰取非空白中的最大单值)
    const nonBlankValues = values.filter((v, i) => diceTypes[i] !== 'BLANK');
    const maxNonBlank = nonBlankValues.length > 0 ? Math.max(...nonBlankValues) : 0;
    
    values = values.map((v, i) => {
        if (diceTypes[i] === 'BLANK') return maxNonBlank;
        return v;
    });

    // 2. 分类求和与求倍率
    let baseSum = 0;
    let totalMultiplier = 1;
    let hasMultiplier = false;

    values.forEach((v, i) => {
        if (diceTypes[i] === 'MULTIPLIER') {
            totalMultiplier *= v;
            hasMultiplier = true;
        } else {
            // NORMAL 或处理后的 BLANK
            baseSum += v;
        }
    });

    // 3. 计算最终总分 (乘法叠加)
    return Math.floor(baseSum * totalMultiplier);
}
