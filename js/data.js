export const CLASS_CONFIGS = {
    Warrior: { maxHp: 80, initialDeck: ["Strike", "Strike", "Defend", "Defend", "Bash"] },
    Priest:  { maxHp: 60, initialDeck: ["Smite", "Smite", "Heal", "Defend", "Pray"] },
    Archer:  { maxHp: 50, initialDeck: ["Shoot", "Shoot", "Dodge", "Dodge", "Focus"] },
    Mage:    { maxHp: 40, initialDeck: ["Zap", "Zap", "Barrier", "Barrier", "Mana Crystal"] }
};

export const ELEMENT_ICONS = ['🔥', '💧', '🪨'];

export const CARD_DB = {
    "Strike": { cost: 1, type: 'attack', value: 6, element: '⚪' },
    "Defend": { cost: 1, type: 'skill', value: 5, element: '⚪' },
    "Bash": { cost: 2, type: 'attack', value: 10, element: '⚪' },
    "Smite": { cost: 1, type: 'attack', value: 5, element: '⚪' },
    "Heal": { cost: 1, type: 'heal', value: 6, element: '⚪' },
    "Pray": { cost: 0, type: 'skill', value: 4, element: '⚪' },
    "Shoot": { cost: 1, type: 'attack', value: 6, element: '⚪' },
    "Dodge": { cost: 1, type: 'skill', value: 6, element: '⚪' },
    "Focus": { cost: 0, type: 'skill', value: 3, element: '⚪' },
    "Zap": { cost: 1, type: 'attack', value: 7, element: '⚪' },
    "Barrier": { cost: 2, type: 'skill', value: 12, element: '⚪' },
    "Mana Crystal": { cost: 0, type: 'skill', value: 3, element: '⚪' },
    "Fireball": { cost: 2, type: 'attack', value: 8, element: '🔥' },
    "Water Splash": { cost: 1, type: 'attack', value: 4, element: '💧' },
    "Earth Spike": { cost: 2, type: 'attack', value: 7, element: '🪨' }
};

export const EVENT_DB = [
    {
        title: "The Golden Shrine",
        description: "You stumble upon an ancient shrine made entirely of solid gold. It practically hums with divine energy.",
        choices: [
            { text: "Pray: Gain 30 Gold", action: 'pray' },
            { text: "Desecrate: Gain 100 Gold, Lose 15 HP", action: 'desecrate' }
        ]
    },
    {
        title: "Lost Merchant",
        description: "A hooded figure is struggling to carry a heavy pack. They offer you a random card if you help them.",
        choices: [
            { text: "Help: Lose 20 Gold, Gain Card", action: 'help_merchant' },
            { text: "Ignore: Walk away", action: 'ignore' }
        ]
    },
    {
        title: "Ominous Portal",
        description: "A swirling vortex of dark energy blocks your path. You hear something breathing inside.",
        choices: [
            { text: "Enter: Teleport 3 spaces forward", action: 'teleport' },
            { text: "Inspect: Trigger Elite Combat", action: 'inspect_portal' }
        ]
    }
];

export const BOSS_DB = {
    "Ignis": { element: '🔥', mechanic: 'scorch' },
    "Glacius": { element: '💧', mechanic: 'freeze' },
    "Titanos": { element: '🪨', mechanic: 'mountain' },
    "VoidWeaver": { element: '⚪', mechanic: 'corrupt' }
};

export const CLASS_POOLS = {
    "Warrior": ["Strike", "Defend", "Bash"],
    "Priest": ["Smite", "Defend", "Heal", "Pray"],
    "Archer": ["Shoot", "Defend", "Dodge", "Focus"],
    "Mage": ["Zap", "Defend", "Barrier", "Mana Crystal", "Fireball", "Water Splash", "Earth Spike"]
};

export const TILE_TYPES = ['⚔️', '❓', '💰', '🏕️'];

export const TILE_NAMES = {
    '🏠': ["Town of Beginnings"],
    '💰': ["Merchant's Cove", "Black Market", "Traveling Trader"],
    '🏕️': ["Resting Bonfire", "Hero's Camp", "Peaceful Glade"],
    '❓': ["Mystery Shrine", "Crossroads", "Forgotten Ruins"],
    '⚔️': ["Goblin Path", "Bandit Ambush", "Dark Forest"],
    '👹': ["Demon's Lair", "Boss Territory"]
};
