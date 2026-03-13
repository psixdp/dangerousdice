import { CONFIG } from './config.js';
import { Dice, calculateFinalScore } from './dice.js';

export class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.mode = null;
        this.currentLevelIdx = 0;
        this.points = 0;
        this.diceInPlay = []; 
        this.inventory = []; // 背包上限 2
        this.totalScoreInLevel = 0;
        this.usedThrows = 0;
        this.history = []; 
        this.consumeHistory = [];
        
        // 状态效果 (对下一次生效)
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

    /**
     * 核心投掷逻辑 (内部)
     */
    _performRoll() {
        const rolls = this.diceInPlay.map(d => d.roll());
        const diceTypes = this.diceInPlay.map(d => d.type);

        let processedRolls = [...rolls];
        let infoLines = [];

        // 3.2 贪心祝福：最大点数面额外 +1
        if (this.nextRollEffect === 'GREEDY') {
            const maxVal = Math.max(...processedRolls);
            processedRolls = processedRolls.map(v => v === maxVal ? v + 1 : v);
            infoLines.push("贪心祝福生效: 最大面+1");
            this.nextRollEffect = null;
        }

        let score = 0;
        // 3.3 穷鬼祝福：忽略一颗最小值
        if (this.nextScoreEffect === 'POOR') {
            const minVal = Math.min(...processedRolls);
            let ignored = false;
            const filteredRolls = [];
            const filteredTypes = [];
            
            processedRolls.forEach((v, i) => {
                if (!ignored && v === minVal) {
                    ignored = true;
                } else {
                    filteredRolls.push(v);
                    filteredTypes.push(diceTypes[i]);
                }
            });
            
            score = calculateFinalScore(filteredRolls, filteredTypes);
            infoLines.push("穷鬼祝福生效: 忽略一颗最小值");
            this.nextScoreEffect = null;
        } else {
            score = calculateFinalScore(processedRolls, diceTypes);
        }

        return { 
            originalRolls: rolls, 
            processedRolls, 
            score, 
            info: infoLines.join(", ") 
        };
    }

    rollDice() {
        if (this.usedThrows >= this.currentLevel.throws) return null;

        this.usedThrows++;
        const result = this._performRoll();

        this.totalScoreInLevel += result.score;
        
        const rollRecord = {
            num: this.usedThrows,
            rolls: result.processedRolls,
            score: result.score,
            info: result.info
        };
        this.history.push(rollRecord);

        return rollRecord;
    }

    useConsumable(itemIndex) {
        const item = this.inventory[itemIndex];
        if (!item) return null;

        if (item.type === 'ROLLBACK') {
            if (this.history.length === 0) return { success: false, msg: "无可回溯的投掷" };
            
            // 撤销最近一次结果 (不扣投掷次数)
            const lastRecord = this.history.pop();
            this.totalScoreInLevel -= lastRecord.score;
            
            // 重新投掷
            const result = this._performRoll();
            this.totalScoreInLevel += result.score;
            
            const rollRecord = {
                num: lastRecord.num,
                rolls: result.processedRolls,
                score: result.score,
                info: (result.info + " (回溯重投)").trim()
            };
            this.history.push(rollRecord);
            
            this.consumeHistory.push(`使用了回溯祝福 (替换第 ${lastRecord.num} 次)`);
            this.inventory.splice(itemIndex, 1);
            return { success: true, type: 'ROLLBACK', record: rollRecord };

        } else if (item.type === 'GREEDY') {
            this.nextRollEffect = 'GREEDY';
            this.consumeHistory.push("使用了贪心祝福 (下次投掷生效)");
            this.inventory.splice(itemIndex, 1);
            return { success: true, type: 'GREEDY' };

        } else if (item.type === 'POOR') {
            this.nextScoreEffect = 'POOR';
            this.consumeHistory.push("使用了穷鬼祝福 (下次计分生效)");
            this.inventory.splice(itemIndex, 1);
            return { success: true, type: 'POOR' };
        }
        return { success: false, msg: "未知消耗品" };
    }

    isLevelPassed() {
        return this.totalScoreInLevel >= this.currentLevel.target;
    }

    isLevelFailed() {
        return !this.isLevelPassed() && this.usedThrows >= this.currentLevel.throws;
    }

    /**
     * 结算关卡 (遵循 game.md)
     */
    finishLevel() {
        const remThrows = this.currentLevel.throws - this.usedThrows;
        
        // 1. 计算本关积分
        const levelBonus = this.mode.calcScore(remThrows, this.usedThrows);
        
        // 2. 计算利息: 持有总积分的 20%，向下取整，最大 5
        const interest = Math.min(this.mode.maxInterest, Math.floor(this.points * this.mode.interestRate));
        
        const totalGained = levelBonus + interest;
        this.points += totalGained;
        
        // 重置本关临时状态
        this.totalScoreInLevel = 0;
        this.usedThrows = 0;
        this.history = [];
        this.consumeHistory = [];
        this.nextRollEffect = null;
        this.nextScoreEffect = null;

        return { gained: totalGained, bonus: levelBonus, interest: interest };
    }
}
