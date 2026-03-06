import { GameState } from './game.js';
import { UI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const gameState = new GameState();
    const ui = new UI(gameState);

    // 全局访问以便调试（可选）
    window.game = gameState;
    window.ui = ui;

    console.log('千王之王：骰子 Roguelite 已启动！');
});
