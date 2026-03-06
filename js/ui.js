import { CONFIG } from './config.js';
import { Dice } from './dice.js';

export class UI {
    constructor(gameState) {
        this.gs = gameState;
        this.currentScreen = 'screen-main';
        
        // 绑定元素
        this.screens = {
            main: document.getElementById('screen-main'),
            level: document.getElementById('screen-level'),
            shop: document.getElementById('screen-shop'),
            victory: document.getElementById('screen-victory')
        };

        this.initEvents();
        this.renderMainMenu();
    }

    showScreen(screenId) {
        Object.values(this.screens).forEach(s => s.classList.add('hidden'));
        this.screens[screenId].classList.remove('hidden');
        this.currentScreen = screenId;
    }

    initEvents() {
        // 主界面
        document.getElementById('btn-start').addEventListener('click', () => this.onStartGame());

        // 关卡界面
        document.getElementById('btn-level-back').addEventListener('click', () => {
            if(confirm("确定要放弃本局对局并返回主菜单吗？")) this.showScreen('main');
        });
        document.getElementById('btn-roll').addEventListener('click', () => this.onRoll());

        // 商店界面
        document.getElementById('btn-shop-back').addEventListener('click', () => {
            if(confirm("确定要放弃本局对局并返回主菜单吗？")) this.showScreen('main');
        });
        document.getElementById('btn-refresh').addEventListener('click', () => this.onRefreshShop());
        document.getElementById('btn-next-level').addEventListener('click', () => this.onNextLevel());

        // 结算界面
        document.getElementById('btn-victory-home').addEventListener('click', () => this.showScreen('main'));
    }

    // --- 主界面 ---
    renderMainMenu() {
        const modeList = document.getElementById('mode-options');
        modeList.innerHTML = '';
        Object.values(CONFIG.MODES).forEach(mode => {
            const card = document.createElement('div');
            card.className = 'card' + (this.selectedModeId === mode.id ? ' selected' : '');
            card.innerHTML = `<h3>${mode.name}</h3><p>${mode.description}</p>`;
            card.onclick = () => {
                this.selectedModeId = mode.id;
                this.renderMainMenu();
            };
            modeList.appendChild(card);
        });

        const diceList = document.getElementById('dice-options');
        diceList.innerHTML = '';
        CONFIG.INITIAL_DICE.forEach(dice => {
            const card = document.createElement('div');
            card.className = 'card' + (this.selectedDiceId === dice.id ? ' selected' : '');
            card.innerHTML = `<div class="dice-icon">6</div><h3>${dice.name}</h3>`;
            card.onclick = () => {
                this.selectedDiceId = dice.id;
                this.renderMainMenu();
            };
            diceList.appendChild(card);
        });

        // 默认选中
        if (!this.selectedModeId) this.selectedModeId = CONFIG.MODES.CLASSIC.id;
        if (!this.selectedDiceId) this.selectedDiceId = CONFIG.INITIAL_DICE[0].id;
    }

    onStartGame() {
        this.gs.init(this.selectedModeId, this.selectedDiceId);
        this.renderLevel();
        this.showScreen('level');
    }

    // --- 关卡界面 ---
    renderLevel() {
        const level = this.gs.currentLevel;
        document.getElementById('txt-level-num').innerText = `第 ${this.gs.currentLevelIdx + 1} 关`;
        document.getElementById('txt-target').innerText = `目标：${level.target} 点`;
        document.getElementById('txt-throws').innerText = `投掷次数：${this.gs.usedThrows} / ${level.throws}`;
        document.getElementById('txt-remaining').innerText = `剩余：${level.throws - this.gs.usedThrows}`;
        document.getElementById('txt-total-score').innerText = this.gs.totalScoreInLevel;

        this.renderHistory();
        this.renderInventory();
        this.renderDiceTable();
    }

    renderHistory() {
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        if (this.gs.history.length === 0) {
            list.innerHTML = '<div class="empty-msg">暂无投掷记录</div>';
            return;
        }
        this.gs.history.forEach(h => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.style.padding = '8px';
            item.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
            item.innerHTML = `<strong>第${h.num}次：${h.score}分</strong> <br><small>结果：[${h.rolls.join(', ')}]</small>`;
            list.appendChild(item);
        });
        list.scrollTop = list.scrollHeight;

        const cList = document.getElementById('consume-history');
        cList.innerHTML = this.gs.consumeHistory.length > 0 ? this.gs.consumeHistory.map(h => `<div style="padding:5px;font-size:12px;">${h}</div>`).join('') : '<div class="empty-msg">暂无使用记录</div>';
    }

    renderInventory() {
        const grid = document.getElementById('inventory');
        grid.innerHTML = '';
        for (let i = 0; i < 2; i++) {
            const item = this.gs.inventory[i];
            const slot = document.createElement('div');
            slot.className = 'slot' + (item ? '' : ' empty');
            if (item) {
                const icon = item.type === 'ROLLBACK' ? '🔄' : (item.type === 'GREEDY' ? '🍀' : '👁️');
                slot.innerHTML = `<div class="item-icon">${icon}</div><div class="item-name">${item.name}</div>`;
                slot.onclick = () => this.onUseItem(i);
            }
            grid.appendChild(slot);
        }
    }

    renderDiceTable(rolls = []) {
        const table = document.getElementById('dice-table');
        table.innerHTML = '';
        this.gs.diceInPlay.forEach((d, i) => {
            const die = document.createElement('div');
            die.className = 'die';
            die.innerText = rolls[i] !== undefined ? rolls[i] : (d.lastRoll || '?');
            table.appendChild(die);
        });
    }

    onRoll() {
        const record = this.gs.rollDice();
        if (record) {
            this.renderLevel();
            if (this.gs.isLevelPassed()) {
                setTimeout(() => {
                    alert("过关成功！获得奖励积分。");
                    this.gs.finishLevel();
                    this.renderShop();
                    this.showScreen('shop');
                }, 500);
            } else if (this.gs.isLevelFailed()) {
                setTimeout(() => {
                    alert("游戏结束：点数不足，请重试！");
                    this.showScreen('main');
                }, 500);
            }
        }
    }

    onUseItem(idx) {
        const item = this.gs.inventory[idx];
        if (this.gs.useConsumable(item.type)) {
            this.gs.inventory.splice(idx, 1);
            this.renderLevel();
        }
    }

    // --- 商店界面 ---
    renderShop() {
        document.getElementById('txt-points').innerText = this.gs.points;
        const nextTarget = CONFIG.LEVELS[this.gs.currentLevelIdx + 1]?.target || '???';
        document.getElementById('txt-next-target').innerText = `${nextTarget} 点`;

        if (!this.shopStock) this.refreshStock();

        const shopGrid = document.getElementById('shop-items');
        shopGrid.innerHTML = '';
        this.shopStock.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'shop-card';
            const icon = this.getItemIcon(item);
            card.innerHTML = `
                <span class="tag">${item.category}</span>
                <div class="icon">${icon}</div>
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="price">🪙 ${item.price}</div>
            `;
            card.onclick = () => this.onBuyItem(item, idx);
            shopGrid.appendChild(card);
        });
    }

    getItemIcon(item) {
        if (item.category === '升级') return '✨';
        if (item.category === '消耗品') return '🎒';
        if (item.category === '新骰子') return '🎲';
        return '❓';
    }

    refreshStock() {
        this.shopStock = [];
        // 2个升级
        const upgrades = [...CONFIG.UPGRADES].sort(() => Math.random() - 0.5).slice(0, 2);
        upgrades.forEach(u => this.shopStock.push({ ...u, category: '升级' }));
        // 1个消耗品
        const consumable = CONFIG.CONSUMABLES[Math.floor(Math.random() * CONFIG.CONSUMABLES.length)];
        this.shopStock.push({ ...consumable, category: '消耗品' });
        // 1个新骰子
        const extraDice = CONFIG.EXTRA_DICE[Math.floor(Math.random() * CONFIG.EXTRA_DICE.length)];
        this.shopStock.push({ ...extraDice, category: '新骰子' });
    }

    onRefreshShop() {
        if (this.gs.points >= this.gs.mode.refreshCost) {
            this.gs.points -= this.gs.mode.refreshCost;
            this.refreshStock();
            this.renderShop();
        } else {
            alert("积分不足！");
        }
    }

    onBuyItem(item, idx) {
        if (this.gs.points < item.price) {
            alert("积分不足！");
            return;
        }

        if (item.category === '升级') {
            // 选择骰子进行升级
            const diceIdx = prompt(`请选择要升级的骰子编号 (1-${this.gs.diceInPlay.length}):`, "1");
            const dIdx = parseInt(diceIdx) - 1;
            if (this.gs.diceInPlay[dIdx]) {
                const dice = this.gs.diceInPlay[dIdx];
                if (item.type === 'WEIGHT') dice.upgradeWeightMax();
                else if (item.type === 'SWAP') dice.upgradeSideSwap();
                else if (item.type === 'ADD') dice.upgradeValueAdd();
                this.gs.points -= item.price;
                this.shopStock.splice(idx, 1);
                this.renderShop();
            } else {
                alert("无效的骰子编号");
            }
        } else if (item.category === '消耗品') {
            if (this.gs.inventory.length < 2) {
                this.gs.points -= item.price;
                this.gs.inventory.push(item);
                this.shopStock.splice(idx, 1);
                this.renderShop();
            } else {
                alert("背包已满！");
            }
        } else if (item.category === '新骰子') {
            if (this.gs.diceInPlay.length < 5) {
                this.gs.points -= item.price;
                this.gs.diceInPlay.push(new Dice(item));
                this.shopStock.splice(idx, 1);
                this.renderShop();
            } else {
                alert("骰子桌已满！");
            }
        }
    }

    onNextLevel() {
        this.gs.currentLevelIdx++;
        if (this.gs.currentLevelIdx >= CONFIG.LEVELS.length) {
            this.showScreen('victory');
        } else {
            this.shopStock = null;
            this.renderLevel();
            this.showScreen('level');
        }
    }
}
