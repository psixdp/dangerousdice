import { CONFIG } from './config.js';
import { Dice } from './dice.js';
import { Dice3D } from './dice3d.js';

export class UI {
    constructor(gameState) {
        this.gs = gameState;
        this.currentScreen = 'screen-main';

        // 界面绑定
        this.screens = {
            main: document.getElementById('screen-main'),
            level: document.getElementById('screen-level'),
            shop: document.getElementById('screen-shop'),
            victory: document.getElementById('screen-victory')
        };

        this.selectedModeId = 'CLASSIC';
        this.selectedDiceId = 'STANDARD_6';
        this.shopStock = null;

        // 3D 骰子实例数组（仅用于关卡界面的投掷骰子）
        this.dice3DInstances = [];

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
        document.getElementById('btn-start').onclick = () => this.onStartGame();

        // 关卡界面
        document.getElementById('btn-quit').onclick = () => {
            if(confirm("确定要放弃本局吗？")) this.showScreen('main');
        };
        document.getElementById('btn-roll').onclick = () => this.onRoll();

        // 商店界面
        document.getElementById('btn-shop-quit').onclick = () => {
            if(confirm("确定要放弃本局吗？")) this.showScreen('main');
        };
        document.getElementById('btn-refresh').onclick = () => this.onRefreshShop();
        document.getElementById('btn-next').onclick = () => this.onNextLevel();

        // 胜利界面
        document.getElementById('btn-home').onclick = () => this.showScreen('main');

        // 结算弹窗
        document.getElementById('btn-result-continue').onclick = () => this.onResultContinue();
    }

    // --- 渲染逻辑 ---

    renderMainMenu() {
        // 模式选择
        const modeList = document.getElementById('mode-list');
        if (!modeList) {
            console.error("Element #mode-list not found!");
            return;
        }
        modeList.innerHTML = '';
        Object.values(CONFIG.MODES).forEach(mode => {
            const card = document.createElement('div');
            card.className = `card mode-card ${this.selectedModeId === mode.id ? 'selected' : ''}`;
            card.innerHTML = `<h3>${mode.name}</h3><p>${mode.description}</p>`;
            card.onclick = () => {
                this.selectedModeId = mode.id;
                this.renderMainMenu();
            };
            modeList.appendChild(card);
        });

        // 初始骰子选择
        const diceList = document.getElementById('dice-list');
        if (!diceList) {
            console.error("Element #dice-list not found!");
            return;
        }
        diceList.innerHTML = '';
        CONFIG.INITIAL_DICE.forEach(dice => {
            const card = document.createElement('div');
            card.className = `card dice-card ${this.selectedDiceId === dice.id ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="dice-preview" style="display:flex;align-items:center;justify-content:center;font-size:40px;background:rgba(255,255,255,0.1);width:80px;height:80px;border-radius:10px;">🎲</div>
                <div style="font-weight:bold; margin-top:10px;">${dice.name}</div>
            `;
            card.onclick = () => {
                this.selectedDiceId = dice.id;
                this.renderMainMenu();
            };
            diceList.appendChild(card);
        });
    }

    onStartGame() {
        this.gs.init(this.selectedModeId, this.selectedDiceId);
        this.renderLevel(true);  // 重新创建 3D 骰子
        this.showScreen('level');
    }

    renderLevel(recreateDice = false) {
        const level = this.gs.currentLevel;
        document.getElementById('ui-level-num').innerText = `第 ${this.gs.currentLevelIdx + 1} 关`;
        document.getElementById('ui-target-score').innerText = `目标：${level.target} 点`;
        document.getElementById('ui-throw-count').innerText = `次数：${this.gs.usedThrows} / ${level.throws}`;
        document.getElementById('ui-current-points').innerText = `当前累计：${this.gs.totalScoreInLevel}`;
        document.getElementById('ui-points-nav').innerText = `积分：${this.gs.points}`;

        // 历史记录
        const historyDiv = document.getElementById('ui-history');
        historyDiv.innerHTML = this.gs.history.length ? this.gs.history.map(h => `
            <div class="history-item">
                <strong>第 ${h.num} 次: ${h.score}分</strong>
                <div style="color:var(--text-grey); font-size:12px;">[${h.rolls.join(', ')}] ${h.info}</div>
            </div>
        `).join('') : '<div style="color:var(--text-muted);text-align:center;margin-top:20px;">暂无记录</div>';
        historyDiv.scrollTop = historyDiv.scrollHeight;

        // 消耗品记录
        document.getElementById('ui-consume-log').innerHTML = this.gs.consumeHistory.map(log => `
            <div class="history-item" style="color:var(--primary-gold)">${log}</div>
        `).join('') || '<div style="color:var(--text-muted);text-align:center;margin-top:20px;">暂无使用</div>';

        // 骰子桌 - 使用 3D 骰子
        const table = document.getElementById('ui-dice-table');

        // 如果需要重新创建或骰子数量不匹配
        if (recreateDice || this.dice3DInstances.length !== this.gs.diceInPlay.length) {
            table.innerHTML = '';
            this.dice3DInstances = [];

            this.gs.diceInPlay.forEach((d, index) => {
                const container = document.createElement('div');
                container.className = 'die-box';
                container.style.display = 'block';

                const dice3D = new Dice3D(container, d.lastRoll || 1);
                this.dice3DInstances.push(dice3D);

                table.appendChild(container);
            });
        } else {
            // 只更新骰子值，不重建
            this.dice3DInstances.forEach((dice3D, index) => {
                const value = this.gs.diceInPlay[index].lastRoll || 1;
                dice3D.setValue(value);
            });
        }

        // 背包
        const invDiv = document.getElementById('ui-inventory');
        invDiv.innerHTML = '';
        for (let i = 0; i < 2; i++) {
            const item = this.gs.inventory[i];
            const slot = document.createElement('div');
            slot.className = `inv-slot ${item ? 'active' : ''}`;
            if (item) {
                slot.innerHTML = `
                    <span style="font-size:30px;">${this.getIcon(item.type)}</span>
                    <div>
                        <div style="font-weight:bold">${item.name}</div>
                        <div style="font-size:11px;color:var(--text-grey)">点击使用</div>
                    </div>
                `;
                slot.onclick = () => this.onUseItem(i);
            } else {
                slot.innerHTML = `<span style="color:var(--text-muted)">空槽位</span>`;
            }
            invDiv.appendChild(slot);
        }
    }

    async onRoll() {
        if (this.gs.usedThrows >= this.gs.currentLevel.throws) return;

        // 获取所有骰子实例的 3D 滚动 promise
        const rollPromises = this.dice3DInstances.map(dice3D => {
            // 生成随机目标值用于动画
            const randomTarget = Math.floor(Math.random() * 6) + 1;
            return dice3D.roll(randomTarget);
        });

        // 执行实际投掷逻辑
        const record = this.gs.rollDice();

        // 等待 3D 滚动完成
        await Promise.all(rollPromises);

        // 更新 3D 骰子显示为实际结果
        this.dice3DInstances.forEach((dice3D, index) => {
            dice3D.setValue(this.gs.diceInPlay[index].lastRoll);
        });

        // 更新界面（历史记录、积分等），但不重建骰子
        this.renderLevel();

        // 检查过关逻辑
        if (record) {
            if (this.gs.isLevelPassed()) {
                setTimeout(() => {
                    this.showResultModal();
                }, 400);
            } else if (this.gs.isLevelFailed()) {
                setTimeout(() => {
                    alert("次数用尽，挑战失败！");
                    this.showScreen('main');
                }, 400);
            }
        }
    }

    onUseItem(idx) {
        const res = this.gs.useConsumable(idx);
        if (res && res.success) {
            this.renderLevel();
        }
    }

    // --- 商店逻辑 ---

    renderShop() {
        document.getElementById('ui-shop-points').innerText = `当前积分：${this.gs.points}`;
        const nextLevel = CONFIG.LEVELS[this.gs.currentLevelIdx];
        document.getElementById('ui-next-target').innerText = nextLevel ? `${nextLevel.target} 点` : '胜利！';

        if (!this.shopStock) this.refreshStock();

        const grid = document.getElementById('ui-shop-grid');
        grid.innerHTML = '';
        this.shopStock.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'card shop-card';
            card.innerHTML = `
                <div style="font-size:12px;color:var(--text-grey);align-self:flex-start;">[${item.category}]</div>
                <div class="icon">${this.getIcon(item.type || item.id)}</div>
                <h3 style="margin:10px 0">${item.name}</h3>
                <p style="font-size:12px;color:var(--text-grey);flex:1">${item.description}</p>
                <button class="btn-primary btn-buy">💰 ${item.price}</button>
            `;
            card.onclick = () => this.onBuyItem(item, idx);
            grid.appendChild(card);
        });
    }

    refreshStock() {
        this.shopStock = [];
        // 2 升级
        const ups = [...CONFIG.UPGRADES].sort(() => Math.random() - 0.5).slice(0, 2);
        ups.forEach(u => this.shopStock.push({...u, category: '骰子升级'}));
        // 1 消耗品
        const con = CONFIG.CONSUMABLES[Math.floor(Math.random() * CONFIG.CONSUMABLES.length)];
        this.shopStock.push({...con, category: '消耗品'});
        // 1 新骰子
        const die = CONFIG.EXTRA_DICE[Math.floor(Math.random() * CONFIG.EXTRA_DICE.length)];
        this.shopStock.push({...die, category: '新骰子'});
    }

    onRefreshShop() {
        if (this.gs.points >= this.gs.mode.refreshCost) {
            this.gs.points -= this.gs.mode.refreshCost;
            this.shopStock = null;
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

        if (item.category === '骰子升级') {
            const dIdx = prompt(`请选择要升级的骰子 (1-${this.gs.diceInPlay.length}):`, "1");
            const dice = this.gs.diceInPlay[parseInt(dIdx) - 1];
            if (dice) {
                if (item.type === 'WEIGHT') dice.upgradeWeightMax();
                if (item.type === 'SWAP') dice.upgradeSideSwap();
                if (item.type === 'ADD') dice.upgradeValueAdd();
                this.gs.points -= item.price;
                this.shopStock.splice(idx, 1);
                this.renderShop();
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
        // 增加关卡索引
        this.gs.currentLevelIdx++;

        if (this.gs.currentLevelIdx >= CONFIG.LEVELS.length) {
            this.showScreen('victory');
        } else {
            this.renderLevel(true);  // 重新创建 3D 骰子
            this.showScreen('level');
        }
    }

    getIcon(type) {
        const icons = {
            'ROLLBACK': '🔄', 'GREEDY': '🍀', 'POOR': '👁️',
            'WEIGHT': '📈', 'SWAP': '✨', 'ADD': '➕',
            'FOUR_SIDED': '🔺', 'SIX_111666': '🎲', 'MULTIPLIER_6': '✖️', 'BLANK_6': '⚪'
        };
        return icons[type] || '🎁';
    }

    // --- 结算弹窗逻辑 ---

    showResultModal() {
        // 先结算关卡获取数据
        const result = this.gs.finishLevel();
        this.shopStock = null;

        // 填充弹窗数据 - creditsgot: 本关卡获得的积分
        document.getElementById('creditsgot-value').textContent = `+${result.gained}`;

        // 填充弹窗数据 - creditsowned: 结算后的总积分
        document.getElementById('creditsowned-value').textContent = this.gs.points;

        // 显示弹窗（带动画）
        const modal = document.getElementById('result-modal');
        modal.classList.remove('hidden');
        modal.classList.add('visible');

        // 动画完成后允许点击（500ms 后）
        setTimeout(() => {
            modal.classList.add('clickable');
        }, 500);
    }

    onResultContinue() {
        // 隐藏弹窗
        const modal = document.getElementById('result-modal');
        modal.classList.remove('visible');
        modal.classList.remove('clickable');

        // 延迟后进入商店界面
        setTimeout(() => {
            modal.classList.add('hidden');
            this.renderShop();
            this.showScreen('shop');
        }, 300);
    }
}
