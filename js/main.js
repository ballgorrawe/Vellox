import { CLASS_CONFIGS } from './data.js';
import { gameState, resetGameState } from './state.js';
import { DOM, initDOM, syncUI, renderBoard, setUIHandlers } from './ui.js';
import { generateFixedBoard, rollDice, setBoardHandlers } from './board.js';
import { queueCard, useHeroSkill, executeQueue, initCombat, setCombatHandlers, shuffleArray } from './combat.js';
import { 
    openLootModal, selectLootCard, rerollLoot, 
    campHeal, campOpenUpgrade, campCancelUpgrade, leaveCampfire,
    openShopModal, closeShopModal, rerollShop, toggleShopPeek,
    openInventoryModal, closeInventoryModal 
} from './inventory.js';
import { triggerRandomEvent } from './event.js';

// Setup Dependency Injection to avoid circular imports
setUIHandlers({
    queueCard,
    useHeroSkill
});

setBoardHandlers({
    openShopModal,
    campCancelUpgrade,
    initCombat,
    triggerRandomEvent
});

setCombatHandlers({
    openLootModal
});

const initializeGame = (className) => {
    const config = CLASS_CONFIGS[className];
    if (!config) return;

    resetGameState();
    if (DOM.board.container) DOM.board.container.innerHTML = '';

    gameState.player.class = className;
    gameState.player.stats.maxHp = config.maxHp;
    gameState.player.stats.hp = config.maxHp;
    
    gameState.deck.drawPile = [...config.initialDeck];
    shuffleArray(gameState.deck.drawPile);
    
    gameState.meta.currentView = 'view-board';

    generateFixedBoard();
    syncUI();
    
    if (DOM.board.statusLog) DOM.board.statusLog.textContent = 'Ready to roll!';
    if (DOM.board.rollBtn) DOM.board.rollBtn.disabled = false;
    
    renderBoard();
};

const bindEvents = () => {
    let pendingClass = null;
    DOM.classCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const button = e.target.closest('.class-card');
            if (button && button.dataset.class) {
                // Remove selected class from all cards
                DOM.classCards.forEach(c => c.classList.remove('selected'));
                // Add selected class to the clicked card
                button.classList.add('selected');
                
                pendingClass = button.dataset.class;
                
                // Show the start run button
                if (DOM.ui.startRunBtn) {
                    DOM.ui.startRunBtn.classList.remove('hidden');
                    // Add slight fade-in by ensuring opacity is set (handled in CSS usually, but we ensure it's visible)
                    DOM.ui.startRunBtn.style.opacity = '1';
                    DOM.ui.startRunBtn.style.transform = 'scale(1)';
                }
            }
        });
    });

    if (DOM.ui.startRunBtn) {
        DOM.ui.startRunBtn.addEventListener('click', () => {
            if (pendingClass) {
                initializeGame(pendingClass);
                // Hide it again for future resets
                DOM.ui.startRunBtn.classList.add('hidden');
                DOM.ui.startRunBtn.style.opacity = '0';
            }
        });
    }

    if (DOM.board.rollBtn) {
        DOM.board.rollBtn.addEventListener('click', rollDice);
    }

    if (DOM.combat.executeQueueBtn) {
        DOM.combat.executeQueueBtn.addEventListener('click', executeQueue);
    }
    
    if (DOM.loot.skipBtn) DOM.loot.skipBtn.addEventListener('click', () => selectLootCard(null));
    if (DOM.loot.rerollBtn) DOM.loot.rerollBtn.addEventListener('click', rerollLoot);
    
    if (DOM.shop.closeBtn) DOM.shop.closeBtn.addEventListener('click', closeShopModal);
    if (DOM.shop.rerollBtn) DOM.shop.rerollBtn.addEventListener('click', rerollShop);
    if (DOM.shop.peekBtn) DOM.shop.peekBtn.addEventListener('click', toggleShopPeek);
    if (DOM.shop.returnToShopBtn) DOM.shop.returnToShopBtn.addEventListener('click', toggleShopPeek);
    
    if (DOM.campfire.healBtn) DOM.campfire.healBtn.addEventListener('click', campHeal);
    if (DOM.campfire.upgradeBtn) DOM.campfire.upgradeBtn.addEventListener('click', campOpenUpgrade);
    if (DOM.campfire.cancelBtn) DOM.campfire.cancelBtn.addEventListener('click', campCancelUpgrade);
    if (DOM.campfire.leaveBtn) DOM.campfire.leaveBtn.addEventListener('click', leaveCampfire);
    
    if (DOM.modal.openBtn) DOM.modal.openBtn.addEventListener('click', openInventoryModal);
    if (DOM.modal.closeBtn) DOM.modal.closeBtn.addEventListener('click', closeInventoryModal);
};

const bootGame = () => {
    initDOM();
    bindEvents();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootGame);
} else {
    bootGame();
}
