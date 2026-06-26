export const INITIAL_STATE = {
    board: [],
    lapCount: 0,
    isRolling: false,
    activeBoss: null,
    player: {
        class: null,
        stats: {
            hp: 0,
            maxHp: 0,
            gold: 0,
            energy: 0,
            maxEnergy: 3,
            position: 0
        },
        inventory: {
            cards: [],
            items: ['Loaded Dice']
        },
        buffs: []
    },
    deck: {
        drawPile: [],
        hand: [],
        discardPile: [],
        exhaustPile: []
    },
    combat: {
        enemy: { hp: 0, maxHp: 0, block: 0, type: '' },
        playerBlock: 0,
        turn: 'player',
        cardQueue: [],
        isExecuting: false
    },
    meta: {
        bossTokens: 0,
        currentView: 'view-main-menu'
    },
    modifiers: {
        nextRoll: null
    }
};

export let gameState = null;

export const resetGameState = () => {
    gameState = JSON.parse(JSON.stringify(INITIAL_STATE));
};
