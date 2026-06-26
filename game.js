/**
 * Step 3: Core Game State Architecture
 */
const gameState = {
    player: {
        class: null,
        maxHp: 0,
        hp: 0,
        gold: 0,
        energy: 0,
        maxEnergy: 3,
        position: 0
    },
    deck: {
        drawPile: [],
        hand: [],
        discardPile: []
    },
    meta: {
        bossTokens: 0
    }
};

/**
 * Step 5.1: View Switching Logic
 * Hides all views and shows the target view
 * @param {string} viewId - The ID of the view to switch to
 */
function switchView(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
    });

    // Show the target view
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
    } else {
        console.error(`View with ID ${viewId} not found.`);
    }
}

/**
 * Step 4.2: Class Selection Implementation
 * Initializes the game state based on the selected class
 * @param {string} selectedClass - The chosen character class
 */
function initGame(selectedClass) {
    // 1. Update player class and stats
    gameState.player.class = selectedClass;
    
    switch (selectedClass) {
        case 'Warrior':
            gameState.player.maxHp = 80;
            break;
        case 'Priest':
            gameState.player.maxHp = 60;
            break;
        case 'Archer':
            gameState.player.maxHp = 50;
            break;
        case 'Mage':
            gameState.player.maxHp = 40;
            break;
        default:
            gameState.player.maxHp = 50; // Fallback
            break;
    }
    
    // Set current HP to max HP
    gameState.player.hp = gameState.player.maxHp;

    // 2. Populate Deck with 5 placeholder items
    gameState.deck.drawPile = ["Strike", "Strike", "Defend", "Defend", "Class Skill"];

    // 3. Switch to Board View
    switchView('view-board');

    // 4. Update the UI to verify state
    updateUI();
}

/**
 * Step 5.3: Update UI logic
 * Updates the Board View UI bar to display current status
 */
function updateUI() {
    const uiClass = document.getElementById('ui-class');
    const uiHp = document.getElementById('ui-hp');
    const uiGold = document.getElementById('ui-gold');

    if (uiClass) {
        uiClass.textContent = `Class: ${gameState.player.class}`;
    }
    if (uiHp) {
        uiHp.textContent = `HP: ${gameState.player.hp} / ${gameState.player.maxHp}`;
    }
    if (uiGold) {
        uiGold.textContent = `Gold: ${gameState.player.gold}`;
    }
}
