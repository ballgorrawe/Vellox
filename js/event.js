import { gameState } from './state.js';
import { DOM, syncUI, renderBoard, showDialog } from './ui.js';
import { EVENT_DB, CARD_DB } from './data.js';

export const triggerRandomEvent = (handlers) => {
    const randomIdx = Math.floor(Math.random() * EVENT_DB.length);
    const currentEvent = EVENT_DB[randomIdx];
    
    DOM.event.title.textContent = currentEvent.title;
    DOM.event.description.textContent = currentEvent.description;
    
    DOM.event.choices.innerHTML = '';
    
    currentEvent.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.style.backgroundColor = '#4b5563';
        btn.textContent = choice.text;
        
        btn.onclick = () => {
            resolveEventChoice(choice.action, handlers);
        };
        
        DOM.event.choices.appendChild(btn);
    });
    
    gameState.meta.currentView = 'view-event';
    syncUI();
};

const resolveEventChoice = (action, handlers) => {
    let dialogTitle = 'Result';
    let dialogMessage = '';
    let triggerCombat = false;
    
    switch (action) {
        case 'pray':
            gameState.player.stats.gold += 30;
            dialogMessage = 'You feel a sense of peace. Gained 30 Gold.';
            break;
        case 'desecrate':
            gameState.player.stats.gold += 100;
            gameState.player.stats.hp = Math.max(1, gameState.player.stats.hp - 15);
            dialogMessage = 'The shrine crumbles, dropping 100 Gold, but a curse strikes you for 15 damage.';
            break;
        case 'help_merchant':
            if (gameState.player.stats.gold >= 20) {
                gameState.player.stats.gold -= 20;
                const allCards = Object.keys(CARD_DB);
                const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
                gameState.deck.sideboard.push(randomCard);
                dialogMessage = 'You helped the merchant and received ' + randomCard + '! (Lost 20 Gold)';
            } else {
                dialogMessage = 'You don\'t have enough gold. The merchant sighs and walks away.';
            }
            break;
        case 'ignore':
            dialogMessage = 'You walk away safely. Nothing happens.';
            break;
        case 'teleport':
            gameState.player.stats.position = (gameState.player.stats.position + 3) % gameState.board.length;
            dialogMessage = 'You step into the portal and are warped forward!';
            break;
        case 'inspect_portal':
            dialogMessage = 'You peek inside... A monster pulls you in!';
            triggerCombat = true;
            break;
        default:
            dialogMessage = 'Nothing happens.';
            break;
    }
    
    showDialog(dialogTitle, dialogMessage, false, () => {
        finishEvent(triggerCombat, handlers);
    });
};

const finishEvent = (triggerCombat, handlers) => {
    if (triggerCombat) {
        if (handlers && handlers.initCombat) {
            gameState.combat.isElite = true; 
            handlers.initCombat('Monster');
        }
    } else {
        const tile = gameState.board[gameState.player.stats.position];
        tile.icon = '✅';
        tile.type = 'cleared';
        
        gameState.isRolling = false;
        if (DOM.board.rollBtn) DOM.board.rollBtn.disabled = false;
        
        gameState.meta.currentView = 'view-board';
        syncUI();
        renderBoard();
    }
};
