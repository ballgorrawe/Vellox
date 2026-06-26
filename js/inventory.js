import { gameState } from './state.js';
import { CARD_DB, CLASS_POOLS } from './data.js';
import { DOM, parseCard, syncUI, renderBoard, showDialog, showPrompt } from './ui.js';

export const openLootModal = () => {
    gameState.meta.lootRerolled = false;
    if (DOM.loot.rerollBtn) DOM.loot.rerollBtn.disabled = false;
    generateLootCards();
    if (DOM.loot.wrapper) {
        DOM.loot.wrapper.classList.remove('hidden');
        DOM.loot.wrapper.setAttribute('aria-hidden', 'false');
    }
};

export const closeLootModal = () => {
    if (DOM.loot.wrapper) {
        DOM.loot.wrapper.classList.add('hidden');
        DOM.loot.wrapper.setAttribute('aria-hidden', 'true');
    }
    gameState.isRolling = false;
    if (DOM.board.rollBtn) DOM.board.rollBtn.disabled = false;
};

export const generateLootCards = () => {
    const { container } = DOM.loot;
    if (!container) return;
    container.innerHTML = '';
    
    const playerClass = gameState.player.class;
    const classCards = CLASS_POOLS[playerClass] || Object.keys(CARD_DB);
    const otherCards = Object.keys(CARD_DB).filter(c => !classCards.includes(c));
    const allCards = Object.keys(CARD_DB);
    
    const elements = ['⚪', '🔥', '💧', '🪨'];
    
    const options = [];
    for (let i = 0; i < 3; i++) {
        const isClassCard = Math.random() < 0.90;
        let pool = isClassCard && classCards.length > 0 ? classCards : otherCards;
        if (pool.length === 0) pool = allCards;
        
        const randomCardName = pool[Math.floor(Math.random() * pool.length)];
        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        options.push(`${randomCardName}:${randomElement}`);
    }
    
    options.forEach(cardRef => {
        const card = parseCard(cardRef);
        const cardDiv = document.createElement('div');
        cardDiv.className = 'combat-card';
        
        let desc = '';
        if (card.type === 'attack') desc = `Deal ${card.value} DMG`;
        else if (card.type === 'skill') desc = `Gain ${card.value} Block`;
        else if (card.type === 'heal') desc = `Heal ${card.value} HP`;
        
        cardDiv.innerHTML = `<strong>${card.name}</strong><span>Cost: ${card.cost} EN</span><small>${desc}</small><div style="margin-top:5px; font-size:1.2rem;">${card.element}</div>`;
        
        cardDiv.addEventListener('click', () => {
            selectLootCard(cardRef);
        });
        
        container.appendChild(cardDiv);
    });
};

export const selectLootCard = (cardRef) => {
    if (cardRef) {
        const parsed = parseCard(cardRef);
        const deckSize = gameState.deck.drawPile.length + gameState.deck.hand.length + gameState.deck.discardPile.length;
        if (deckSize >= 15) {
            if (gameState.player.inventory.cards.length < 5) {
                showDialog('Confirm', "Main deck full. Send to Sideboard?", true, () => {
                    gameState.player.inventory.cards.push(cardRef);
                    if (DOM.board.statusLog) DOM.board.statusLog.textContent += ` Added ${parsed.name} to sideboard!`;
                    closeLootModal();
                });
            } else {
                showDialog('Notice', "Inventory Full! You must discard something first.", false);
            }
        } else {
            gameState.deck.drawPile.push(cardRef);
            if (DOM.board.statusLog) DOM.board.statusLog.textContent += ` Added ${parsed.name} to deck!`;
            closeLootModal();
        }
    } else {
        if (DOM.board.statusLog) DOM.board.statusLog.textContent += ` Skipped loot.`;
        closeLootModal();
    }
};

export const rerollLoot = () => {
    if (gameState.meta.lootRerolled) return;
    if (gameState.player.stats.gold < 20) {
        showDialog('Notice', "Not enough gold to reroll!", false);
        return;
    }
    
    gameState.player.stats.gold -= 20;
    gameState.meta.lootRerolled = true;
    if (DOM.loot.rerollBtn) DOM.loot.rerollBtn.disabled = true;
    
    syncUI();
    generateLootCards();
};

export const campHeal = () => {
    const healAmount = Math.floor(gameState.player.stats.maxHp * 0.3);
    gameState.player.stats.hp = Math.min(gameState.player.stats.hp + healAmount, gameState.player.stats.maxHp);
    
    if (DOM.board.statusLog) {
        DOM.board.statusLog.textContent = `Rested at campfire. Healed ${healAmount} HP!`;
    }
    
    const tile = gameState.board[gameState.player.stats.position];
    tile.icon = '✅';
    tile.type = 'cleared';
    
    gameState.isRolling = false;
    if (DOM.board.rollBtn) DOM.board.rollBtn.disabled = false;
    
    gameState.meta.currentView = 'view-board';
    syncUI();
    renderBoard();
};

export const campOpenUpgrade = () => {
    DOM.campfire.prompt.textContent = "Select a card to upgrade:";
    DOM.campfire.optionsWrap.classList.add('hidden');
    DOM.campfire.upgradeWrap.classList.remove('hidden');
    
    const { deckGrid } = DOM.campfire;
    deckGrid.innerHTML = '';
    
    const allDeckCards = [...gameState.deck.drawPile, ...gameState.deck.hand, ...gameState.deck.discardPile];
    
    allDeckCards.forEach(cardRef => {
        const card = parseCard(cardRef);
        const cardDiv = document.createElement('div');
        cardDiv.className = 'combat-card';
        
        let desc = '';
        if (card.type === 'attack') desc = `Deal ${card.value} DMG`;
        else if (card.type === 'skill') desc = `Gain ${card.value} Block`;
        else if (card.type === 'heal') desc = `Heal ${card.value} HP`;
        
        cardDiv.innerHTML = `<strong>${card.name}</strong><span>Cost: ${card.cost} EN</span><small>${desc}</small><div style="margin-top:5px; font-size:1.2rem;">${card.element}</div>`;
        
        if (cardRef.endsWith('++')) {
            cardDiv.classList.add('camp-card-disabled');
        } else {
            cardDiv.addEventListener('click', () => {
                showDialog('Confirm', `Upgrade ${card.name}?`, true, () => {
                    campUpgradeCard(cardRef);
                });
            });
        }
        
        deckGrid.appendChild(cardDiv);
    });
};

export const campCancelUpgrade = () => {
    if (DOM.campfire.prompt) DOM.campfire.prompt.textContent = "You arrive at a peaceful campfire. What would you like to do?";
    if (DOM.campfire.optionsWrap) DOM.campfire.optionsWrap.classList.remove('hidden');
    if (DOM.campfire.upgradeWrap) DOM.campfire.upgradeWrap.classList.add('hidden');
};

export const leaveCampfire = () => {
    if (DOM.board.statusLog) {
        DOM.board.statusLog.textContent = `Left the campfire.`;
    }
    
    const tile = gameState.board[gameState.player.stats.position];
    tile.icon = '✅';
    tile.type = 'cleared';
    
    gameState.isRolling = false;
    if (DOM.board.rollBtn) DOM.board.rollBtn.disabled = false;
    
    gameState.meta.currentView = 'view-board';
    syncUI();
    renderBoard();
};

export const campUpgradeCard = (oldCardRef) => {
    const newCardRef = oldCardRef + '+';
    
    const piles = ['drawPile', 'discardPile', 'hand'];
    for (let pile of piles) {
        const idx = gameState.deck[pile].indexOf(oldCardRef);
        if (idx !== -1) {
            gameState.deck[pile][idx] = newCardRef;
            break;
        }
    }
    
    if (DOM.board.statusLog) {
        DOM.board.statusLog.textContent = `Upgraded to ${parseCard(newCardRef).name}!`;
    }
    
    const tile = gameState.board[gameState.player.stats.position];
    tile.icon = '✅';
    tile.type = 'cleared';
    
    gameState.isRolling = false;
    if (DOM.board.rollBtn) DOM.board.rollBtn.disabled = false;
    
    gameState.meta.currentView = 'view-board';
    syncUI();
    renderBoard();
};

let currentShopSelection = null;

export const openShopModal = () => {
    gameState.meta.shopRerolled = false;
    currentShopSelection = null;
    if (DOM.shop.buyConfirmBtn) DOM.shop.buyConfirmBtn.classList.add('hidden');
    if (DOM.shop.rerollBtn) DOM.shop.rerollBtn.disabled = false;
    generateShopStock();
    if (DOM.shop.wrapper) {
        DOM.shop.wrapper.classList.remove('hidden');
        DOM.shop.wrapper.classList.remove('shop-peeking');
        if (DOM.shop.peekBtn) DOM.shop.peekBtn.textContent = '👁️ View Board';
        DOM.shop.wrapper.setAttribute('aria-hidden', 'false');
    }
};

export const closeShopModal = () => {
    if (DOM.shop.wrapper) {
        DOM.shop.wrapper.classList.add('hidden');
        DOM.shop.wrapper.setAttribute('aria-hidden', 'true');
    }
    if (DOM.shop.returnToShopBtn) DOM.shop.returnToShopBtn.classList.add('hidden');
    gameState.isRolling = false;
    if (DOM.board.rollBtn) DOM.board.rollBtn.disabled = false;
    syncUI();
};

export const toggleShopPeek = () => {
    if (!DOM.shop.wrapper) return;
    
    if (DOM.shop.wrapper.classList.contains('hidden')) {
        DOM.shop.wrapper.classList.remove('hidden');
        if (DOM.shop.returnToShopBtn) DOM.shop.returnToShopBtn.classList.add('hidden');
    } else {
        DOM.shop.wrapper.classList.add('hidden');
        if (DOM.shop.returnToShopBtn) DOM.shop.returnToShopBtn.classList.remove('hidden');
    }
};

export const selectShopItem = (type, ref, cost, cardDiv) => {
    if (currentShopSelection && currentShopSelection.cardDiv) {
        currentShopSelection.cardDiv.classList.remove('shop-item-selected');
    }
    
    currentShopSelection = { type, ref, cost, cardDiv };
    cardDiv.classList.add('shop-item-selected');
    
    if (DOM.shop.buyConfirmBtn) {
        DOM.shop.buyConfirmBtn.textContent = `Buy for ${cost} Gold`;
        DOM.shop.buyConfirmBtn.classList.remove('hidden');
        DOM.shop.buyConfirmBtn.onclick = () => {
            buyShopItem(currentShopSelection.type, currentShopSelection.ref, currentShopSelection.cost, currentShopSelection.cardDiv);
        };
    }
};

export const generateShopStock = () => {
    const { stockContainer } = DOM.shop;
    if (!stockContainer) return;
    
    stockContainer.innerHTML = '';
    
    const allCards = Object.keys(CARD_DB);
    const elements = ['⚪', '🔥', '💧', '🪨'];
    
    for (let i = 0; i < 3; i++) {
        const randomCardName = allCards[Math.floor(Math.random() * allCards.length)];
        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        const cardRef = `${randomCardName}:${randomElement}`;
        const card = parseCard(cardRef);
        
        const cardDiv = document.createElement('div');
        cardDiv.className = 'combat-card';
        let desc = '';
        if (card.type === 'attack') desc = `Deal ${card.value} DMG`;
        else if (card.type === 'skill') desc = `Gain ${card.value} Block`;
        else if (card.type === 'heal') desc = `Heal ${card.value} HP`;
        
        cardDiv.innerHTML = `<strong>${card.name}</strong><span>Cost: ${card.cost} EN</span><small>${desc}</small><div style="margin-top:5px; font-size:1.2rem;">${card.element}</div><p style="margin-top:10px; font-weight:bold;">30G</p>`;
        
        cardDiv.addEventListener('click', () => {
            selectShopItem('card', cardRef, 30, cardDiv);
        });
        
        stockContainer.appendChild(cardDiv);
    }
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'modal-item';
    itemDiv.style.textAlign = 'center';
    itemDiv.innerHTML = `<strong>Loaded Dice</strong><br/><small>Force next roll</small><p style="margin-top:10px; font-weight:bold;">20G</p>`;
    itemDiv.addEventListener('click', () => {
        selectShopItem('item', 'Loaded Dice', 20, itemDiv);
    });
    stockContainer.appendChild(itemDiv);
    
    renderShopSellSideboard();
};

export const renderShopSellSideboard = () => {
    const { sellContainer } = DOM.shop;
    if (!sellContainer) return;
    sellContainer.innerHTML = '';
    
    gameState.player.inventory.cards.forEach((cardRef, idx) => {
        const parsed = parseCard(cardRef);
        const displayStr = cardRef.includes(':') ? `${parsed.name} (${parsed.element})` : parsed.name;
        
        const el = document.createElement('div');
        el.className = 'modal-card';
        el.innerHTML = `${displayStr} <button style="margin-top:5px; padding:5px; width:100%;" class="btn">Sell 10G</button>`;
        
        el.querySelector('button').addEventListener('click', () => {
            gameState.player.stats.gold += 10;
            trashCard(cardRef, 'sideboard', idx);
            renderShopSellSideboard(); 
            syncUI(); 
        });
        sellContainer.appendChild(el);
    });
};

export const buyShopItem = (type, ref, cost, elToRemove) => {
    if (gameState.player.stats.gold < cost) {
        showDialog('Notice', "Not enough gold!", false);
        return;
    }
    
    if (type === 'card') {
        const deckSize = gameState.deck.drawPile.length + gameState.deck.hand.length + gameState.deck.discardPile.length;
        if (deckSize >= 15) {
            if (gameState.player.inventory.cards.length >= 5) {
                showDialog('Notice', "Deck and Sideboard are full!", false);
                return;
            }
            gameState.player.inventory.cards.push(ref);
        } else {
            gameState.deck.drawPile.push(ref);
        }
    } else if (type === 'item') {
        if (gameState.player.inventory.items.length >= 3) {
            showDialog('Notice', "Item Bag is full!", false);
            return;
        }
        gameState.player.inventory.items.push(ref);
    }
    
    gameState.player.stats.gold -= cost;
    elToRemove.remove();
    currentShopSelection = null;
    if (DOM.shop.buyConfirmBtn) DOM.shop.buyConfirmBtn.classList.add('hidden');
    syncUI();
    renderInventoryModal();
};

export const rerollShop = () => {
    if (gameState.meta.shopRerolled) return;
    if (gameState.player.stats.gold < 10) {
        showDialog('Notice', "Not enough gold to reroll!", false);
        return;
    }
    gameState.player.stats.gold -= 10;
    gameState.meta.shopRerolled = true;
    if (DOM.shop.rerollBtn) DOM.shop.rerollBtn.disabled = true;
    syncUI();
    generateShopStock();
};

export const openInventoryModal = () => {
    renderInventoryModal();
    if (DOM.modal.wrapper) {
        DOM.modal.wrapper.classList.remove('hidden');
        DOM.modal.wrapper.setAttribute('aria-hidden', 'false');
    }
};

export const closeInventoryModal = () => {
    if (DOM.modal.wrapper) {
        DOM.modal.wrapper.classList.add('hidden');
        DOM.modal.wrapper.setAttribute('aria-hidden', 'true');
    }
};

export const renderInventoryModal = () => {
    const { deckContainer, sideboardContainer, itemsContainer, deckCount, sideboardCount, itemCount } = DOM.modal;
    if (!deckContainer) return;
    
    const allDeckCards = [...gameState.deck.drawPile, ...gameState.deck.hand, ...gameState.deck.discardPile];
    deckCount.textContent = allDeckCards.length;
    deckContainer.innerHTML = '';
    
    const isCombat = gameState.meta.currentView === 'view-combat';
    
    const handleDragOver = (e) => {
        e.preventDefault();
        if (!isCombat) e.currentTarget.classList.add('drag-over');
    };
    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('drag-over');
    };
    
    deckContainer.ondragover = handleDragOver;
    deckContainer.ondragleave = handleDragLeave;
    deckContainer.ondrop = (e) => {
        e.preventDefault();
        deckContainer.classList.remove('drag-over');
        if (isCombat) return;
        
        const sourceZone = e.dataTransfer.getData('source-zone');
        if (sourceZone === 'main') return;
        
        if (allDeckCards.length >= 10) {
            showDialog('Notice', 'Deck is full (Max 10)!', false);
            return;
        }
        
        const cardIdx = e.dataTransfer.getData('card-idx');
        const cardRef = gameState.player.inventory.cards[cardIdx];
        gameState.player.inventory.cards.splice(cardIdx, 1);
        gameState.deck.drawPile.push(cardRef);
        renderInventoryModal();
    };

    sideboardContainer.ondragover = handleDragOver;
    sideboardContainer.ondragleave = handleDragLeave;
    sideboardContainer.ondrop = (e) => {
        e.preventDefault();
        sideboardContainer.classList.remove('drag-over');
        if (isCombat) return;
        
        const sourceZone = e.dataTransfer.getData('source-zone');
        if (sourceZone === 'inventory') return;
        
        const cardRef = e.dataTransfer.getData('card-ref');
        trashCard(cardRef, 'deck');
        gameState.player.inventory.cards.push(cardRef);
        renderInventoryModal();
    };
    
    allDeckCards.forEach((cardRef, idx) => {
        const parsed = parseCard(cardRef);
        const displayStr = cardRef.includes(':') ? `${parsed.name} (${parsed.element})` : parsed.name;
        
        const el = document.createElement('div');
        el.className = 'modal-card';
        el.textContent = displayStr;
        
        el.draggable = !isCombat;
        el.ondragstart = (e) => {
            el.classList.add('dragging');
            e.dataTransfer.setData('source-zone', 'main');
            e.dataTransfer.setData('card-ref', cardRef);
        };
        el.ondragend = () => el.classList.remove('dragging');
        
        el.addEventListener('click', () => {
            if (isCombat) {
                showDialog('Notice', "Cannot trash cards during combat!", false);
                return;
            }
            showDialog('Confirm', '"Trash" usually means permanently destroy. Are you sure? You can just drag it to sideboard!', true, () => {
                trashCard(cardRef, 'deck');
            });
        });
        deckContainer.appendChild(el);
    });
    
    sideboardCount.textContent = gameState.player.inventory.cards.length;
    sideboardContainer.innerHTML = '';
    gameState.player.inventory.cards.forEach((cardRef, idx) => {
        const parsed = parseCard(cardRef);
        const displayStr = cardRef.includes(':') ? `${parsed.name} (${parsed.element})` : parsed.name;
        
        const el = document.createElement('div');
        el.className = 'modal-card';
        el.textContent = displayStr;
        
        el.draggable = !isCombat;
        el.ondragstart = (e) => {
            el.classList.add('dragging');
            e.dataTransfer.setData('source-zone', 'inventory');
            e.dataTransfer.setData('card-idx', idx);
            e.dataTransfer.setData('card-ref', cardRef);
        };
        el.ondragend = () => el.classList.remove('dragging');
        
        el.addEventListener('click', () => {
            showDialog('Confirm', 'Trash permanently?', true, () => {
                trashCard(cardRef, 'sideboard', idx);
            });
        });
        sideboardContainer.appendChild(el);
    });
    
    itemCount.textContent = gameState.player.inventory.items.length;
    itemsContainer.innerHTML = '';
    gameState.player.inventory.items.forEach((itemName, idx) => {
        const el = document.createElement('div');
        el.className = 'modal-item';
        el.textContent = itemName;
        el.addEventListener('click', () => {
            useItem(itemName, idx);
        });
        itemsContainer.appendChild(el);
    });
};

export const trashCard = (cardName, source, exactIdx) => {
    if (source === 'deck') {
        const piles = ['drawPile', 'discardPile', 'hand'];
        for (let pile of piles) {
            const i = gameState.deck[pile].indexOf(cardName);
            if (i !== -1) {
                gameState.deck[pile].splice(i, 1);
                break;
            }
        }
    } else if (source === 'sideboard') {
        if (exactIdx !== undefined) {
            gameState.player.inventory.cards.splice(exactIdx, 1);
        } else {
            const i = gameState.player.inventory.cards.indexOf(cardName);
            if (i !== -1) gameState.player.inventory.cards.splice(i, 1);
        }
    }
    renderInventoryModal();
};

export const useItem = (itemName, idx) => {
    if (itemName === 'Loaded Dice') {
        showPrompt('Use Loaded Dice', 'Choose a number from 1 to 6 for your next roll:', (valStr) => {
            let val = parseInt(valStr);
            if (!isNaN(val) && val >= 1 && val <= 6) {
                if (!gameState.modifiers) gameState.modifiers = {};
                gameState.modifiers.nextRoll = val;
                gameState.player.inventory.items.splice(idx, 1);
                closeInventoryModal();
                showDialog('Notice', `Loaded Dice activated! Next roll will be ${val}.`, false);
            } else {
                showDialog('Notice', "Invalid number. Item not used.", false);
            }
        });
    }
};

