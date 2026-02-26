/**
 * 骰子游戏脚本 - 关卡模式
 * 功能：实现骰子的3D旋转动画、随机点数生成和关卡机制
 */

// 确保DOM加载完成后执行
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，开始初始化游戏');
    
    // DOM元素引用
    const mainMenu = document.getElementById('mainMenu');
    const gameContainer = document.getElementById('gameContainer');
    const diceOptions = document.getElementById('diceOptions');
    const startButton = document.getElementById('startButton');
    const backButton = document.getElementById('backButton');
    const backToMainButton = document.getElementById('backToMainButton');
    const dice = document.getElementById('dice');
    const rollButton = document.getElementById('rollButton');
    const resultModal = document.getElementById('resultModal');
    const nextLevelButton = document.getElementById('nextLevelButton');
    const backToFirstButton = document.getElementById('backToFirstButton');
    
    // 出千界面DOM元素
    const cheatModal = document.getElementById('cheatModal');
    const dicePreview = document.getElementById('dicePreview');
    const cheatOptions = document.getElementById('cheatOptions');
    const historyItems = document.getElementById('historyItems');
    const continueButton = document.getElementById('continueButton');
    const resetDiceButton = document.getElementById('resetDiceButton');
    
    // 关卡信息DOM元素
    const currentLevelEl = document.getElementById('currentLevel');
    const rollCountEl = document.getElementById('rollCount');
    const currentSumEl = document.getElementById('currentSum');
    const targetSumEl = document.getElementById('targetSum');
    
    // 结算界面DOM元素
    const resultTitleEl = document.getElementById('resultTitle');
    const resultMessageEl = document.getElementById('resultMessage');
    const resultLevelEl = document.getElementById('resultLevel');
    const resultSumEl = document.getElementById('resultSum');
    const resultTargetEl = document.getElementById('resultTarget');
    
    // 检查DOM元素是否正确获取
    console.log('DOM元素获取结果:');
    console.log('mainMenu:', mainMenu);
    console.log('gameContainer:', gameContainer);
    console.log('diceOptions:', diceOptions);
    console.log('startButton:', startButton);
    console.log('backButton:', backButton);
    console.log('backToMainButton:', backToMainButton);
    console.log('dice:', dice);
    console.log('rollButton:', rollButton);
    console.log('resultModal:', resultModal);
    console.log('nextLevelButton:', nextLevelButton);
    console.log('backToFirstButton:', backToFirstButton);
    console.log('currentLevelEl:', currentLevelEl);
    console.log('rollCountEl:', rollCountEl);
    console.log('currentSumEl:', currentSumEl);
    console.log('targetSumEl:', targetSumEl);
    
    // 骰子各面对应的旋转角度
    const diceFaces = {
        1: { x: 0, y: 0 },
        2: { x: 0, y: 90 },
        3: { x: 0, y: 180 },
        4: { x: 0, y: -90 },
        5: { x: 90, y: 0 },
        6: { x: -90, y: 0 }
    };
    
    // 游戏状态
    let gameState = {
        currentLevel: 1,
        currentRolls: 0,
        currentSum: 0,
        currentScore: 0, // 当前积分
        isRolling: false,
        isGameOver: false,
        selectedDice: 'standard6', // 默认选择标准六面骰
        diceCount: 1, // 当前使用的骰子数量
        diceList: [], // 骰子列表
        modifiedDice: null, // 修改后的骰子配置
        cheatHistory: [], // 出千修改历史
        usedCheats: [], // 已使用的出千选项ID
        consumables: [], // 消耗品列表
        hasRolled: false // 是否已经投掷过骰子
    };
    
    // 获取关卡配置
    const levelConfig = window.levelConfig || [];
    console.log('关卡配置:', levelConfig);
    
    // 获取骰子配置（暂时使用空数组，在generateDiceOptions函数中会重新获取）
    let diceConfig = [];
    console.log('初始骰子配置:', diceConfig);
    
    // 获取出千配置
    const cheatConfig = window.cheatConfig || [];
    console.log('出千配置:', cheatConfig);
    
    // 获取消耗品配置
    const consumableConfig = window.consumableConfig || [];
    console.log('消耗品配置:', consumableConfig);
    
    /**
     * 获取当前关卡配置
     * @returns {Object} 当前关卡配置
     */
    function getCurrentLevelConfig() {
        const config = levelConfig.find(level => level.level === gameState.currentLevel) || levelConfig[0];
        console.log('当前关卡配置:', config);
        return config;
    }
    
    /**
     * 获取当前选中的骰子配置
     * @returns {Object} 当前骰子配置
     */
    function getCurrentDiceConfig() {
        const config = diceConfig.find(dice => dice.id === gameState.selectedDice) || diceConfig[0];
        console.log('当前骰子配置:', config);
        return config;
    }
    
    /**
     * 归一化权重数组，转换为概率数组
     * @param {Array} weights 权重数组
     * @returns {Array} 归一化后的概率数组
     */
    function normalizeWeights(weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        return weights.map(weight => weight / totalWeight);
    }
    
    /**
     * 根据权重为指定骰子生成随机点数
     * @param {Object} diceConfig 骰子配置
     * @returns {number} 生成的点数
     */
    function generateRandomNumber(diceConfig) {
        const probabilities = normalizeWeights(diceConfig.weights);
        const random = Math.random();
        let cumulativeProbability = 0;
        
        for (let i = 0; i < diceConfig.faces.length; i++) {
            cumulativeProbability += probabilities[i];
            if (random <= cumulativeProbability) {
                return diceConfig.faces[i];
            }
        }
        
        // 防止概率计算错误，返回最后一个面
        return diceConfig.faces[diceConfig.faces.length - 1];
    }
    
    /**
     * 计算多个骰子的总和
     * @param {Array} diceResults 骰子结果数组
     * @param {Array} diceConfigs 骰子配置数组
     * @returns {number} 计算后的总和
     */
    function calculateDiceSum(diceResults, diceConfigs) {
        let sum = 0;
        let multipliers = [];
        let maxNumber = 0;
        
        // 首先计算基础数字和找出最大值
        for (let i = 0; i < diceResults.length; i++) {
            const result = diceResults[i];
            const config = diceConfigs[i];
            
            if (config.isMultiplier) {
                multipliers.push(result);
            } else if (config.isBlank) {
                // 空白骰子暂时跳过，后面会处理
            } else {
                sum += result;
                if (result > maxNumber) {
                    maxNumber = result;
                }
            }
        }
        
        // 处理空白骰子
        for (let i = 0; i < diceResults.length; i++) {
            const config = diceConfigs[i];
            if (config.isBlank) {
                sum += maxNumber;
            }
        }
        
        // 处理倍率骰子
        if (multipliers.length > 0) {
            const totalMultiplier = multipliers.reduce((acc, val) => acc * val, 1);
            sum = Math.round(sum * totalMultiplier);
        }
        
        // 处理贪心祝福
        if (gameState.greedActive) {
            const maxResult = Math.max(...diceResults.filter((result, i) => !diceConfigs[i].isMultiplier));
            const maxCount = diceResults.filter((result, i) => !diceConfigs[i].isMultiplier && result === maxResult).length;
            sum += maxCount;
            gameState.greedActive = false;
        }
        
        // 处理穷鬼祝福
        if (gameState.poorActive) {
            const minResult = Math.min(...diceResults.filter((result, i) => !diceConfigs[i].isMultiplier));
            sum -= minResult;
            gameState.poorActive = false;
        }
        
        return sum;
    }
    
    /**
     * 更新关卡信息显示
     */
    function updateLevelInfo() {
        const levelConfig = getCurrentLevelConfig();
        if (currentLevelEl) currentLevelEl.textContent = gameState.currentLevel;
        if (rollCountEl) rollCountEl.textContent = `${gameState.currentRolls}/${levelConfig.maxRolls}`;
        if (currentSumEl) currentSumEl.textContent = gameState.currentSum;
        if (targetSumEl) targetSumEl.textContent = levelConfig.targetSum;
        // 更新积分显示
        const currentScoreEl = document.getElementById('currentScore');
        if (currentScoreEl) currentScoreEl.textContent = gameState.currentScore;
        // 更新骰子数量显示
        const diceCountEl = document.getElementById('diceCount');
        if (diceCountEl) diceCountEl.textContent = gameState.diceCount;
        console.log('更新关卡信息:', gameState);
    }
    
    /**
     * 更新消耗品显示
     */
    function updateConsumablesDisplay() {
        const consumableItemsEl = document.getElementById('consumableItems');
        if (!consumableItemsEl) return;
        
        consumableItemsEl.innerHTML = '';
        
        if (gameState.consumables.length === 0) {
            consumableItemsEl.innerHTML = '<p class="no-consumables">暂无消耗品</p>';
            return;
        }
        
        gameState.consumables.forEach((consumable, index) => {
            const consumableItemEl = document.createElement('div');
            consumableItemEl.className = 'consumable-item';
            consumableItemEl.dataset.index = index;
            
            const consumableData = consumableConfig.find(c => c.id === consumable.id);
            if (consumableData) {
                consumableItemEl.innerHTML = `
                    <div class="consumable-icon">${consumableData.icon}</div>
                    <h4>${consumableData.name}</h4>
                    <p>${consumableData.description}</p>
                `;
                
                consumableItemEl.addEventListener('click', function() {
                    useConsumable(index);
                });
            }
            
            consumableItemsEl.appendChild(consumableItemEl);
        });
        
        console.log('更新消耗品显示完成');
    }
    
    /**
     * 使用消耗品
     * @param {number} index 消耗品索引
     */
    function useConsumable(index) {
        if (index < 0 || index >= gameState.consumables.length) return;
        
        const consumable = gameState.consumables[index];
        const consumableData = consumableConfig.find(c => c.id === consumable.id);
        
        if (!consumableData) return;
        
        console.log('使用消耗品:', consumableData.name);
        
        // 根据消耗品类型执行不同的效果
        switch (consumableData.id) {
            case 'backtrack':
                // 回溯祝福：重新投掷1次骰子，不额外扣除投掷次数
                if (gameState.currentRolls > 0) {
                    gameState.currentRolls--;
                    gameState.currentSum = 0;
                    updateLevelInfo();
                    alert('回溯祝福生效：你可以重新投掷一次骰子！');
                } else {
                    alert('回溯祝福只能在至少投掷一次后使用！');
                    return;
                }
                break;
            
            case 'greed':
                // 贪心祝福：下次投掷，最大点数额外+1
                gameState.greedActive = true;
                alert('贪心祝福生效：下次投掷的最大点数将额外+1！');
                break;
            
            case 'poor':
                // 穷鬼祝福：下次计分，会忽略掷出最小值的骰子
                gameState.poorActive = true;
                alert('穷鬼祝福生效：下次计分将忽略掷出最小值的骰子！');
                break;
        }
        
        // 移除使用的消耗品
        gameState.consumables.splice(index, 1);
        updateConsumablesDisplay();
        console.log('消耗品使用完成');
    }
    
    /**
     * 生成骰子选择选项
     */
    function generateDiceOptions() {
        console.log('========== 开始生成骰子选择选项 ==========');
        
        // 重新获取diceOptions元素，确保DOM已经加载完成
        console.log('获取 diceOptions 元素');
        const diceOptions = document.getElementById('diceOptions');
        console.log('diceOptions 元素:', diceOptions);
        
        if (!diceOptions) {
            console.error('无法获取diceOptions元素');
            return;
        }
        
        console.log('清空 diceOptions 内容');
        diceOptions.innerHTML = '';
        
        // 直接定义初始骰子配置，确保骰子选项能够显示
        console.log('定义初始骰子配置');
        const initialDiceConfig = [
            {
                id: 'standard6',
                type: 'initial',
                name: '标准六面骰',
                description: '每个面出现的概率均等',
                color: '#ffffff',
                borderColor: '#333333',
                dotColor: '#333333',
                faces: [1, 2, 3, 4, 5, 6],
                weights: [1, 1, 1, 1, 1, 1]
            },
            {
                id: 'standard8',
                type: 'initial',
                name: '标准八面骰',
                description: '每个面出现的概率均等',
                color: '#ffffff',
                borderColor: '#333333',
                dotColor: '#333333',
                faces: [1, 2, 3, 4, 5, 6, 7, 8],
                weights: [1, 1, 1, 1, 1, 1, 1, 1]
            },
            {
                id: 'loaded6',
                type: 'initial',
                name: '灌铅六面骰',
                description: '数字1和6出现的概率更高',
                color: '#ffcccc',
                borderColor: '#cc0000',
                dotColor: '#cc0000',
                faces: [1, 2, 3, 4, 5, 6],
                weights: [3, 1, 1, 1, 1, 3]
            },
            // 额外的骰子，用于出千界面购买
            {
                id: 'lucky7',
                type: 'extra',
                name: '幸运七面骰',
                description: '包含幸运数字7，每个面出现概率均等',
                color: '#ffd700',
                borderColor: '#cc8400',
                dotColor: '#cc8400',
                faces: [1, 2, 3, 4, 5, 6, 7],
                weights: [1, 1, 1, 1, 1, 1, 1],
                cost: 50
            },
            {
                id: 'multiplier',
                type: 'extra',
                name: '倍率骰子',
                description: '可以为其他骰子的结果提供倍率',
                color: '#90ee90',
                borderColor: '#228b22',
                dotColor: '#228b22',
                faces: [1, 2, 3, 4],
                weights: [1, 1, 1, 1],
                cost: 80
            },
            {
                id: 'blank',
                type: 'extra',
                name: '空白骰子',
                description: '会复制其他骰子的最大值',
                color: '#e0e0e0',
                borderColor: '#666666',
                dotColor: '#666666',
                faces: [0, 0, 0, 0, 0, 0],
                weights: [1, 1, 1, 1, 1, 1],
                cost: 100
            }
        ];
        
        console.log('初始骰子配置:', initialDiceConfig);
        
        // 更新全局diceConfig变量，确保其他函数也能使用这些骰子配置
        console.log('更新全局骰子配置');
        window.diceConfig = initialDiceConfig;
        console.log('更新 window.diceConfig 完成:', window.diceConfig);
        
        diceConfig = initialDiceConfig;
        console.log('更新 diceConfig 完成:', diceConfig);
        
        console.log('开始遍历初始骰子配置');
        initialDiceConfig.forEach((dice, index) => {
            console.log(`处理第 ${index + 1} 个骰子:`, dice.name);
            
            const diceOption = document.createElement('div');
            console.log('创建骰子选项元素:', diceOption);
            
            diceOption.className = `dice-option ${gameState.selectedDice === dice.id ? 'selected' : ''}`;
            diceOption.dataset.diceId = dice.id;
            console.log('设置骰子选项属性:', { className: diceOption.className, dataset: diceOption.dataset });
            
            // 生成概率显示文本（归一化权重）
            console.log('生成概率显示文本');
            let probabilitiesText = '';
            const normalizedProbabilities = normalizeWeights(dice.weights);
            console.log('归一化后的概率:', normalizedProbabilities);
            
            dice.faces.forEach((face, faceIndex) => {
                probabilitiesText += `${face}: ${(normalizedProbabilities[faceIndex] * 100).toFixed(1)}%`;
                if (faceIndex < dice.faces.length - 1) {
                    probabilitiesText += ', ';
                }
            });
            console.log('概率显示文本:', probabilitiesText);
            
            // 生成骰子图标HTML - 与关卡中一致的样式
            console.log('生成骰子图标HTML');
            const diceIconHTML = `
                <div class="dice-icon">
                    <!-- 骰子的6个面 - 与关卡中一致的结构 -->
                    <div class="dice-face face-1" style="background-color: ${dice.color}; border-color: ${dice.borderColor}; color: ${dice.dotColor};">1</div>
                    <div class="dice-face face-2" style="background-color: ${dice.color}; border-color: ${dice.borderColor}; color: ${dice.dotColor};">2</div>
                    <div class="dice-face face-3" style="background-color: ${dice.color}; border-color: ${dice.borderColor}; color: ${dice.dotColor};">3</div>
                    <div class="dice-face face-4" style="background-color: ${dice.color}; border-color: ${dice.borderColor}; color: ${dice.dotColor};">4</div>
                    <div class="dice-face face-5" style="background-color: ${dice.color}; border-color: ${dice.borderColor}; color: ${dice.dotColor};">5</div>
                    <div class="dice-face face-6" style="background-color: ${dice.color}; border-color: ${dice.borderColor}; color: ${dice.dotColor};">6</div>
                </div>
            `;
            console.log('骰子图标HTML:', diceIconHTML);
            
            console.log('设置骰子选项HTML内容');
            diceOption.innerHTML = `
                ${diceIconHTML}
                <h3>${dice.name}</h3>
                <div class="dice-details">
                    <div class="dice-description">${dice.description}</div>
                    <div class="dice-probabilities">概率: ${probabilitiesText}</div>
                </div>
            `;
            console.log('骰子选项HTML内容设置完成');
            
            // 让骰子选项的高度根据内容自动调整
            diceOption.style.height = 'auto';
            diceOption.style.minHeight = '0';
            console.log('设置骰子选项样式');
            
            diceOption.addEventListener('click', function() {
                // 移除其他选项的选中状态
                document.querySelectorAll('.dice-option').forEach(option => {
                    option.classList.remove('selected');
                });
                
                // 添加当前选项的选中状态
                this.classList.add('selected');
                
                // 更新选中的骰子
                gameState.selectedDice = this.dataset.diceId;
                console.log('选择骰子:', gameState.selectedDice);
            });
            console.log('添加骰子选项点击事件监听器');
            
            diceOptions.appendChild(diceOption);
            console.log('将骰子选项添加到 diceOptions 容器');
        });
        
        console.log('生成骰子选择选项完成');
        console.log('当前 diceOptions 内容:', diceOptions.innerHTML);
        console.log('========== 生成骰子选择选项完成 ==========');
    }
    
    /**
     * 显示主菜单
     */
    function showMainMenu() {
        if (mainMenu) mainMenu.style.display = 'flex';
        if (gameContainer) gameContainer.style.display = 'none';
        if (resultModal) resultModal.classList.remove('show');
        console.log('显示主菜单');
    }
    
    /**
     * 显示游戏界面
     */
    function showGameInterface() {
        if (mainMenu) mainMenu.style.display = 'none';
        if (gameContainer) gameContainer.style.display = 'flex';
        // 更新关卡中骰子的悬停信息
        updateGameDiceInfo();
        // 初始化骰子数量选择事件
        initDiceCountSelection();
        console.log('显示游戏界面');
    }
    
    /**
     * 初始化骰子数量选择事件
     */
    function initDiceCountSelection() {
        const diceCountOptions = document.getElementById('diceCountOptions');
        if (!diceCountOptions) return;
        
        // 移除旧的事件监听器
        const oldOptions = diceCountOptions.querySelectorAll('.dice-count-option');
        oldOptions.forEach(option => {
            option.removeEventListener('click', handleDiceCountSelection);
        });
        
        // 添加新的事件监听器
        const options = diceCountOptions.querySelectorAll('.dice-count-option');
        options.forEach(option => {
            option.addEventListener('click', handleDiceCountSelection);
        });
        
        // 初始选中当前骰子数量
        options.forEach(option => {
            if (parseInt(option.dataset.count) === gameState.diceCount) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        console.log('初始化骰子数量选择事件完成');
    }
    
    /**
     * 处理骰子数量选择
     */
    function handleDiceCountSelection() {
        if (gameState.hasRolled) {
            alert('一旦投掷了第一次，后续投掷次数就不能改变骰子数量！');
            return;
        }
        
        const count = parseInt(this.dataset.count);
        if (count > gameState.diceList.length) {
            alert('你没有足够的骰子！请先在出千流程中购买额外骰子。');
            return;
        }
        
        // 更新骰子数量
        gameState.diceCount = count;
        
        // 更新选中状态
        document.querySelectorAll('.dice-count-option').forEach(option => {
            option.classList.remove('selected');
        });
        this.classList.add('selected');
        
        // 更新关卡信息显示
        updateLevelInfo();
        
        console.log('选择骰子数量:', count);
    }
    
    /**
     * 显示出千界面
     */
    function showCheatInterface() {
        if (cheatModal) cheatModal.classList.add('show');
        // 更新出千界面积分显示
        const cheatCurrentScoreEl = document.getElementById('cheatCurrentScore');
        if (cheatCurrentScoreEl) {
            cheatCurrentScoreEl.textContent = gameState.currentScore;
        }
        generateCheatOptions();
        updateDicePreview();
        updateCheatHistory();
        console.log('显示出千界面');
    }
    
    /**
     * 隐藏出千界面
     */
    function hideCheatInterface() {
        if (cheatModal) cheatModal.classList.remove('show');
        console.log('隐藏出千界面');
    }
    
    /**
     * 生成出千选项
     */
    function generateCheatOptions() {
        // 更新出千界面积分显示
        const cheatCurrentScoreEl = document.getElementById('cheatCurrentScore');
        if (cheatCurrentScoreEl) {
            cheatCurrentScoreEl.textContent = gameState.currentScore;
        }
        
        // 获取各个选项容器
        const upgradeOptions = document.getElementById('upgradeOptions');
        const diceOptions = document.getElementById('cheatDiceOptions');
        const consumableOptions = document.getElementById('consumableOptions');
        
        if (!upgradeOptions || !diceOptions || !consumableOptions) return;
        
        // 清空所有选项容器
        upgradeOptions.innerHTML = '';
        diceOptions.innerHTML = '';
        consumableOptions.innerHTML = '';
        
        // 生成升级选项
        cheatConfig.forEach(cheat => {
            // 跳过购买骰子选项，单独处理
            if (cheat.id === 'buy-dice') return;
            
            const cheatOption = document.createElement('div');
            const isUsed = gameState.usedCheats.includes(cheat.id);
            const hasEnoughScore = gameState.currentScore >= cheat.cost;
            const isDisabled = isUsed || !hasEnoughScore;
            
            cheatOption.className = `cheat-option ${isDisabled ? 'disabled' : ''}`;
            cheatOption.dataset.cheatId = cheat.id;
            
            cheatOption.innerHTML = `
                <div class="cheat-icon">${cheat.icon}</div>
                <h4>${cheat.name}</h4>
                <button class="buy-button" ${isDisabled ? 'disabled' : ''}>购买 (${cheat.cost}积分)</button>
                <div class="cheat-details">
                    <div class="cheat-description">${cheat.description}</div>
                    <div class="cheat-description">消耗: ${cheat.cost}积分</div>
                </div>
            `;
            
            if (!isDisabled) {
                const buyButton = cheatOption.querySelector('.buy-button');
                buyButton.addEventListener('click', function() {
                    const cheatId = cheatOption.dataset.cheatId;
                    const cheatData = cheatConfig.find(c => c.id === cheatId);
                    
                    // 消耗积分
                    gameState.currentScore -= cheatData.cost;
                    updateLevelInfo();
                    console.log('购买出千选项，消耗积分:', cheatData.cost, '剩余积分:', gameState.currentScore);
                    
                    // 应用出千修改
                    applyCheat(cheatId);
                    gameState.usedCheats.push(cheatId);
                    generateCheatOptions(); // 重新生成选项以更新禁用状态
                    showCheatNotification(cheatId); // 显示修改提示
                });
            }
            
            upgradeOptions.appendChild(cheatOption);
        });
        
        // 生成可购买的骰子选项
        const extraDiceConfig = diceConfig.filter(d => d.type === 'extra');
        extraDiceConfig.forEach(dice => {
            const hasEnoughScore = gameState.currentScore >= dice.cost;
            const isDisabled = !hasEnoughScore || gameState.diceList.length >= 5;
            
            const diceOption = document.createElement('div');
            diceOption.className = `cheat-option ${isDisabled ? 'disabled' : ''}`;
            diceOption.dataset.diceId = dice.id;
            
            diceOption.innerHTML = `
                <div class="cheat-icon">🎲</div>
                <h4>${dice.name}</h4>
                <button class="buy-button" ${isDisabled ? 'disabled' : ''}>购买 (${dice.cost}积分)</button>
                <div class="cheat-details">
                    <div class="cheat-description">${dice.description}</div>
                    <div class="cheat-description">消耗: ${dice.cost}积分</div>
                </div>
            `;
            
            if (!isDisabled) {
                const buyButton = diceOption.querySelector('.buy-button');
                buyButton.addEventListener('click', function() {
                    const diceId = diceOption.dataset.diceId;
                    const diceData = diceConfig.find(d => d.id === diceId);
                    
                    // 消耗积分
                    gameState.currentScore -= diceData.cost;
                    updateLevelInfo();
                    console.log('购买骰子，消耗积分:', diceData.cost, '剩余积分:', gameState.currentScore);
                    
                    // 添加新骰子
                    addNewDice(diceData);
                    generateCheatOptions(); // 重新生成选项以更新禁用状态
                    alert(`成功购买 ${diceData.name}！`);
                });
            }
            
            diceOptions.appendChild(diceOption);
        });
        
        // 生成可购买的消耗品选项
        consumableConfig.forEach(consumable => {
            const hasEnoughScore = gameState.currentScore >= consumable.cost;
            const isDisabled = !hasEnoughScore || gameState.consumables.length >= 3;
            
            const consumableOption = document.createElement('div');
            consumableOption.className = `cheat-option ${isDisabled ? 'disabled' : ''}`;
            consumableOption.dataset.consumableId = consumable.id;
            
            consumableOption.innerHTML = `
                <div class="cheat-icon">${consumable.icon}</div>
                <h4>${consumable.name}</h4>
                <button class="buy-button" ${isDisabled ? 'disabled' : ''}>购买 (${consumable.cost}积分)</button>
                <div class="cheat-details">
                    <div class="cheat-description">${consumable.description}</div>
                    <div class="cheat-description">消耗: ${consumable.cost}积分</div>
                </div>
            `;
            
            if (!isDisabled) {
                const buyButton = consumableOption.querySelector('.buy-button');
                buyButton.addEventListener('click', function() {
                    const consumableId = consumableOption.dataset.consumableId;
                    const consumableData = consumableConfig.find(c => c.id === consumableId);
                    
                    // 消耗积分
                    gameState.currentScore -= consumableData.cost;
                    updateLevelInfo();
                    console.log('购买消耗品，消耗积分:', consumableData.cost, '剩余积分:', gameState.currentScore);
                    
                    // 添加消耗品
                    gameState.consumables.push({ id: consumableId });
                    generateCheatOptions(); // 重新生成选项以更新禁用状态
                    updateConsumablesDisplay(); // 更新消耗品显示
                    alert(`成功购买 ${consumableData.name}！`);
                });
            }
            
            consumableOptions.appendChild(consumableOption);
        });
        
        console.log('生成出千选项完成');
    }
    
    /**
     * 添加新骰子
     * @param {Object} diceData 骰子数据
     */
    function addNewDice(diceData) {
        if (gameState.diceList.length >= 5) {
            alert('骰子数量已达到上限！');
            return;
        }
        
        const newDice = JSON.parse(JSON.stringify(diceData));
        gameState.diceList.push(newDice);
        console.log('添加新骰子:', newDice.name, '当前骰子数量:', gameState.diceList.length);
    }
    
    /**
     * 更新骰子预览
     */
    function updateDicePreview() {
        if (!dicePreview) return;
        
        // 生成多个骰子的预览
        let dicePreviewHTML = '';
        
        gameState.diceList.forEach((dice, index) => {
            // 归一化权重，计算每个面的概率
            const totalWeight = dice.weights.reduce((sum, weight) => sum + weight, 0);
            const probabilities = dice.weights.map(weight => (weight / totalWeight * 100).toFixed(1));
            
            // 生成骰子悬停信息HTML
            let diceInfoHTML = `
                <div class="dice-info">
                    <h4>${dice.name} 详情</h4>
            `;
            
            dice.faces.forEach((face, faceIndex) => {
                diceInfoHTML += `
                    <div class="face-info">
                        <span class="face-number">面 ${faceIndex + 1}: ${face}</span>
                        <span class="face-probability">${probabilities[faceIndex]}%</span>
                    </div>
                `;
            });
            
            diceInfoHTML += `
                </div>
            `;
            
            // 生成骰子HTML
            dicePreviewHTML += `
                <div style="display: inline-block; margin: 0 10px; position: relative;">
                    <div class="dice-icon" style="transform: rotateX(45deg) rotateY(45deg);">
                        <div class="dice-face face-1" style="background-color: ${dice.color}; border-color: ${dice.borderColor}; color: ${dice.dotColor};">${dice.faces[0]}</div>
                        <div class="dice-face face-2" style="background-color: ${dice.color}; border-color: ${dice.borderColor}; color: ${dice.dotColor};">${dice.faces[1]}</div>
                        <div class="dice-face face-3" style="background-color: ${dice.color}; border-color: ${dice.borderColor}; color: ${dice.dotColor};">${dice.faces[2]}</div>
                        <div class="dice-face face-4" style="background-color: ${dice.color}; border-color: ${dice.borderColor}; color: ${dice.dotColor};">${dice.faces[3]}</div>
                        <div class="dice-face face-5" style="background-color: ${dice.color}; border-color: ${dice.borderColor}; color: ${dice.dotColor};">${dice.faces[4]}</div>
                        <div class="dice-face face-6" style="background-color: ${dice.color}; border-color: ${dice.borderColor}; color: ${dice.dotColor};">${dice.faces[5]}</div>
                    </div>
                    ${diceInfoHTML}
                </div>
            `;
        });
        
        dicePreview.innerHTML = dicePreviewHTML;
        console.log('更新骰子预览完成');
    }
    
    /**
     * 更新修改历史
     */
    function updateCheatHistory() {
        if (!historyItems) return;
        
        if (gameState.cheatHistory.length === 0) {
            historyItems.innerHTML = '<p class="no-history">暂无修改</p>';
            return;
        }
        
        let historyHTML = '';
        gameState.cheatHistory.forEach((history, index) => {
            historyHTML += `
                <div class="history-item">
                    ${index + 1}. ${history}
                </div>
            `;
        });
        
        historyItems.innerHTML = historyHTML;
        console.log('更新修改历史完成');
    }
    
    /**
     * 应用出千修改
     * @param {string} cheatId 出千选项ID
     */
    function applyCheat(cheatId) {
        // 对每个骰子应用升级
        gameState.diceList.forEach((dice, index) => {
            // 跳过倍率骰的某些升级
            if (dice.isMultiplier && (cheatId === 'increase' || cheatId === 'double-max-weight')) {
                return;
            }
            
            switch (cheatId) {
                case 'increase':
                    // 每个面的数字+1
                    for (let i = 0; i < dice.faces.length; i++) {
                        dice.faces[i] += 1;
                    }
                    gameState.cheatHistory.push(`将 ${dice.name} 的所有面数字+1`);
                    break;
                    
                case 'double-max-weight':
                    // 增加最大数字的概率权重为原有的两倍
                    const maxValue = Math.max(...dice.faces);
                    for (let i = 0; i < dice.faces.length; i++) {
                        if (dice.faces[i] === maxValue) {
                            dice.weights[i] *= 2;
                        }
                    }
                    gameState.cheatHistory.push(`将 ${dice.name} 的最大数字概率翻倍`);
                    break;
                    
                case 'replace-face':
                    // 将一个随机面替换为其他某个面的数字
                    const randomFaceIndex = Math.floor(Math.random() * dice.faces.length);
                    const otherFaceIndex = Math.floor(Math.random() * dice.faces.length);
                    const originalValue = dice.faces[randomFaceIndex];
                    dice.faces[randomFaceIndex] = dice.faces[otherFaceIndex];
                    gameState.cheatHistory.push(`将 ${dice.name} 的面 ${randomFaceIndex + 1} 数字从 ${originalValue} 替换为 ${dice.faces[randomFaceIndex]}`);
                    break;
            }
        });
        
        updateDicePreview();
        updateCheatHistory();
        console.log('应用出千修改:', cheatId);
    }
    
    /**
     * 显示出千修改提示
     * @param {string} cheatId 出千选项ID
     */
    function showCheatNotification(cheatId) {
        // 获取最后一次修改历史
        if (gameState.cheatHistory.length > 0) {
            const lastHistory = gameState.cheatHistory[gameState.cheatHistory.length - 1];
            alert(`修改成功！\n${lastHistory}`);
        }
    }
    
    /**
     * 重置骰子
     */
    function resetDice() {
        gameState.modifiedDice = null;
        gameState.cheatHistory = [];
        gameState.usedCheats = [];
        updateDicePreview();
        updateCheatHistory();
        generateCheatOptions();
        console.log('重置骰子完成');
    }
    
    /**
     * 获取当前骰子配置（考虑修改后的配置）
     * @returns {Object} 当前骰子配置
     */
    function getCurrentDiceConfig() {
        return gameState.modifiedDice || diceConfig.find(dice => dice.id === gameState.selectedDice) || diceConfig[0];
    }
    
    /**
     * 掷骰子函数
     */
    function rollDice() {
        console.log('点击掷骰子按钮，当前游戏状态:', gameState);
        
        // 防止重复点击或游戏结束
        if (gameState.isRolling || gameState.isGameOver) {
            console.log('游戏状态不允许掷骰子');
            return;
        }
        
        const currentLevelConfig = getCurrentLevelConfig();
        
        // 检查是否达到最大投掷次数
        if (gameState.currentRolls >= currentLevelConfig.maxRolls) {
            console.log('达到最大投掷次数，检查关卡完成情况');
            checkLevelCompletion();
            return;
        }
        
        gameState.isRolling = true;
        if (rollButton) rollButton.disabled = true;
        console.log('开始掷骰子');
        
        // 标记已经投掷过骰子
        gameState.hasRolled = true;
        
        // 准备投掷的骰子
        const diceToRoll = gameState.diceList.slice(0, gameState.diceCount);
        const diceResults = [];
        const diceElements = [];
        
        // 获取骰子元素
        for (let i = 1; i <= gameState.diceCount; i++) {
            const diceEl = document.getElementById(`dice${i}`);
            if (diceEl) {
                diceEl.style.display = 'block';
                diceElements.push(diceEl);
            }
        }
        
        // 隐藏多余的骰子
        for (let i = gameState.diceCount + 1; i <= 3; i++) {
            const diceEl = document.getElementById(`dice${i}`);
            if (diceEl) {
                diceEl.style.display = 'none';
            }
        }
        
        // 为每个骰子生成随机点数并应用动画
        diceToRoll.forEach((diceConfig, index) => {
            const randomNumber = generateRandomNumber(diceConfig);
            diceResults.push(randomNumber);
            
            // 应用旋转动画
            if (diceElements[index]) {
                // 随机旋转动画
                const rotations = 3 + Math.random() * 2; // 3-5圈
                const totalRotationX = (Math.random() * 360) + (rotations * 360);
                const totalRotationY = (Math.random() * 360) + (rotations * 360);
                diceElements[index].style.transform = `rotateX(${totalRotationX}deg) rotateY(${totalRotationY}deg)`;
                
                // 动画结束后，设置为对应点数的正确角度
                setTimeout(() => {
                    // 获取对应点数的正确旋转角度
                    const faceRotation = diceFaces[randomNumber] || diceFaces[1];
                    diceElements[index].style.transform = `rotateX(${faceRotation.x}deg) rotateY(${faceRotation.y}deg)`;
                }, 1000); // 与CSS中的transition时间对应
            }
        });
        
        // 计算总和
        const totalSum = calculateDiceSum(diceResults, diceToRoll);
        console.log('骰子结果:', diceResults);
        console.log('计算后的总和:', totalSum);
        
        // 更新当前总和
        gameState.currentSum += totalSum;
        gameState.currentRolls++;
        console.log('更新后的游戏状态:', gameState);
        
        // 更新关卡信息显示
        updateLevelInfo();
        
        // 检查是否已经达到目标点数
        const newLevelConfig = getCurrentLevelConfig();
        if (gameState.currentSum > newLevelConfig.targetSum) {
            console.log('已经达到目标点数，不需要继续投掷');
            // 直接检查关卡完成情况，这样剩余次数会参与积分计算
            setTimeout(() => {
                gameState.isRolling = false;
                checkLevelCompletion();
            }, 1000); // 与CSS中的transition时间对应
            return;
        }
        
        // 动画结束后检查是否完成关卡
        setTimeout(() => {
            gameState.isRolling = false;
            console.log('动画结束，检查是否完成关卡');
            
            // 检查是否达到最大投掷次数
            const timeoutLevelConfig = getCurrentLevelConfig();
            if (gameState.currentRolls >= timeoutLevelConfig.maxRolls) {
                checkLevelCompletion();
            } else {
                if (rollButton) rollButton.disabled = false;
                console.log('继续投掷，启用按钮');
            }
        }, 1000); // 与CSS中的transition时间对应
    }
    
    /**
     * 检查关卡完成情况
     */
    function checkLevelCompletion() {
        const levelConfig = getCurrentLevelConfig();
        const isLevelComplete = gameState.currentSum > levelConfig.targetSum;
        console.log('检查关卡完成情况:', { isLevelComplete, currentSum: gameState.currentSum, targetSum: levelConfig.targetSum });
        
        // 禁用掷骰子按钮
        if (rollButton) rollButton.disabled = true;
        
        // 设置游戏状态为结束
        gameState.isGameOver = true;
        console.log('游戏状态设置为结束');
        
        // 如果关卡完成，添加积分奖励并进入出千界面
        if (isLevelComplete) {
            // 计算积分奖励：基础胜利积分 + 剩余投掷次数 * 2
            const basePoints = levelConfig.scoreRule?.basePoints || 10;
            const remainingRolls = levelConfig.maxRolls - gameState.currentRolls;
            const bonusPoints = remainingRolls * (levelConfig.scoreRule?.bonusPointsPerRoll || 2);
            const scoreReward = basePoints + bonusPoints;
            
            gameState.currentScore += scoreReward;
            updateLevelInfo();
            console.log('关卡完成，获得积分奖励:', scoreReward, '当前积分:', gameState.currentScore);
            console.log('积分计算：基础分', basePoints, '+ 剩余投掷次数', remainingRolls, '*', levelConfig.scoreRule?.bonusPointsPerRoll || 2, '=', bonusPoints);
            
            console.log('关卡完成，进入出千界面');
            showCheatInterface();
        } else {
            // 关卡失败，显示结算界面
            console.log('关卡失败，显示结算界面');
            updateResultModal(isLevelComplete);
            if (resultModal) {
                resultModal.classList.add('show');
                console.log('显示结算界面');
            }
        }
    }
    
    /**
     * 更新结算界面
     * @param {boolean} isLevelComplete 是否完成关卡
     */
    function updateResultModal(isLevelComplete) {
        const levelConfig = getCurrentLevelConfig();
        
        if (resultTitleEl && resultMessageEl) {
            if (isLevelComplete) {
                resultTitleEl.textContent = '关卡完成!';
                resultMessageEl.textContent = '恭喜你完成了关卡目标!';
                if (nextLevelButton) nextLevelButton.style.display = 'block';
            } else {
                resultTitleEl.textContent = '关卡失败';
                resultMessageEl.textContent = '很遗憾，未能完成关卡目标!';
                if (nextLevelButton) nextLevelButton.style.display = 'none';
            }
        }
        
        if (resultLevelEl) resultLevelEl.textContent = gameState.currentLevel;
        if (resultSumEl) resultSumEl.textContent = gameState.currentSum;
        if (resultTargetEl) resultTargetEl.textContent = levelConfig.targetSum;
        
        // 添加轮次信息和修改历史
        const resultModalContent = document.querySelector('.result-modal .modal-content');
        if (resultModalContent) {
            // 查找或创建轮次和历史信息区域
            let roundHistorySection = resultModalContent.querySelector('.round-history-section');
            if (!roundHistorySection) {
                roundHistorySection = document.createElement('div');
                roundHistorySection.className = 'round-history-section';
                roundHistorySection.style.marginTop = '20px';
                roundHistorySection.style.padding = '15px';
                roundHistorySection.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                roundHistorySection.style.borderRadius = '10px';
                
                // 插入到结果统计之后
                const resultStats = resultModalContent.querySelector('.result-stats');
                if (resultStats) {
                    resultStats.after(roundHistorySection);
                }
            }
            
            // 更新轮次和历史信息
            let roundHistoryHTML = `
                <h4 style="color: #e6b141; margin-bottom: 10px; font-size: 16px;">关卡信息</h4>
                <p style="color: white; font-size: 14px; margin-bottom: 10px;">当前轮次: ${gameState.currentRolls}/${levelConfig.maxRolls}</p>
                <h4 style="color: #e6b141; margin-bottom: 10px; font-size: 16px;">修改历史</h4>
            `;
            
            if (gameState.cheatHistory.length > 0) {
                roundHistoryHTML += `<div style="color: white; font-size: 14px;">`;
                gameState.cheatHistory.forEach((history, index) => {
                    roundHistoryHTML += `<p style="margin-bottom: 5px;">${index + 1}. ${history}</p>`;
                });
                roundHistoryHTML += `</div>`;
            } else {
                roundHistoryHTML += `<p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; font-style: italic;">暂无修改</p>`;
            }
            
            roundHistorySection.innerHTML = roundHistoryHTML;
        }
        
        console.log('更新结算界面:', { isLevelComplete, level: gameState.currentLevel, sum: gameState.currentSum, target: levelConfig.targetSum });
    }
    
    /**
     * 进入下一关
     */
    function goToNextLevel() {
        console.log('进入下一关');
        // 检查是否有下一关
        const nextLevel = gameState.currentLevel + 1;
        const hasNextLevel = levelConfig.some(level => level.level === nextLevel);
        console.log('检查是否有下一关:', { nextLevel, hasNextLevel });
        
        if (hasNextLevel) {
            gameState.currentLevel = nextLevel;
        } else {
            // 如果没有下一关，回到第一关
            gameState.currentLevel = 1;
        }
        
        // 重置游戏状态
        resetGameState();
        
        // 隐藏结算界面
        if (resultModal) resultModal.classList.remove('show');
        console.log('进入下一关完成');
    }
    
    /**
     * 从出千界面进入下一关
     */
    function goToNextLevelFromCheat() {
        console.log('从出千界面进入下一关');
        // 检查是否有下一关
        const nextLevel = gameState.currentLevel + 1;
        const hasNextLevel = levelConfig.some(level => level.level === nextLevel);
        console.log('检查是否有下一关:', { nextLevel, hasNextLevel });
        
        if (hasNextLevel) {
            gameState.currentLevel = nextLevel;
        } else {
            // 如果没有下一关，回到第一关
            gameState.currentLevel = 1;
        }
        
        // 重置游戏状态，但保留骰子修改
        const modifiedDice = gameState.modifiedDice;
        resetGameState();
        gameState.modifiedDice = modifiedDice;
        
        // 隐藏出千界面
        hideCheatInterface();
        console.log('从出千界面进入下一关完成');
    }
    
    /**
     * 重新开始当前关卡
     */
    function restartLevel() {
        console.log('重新开始当前关卡');
        // 重置游戏状态
        resetGameState();
        
        // 隐藏结算界面
        if (resultModal) resultModal.classList.remove('show');
        console.log('重新开始关卡完成');
    }
    
    /**
     * 回到第一关
     */
    function backToFirstLevel() {
        console.log('回到第一关');
        // 重置到第一关
        gameState.currentLevel = 1;
        resetGameState();
        
        // 隐藏结算界面
        if (resultModal) resultModal.classList.remove('show');
        console.log('回到第一关完成');
    }
    
    /**
     * 更新关卡中骰子的悬停信息
     */
    function updateGameDiceInfo() {
        if (!dice || !dice.parentElement) return;
        
        const currentDice = getCurrentDiceConfig();
        
        // 归一化权重，计算每个面的概率
        const totalWeight = currentDice.weights.reduce((sum, weight) => sum + weight, 0);
        const probabilities = currentDice.weights.map(weight => (weight / totalWeight * 100).toFixed(1));
        
        // 检查是否已经存在骰子信息元素
        let diceInfo = dice.parentElement.querySelector('.dice-info');
        
        if (!diceInfo) {
            // 创建骰子信息元素
            diceInfo = document.createElement('div');
            diceInfo.className = 'dice-info';
            dice.parentElement.appendChild(diceInfo);
        }
        
        // 生成骰子信息HTML
        let diceInfoHTML = `
            <h4>骰子详情</h4>
        `;
        
        currentDice.faces.forEach((face, index) => {
            diceInfoHTML += `
                <div class="face-info">
                    <span class="face-number">面 ${index + 1}: ${face}</span>
                    <span class="face-probability">${probabilities[index]}%</span>
                </div>
            `;
        });
        
        diceInfo.innerHTML = diceInfoHTML;
        console.log('更新关卡中骰子的悬停信息完成');
    }
    
    /**
     * 重置游戏状态
     */
    function resetGameState() {
        // 保留当前积分，不重置
        
        gameState.currentRolls = 0;
        gameState.currentSum = 0;
        gameState.isRolling = false;
        gameState.isGameOver = false;
        gameState.usedCheats = []; // 重置出千选项的购买次数
        // 保留骰子修改和出千历史
        console.log('重置游戏状态:', gameState);
        
        // 更新关卡信息显示
        updateLevelInfo();
        
        // 更新关卡中骰子的悬停信息
        updateGameDiceInfo();
        
        // 启用掷骰子按钮
        if (rollButton) rollButton.disabled = false;
        console.log('启用掷骰子按钮');
        
        // 重置骰子位置
        if (dice) {
            dice.style.transform = `rotateX(${diceFaces[1].x}deg) rotateY(${diceFaces[1].y}deg)`;
            console.log('重置骰子位置');
        }
    }
    
    /**
     * 初始化游戏状态（仅在游戏开始时调用）
     */
    function initGameState() {
        // 加载当前关卡的初始积分（只有第一关有初始积分）
        const levelConfig = getCurrentLevelConfig();
        gameState.currentScore = levelConfig.initialScore || gameState.currentScore || 0;
        
        gameState.currentRolls = 0;
        gameState.currentSum = 0;
        gameState.isRolling = false;
        gameState.isGameOver = false;
        gameState.usedCheats = [];
        gameState.diceCount = 1;
        gameState.hasRolled = false;
        // 保留修改历史和骰子修改
        
        // 初始化骰子列表
        initDiceList();
        
        console.log('初始化游戏状态:', gameState);
        
        // 更新关卡信息显示
        updateLevelInfo();
        
        // 更新关卡中骰子的悬停信息
        updateGameDiceInfo();
        
        // 更新消耗品显示
        updateConsumablesDisplay();
    }
    
    /**
     * 初始化骰子列表
     */
    function initDiceList() {
        gameState.diceList = [];
        // 添加初始骰子
        const initialDice = diceConfig.find(d => d.id === gameState.selectedDice) || diceConfig[0];
        gameState.diceList.push(JSON.parse(JSON.stringify(initialDice)));
        console.log('初始化骰子列表:', gameState.diceList);
    }
    
    /**
     * 初始化游戏
     */
    function initGame() {
        console.log('========== 开始初始化游戏 ==========');
        
        // 生成骰子选择选项
        console.log('调用 generateDiceOptions 函数');
        generateDiceOptions();
        console.log('generateDiceOptions 函数调用完成');
        
        // 检查骰子配置是否已经更新
        console.log('当前 diceConfig:', diceConfig);
        console.log('当前 window.diceConfig:', window.diceConfig);
        
        // 添加事件监听器
        if (startButton) {
            startButton.addEventListener('click', function() {
                console.log('点击开始游戏按钮');
                showGameInterface();
                initGameState();
            });
            console.log('添加开始游戏按钮点击事件监听器');
        }
        
        if (backButton) {
            backButton.addEventListener('click', function() {
                console.log('点击返回主菜单按钮');
                showMainMenu();
            });
            console.log('添加返回主菜单按钮点击事件监听器');
        }
        
        if (backToMainButton) {
            backToMainButton.addEventListener('click', function() {
                console.log('从结算界面返回主菜单');
                showMainMenu();
            });
            console.log('添加结算界面返回主菜单按钮点击事件监听器');
        }
        
        if (rollButton) {
            rollButton.addEventListener('click', rollDice);
            console.log('添加掷骰子按钮点击事件监听器');
        }
        
        if (nextLevelButton) {
            nextLevelButton.addEventListener('click', function() {
                console.log('点击进入下一关按钮');
                goToNextLevel();
            });
            console.log('添加进入下一关按钮点击事件监听器');
        }
        

        
        if (backToFirstButton) {
            backToFirstButton.addEventListener('click', backToFirstLevel);
            console.log('添加回到第一关按钮点击事件监听器');
        }
        
        // 出千界面事件监听器
        if (continueButton) {
            continueButton.addEventListener('click', function() {
                console.log('点击保留修改进入下一关按钮');
                goToNextLevelFromCheat();
            });
            console.log('添加保留修改进入下一关按钮点击事件监听器');
        }
        

        
        if (resetDiceButton) {
            resetDiceButton.addEventListener('click', function() {
                console.log('点击重置骰子按钮');
                resetDice();
            });
            console.log('添加重置骰子按钮点击事件监听器');
        }
        
        // 显示主菜单
        console.log('调用 showMainMenu 函数');
        showMainMenu();
        console.log('showMainMenu 函数调用完成');
        
    }
    
    // 调用初始化游戏函数
    console.log('调用 initGame 函数');
    initGame();
    console.log('initGame 函数调用完成');
});