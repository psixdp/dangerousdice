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
        this.nextRollEffect = null; // 'GREEDY' 或 'POOR'
        this.lastRollState = null; // 用于回溯
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

    rollDice() {
        if (this.usedThrows >= this.currentLevel.throws) return null;

        // 备份状态以便回溯
        this.lastRollState = {
            totalScore: this.totalScoreInLevel,
            usedThrows: this.usedThrows,
            diceInPlay: this.diceInPlay.map(d => d.clone())
        };

        this.usedThrows++;
        const rolls = this.diceInPlay.map(d => d.roll());
        const diceTypes = this.diceInPlay.map(d => d.type);

        let finalRolls = [...rolls];
        let info = "";

        // 状态效果处理
        if (this.nextRollEffect === 'GREEDY') {
            const maxVal = Math.max(...finalRolls);
            finalRolls = finalRolls.map(v => v === maxVal ? v + 1 : v);
            info = "幸运花生效：最大值 +1";
            this.nextRollEffect = null;
        }

        let score = 0;
        if (this.nextRollEffect === 'POOR') {
            // 忽略一颗最小骰子
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
            info = "穷鬼之眼生效：忽略最小值 " + minVal;
            this.nextRollEffect = null;
        } else {
            score = calculateScore(finalRolls, diceTypes);
        }

        this.totalScoreInLevel += score;
        
        const rollRecord = {
            num: this.usedThrows,
            rolls: finalRolls,
            score: score,
            info: info
        };
        this.history.push(rollRecord);

        return rollRecord;
    }

    useConsumable(itemType) {
        if (itemType === 'ROLLBACK') {
            if (!this.lastRollState) return false;
            this.totalScoreInLevel = this.lastRollState.totalScore;
            this.usedThrows = this.lastRollState.usedThrows;
            this.history.pop();
            this.lastRollState = null;
            this.consumeHistory.push("使用了重投币");
            return true;
        } else if (itemType === 'GREEDY') {
            this.nextRollEffect = 'GREEDY';
            this.consumeHistory.push("使用了幸运花");
            return true;
        } else if (itemType === 'POOR') {
            this.nextRollEffect = 'POOR';
            this.consumeHistory.push("使用了穷鬼之眼");
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
        const interest = Math.min(this.mode.maxInterest, Math.floor(this.points * this.mode.interestRate));
        
        this.points += levelBonus + interest;
        
        // 重置关卡临时状态
        this.totalScoreInLevel = 0;
        this.usedThrows = 0;
        this.history = [];
        this.consumeHistory = [];
        this.lastRollState = null;
        this.nextRollEffect = null;
    }
}
