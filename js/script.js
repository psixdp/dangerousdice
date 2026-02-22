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
    const restartButton = document.getElementById('restartButton');
    const backToFirstButton = document.getElementById('backToFirstButton');
    
    // 出千界面DOM元素
    const cheatModal = document.getElementById('cheatModal');
    const dicePreview = document.getElementById('dicePreview');
    const cheatOptions = document.getElementById('cheatOptions');
    const historyItems = document.getElementById('historyItems');
    const continueButton = document.getElementById('continueButton');
    const skipCheatButton = document.getElementById('skipCheatButton');
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
    console.log('restartButton:', restartButton);
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
        isRolling: false,
        isGameOver: false,
        selectedDice: 'standard', // 默认选择标准骰子
        modifiedDice: null, // 修改后的骰子配置
        cheatHistory: [], // 出千修改历史
        usedCheats: [] // 已使用的出千选项ID
    };
    
    // 获取关卡配置
    const levelConfig = window.levelConfig || [];
    console.log('关卡配置:', levelConfig);
    
    // 获取骰子配置
    const diceConfig = window.diceConfig || [];
    console.log('骰子配置:', diceConfig);
    
    // 获取出千配置
    const cheatConfig = window.cheatConfig || [];
    console.log('出千配置:', cheatConfig);
    
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
     * 根据权重生成随机点数
     * @returns {number} 生成的点数
     */
    function generateRandomNumber() {
        const diceConfig = getCurrentDiceConfig();
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
     * 更新关卡信息显示
     */
    function updateLevelInfo() {
        const levelConfig = getCurrentLevelConfig();
        if (currentLevelEl) currentLevelEl.textContent = gameState.currentLevel;
        if (rollCountEl) rollCountEl.textContent = `${gameState.currentRolls}/${levelConfig.maxRolls}`;
        if (currentSumEl) currentSumEl.textContent = gameState.currentSum;
        if (targetSumEl) targetSumEl.textContent = levelConfig.targetSum;
        console.log('更新关卡信息:', gameState);
    }
    
    /**
     * 生成骰子选择选项
     */
    function generateDiceOptions() {
        if (!diceOptions) return;
        
        diceOptions.innerHTML = '';
        
        diceConfig.forEach(dice => {
            const diceOption = document.createElement('div');
            diceOption.className = `dice-option ${gameState.selectedDice === dice.id ? 'selected' : ''}`;
            diceOption.dataset.diceId = dice.id;
            
            // 生成概率显示文本（归一化权重）
            let probabilitiesText = '';
            const normalizedProbabilities = normalizeWeights(dice.weights);
            dice.faces.forEach((face, index) => {
                probabilitiesText += `${face}: ${(normalizedProbabilities[index] * 100).toFixed(1)}%`;
                if (index < dice.faces.length - 1) {
                    probabilitiesText += ', ';
                }
            });
            
            // 生成骰子图标HTML - 与关卡中一致的样式
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
            
            diceOption.innerHTML = `
                ${diceIconHTML}
                <h3>${dice.name}</h3>
                <div class="dice-details">
                    <div class="dice-description">${dice.description}</div>
                    <div class="dice-probabilities">概率: ${probabilitiesText}</div>
                </div>
            `;
            
            // 让骰子选项的高度根据内容自动调整
            diceOption.style.height = 'auto';
            diceOption.style.minHeight = '0';
            
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
            
            diceOptions.appendChild(diceOption);
        });
        
        console.log('生成骰子选择选项完成');
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
        console.log('显示游戏界面');
    }
    
    /**
     * 显示出千界面
     */
    function showCheatInterface() {
        if (cheatModal) cheatModal.classList.add('show');
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
        if (!cheatOptions) return;
        
        cheatOptions.innerHTML = '';
        
        cheatConfig.forEach(cheat => {
            const cheatOption = document.createElement('div');
            cheatOption.className = `cheat-option ${gameState.usedCheats.includes(cheat.id) ? 'disabled' : ''}`;
            cheatOption.dataset.cheatId = cheat.id;
            
            cheatOption.innerHTML = `
                <div class="cheat-icon">${cheat.icon}</div>
                <h4>${cheat.name}</h4>
                <button class="buy-button" ${gameState.usedCheats.includes(cheat.id) ? 'disabled' : ''}>购买</button>
                <div class="cheat-details">
                    <div class="cheat-description">${cheat.description}</div>
                </div>
            `;
            
            if (!gameState.usedCheats.includes(cheat.id)) {
                const buyButton = cheatOption.querySelector('.buy-button');
                buyButton.addEventListener('click', function() {
                    const cheatId = cheatOption.dataset.cheatId;
                    applyCheat(cheatId);
                    gameState.usedCheats.push(cheatId);
                    generateCheatOptions(); // 重新生成选项以更新禁用状态
                    showCheatNotification(cheatId); // 显示修改提示
                });
            }
            
            cheatOptions.appendChild(cheatOption);
        });
        
        console.log('生成出千选项完成');
    }
    
    /**
     * 更新骰子预览
     */
    function updateDicePreview() {
        if (!dicePreview) return;
        
        const currentDice = getCurrentDiceConfig();
        const displayDice = gameState.modifiedDice || currentDice;
        
        // 归一化权重，计算每个面的概率
        const totalWeight = displayDice.weights.reduce((sum, weight) => sum + weight, 0);
        const probabilities = displayDice.weights.map(weight => (weight / totalWeight * 100).toFixed(1));
        
        // 生成骰子悬停信息HTML
        let diceInfoHTML = `
            <div class="dice-info">
                <h4>骰子详情</h4>
        `;
        
        displayDice.faces.forEach((face, index) => {
            diceInfoHTML += `
                <div class="face-info">
                    <span class="face-number">面 ${index + 1}: ${face}</span>
                    <span class="face-probability">${probabilities[index]}%</span>
                </div>
            `;
        });
        
        diceInfoHTML += `
            </div>
        `;
        
        // 生成骰子预览HTML
        const dicePreviewHTML = `
            <div class="dice-icon" style="transform: rotateX(45deg) rotateY(45deg);">
                <div class="dice-face face-1" style="background-color: ${displayDice.color}; border-color: ${displayDice.borderColor}; color: ${displayDice.dotColor};">${displayDice.faces[0]}</div>
                <div class="dice-face face-2" style="background-color: ${displayDice.color}; border-color: ${displayDice.borderColor}; color: ${displayDice.dotColor};">${displayDice.faces[1]}</div>
                <div class="dice-face face-3" style="background-color: ${displayDice.color}; border-color: ${displayDice.borderColor}; color: ${displayDice.dotColor};">${displayDice.faces[2]}</div>
                <div class="dice-face face-4" style="background-color: ${displayDice.color}; border-color: ${displayDice.borderColor}; color: ${displayDice.dotColor};">${displayDice.faces[3]}</div>
                <div class="dice-face face-5" style="background-color: ${displayDice.color}; border-color: ${displayDice.borderColor}; color: ${displayDice.dotColor};">${displayDice.faces[4]}</div>
                <div class="dice-face face-6" style="background-color: ${displayDice.color}; border-color: ${displayDice.borderColor}; color: ${displayDice.dotColor};">${displayDice.faces[5]}</div>
            </div>
            ${diceInfoHTML}
        `;
        
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
        const currentDice = getCurrentDiceConfig();
        const modifiedDice = JSON.parse(JSON.stringify(gameState.modifiedDice || currentDice));
        
        switch (cheatId) {
            case 'increase':
                // 随机选择一个面，数字+1
                const randomFaceIndex = Math.floor(Math.random() * modifiedDice.faces.length);
                const originalValue = modifiedDice.faces[randomFaceIndex];
                modifiedDice.faces[randomFaceIndex] += 1;
                gameState.cheatHistory.push(`将面 ${randomFaceIndex + 1} 的数字从 ${originalValue} 增加到 ${modifiedDice.faces[randomFaceIndex]}`);
                break;
                
            case 'randomize':
                // 随机修改一个面的数字
                const randomFaceIndex2 = Math.floor(Math.random() * modifiedDice.faces.length);
                const originalValue2 = modifiedDice.faces[randomFaceIndex2];
                const minValue = Math.min(...modifiedDice.faces);
                const maxValue = Math.max(...modifiedDice.faces);
                const randomValue = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
                modifiedDice.faces[randomFaceIndex2] = randomValue;
                gameState.cheatHistory.push(`将面 ${randomFaceIndex2 + 1} 的数字从 ${originalValue2} 随机修改为 ${randomValue}`);
                break;
                
            case 'double-weight':
                // 指定修改一个面的概率权重，将其*2
                const randomFaceIndex3 = Math.floor(Math.random() * modifiedDice.weights.length);
                const originalWeight = modifiedDice.weights[randomFaceIndex3];
                modifiedDice.weights[randomFaceIndex3] *= 2;
                gameState.cheatHistory.push(`将面 ${randomFaceIndex3 + 1} 的概率权重从 ${originalWeight} 增加到 ${modifiedDice.weights[randomFaceIndex3]}`);
                break;
        }
        
        gameState.modifiedDice = modifiedDice;
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
        
        const levelConfig = getCurrentLevelConfig();
        
        // 检查是否达到最大投掷次数
        if (gameState.currentRolls >= levelConfig.maxRolls) {
            console.log('达到最大投掷次数，检查关卡完成情况');
            checkLevelCompletion();
            return;
        }
        
        gameState.isRolling = true;
        if (rollButton) rollButton.disabled = true;
        console.log('开始掷骰子');
        
        // 生成随机点数（根据选中的骰子配置）
        const randomNumber = generateRandomNumber();
        console.log('随机生成的点数:', randomNumber);
        
        // 更新当前总和
        gameState.currentSum += randomNumber;
        gameState.currentRolls++;
        console.log('更新后的游戏状态:', gameState);
        
        // 更新关卡信息显示
        updateLevelInfo();
        
        // 计算旋转角度（添加多圈旋转以增加动画效果）
        const rotations = 3; // 旋转圈数
        const finalRotation = diceFaces[randomNumber];
        const totalRotationX = finalRotation.x + (rotations * 360);
        const totalRotationY = finalRotation.y + (rotations * 360);
        console.log('旋转角度:', { totalRotationX, totalRotationY });
        
        // 应用旋转动画
        if (dice) {
            dice.style.transform = `rotateX(${totalRotationX}deg) rotateY(${totalRotationY}deg)`;
            console.log('应用旋转动画');
        }
        
        // 动画结束后检查是否完成关卡
        setTimeout(() => {
            gameState.isRolling = false;
            console.log('动画结束，检查是否完成关卡');
            
            // 检查是否达到最大投掷次数
            if (gameState.currentRolls >= levelConfig.maxRolls) {
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
        
        // 如果关卡完成，进入出千界面
        if (isLevelComplete) {
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
     * 初始化游戏
     */
    function initGame() {
        console.log('开始初始化游戏');
        
        // 生成骰子选择选项
        generateDiceOptions();
        
        // 添加事件监听器
        if (startButton) {
            startButton.addEventListener('click', function() {
                console.log('点击开始游戏按钮');
                showGameInterface();
                resetGameState();
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
        
        if (restartButton) {
            restartButton.addEventListener('click', restartLevel);
            console.log('添加重新开始按钮点击事件监听器');
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
        
        if (skipCheatButton) {
            skipCheatButton.addEventListener('click', function() {
                console.log('点击跳过修改按钮');
                hideCheatInterface();
                goToNextLevel();
            });
            console.log('添加跳过修改按钮点击事件监听器');
        }
        
        if (resetDiceButton) {
            resetDiceButton.addEventListener('click', function() {
                console.log('点击重置骰子按钮');
                resetDice();
            });
            console.log('添加重置骰子按钮点击事件监听器');
        }
        
        // 显示主菜单
        showMainMenu();
        
        console.log('骰子游戏 - 关卡模式初始化完成');
        console.log('关卡配置:', levelConfig);
        console.log('骰子配置:', diceConfig);
        console.log('出千配置:', cheatConfig);
    }
    
    // 初始化游戏
    initGame();
});