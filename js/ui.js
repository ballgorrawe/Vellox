import { gameState } from './state.js';
import { CARD_DB } from './data.js';

export const DOM = {
    views: null,
    classCards: null,
    ui: {},
    board: {},
    combat: {},
    loot: {},
    shop: {},
    campfire: {},
    modal: {}
};

// Handlers passed from other modules to avoid circular dependencies
let handlers = {
    queueCard: null,
    useHeroSkill: null
};

export const setUIHandlers = (newHandlers) => {
    handlers = { ...handlers, ...newHandlers };
};

export const initDOM = () => {
    DOM.views = document.querySelectorAll('.view');
    DOM.classCards = document.querySelectorAll('.class-card');
    
    DOM.ui = {
        playerClass: document.getElementById('ui-class'),
        hp: document.getElementById('ui-hp'),
        gold: document.getElementById('ui-gold'),
        startRunBtn: document.getElementById('btn-start-run'),
        classInfo: document.getElementById('ui-class'),
        hpInfo: document.getElementById('ui-hp'),
        goldInfo: document.getElementById('ui-gold')
    };
    
    DOM.board = {
        container: document.getElementById('board-container'),
        statusLog: document.getElementById('status-log'),
        rollBtn: document.getElementById('btn-roll-dice'),
        centerBoss: document.getElementById('center-boss-area'),
        diceOverlay: document.getElementById('dice-overlay'),
        diceCube: document.getElementById('dice-cube')
    };
    
    DOM.combat = {
        enemyIcon: document.getElementById('enemy-icon'),
        enemyHp: document.getElementById('enemy-hp'),
        enemyBlock: document.getElementById('enemy-block'),
        playerHp: document.getElementById('player-hp'),
        playerBlock: document.getElementById('player-block'),
        playerEnergy: document.getElementById('player-energy'),
        handArea: document.getElementById('combat-hand-area'),
        drawCount: document.getElementById('draw-pile-count'),
        discardCount: document.getElementById('discard-pile-count'),
        executeQueueBtn: document.getElementById('btn-execute-queue')
    };
    
    DOM.loot = {
        wrapper: document.getElementById('loot-modal'),
        container: document.getElementById('loot-cards-container'),
        skipBtn: document.getElementById('btn-loot-skip'),
        rerollBtn: document.getElementById('btn-loot-reroll')
    };
    
    DOM.shop = {
        wrapper: document.getElementById('shop-modal'),
        stockContainer: document.getElementById('shop-stock-container'),
        sellContainer: document.getElementById('shop-sell-container'),
        rerollBtn: document.getElementById('btn-shop-reroll'),
        closeBtn: document.getElementById('btn-leave-shop'),
        currentGold: document.getElementById('shop-current-gold'),
        peekBtn: document.getElementById('btn-peek-board'),
        buyConfirmBtn: document.getElementById('btn-buy-confirm'),
        returnToShopBtn: document.getElementById('btn-return-to-shop')
    };
    
    DOM.event = {
        title: document.getElementById('event-title'),
        description: document.getElementById('event-description'),
        choices: document.getElementById('event-choices')
    };
    
    DOM.campfire = {
        prompt: document.getElementById('campfire-prompt'),
        optionsWrap: document.getElementById('campfire-state-menu'),
        upgradeWrap: document.getElementById('campfire-state-upgrade'),
        deckGrid: document.getElementById('campfire-card-grid'),
        healBtn: document.getElementById('btn-camp-heal'),
        upgradeBtn: document.getElementById('btn-camp-upgrade'),
        cancelBtn: document.getElementById('btn-cancel-upgrade'),
        leaveBtn: document.getElementById('btn-leave-campfire')
    };
    
    DOM.modal = {
        wrapper: document.getElementById('inventory-modal'),
        openBtn: document.getElementById('btn-inventory'),
        closeBtn: document.getElementById('btn-exit-inventory'),
        deckContainer: document.getElementById('modal-deck-container'),
        sideboardContainer: document.getElementById('modal-sideboard-container'),
        itemsContainer: document.getElementById('modal-items-container'),
        deckCount: document.getElementById('deck-count'),
        sideboardCount: document.getElementById('sideboard-count'),
        itemCount: document.getElementById('item-count')
    };
    
    DOM.dialog = {
        overlay: document.getElementById('custom-dialog-overlay'),
        title: document.getElementById('dialog-title'),
        message: document.getElementById('dialog-message'),
        input: document.getElementById('dialog-input'),
        cancelBtn: document.getElementById('btn-dialog-cancel'),
        confirmBtn: document.getElementById('btn-dialog-confirm')
    };
};

export const syncUI = () => {
    // Show active view
    if (DOM.views) {
        DOM.views.forEach(view => {
            if (view.id === gameState.meta.currentView) {
                view.classList.remove('hidden');
                view.setAttribute('aria-hidden', 'false');
            } else {
                view.classList.add('hidden');
                view.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Update Top Bar
    if (DOM.ui.classInfo) DOM.ui.classInfo.textContent = gameState.player.class || '-';
    if (DOM.ui.hpInfo) DOM.ui.hpInfo.textContent = `${gameState.player.stats.hp} / ${gameState.player.stats.maxHp}`;
    if (DOM.ui.goldInfo) DOM.ui.goldInfo.textContent = gameState.player.stats.gold;
    
    if (DOM.shop.currentGold) DOM.shop.currentGold.textContent = `Gold: ${gameState.player.stats.gold}`;
};

export const showDialog = (title, message, isConfirm, onConfirmCallback) => {
    const { overlay, title: titleEl, message: messageEl, cancelBtn, confirmBtn } = DOM.dialog;
    if (!overlay) return;
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    if (isConfirm) {
        cancelBtn.style.display = 'inline-block';
    } else {
        cancelBtn.style.display = 'none';
    }
    
    overlay.classList.remove('hidden');
    
    const closeDialog = () => {
        overlay.classList.add('hidden');
    };
    
    confirmBtn.onclick = () => {
        closeDialog();
        if (onConfirmCallback) onConfirmCallback();
    };
    
    cancelBtn.onclick = () => {
        closeDialog();
    };
};

export const showPrompt = (title, message, onConfirmCallback) => {
    const { overlay, title: titleEl, message: messageEl, input, cancelBtn, confirmBtn } = DOM.dialog;
    if (!overlay) return;
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    if (input) {
        input.classList.remove('hidden');
        input.value = '';
    }
    
    cancelBtn.style.display = 'inline-block';
    overlay.classList.remove('hidden');
    
    const closeDialog = () => {
        overlay.classList.add('hidden');
        if (input) input.classList.add('hidden');
    };
    
    confirmBtn.onclick = () => {
        const val = input ? input.value : '';
        closeDialog();
        if (onConfirmCallback) onConfirmCallback(val);
    };
    
    cancelBtn.onclick = () => {
        closeDialog();
    };
};

const getTileGridPosition = (index) => {
    if (index >= 0 && index <= 11) {
        // Bottom Row
        return { c: index + 1, r: 12 };
    } else if (index >= 12 && index <= 21) {
        // Right Col
        return { c: 12, r: 12 - (index - 11) };
    } else if (index >= 22 && index <= 33) {
        // Top Row
        return { c: 12 - (index - 22), r: 1 };
    } else if (index >= 34 && index <= 43) {
        // Left Col
        return { c: 1, r: 1 + (index - 33) };
    }
    return { c: 1, r: 1 };
};

export const renderBoard = () => {
    const { container } = DOM.board;
    if (!container) return;
    
    if (container.children.length < gameState.board.length) {
        for (let i = container.children.length; i < gameState.board.length; i++) {
            const tile = gameState.board[i];
            const tileDiv = document.createElement('div');
            tileDiv.className = 'tile';
            tileDiv.id = `tile-${i}`;
            tileDiv.innerHTML = `<span class="tile-icon">${tile.icon}</span>`;
            
            // Apply coordinates
            const pos = getTileGridPosition(i);
            tileDiv.style.gridColumn = pos.c;
            tileDiv.style.gridRow = pos.r;
            
            container.appendChild(tileDiv);
        }
    }
    
    for (let i = 0; i < gameState.board.length; i++) {
        const tileDiv = container.children[i];
        if (i === gameState.player.stats.position) {
            tileDiv.classList.add('player-here');
            tileDiv.innerHTML = `
                <span class="tile-icon">${gameState.board[i].icon}</span>
                <div class="player-token">🚶‍♂️</div>
            `;
        } else {
            tileDiv.classList.remove('player-here');
            tileDiv.innerHTML = `<span class="tile-icon">${gameState.board[i].icon}</span>`;
        }
    }
    
    renderCenterBoss();
};

export const renderCenterBoss = () => {
    const { centerBoss } = DOM.board;
    if (!centerBoss) return;
    
    if (gameState.activeBoss) {
        centerBoss.innerHTML = `<span class="tile-icon">${gameState.activeBoss.element}</span>`;
    } else {
        centerBoss.innerHTML = `<span class="tile-icon">🕳️</span>`; // Empty pit / sleeping
    }
};

export const parseCard = (cardRef) => {
    let baseRef = cardRef;
    let plusCount = 0;
    
    while (baseRef.endsWith('+')) {
        plusCount++;
        baseRef = baseRef.slice(0, -1);
    }
    
    let parsed;
    if (!baseRef.includes(':')) {
        parsed = { name: baseRef, ...CARD_DB[baseRef] };
    } else {
        const [name, element] = baseRef.split(':');
        parsed = { name, ...CARD_DB[name], element };
    }
    
    if (plusCount > 0) {
        parsed.value += (plusCount * 3);
        parsed.name += '+'.repeat(plusCount);
    }
    
    return parsed;
};

export const renderCombatUI = () => {
    if (!DOM.combat.enemyHp) return;
    
    const { combat, player, deck } = gameState;
    
    const enemyIcon = combat.enemy.type === 'Boss' ? '👹' : '⚔️';
    DOM.combat.enemyIcon.textContent = `${enemyIcon} ${combat.enemy.element || '⚪'}`;
    DOM.combat.enemyHp.textContent = `HP: ${combat.enemy.hp} / ${combat.enemy.maxHp}`;
    DOM.combat.enemyBlock.textContent = `Block: ${combat.enemy.block}`;
    
    DOM.combat.playerHp.textContent = `HP: ${player.stats.hp} / ${player.stats.maxHp}`;
    DOM.combat.playerBlock.textContent = `Block: ${combat.playerBlock}`;
    DOM.combat.playerEnergy.textContent = `Energy: ${player.stats.energy} / ${player.stats.maxEnergy}`;
    
    // Hero Skill Button Rendering
    const playerArea = document.getElementById('combat-player-area');
    if (playerArea) {
        let skillBtn = document.getElementById('btn-hero-skill');
        if (!skillBtn) {
            skillBtn = document.createElement('button');
            skillBtn.id = 'btn-hero-skill';
            skillBtn.className = 'btn';
            skillBtn.style.marginLeft = '20px';
            if (handlers.useHeroSkill) skillBtn.addEventListener('click', handlers.useHeroSkill);
            playerArea.appendChild(skillBtn);
        }
        
        if (player.class === 'Warrior') {
            skillBtn.textContent = 'Shield Bash (2 EN)';
            skillBtn.title = 'Deals damage equal to current Block.';
        } else if (player.class === 'Mage') {
            skillBtn.textContent = 'Mana Surge (3 HP)';
            skillBtn.title = 'Draw 2 cards, Gain 2 Energy. Costs 3 HP.';
        } else if (player.class === 'Archer') {
            skillBtn.textContent = 'Mark Target (1 EN)';
            skillBtn.title = 'Next attack deals double damage.';
        } else if (player.class === 'Priest') {
            skillBtn.textContent = 'Divine Heal (2 EN)';
            skillBtn.title = 'Restore 5 HP.';
        }
        
        skillBtn.disabled = combat.skillUsedThisTurn || combat.turn !== 'player';
    }
    
    DOM.combat.drawCount.textContent = gameState.deck.drawPile.length;
    DOM.combat.discardCount.textContent = gameState.deck.discardPile.length;
    
    // Render hand
    DOM.combat.handArea.innerHTML = '';
    
    deck.hand.forEach((cardRef, index) => {
        const card = parseCard(cardRef);
        const cardDiv = document.createElement('div');
        cardDiv.className = 'combat-card';
        
        let desc = '';
        if (card.type === 'attack') desc = `Deal ${card.value} DMG`;
        else if (card.type === 'skill') desc = `Gain ${card.value} Block`;
        else if (card.type === 'heal') desc = `Heal ${card.value} HP`;
        
        cardDiv.innerHTML = `<strong>${card.name}</strong><span>Cost: ${card.cost} EN</span><small>${desc}</small><div style="margin-top:5px; font-size:1.2rem;">${card.element}</div>`;
        
        const queueIndex = combat.cardQueue.indexOf(index);
        if (queueIndex !== -1) {
            cardDiv.classList.add('queued-card');
            const badge = document.createElement('div');
            badge.className = 'queue-badge';
            badge.textContent = queueIndex + 1;
            cardDiv.appendChild(badge);
        }
        
        cardDiv.addEventListener('click', () => {
            if (handlers.queueCard) handlers.queueCard(index);
        });
        
        DOM.combat.handArea.appendChild(cardDiv);
    });
    
    if (DOM.combat.executeQueueBtn) {
        DOM.combat.executeQueueBtn.disabled = combat.isExecuting || combat.turn !== 'player';
    }
};
