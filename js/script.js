import { GameState } from './game.js';
import { UI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const gameState = new GameState();
    const ui = new UI(gameState);
    
    // 全局引用便于调试 (可选)
    window.game = gameState;
    window.ui = ui;
});
