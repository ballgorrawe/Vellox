import { gameState } from './state.js';
import { TILE_TYPES, TILE_NAMES, BOSS_DB } from './data.js';
import { DOM, renderBoard, syncUI } from './ui.js';

let handlers = {
    openShopModal: null,
    campCancelUpgrade: null,
    initCombat: null
};

export const setBoardHandlers = (newHandlers) => {
    handlers = { ...handlers, ...newHandlers };
};

export const generateFixedBoard = () => {
    gameState.board = [];
    for (let i = 0; i < 44; i++) {
        let icon;
        let type;
        if (i === 0) {
            type = 'start';
            icon = '🏠';
        } else if (i % 11 === 0) {
            type = 'boss';
            icon = '👹';
        } else {
            type = 'normal';
            icon = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
        }
        
        const possibleNames = TILE_NAMES[icon] || ["Unknown"];
        const name = possibleNames[Math.floor(Math.random() * possibleNames.length)];
        gameState.board.push({ type, icon, name });
    }
};

export const rollDice = () => {
    if (gameState.isRolling) return;
    
    gameState.isRolling = true;
    if (DOM.board.rollBtn) DOM.board.rollBtn.disabled = true;
    if (DOM.board.statusLog) DOM.board.statusLog.textContent = `Rolling... 🎲`;
    
    // 1. Show overlay and start crazy spin
    const { diceOverlay, diceCube } = DOM.board;
    if (diceOverlay && diceCube) {
        diceOverlay.classList.remove('hidden');
        diceCube.className = 'rolling';
    }
    
    // Calculate Roll
    let diceRoll = Math.floor(Math.random() * 6) + 1;
    if (gameState.modifiers && gameState.modifiers.nextRoll !== null) {
        diceRoll = gameState.modifiers.nextRoll;
        gameState.modifiers.nextRoll = null;
    }
    
    // 2. Stop crazy spin and snap to the rolled face
    setTimeout(() => {
        if (diceCube) {
            diceCube.className = `show-${diceRoll}`;
        }
        
        // 3. Wait a moment so player sees the result, then hide overlay and execute logic
        setTimeout(() => {
            if (diceOverlay && diceCube) {
                diceOverlay.classList.add('hidden');
                diceCube.className = '';
            }
            
            let startPos = gameState.player.stats.position;
            
            let finalPos = startPos;
            for (let step = 1; step <= diceRoll; step++) {
                let checkPos = (startPos + step) % gameState.board.length;
                finalPos = startPos + step;
                if (gameState.board[checkPos].icon === '⛰️') {
                    break;
                }
            }
            
            let passedGo = false;
            const passGoLogic = () => {
                gameState.lapCount++;
                gameState.player.stats.gold += 50;
                gameState.player.stats.hp = Math.min(gameState.player.stats.hp + 10, gameState.player.stats.maxHp);
                passedGo = true;
                
                if (gameState.activeBoss) {
                    expandBossTerritory();
                } else if (gameState.lapCount % 5 === 0 && gameState.lapCount > 0) {
                    spawnDynamicBoss();
                }
            };
            
            if (finalPos >= gameState.board.length) {
                passGoLogic();
            }
            
            gameState.player.stats.position = finalPos % gameState.board.length;
            
            let slideMsg = null;
            if (gameState.board[gameState.player.stats.position].icon === '❄️') {
                const slide = Math.floor(Math.random() * 3) + 1;
                const oldPos = gameState.player.stats.position;
                const newPos = oldPos + slide;
                
                if (newPos >= gameState.board.length) passGoLogic();
                
                gameState.player.stats.position = newPos % gameState.board.length;
                slideMsg = `Slid ${slide} spaces on ice!`;
            }
            
            renderBoard();
            const triggersEvent = resolveEncounter(diceRoll, passedGo, slideMsg);
            
            if (!triggersEvent) {
                gameState.isRolling = false;
                if (DOM.board.rollBtn) DOM.board.rollBtn.disabled = false;
            }
            
            syncUI();
            
        }, 1000); // 1000ms delay to show the final face
    }, 1000); // 1000ms of crazy spinning
};

export const expandBossTerritory = () => {
    if (!gameState.activeBoss) return;
    
    const { position, territory, mechanic } = gameState.activeBoss;
    const len = gameState.board.length;
    
    const occupied = new Set([position, ...territory]);
    let newTerritory = [];
    
    occupied.forEach(idx => {
        const left = (idx - 1 + len) % len;
        const right = (idx + 1) % len;
        
        if (!occupied.has(left) && left !== 0) newTerritory.push(left);
        if (!occupied.has(right) && right !== 0) newTerritory.push(right);
    });
    
    const uniqueNew = [...new Set(newTerritory)];
    
    uniqueNew.forEach(idx => {
        territory.push(idx);
        const tile = gameState.board[idx];
        tile.type = 'territory';
        
        if (mechanic === 'scorch') tile.icon = '🔥';
        else if (mechanic === 'freeze') tile.icon = '❄️';
        else if (mechanic === 'mountain') tile.icon = '⛰️';
        else if (mechanic === 'corrupt') tile.icon = '👁️';
    });
};

export const spawnDynamicBoss = () => {
    const bossNames = Object.keys(BOSS_DB);
    const randomBossName = bossNames[Math.floor(Math.random() * bossNames.length)];
    const bossData = BOSS_DB[randomBossName];
    
    let randomIdx;
    do {
        randomIdx = Math.floor(Math.random() * (gameState.board.length - 1)) + 1;
    } while (randomIdx === gameState.player.stats.position);
    
    gameState.board[randomIdx].type = 'boss';
    gameState.board[randomIdx].icon = '👹';
    
    gameState.activeBoss = {
        name: randomBossName,
        element: bossData.element,
        mechanic: bossData.mechanic,
        position: randomIdx,
        territory: []
    };
    
    gameState.meta.pendingBossWarning = `WARNING: ${randomBossName} has appeared on the board!`;
};

export const resolveEncounter = (rollResult, passedGo, slideMessage) => {
    const tile = gameState.board[gameState.player.stats.position];
    let triggersEvent = false;
    
    if (tile && DOM.board.statusLog) {
        let message = `You rolled a ${rollResult}!`;
        if (slideMessage) message += ` ${slideMessage}`;
        
        if (passedGo) {
            message += ` Lap ${gameState.lapCount} Complete! +50 Gold, +10 HP!`;
        }
        
        if (tile.name && tile.icon !== '✅') {
            message += ` Arrived at [${tile.name}].`;
        }
        
        if (gameState.meta.pendingBossWarning) {
            message += ` ${gameState.meta.pendingBossWarning}`;
            gameState.meta.pendingBossWarning = null;
        }
        
        let encounterType = '';
        
        switch (tile.icon) {
            case '⚔️': 
                message += ` You encountered a Monster (Level ${gameState.lapCount})!`; 
                triggersEvent = true;
                encounterType = 'Monster';
                break;
            case '❓': 
                message += " You found a mystery event!"; 
                triggersEvent = true;
                encounterType = 'Event';
                break;
            case '💰': 
                message += " You arrived at a Shop!"; 
                if (handlers.openShopModal) handlers.openShopModal();
                break;
            case '🏕️': 
                message += " You arrive at a Campfire."; 
                if (handlers.campCancelUpgrade) handlers.campCancelUpgrade();
                triggersEvent = true;
                encounterType = 'Campfire';
                break;
            case '👹': 
                message += " You face a Boss!"; 
                triggersEvent = true;
                encounterType = 'Boss';
                break;
            case '🏠': message += " You landed on the Start space."; break;
            
            case '🔥':
                const scorchDmg = Math.floor(gameState.player.stats.maxHp * 0.1);
                gameState.player.stats.hp -= scorchDmg;
                message += ` Scorched! Lost ${scorchDmg} HP. You encounter a fiery Monster!`;
                triggersEvent = true;
                encounterType = 'Monster';
                break;
            case '❄️':
                message += ` You landed on frozen ground! You encounter a frosted Monster!`;
                triggersEvent = true;
                encounterType = 'Monster';
                break;
            case '⛰️':
                message += " The mountain path is blocked! You fight an Elite Monster!";
                triggersEvent = true;
                encounterType = 'Elite';
                break;
            case '👁️':
                message += " You wander through corrupted territory... You encounter a void Monster!";
                triggersEvent = true;
                encounterType = 'Monster';
                break;
            case '✅':
                message += " This area is clear.";
                break;
        }
        DOM.board.statusLog.textContent = message;
        
        if (triggersEvent) {
            setTimeout(() => {
                if (encounterType === 'Campfire') {
                    gameState.meta.currentView = 'view-campfire';
                    syncUI();
                } else if (encounterType === 'Event') {
                    if (handlers.triggerRandomEvent) handlers.triggerRandomEvent(handlers);
                } else {
                    if (handlers.initCombat) handlers.initCombat(encounterType);
                }
            }, 1500);
        }
    }
    
    return triggersEvent;
};
