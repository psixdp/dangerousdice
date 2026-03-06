import { CONFIG } from './config.js';
import { Dice, calculateScore } from './dice.js';

export class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.mode = null;
        this.currentLevelIdx = 0;
        this.points = 0;
        this.diceInPlay = []; // 包含 Dice 实例
        this.inventory = []; // 消耗品对象
        this.totalScoreInLevel = 0;
        this.usedThrows = 0;
        this.history = []; // 每关投掷历史
        this.consumeHistory = [];
        
        // 状态效果
        this.nextRollEffect = null; // 'GREEDY'
        this.nextScoreEffect = null; // 'POOR'
    }

    init(modeId, initialDiceId) {
        this.reset();
        this.mode = CONFIG.MODES[modeId];
        this.points = this.mode.initialPoints;
        
        const diceConfig = CONFIG.INITIAL_DICE.find(d => d.id === initialDiceId);
        this.diceInPlay = [new Dice(diceConfig)];
    }

    get currentLevel() {
        return CONFIG.LEVELS[this.currentLevelIdx];
    }

    // 执行一次投掷逻辑，返回结果对象
    _performRoll() {
        const rolls = this.diceInPlay.map(d => d.roll());
        const diceTypes = this.diceInPlay.map(d => d.type);

        let finalRolls = [...rolls];
        let info = "";

        // 3.2 贪心祝福：最大点数面额外 +1
        if (this.nextRollEffect === 'GREEDY') {
            const maxVal = Math.max(...finalRolls);
            finalRolls = finalRolls.map(v => v === maxVal ? v + 1 : v);
            info += "贪心生效 (+1) ";
            this.nextRollEffect = null;
        }

        let score = 0;
        // 3.3 穷鬼祝福：忽略一颗最小值
        if (this.nextScoreEffect === 'POOR') {
            const minVal = Math.min(...finalRolls);
            let ignored = false;
            const filteredRolls = [];
            const filteredTypes = [];
            finalRolls.forEach((v, i) => {
                if (!ignored && v === minVal) {
                    ignored = true;
                } else {
                    filteredRolls.push(v);
                    filteredTypes.push(diceTypes[i]);
                }
            });
            score = calculateScore(filteredRolls, filteredTypes);
            info += "穷鬼生效 (略最小) ";
            this.nextScoreEffect = null;
        } else {
            score = calculateScore(finalRolls, diceTypes);
        }

        return { rolls: finalRolls, score, info };
    }

    rollDice() {
        if (this.usedThrows >= this.currentLevel.throws) return null;

        this.usedThrows++;
        const result = this._performRoll();

        this.totalScoreInLevel += result.score;
        
        const rollRecord = {
            num: this.usedThrows,
            rolls: result.rolls,
            score: result.score,
            info: result.info
        };
        this.history.push(rollRecord);

        return rollRecord;
    }

    useConsumable(itemType) {
        if (itemType === 'ROLLBACK') {
            if (this.history.length === 0) return false;
            
            // 撤销最近一次结果
            const lastRecord = this.history.pop();
            this.totalScoreInLevel -= lastRecord.score;
            
            // 重新投掷（不扣次数，即用本次结果替代上一次结果）
            const result = this._performRoll();
            this.totalScoreInLevel += result.score;
            
            const rollRecord = {
                num: lastRecord.num,
                rolls: result.rolls,
                score: result.score,
                info: (result.info + " (回溯重投)").trim()
            };
            this.history.push(rollRecord);
            
            this.consumeHistory.push("使用了回溯祝福");
            return { type: 'ROLLBACK', record: rollRecord };
        } else if (itemType === 'GREEDY') {
            this.nextRollEffect = 'GREEDY';
            this.consumeHistory.push("使用了贪心祝福");
            return true;
        } else if (itemType === 'POOR') {
            this.nextScoreEffect = 'POOR';
            this.consumeHistory.push("使用了穷鬼祝福");
            return true;
        }
        return false;
    }

    isLevelPassed() {
        return this.totalScoreInLevel >= this.currentLevel.target;
    }

    isLevelFailed() {
        return !this.isLevelPassed() && this.usedThrows >= this.currentLevel.throws;
    }

    finishLevel() {
        const remThrows = this.currentLevel.throws - this.usedThrows;
        const levelBonus = this.mode.calcScore(remThrows, this.usedThrows);
        
        // 利息：20%，最大 5
        const interest = Math.min(this.mode.maxInterest, Math.floor(this.points * this.mode.interestRate));
        
        this.points += levelBonus + interest;
        
        // 重置关卡状态
        this.totalScoreInLevel = 0;
        this.usedThrows = 0;
        this.history = [];
        this.consumeHistory = [];
        this.nextRollEffect = null;
        this.nextScoreEffect = null;
    }
}
