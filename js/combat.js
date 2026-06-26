import { gameState } from './state.js';
import { ELEMENT_ICONS } from './data.js';
import { DOM, renderCombatUI, syncUI, renderBoard, parseCard, showDialog } from './ui.js';

let handlers = {
    openLootModal: null
};

export const setCombatHandlers = (newHandlers) => {
    handlers = { ...handlers, ...newHandlers };
};

export const initCombat = (encounterType) => {
    const isBoss = encounterType === 'Boss' || encounterType === '👹';
    const isElite = encounterType === 'Elite';
    
    let baseHp = 20;
    if (isBoss) baseHp = 50;
    else if (isElite) baseHp = 35;
    
    gameState.combat.enemy.type = encounterType;
    gameState.combat.enemy.maxHp = baseHp + (gameState.lapCount * 10);
    gameState.combat.enemy.hp = gameState.combat.enemy.maxHp;
    gameState.combat.enemy.block = 0;
    
    gameState.combat.enemy.element = ELEMENT_ICONS[Math.floor(Math.random() * ELEMENT_ICONS.length)];
    
    gameState.combat.playerBlock = 0;
    gameState.player.stats.energy = gameState.player.stats.maxEnergy;
    gameState.combat.turn = 'player';
    
    gameState.meta.currentView = 'view-combat';
    syncUI();
    startPlayerTurn();
};

export const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

export const drawCards = (amount) => {
    for (let i = 0; i < amount; i++) {
        if (gameState.deck.drawPile.length === 0) {
            if (gameState.deck.discardPile.length === 0) break;
            
            gameState.deck.drawPile = [...gameState.deck.discardPile];
            gameState.deck.discardPile = [];
            shuffleArray(gameState.deck.drawPile);
        }
        gameState.deck.hand.push(gameState.deck.drawPile.pop());
    }
    renderCombatUI();
};

export const startPlayerTurn = () => {
    gameState.combat.turn = 'player';
    gameState.player.stats.energy = gameState.player.stats.maxEnergy;
    gameState.combat.playerBlock = 0;
    gameState.combat.skillUsedThisTurn = false;
    gameState.combat.enemyMarked = false;
    gameState.combat.cardQueue = [];
    gameState.combat.isExecuting = false;
    drawCards(5);
};

export const startEnemyTurn = () => {
    setTimeout(() => {
        if (gameState.combat.enemy.hp <= 0) return;
        
        let dmg = 5 + gameState.lapCount;
        
        if (gameState.combat.playerBlock > 0) {
            if (dmg >= gameState.combat.playerBlock) {
                dmg -= gameState.combat.playerBlock;
                gameState.combat.playerBlock = 0;
            } else {
                gameState.combat.playerBlock -= dmg;
                dmg = 0;
            }
        }
        
        gameState.player.stats.hp -= dmg;
        renderCombatUI();
        
        if (!checkCombatEnd()) {
            startPlayerTurn();
        }
    }, 1000);
};

export const checkCombatEnd = () => {
    if (gameState.player.stats.hp <= 0) {
        showDialog('Notice', "Game Over! You have died.", false);
        gameState.meta.currentView = 'view-class-selection';
        syncUI();
        return true;
    }
    
    if (gameState.combat.enemy.hp <= 0) {
        gameState.deck.drawPile.push(...gameState.deck.hand);
        gameState.deck.drawPile.push(...gameState.deck.discardPile);
        gameState.deck.hand = [];
        gameState.deck.discardPile = [];
        shuffleArray(gameState.deck.drawPile); 
        
        if (DOM.board.statusLog) DOM.board.statusLog.textContent = 'You defeated the enemy!';
        
        const tile = gameState.board[gameState.player.stats.position];
        tile.icon = '✅';
        tile.type = 'cleared';
        
        gameState.meta.currentView = 'view-board';
        syncUI();
        renderBoard();
        if (handlers.openLootModal) handlers.openLootModal();
        return true;
    }
    
    return false;
};

export const calculateElementalDamage = (baseDamage, attackElement, defenseElement) => {
    if (attackElement === '💧' && defenseElement === '🔥') return Math.floor(baseDamage * 1.5);
    if (attackElement === '🔥' && defenseElement === '🪨') return Math.floor(baseDamage * 1.5);
    if (attackElement === '🪨' && defenseElement === '💧') return Math.floor(baseDamage * 1.5);
    
    if (attackElement === '🔥' && defenseElement === '💧') return Math.floor(baseDamage * 0.5);
    if (attackElement === '🪨' && defenseElement === '🔥') return Math.floor(baseDamage * 0.5);
    if (attackElement === '💧' && defenseElement === '🪨') return Math.floor(baseDamage * 0.5);
    
    return baseDamage;
};

export const queueCard = (handIndex) => {
    if (gameState.combat.turn !== 'player' || gameState.combat.isExecuting) return;
    
    const cardQueue = gameState.combat.cardQueue;
    const queueIndex = cardQueue.indexOf(handIndex);
    
    if (queueIndex !== -1) {
        cardQueue.splice(queueIndex, 1);
        renderCombatUI();
        return;
    }
    
    const cardRef = gameState.deck.hand[handIndex];
    const card = parseCard(cardRef);
    if (!card) return;
    
    let queuedCost = 0;
    cardQueue.forEach(idx => {
        const qRef = gameState.deck.hand[idx];
        const qCard = parseCard(qRef);
        if (qCard) queuedCost += qCard.cost;
    });
    
    const predictedEnergy = gameState.player.stats.energy - queuedCost;
    
    if (predictedEnergy < card.cost) {
        showDialog('Notice', "Not enough energy!", false);
        return;
    }
    
    cardQueue.push(handIndex);
    renderCombatUI();
};

export const executeCard = (cardRef) => {
    const handIndex = gameState.deck.hand.indexOf(cardRef);
    if (handIndex === -1) return;
    
    const card = parseCard(cardRef);
    if (!card) return;
    
    gameState.player.stats.energy -= card.cost;
    
    if (card.type === 'attack') {
        let dmg = calculateElementalDamage(card.value, card.element, gameState.combat.enemy.element);
        
        if (gameState.combat.enemyMarked) {
            dmg *= 2;
            gameState.combat.enemyMarked = false;
        }
        
        const enemyArea = document.getElementById('combat-enemy-area');
        if (enemyArea) {
            const feedback = document.createElement('div');
            feedback.style.position = 'absolute';
            feedback.style.color = dmg > card.value ? '#10b981' : (dmg < card.value ? '#ef4444' : '#f8fafc');
            feedback.style.fontWeight = 'bold';
            feedback.style.fontSize = '1.2rem';
            feedback.style.transform = 'translateY(-40px)';
            feedback.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            feedback.style.zIndex = '10';
            
            if (dmg > card.value) {
                feedback.textContent = 'Super Effective! (' + dmg + ')';
            } else if (dmg < card.value) {
                feedback.textContent = 'Not Effective... (' + dmg + ')';
            } else {
                feedback.textContent = 'Hit (' + dmg + ')';
            }
            
            enemyArea.style.position = 'relative';
            enemyArea.appendChild(feedback);
            setTimeout(() => {
                if (feedback.parentNode) feedback.remove();
            }, 1000);
        }

        if (gameState.combat.enemy.block > 0) {
            if (dmg >= gameState.combat.enemy.block) {
                dmg -= gameState.combat.enemy.block;
                gameState.combat.enemy.block = 0;
            } else {
                gameState.combat.enemy.block -= dmg;
                dmg = 0;
            }
        }
        gameState.combat.enemy.hp -= dmg;
    } else if (card.type === 'skill') {
        gameState.combat.playerBlock += card.value;
    } else if (card.type === 'heal') {
        gameState.player.stats.hp = Math.min(gameState.player.stats.hp + card.value, gameState.player.stats.maxHp);
    }
    
    gameState.deck.hand.splice(handIndex, 1);
    gameState.deck.discardPile.push(cardRef);
    
    renderCombatUI();
    checkCombatEnd();
};

export const executeQueue = () => {
    if (gameState.combat.turn !== 'player' || gameState.combat.isExecuting) return;
    if (gameState.combat.cardQueue.length === 0) {
        endPlayerTurn();
        return;
    }
    
    gameState.combat.isExecuting = true;
    
    const queueRefs = gameState.combat.cardQueue.map(idx => gameState.deck.hand[idx]);
    
    let i = 0;
    const processNext = () => {
        if (i >= queueRefs.length || gameState.combat.enemy.hp <= 0 || gameState.player.stats.hp <= 0) {
            gameState.combat.isExecuting = false;
            gameState.combat.cardQueue = [];
            if (gameState.combat.enemy.hp > 0 && gameState.player.stats.hp > 0) {
                endPlayerTurn();
            }
            return;
        }
        
        executeCard(queueRefs[i]);
        i++;
        setTimeout(processNext, 300);
    };
    
    processNext();
};

export const useHeroSkill = () => {
    if (gameState.combat.turn !== 'player') return;
    if (gameState.combat.skillUsedThisTurn) return;
    
    const playerClass = gameState.player.class;
    
    if (playerClass === 'Warrior' && gameState.player.stats.energy < 2) { showDialog('Notice', "Not enough energy!", false); return; }
    if (playerClass === 'Mage' && gameState.player.stats.hp <= 3) { showDialog('Notice', "Not enough HP!", false); return; }
    if (playerClass === 'Archer' && gameState.player.stats.energy < 1) { showDialog('Notice', "Not enough energy!", false); return; }
    if (playerClass === 'Priest' && gameState.player.stats.energy < 2) { showDialog('Notice', "Not enough energy!", false); return; }
    
    if (playerClass === 'Warrior') gameState.player.stats.energy -= 2;
    if (playerClass === 'Mage') gameState.player.stats.hp -= 3;
    if (playerClass === 'Archer') gameState.player.stats.energy -= 1;
    if (playerClass === 'Priest') gameState.player.stats.energy -= 2;
    
    gameState.combat.skillUsedThisTurn = true;
    
    if (playerClass === 'Warrior') {
        let dmg = gameState.combat.playerBlock;
        if (gameState.combat.enemy.block > 0) {
            if (dmg >= gameState.combat.enemy.block) {
                dmg -= gameState.combat.enemy.block;
                gameState.combat.enemy.block = 0;
            } else {
                gameState.combat.enemy.block -= dmg;
                dmg = 0;
            }
        }
        gameState.combat.enemy.hp -= dmg;
        
        const enemyArea = document.getElementById('combat-enemy-area');
        if (enemyArea) {
            const feedback = document.createElement('div');
            feedback.style.position = 'absolute';
            feedback.style.color = '#f59e0b';
            feedback.style.fontWeight = 'bold';
            feedback.style.fontSize = '1.2rem';
            feedback.style.transform = 'translateY(-40px)';
            feedback.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            feedback.style.zIndex = '10';
            feedback.textContent = `Shield Bash! (${dmg})`;
            enemyArea.style.position = 'relative';
            enemyArea.appendChild(feedback);
            setTimeout(() => { if (feedback.parentNode) feedback.remove(); }, 1000);
        }
    } else if (playerClass === 'Mage') {
        gameState.player.stats.energy += 2;
        drawCards(2); 
    } else if (playerClass === 'Archer') {
        gameState.combat.enemyMarked = true;
    } else if (playerClass === 'Priest') {
        gameState.player.stats.hp = Math.min(gameState.player.stats.hp + 5, gameState.player.stats.maxHp);
    }
    
    renderCombatUI();
    checkCombatEnd();
};

export const endPlayerTurn = () => {
    if (gameState.combat.turn !== 'player' || gameState.combat.isExecuting) return;
    
    gameState.deck.discardPile.push(...gameState.deck.hand);
    gameState.deck.hand = [];
    gameState.combat.cardQueue = [];
    
    gameState.combat.turn = 'enemy';
    renderCombatUI();
    
    setTimeout(() => {
        startEnemyTurn();
    }, 1000);
};
