export const CLASS_CONFIGS = {
    Warrior: { maxHp: 80, trait: "High survivability and raw physical damage.", initialDeck: ["Strike", "Strike", "Defend", "Defend", "Bash"] },
    Mage:    { maxHp: 40, trait: "Card draw engine and high burst elemental magic.", initialDeck: ["Zap", "Zap", "Barrier", "Barrier", "Mana Crystal"] },
    Archer:  { maxHp: 50, trait: "Marks targets for massive double-damage criticals.", initialDeck: ["Shoot", "Shoot", "Dodge", "Dodge", "Focus"] },
    Priest:  { maxHp: 60, trait: "Self-healing and steady, safe pacing.", initialDeck: ["Smite", "Smite", "Heal", "Defend", "Pray"] },
    Rogue:   { maxHp: 45, trait: "Low-cost cards, combo potential, and evasion.", initialDeck: ["Strike", "Strike", "Dodge", "Quick Slash", "Poison Flask"] },
    Paladin: { maxHp: 75, trait: "Massive block stacking and Holy retaliation damage.", initialDeck: ["Smite", "Defend", "Defend", "Holy Shield", "Retribution"] }
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
    "Quick Slash": { cost: 0, type: 'attack', value: 4, element: '⚪' },
    "Poison Flask": { cost: 1, type: 'attack', value: 5, element: '💧' },
    "Holy Shield": { cost: 2, type: 'skill', value: 15, element: '⚪' },
    "Retribution": { cost: 1, type: 'attack', value: 8, element: '🔥' },
    "Fireball": { cost: 2, type: 'attack', value: 8, element: '🔥' },
    "Water Splash": { cost: 1, type: 'attack', value: 4, element: '💧' },
    "Earth Spike": { cost: 2, type: 'attack', value: 7, element: '🪨' }
};

export const ENEMY_CARD_DB = {
    // Normal Cards
    "Bite": { type: 'attack', value: 5, description: "Deal 5 DMG" },
    "Tackle": { type: 'attack', value: 8, description: "Deal 8 DMG" },
    "Harden": { type: 'skill', value: 5, description: "Gain 5 Block" },
    // Boss Cards
    "Inferno Breath": { type: 'attack', value: 15, element: '🔥', description: "Deal 15 DMG, Fire element" },
    "Earthquake": { type: 'attack', value: 10, block: 10, description: "Deal 10 DMG, gain 10 Block" },
    "Devour": { type: 'attack', value: 8, heal: 8, description: "Deal 8 DMG, Heal 8 HP" }
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
