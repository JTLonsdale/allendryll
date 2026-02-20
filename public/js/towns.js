// Shorthand tile aliases for compact map definitions
const _ = TILE.COBBLE, WF = TILE.WOOD_FLOOR, WL = TILE.WALL, WT = TILE.WALL_TOP,
      CT = TILE.COUNTER, DR = TILE.DOOR, CP = TILE.CARPET, TT = TILE.TOWN_TREE,
      EX = TILE.TOWN_EXIT, ST = TILE.STREAM, TB = TILE.TOWN_BRIDGE, FN = TILE.FOUNTAIN,
      WE = TILE.WELL, FC = TILE.FENCE, GD = TILE.GARDEN, SN = TILE.SIGN,
      RF = TILE.ROOF, IB = TILE.INN_BED, BK = TILE.BOOKSHELF, TF = TILE.TOWN_FLOWERS,
      DK = TILE.DOCK, SC = TILE.STONE_CIRCLE, GR = TILE.GRASS, WA = TILE.WATER,
      TR = TILE.TREES;
const SI = TILE.SIGN_INN, SX = TILE.SIGN_WEAPON, SM = TILE.SIGN_ITEM, SS = TILE.SIGN_SPECIAL;

// ============================================================
// WILLOWMERE — Forest village with streams (20x20)
// ============================================================
const WILLOWMERE = {
  id: 'willowmere',
  name: 'Willowmere',
  overworldX: 15, overworldY: 11,
  cols: 20, rows: 20,
  entryX: 10, entryY: 17,
  tiles: [
    [TR, TR, TR, TT, _, _, _, _, _, _, _, _, _, _, _, _, TT, TR, TR, TR],
    [TR, TT, FC, FC, _, TF, _, _, _, ST, ST, _, _, _, TF, FC, FC, TT, TR, TR],
    [TR, FC, RF, RF, RF, _, _, _, _, ST, ST, _, _, _, RF, RF, RF, FC, TR, TR],
    [TR, FC, WL, WL, WL, _, _, TT, _, ST, ST, _, TT, _, WL, WL, WL, FC, TR, TR],
    [TR, FC, WL, DR, WL, _, SM, _, TB, TB, TB, TB, _, SI, WL, DR, WL, FC, TR, TR],
    [TR, _, _, _, _, _, _, _, _, ST, ST, _, _, _, _, _, _, _, TR, TR],
    [TR, _, _, _, _, _, TT, _, _, ST, ST, _, _, TT, _, _, _, _, TR, TR],
    [TR, _, _, TF, _, _, _, _, _, ST, ST, _, _, _, _, _, TF, _, TR, TR],
    [TR, _, _, _, _, _, _, _, TB, TB, TB, TB, _, _, _, _, _, _, TR, TR],
    [TR, TT, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, TT, TR, TR],
    [TR, _, _, _, _, WE, _, _, _, _, _, _, _, _, _, _, _, _, TR, TR],
    [TR, _, _, _, _, _, _, _, _, TF, TF, _, _, _, _, _, _, _, TR, TR],
    [TR, FC, RF, RF, RF, _, _, _, _, _, _, _, _, _, _, _, _, FC, TR, TR],
    [TR, FC, WL, WL, WL, _, _, _, _, _, _, _, _, _, _, GD, GD, FC, TR, TR],
    [TR, FC, WL, DR, WL, SS, _, _, _, _, _, _, _, _, _, GD, GD, FC, TR, TR],
    [TR, _, _, _, _, _, _, TT, _, _, _, _, TT, _, _, _, _, _, TR, TR],
    [TR, _, TF, _, _, _, _, _, _, _, _, _, _, _, _, _, TF, _, TR, TR],
    [TR, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, TR, TR],
    [TR, TR, TR, TR, TR, EX, EX, EX, EX, EX, EX, EX, EX, EX, EX, TR, TR, TR, TR, TR],
    [TR, TR, TR, TR, TR, EX, EX, EX, EX, EX, EX, EX, EX, EX, EX, TR, TR, TR, TR, TR],
  ],
  npcs: [
    { id: 'wm_elder', name: 'Elder Rowan', x: 6, y: 9, direction: 'down',
      sprite: 'elder', dialogue: ['Welcome to Willowmere, child.', 'The forest has guarded us for centuries.', 'Seek the crystal in the vale to the east.'] },
    { id: 'wm_girl', name: 'Lily', x: 3, y: 7, direction: 'right',
      sprite: 'child', dialogue: ['I love picking flowers by the stream!', 'Have you seen the big willow tree? It\'s magical!'] },
    { id: 'wm_guard', name: 'Warden Thorne', x: 13, y: 6, direction: 'left',
      sprite: 'soldier', dialogue: ['The forest paths can be dangerous.', 'Stay on the roads between towns.'] },
    { id: 'wm_herbalist', name: 'Sage Fern', x: 16, y: 13, direction: 'down',
      sprite: 'druid', dialogue: ['My garden grows the finest herbs.', 'Nature provides all we need.'] },
    { id: 'wm_fisher', name: 'Old Reed', x: 7, y: 8, direction: 'right',
      sprite: 'elder', dialogue: ['The stream brings fish from the mountain.', 'Nothing like fresh trout for supper.'] },
    { id: 'wm_child2', name: 'Pip', x: 11, y: 11, direction: 'left',
      sprite: 'child', dialogue: ['Tag! You\'re it!', 'Haha, just kidding!'] },
  ],
  buildings: [
    {
      id: 'willowmere_general', name: 'General Store',
      doorX: 3, doorY: 4,
      cols: 8, rows: 8,
      entryX: 3, entryY: 6,
      tiles: [
        [WL, WL, WL, WL, WL, WL, WL, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, BK, WF, WF, WF, WF, BK, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, CT, CT, CT, CT, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, WL, WL, DR, WL, WL, WL, WL],
      ],
      npcs: [
        { id: 'wm_shopkeep', name: 'Marta', x: 3, y: 3, direction: 'down',
          sprite: 'merchant', dialogue: ['Welcome! Take a look at my wares.'],
          isShopkeeper: true, shopId: 'willowmere_general' },
      ]
    },
    {
      id: 'willowmere_healer', name: 'Healer\'s Hut',
      doorX: 15, doorY: 4,
      cols: 8, rows: 8,
      entryX: 3, entryY: 6,
      tiles: [
        [WL, WL, WL, WL, WL, WL, WL, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, BK, CP, CP, BK, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, IB, CP, CP, CP, IB, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, WL, WL, DR, WL, WL, WL, WL],
      ],
      npcs: [
        { id: 'wm_healer', name: 'Sister Willow', x: 4, y: 3, direction: 'down',
          sprite: 'druid', dialogue: ['Rest here and recover your strength.', 'The forest spirits watch over us.'] },
      ]
    },
    {
      id: 'willowmere_elder', name: 'Elder\'s House',
      doorX: 3, doorY: 14,
      cols: 8, rows: 8,
      entryX: 3, entryY: 6,
      tiles: [
        [WL, WL, WL, WL, WL, WL, WL, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, BK, CP, CP, CP, BK, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, WL, WL, DR, WL, WL, WL, WL],
      ],
      npcs: [
        { id: 'wm_elder_inside', name: 'Elder\'s Cat', x: 5, y: 4, direction: 'left',
          sprite: 'child', dialogue: ['Meow...', 'Purrr...'] },
      ]
    },
  ]
};

// ============================================================
// STORMHAVEN — Clifftop fortress (22x18)
// ============================================================
const STORMHAVEN = {
  id: 'stormhaven',
  name: 'Stormhaven',
  overworldX: 48, overworldY: 11,
  cols: 22, rows: 18,
  entryX: 11, entryY: 16,
  tiles: [
    [WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL],
    [WL, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, WL],
    [WL, _, RF, RF, RF, _, _, RF, RF, RF, RF, RF, RF, _, _, RF, RF, RF, RF, _, _, WL],
    [WL, _, WL, WL, WL, _, _, WL, WL, WL, WL, WL, WL, _, _, WL, WL, WL, WL, _, _, WL],
    [WL, _, WL, DR, WL, _, _, WL, WL, DR, WL, WL, WL, _, _, WL, WL, DR, WL, _, _, WL],
    [WL, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, WL],
    [WL, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, WL],
    [WL, _, _, _, SX, _, _, _, _, _, SI, _, _, _, _, _, _, SS, _, _, _, WL],
    [WL, _, _, _, _, _, _, _, _, FN, _, _, FN, _, _, _, _, _, _, _, _, WL],
    [WL, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, WL],
    [WL, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, WL],
    [WL, _, FC, FC, FC, FC, _, _, _, _, _, _, _, _, _, _, FC, FC, FC, FC, _, WL],
    [WL, _, FC, _, _, FC, _, _, _, _, _, _, _, _, _, _, FC, _, _, FC, _, WL],
    [WL, _, FC, _, _, FC, _, _, _, _, WE, _, _, _, _, _, FC, _, _, FC, _, WL],
    [WL, _, FC, _, _, FC, _, _, _, _, _, _, _, _, _, _, FC, _, _, FC, _, WL],
    [WL, _, FC, FC, FC, FC, _, _, _, _, _, _, _, _, _, _, FC, FC, FC, FC, _, WL],
    [WL, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, WL],
    [WL, WL, WL, WL, WL, EX, EX, EX, EX, EX, EX, EX, EX, EX, EX, EX, EX, WL, WL, WL, WL, WL],
  ],
  npcs: [
    { id: 'sh_commander', name: 'Commander Varek', x: 10, y: 7, direction: 'down',
      sprite: 'soldier', dialogue: ['Stormhaven guards the northern pass.', 'Our soldiers are the finest in Allendryll.', 'Train hard, princess. War is coming.'] },
    { id: 'sh_guard1', name: 'Soldier Bren', x: 3, y: 13, direction: 'right',
      sprite: 'soldier', dialogue: ['Left! Right! Left! Right!', 'Training never stops!'] },
    { id: 'sh_guard2', name: 'Soldier Kira', x: 18, y: 13, direction: 'left',
      sprite: 'soldier', dialogue: ['The training grounds keep us sharp.', 'Have you visited the armory?'] },
    { id: 'sh_smith', name: 'Forge Master Durn', x: 6, y: 6, direction: 'down',
      sprite: 'merchant', dialogue: ['My blades have no equal!', 'Visit the armory to see my work.'] },
    { id: 'sh_scout', name: 'Scout Lina', x: 15, y: 9, direction: 'left',
      sprite: 'soldier', dialogue: ['I\'ve seen dark shapes in the eastern mountains.', 'Something stirs beyond the pass.'] },
  ],
  buildings: [
    {
      id: 'stormhaven_armory', name: 'Armory',
      doorX: 3, doorY: 4,
      cols: 8, rows: 8,
      entryX: 3, entryY: 6,
      tiles: [
        [WL, WL, WL, WL, WL, WL, WL, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, BK, WF, WF, WF, WF, BK, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, CT, CT, CT, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, WL, WL, DR, WL, WL, WL, WL],
      ],
      npcs: [
        { id: 'sh_armorer', name: 'Armorer Grit', x: 2, y: 3, direction: 'down',
          sprite: 'merchant', dialogue: ['Finest weapons and armor in the realm!'],
          isShopkeeper: true, shopId: 'stormhaven_armory' },
      ]
    },
    {
      id: 'stormhaven_barracks', name: 'Barracks Inn',
      doorX: 9, doorY: 4,
      cols: 10, rows: 8,
      entryX: 5, entryY: 6,
      tiles: [
        [WL, WL, WL, WL, WL, WL, WL, WL, WL, WL],
        [WL, WF, WF, WF, WF, WF, WF, WF, WF, WL],
        [WL, IB, WF, IB, WF, WF, IB, WF, IB, WL],
        [WL, WF, WF, WF, WF, WF, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WF, WF, WL],
        [WL, WF, WF, WF, CT, CT, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WF, WF, WL],
        [WL, WL, WL, WL, WL, DR, WL, WL, WL, WL],
      ],
      npcs: [
        { id: 'sh_innkeep', name: 'Barkeep Hilda', x: 5, y: 4, direction: 'down',
          sprite: 'merchant', dialogue: ['Rest your weary bones, traveler.', 'A warm meal and a bed — that\'s all a soldier needs.'] },
      ]
    },
    {
      id: 'stormhaven_tower', name: 'Commander\'s Tower',
      doorX: 17, doorY: 4,
      cols: 8, rows: 8,
      entryX: 3, entryY: 6,
      tiles: [
        [WL, WL, WL, WL, WL, WL, WL, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, BK, CP, CP, CP, BK, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, WL, WL, DR, WL, WL, WL, WL],
      ],
      npcs: [
        { id: 'sh_strategist', name: 'Strategist Morrow', x: 4, y: 3, direction: 'down',
          sprite: 'elder', dialogue: ['The commander is out inspecting the walls.', 'Our maps show enemy movements to the east.'] },
      ]
    },
  ]
};

// ============================================================
// CRYSTALVALE — Capital city (24x24)
// ============================================================
const CRYSTALVALE = {
  id: 'crystalvale',
  name: 'Crystalvale',
  overworldX: 28, overworldY: 24,
  cols: 24, rows: 24,
  entryX: 12, entryY: 22,
  tiles: [
    [WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL],
    [WL, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, WL],
    [WL, _, RF, RF, RF, _, _, RF, RF, RF, _, _, _, _, RF, RF, RF, _, _, RF, RF, RF, _, WL],
    [WL, _, WL, WL, WL, _, _, WL, WL, WL, _, _, _, _, WL, WL, WL, _, _, WL, WL, WL, _, WL],
    [WL, _, WL, DR, WL, _, _, WL, DR, WL, _, _, _, _, WL, DR, WL, _, _, WL, DR, WL, _, WL],
    [WL, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, WL],
    [WL, _, _, SX, _, _, _, _, SX, _, _, _, _, _, _, SM, _, _, _, _, SI, _, _, WL],
    [WL, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, WL],
    [WL, _, _, _, _, _, _, _, _, _, FN, _, _, FN, _, _, _, _, _, _, _, _, _, WL],
    [WL, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, WL],
    [WL, _, _, _, _, _, _, _, _, _, _, TF, TF, _, _, _, _, _, _, _, _, _, _, WL],
    [WL, _, _, _, _, _, _, _, _, _, TF, _, _, TF, _, _, _, _, _, _, _, _, _, WL],
    [WL, _, _, _, _, TT, _, _, _, _, _, _, _, _, _, _, _, _, TT, _, _, _, _, WL],
    [WL, _, _, _, _, _, _, _, _, _, TF, _, _, TF, _, _, _, _, _, _, _, _, _, WL],
    [WL, _, _, _, _, _, _, _, _, _, _, TF, TF, _, _, _, _, _, _, _, _, _, _, WL],
    [WL, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, WL],
    [WL, _, RF, RF, RF, _, _, _, RF, RF, RF, RF, RF, RF, RF, RF, _, _, _, RF, RF, RF, _, WL],
    [WL, _, WL, WL, WL, _, _, _, WL, WL, WL, WL, WL, WL, WL, WL, _, _, _, WL, WL, WL, _, WL],
    [WL, _, WL, DR, WL, _, _, _, WL, WL, DR, WL, WL, DR, WL, WL, _, _, _, WL, DR, WL, _, WL],
    [WL, _, _, _, _, _, _, _, SS, _, _, _, _, _, _, SS, _, _, _, _, _, _, _, WL],
    [WL, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, WL],
    [WL, _, _, _, _, _, TT, _, _, _, _, _, _, _, _, _, _, TT, _, _, _, _, _, WL],
    [WL, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, WL],
    [WL, WL, WL, WL, WL, WL, EX, EX, EX, EX, EX, EX, EX, EX, EX, EX, EX, EX, WL, WL, WL, WL, WL, WL],
  ],
  npcs: [
    { id: 'cv_king', name: 'King Aldric', x: 12, y: 9, direction: 'down',
      sprite: 'elder', dialogue: ['Welcome to Crystalvale, the jewel of Allendryll.', 'Our kingdom faces dark times.', 'Five princesses may be our only hope.'] },
    { id: 'cv_guard1', name: 'Royal Guard', x: 6, y: 8, direction: 'right',
      sprite: 'soldier', dialogue: ['Long live the King!', 'The capital is safe under our watch.'] },
    { id: 'cv_guard2', name: 'Royal Guard', x: 17, y: 8, direction: 'left',
      sprite: 'soldier', dialogue: ['The throne room is in the castle above.', 'Only those with royal business may enter.'] },
    { id: 'cv_merchant1', name: 'Trader Felix', x: 10, y: 6, direction: 'down',
      sprite: 'merchant', dialogue: ['The market square has everything you need!', 'Visit our fine shops!'] },
    { id: 'cv_scholar', name: 'Scholar Elan', x: 21, y: 19, direction: 'left',
      sprite: 'elder', dialogue: ['The library holds ancient secrets.', 'I\'ve been researching the Crystal of Allendryll.'] },
    { id: 'cv_child1', name: 'Tommy', x: 11, y: 11, direction: 'right',
      sprite: 'child', dialogue: ['The fountain is so pretty!', 'I want to be a knight when I grow up!'] },
    { id: 'cv_child2', name: 'Sara', x: 13, y: 13, direction: 'left',
      sprite: 'child', dialogue: ['My mom works at the item shop.', 'She lets me have candy sometimes!'] },
    { id: 'cv_bard', name: 'Bard Melody', x: 8, y: 15, direction: 'right',
      sprite: 'merchant', dialogue: ['Shall I sing you a song of the ancient wars?', 'The five crystals were shattered long ago...'] },
    { id: 'cv_noble', name: 'Lady Corinne', x: 16, y: 15, direction: 'left',
      sprite: 'elder', dialogue: ['The capital hasn\'t been this lively in years.', 'With the princesses\' return, hope blooms anew.'] },
    { id: 'cv_guard3', name: 'Gate Guard', x: 12, y: 21, direction: 'down',
      sprite: 'soldier', dialogue: ['Safe travels beyond the walls, princess.'] },
  ],
  buildings: [
    {
      id: 'crystalvale_weapon', name: 'Weapon Shop',
      doorX: 3, doorY: 4,
      cols: 8, rows: 8,
      entryX: 3, entryY: 6,
      tiles: [
        [WL, WL, WL, WL, WL, WL, WL, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, BK, WF, WF, WF, WF, BK, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, CT, CT, CT, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, WL, WL, DR, WL, WL, WL, WL],
      ],
      npcs: [
        { id: 'cv_weapon_shop', name: 'Blade Master Oren', x: 2, y: 3, direction: 'down',
          sprite: 'merchant', dialogue: ['The finest blades in all the land!'],
          isShopkeeper: true, shopId: 'crystalvale_weapon' },
      ]
    },
    {
      id: 'crystalvale_armor', name: 'Armor Shop',
      doorX: 8, doorY: 4,
      cols: 8, rows: 8,
      entryX: 3, entryY: 6,
      tiles: [
        [WL, WL, WL, WL, WL, WL, WL, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, BK, WF, WF, WF, WF, BK, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, CT, CT, CT, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, WL, WL, DR, WL, WL, WL, WL],
      ],
      npcs: [
        { id: 'cv_armor_shop', name: 'Armorsmith Della', x: 2, y: 3, direction: 'down',
          sprite: 'merchant', dialogue: ['Protection is paramount, dear princess!'],
          isShopkeeper: true, shopId: 'crystalvale_armor' },
      ]
    },
    {
      id: 'crystalvale_item', name: 'Item Shop',
      doorX: 15, doorY: 4,
      cols: 8, rows: 8,
      entryX: 3, entryY: 6,
      tiles: [
        [WL, WL, WL, WL, WL, WL, WL, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, BK, WF, WF, WF, WF, BK, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, CT, CT, CT, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, WL, WL, DR, WL, WL, WL, WL],
      ],
      npcs: [
        { id: 'cv_item_shop', name: 'Merchant Rosa', x: 2, y: 3, direction: 'down',
          sprite: 'merchant', dialogue: ['Potions, herbs, and more — all you need for your journey!'],
          isShopkeeper: true, shopId: 'crystalvale_item' },
      ]
    },
    {
      id: 'crystalvale_inn', name: 'Crystalvale Inn',
      doorX: 20, doorY: 4,
      cols: 10, rows: 8,
      entryX: 5, entryY: 6,
      tiles: [
        [WL, WL, WL, WL, WL, WL, WL, WL, WL, WL],
        [WL, CP, CP, CP, CP, CP, CP, CP, CP, WL],
        [WL, IB, CP, IB, CP, CP, IB, CP, IB, WL],
        [WL, CP, CP, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CT, CT, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, CP, CP, WL],
        [WL, WL, WL, WL, WL, DR, WL, WL, WL, WL],
      ],
      npcs: [
        { id: 'cv_innkeep', name: 'Innkeeper Belle', x: 5, y: 3, direction: 'down',
          sprite: 'merchant', dialogue: ['Welcome to the Crystalvale Inn!', 'Rest well, your highness.'] },
      ]
    },
    {
      id: 'crystalvale_throne', name: 'Throne Room',
      doorX: 10, doorY: 18,
      cols: 12, rows: 10,
      entryX: 6, entryY: 8,
      tiles: [
        [WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL],
        [WL, CP, CP, CP, CP, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, CP, CP, CP, CP, WL],
        [WL, WL, WL, WL, WL, WL, DR, WL, WL, WL, WL, WL],
      ],
      npcs: [
        { id: 'cv_advisor', name: 'Royal Advisor Thane', x: 6, y: 3, direction: 'down',
          sprite: 'elder', dialogue: ['The King holds audience here each morning.', 'The Crystal of Allendryll must be restored.', 'Only the five princesses can reunite the shards.'] },
      ]
    },
    {
      id: 'crystalvale_library', name: 'Library',
      doorX: 13, doorY: 18,
      cols: 10, rows: 8,
      entryX: 5, entryY: 6,
      tiles: [
        [WL, WL, WL, WL, WL, WL, WL, WL, WL, WL],
        [WL, WF, BK, WF, WF, WF, WF, BK, WF, WL],
        [WL, WF, BK, WF, WF, WF, WF, BK, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WF, WF, WL],
        [WL, WF, BK, WF, WF, WF, WF, BK, WF, WL],
        [WL, WF, BK, WF, WF, WF, WF, BK, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WF, WF, WL],
        [WL, WL, WL, WL, WL, DR, WL, WL, WL, WL],
      ],
      npcs: [
        { id: 'cv_librarian', name: 'Librarian Petra', x: 5, y: 3, direction: 'down',
          sprite: 'elder', dialogue: ['Knowledge is the greatest treasure.', 'These tomes contain the history of Allendryll.'] },
      ]
    },
  ]
};

// ============================================================
// FERNHOLLOW — Druidic village (20x20)
// ============================================================
const FERNHOLLOW = {
  id: 'fernhollow',
  name: 'Fernhollow',
  overworldX: 13, overworldY: 38,
  cols: 20, rows: 20,
  entryX: 10, entryY: 17,
  tiles: [
    [TR, TR, TR, TR, TT, _, _, _, _, _, _, _, _, _, _, TT, TR, TR, TR, TR],
    [TR, TT, _, _, _, _, _, SC, _, _, _, _, SC, _, _, _, _, _, TT, TR],
    [TR, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, TR],
    [TR, _, RF, RF, RF, _, _, _, _, _, _, _, _, _, _, RF, RF, RF, _, TR],
    [TR, _, WL, WL, WL, _, _, _, _, _, _, _, _, _, _, WL, WL, WL, _, TR],
    [TR, _, WL, DR, WL, _, _, _, _, SC, _, SC, _, _, _, WL, DR, WL, _, TR],
    [TR, _, _, _, _, SM, _, _, _, _, _, _, _, _, _, _, _, SS, _, TR],
    [TR, _, _, GD, GD, _, _, _, _, _, _, _, _, _, _, GD, GD, _, _, TR],
    [TR, _, _, GD, GD, _, _, _, _, _, _, _, _, _, _, GD, GD, _, _, TR],
    [TR, _, _, _, _, _, _, _, SC, _, _, _, SC, _, _, _, _, _, _, TR],
    [TR, TT, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, TT, TR],
    [TR, _, _, _, _, _, _, _, _, TF, TF, _, _, _, _, _, _, _, _, TR],
    [TR, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, TR],
    [TR, _, RF, RF, RF, _, _, _, _, _, _, _, _, _, _, _, _, _, _, TR],
    [TR, _, WL, WL, WL, _, _, _, _, _, _, _, _, _, _, _, _, _, _, TR],
    [TR, _, WL, DR, WL, _, _, _, _, _, _, _, TT, _, _, _, _, _, _, TR],
    [TR, _, _, _, _, SS, _, TT, _, _, _, _, _, _, _, _, _, _, _, TR],
    [TR, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, TR],
    [TR, TR, TR, TR, TR, EX, EX, EX, EX, EX, EX, EX, EX, EX, EX, TR, TR, TR, TR, TR],
    [TR, TR, TR, TR, TR, EX, EX, EX, EX, EX, EX, EX, EX, EX, EX, TR, TR, TR, TR, TR],
  ],
  npcs: [
    { id: 'fh_archdruid', name: 'Arch-Druid Oaken', x: 10, y: 10, direction: 'down',
      sprite: 'druid', dialogue: ['The stones speak to those who listen.', 'Fernhollow is one with the forest.', 'The old magic still flows through these roots.'] },
    { id: 'fh_herbalist', name: 'Moss', x: 4, y: 7, direction: 'right',
      sprite: 'druid', dialogue: ['These mushrooms have healing properties.', 'Nature is the greatest alchemist.'] },
    { id: 'fh_apprentice', name: 'Ivy', x: 8, y: 9, direction: 'down',
      sprite: 'child', dialogue: ['I\'m learning to speak with the trees!', 'The Arch-Druid says I have talent!'] },
    { id: 'fh_guardian', name: 'Root Warden', x: 14, y: 6, direction: 'left',
      sprite: 'druid', dialogue: ['The stone circle protects Fernhollow.', 'Dark magic cannot penetrate these wards.'] },
    { id: 'fh_elder', name: 'Elder Bramble', x: 6, y: 16, direction: 'right',
      sprite: 'elder', dialogue: ['I remember when the Crystal was whole.', 'The druids kept a shard safe for centuries.'] },
  ],
  buildings: [
    {
      id: 'fernhollow_potion', name: 'Potion Shop',
      doorX: 3, doorY: 5,
      cols: 8, rows: 8,
      entryX: 3, entryY: 6,
      tiles: [
        [WL, WL, WL, WL, WL, WL, WL, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, BK, WF, WF, WF, WF, BK, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, CT, CT, CT, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, WL, WL, DR, WL, WL, WL, WL],
      ],
      npcs: [
        { id: 'fh_potioneer', name: 'Brewer Thorn', x: 2, y: 3, direction: 'down',
          sprite: 'druid', dialogue: ['My potions are brewed with forest dew!'],
          isShopkeeper: true, shopId: 'fernhollow_potion' },
      ]
    },
    {
      id: 'fernhollow_grove', name: 'Sacred Grove',
      doorX: 15, doorY: 5,
      cols: 10, rows: 8,
      entryX: 5, entryY: 6,
      tiles: [
        [WL, WL, WL, WL, WL, WL, WL, WL, WL, WL],
        [WL, GR, GR, GR, GR, GR, GR, GR, GR, WL],
        [WL, GR, SC, GR, GR, GR, GR, SC, GR, WL],
        [WL, GR, GR, GR, TF, TF, GR, GR, GR, WL],
        [WL, GR, GR, TF, GR, GR, TF, GR, GR, WL],
        [WL, GR, GR, GR, TF, TF, GR, GR, GR, WL],
        [WL, GR, SC, GR, GR, GR, GR, SC, GR, WL],
        [WL, WL, WL, WL, WL, DR, WL, WL, WL, WL],
      ],
      npcs: [
        { id: 'fh_grove_spirit', name: 'Forest Spirit', x: 5, y: 3, direction: 'down',
          sprite: 'druid', dialogue: ['The forest remembers all...', 'A shard of crystal sleeps beneath the roots.', 'Only a pure heart may claim it.'] },
      ]
    },
    {
      id: 'fernhollow_hollow', name: 'Arch-Druid\'s Hollow',
      doorX: 3, doorY: 15,
      cols: 8, rows: 8,
      entryX: 3, entryY: 6,
      tiles: [
        [WL, WL, WL, WL, WL, WL, WL, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, BK, CP, CP, CP, BK, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, CP, CP, CP, CP, CP, CP, WL],
        [WL, WL, WL, DR, WL, WL, WL, WL],
      ],
      npcs: [
        { id: 'fh_hollow_keeper', name: 'Keeper of Lore', x: 4, y: 3, direction: 'down',
          sprite: 'elder', dialogue: ['The Arch-Druid\'s wisdom fills these halls.', 'Ancient prophecies speak of five who will save us.'] },
      ]
    },
  ]
};

// ============================================================
// LAKEPORT — Lakeside port town (22x18)
// ============================================================
const LAKEPORT = {
  id: 'lakeport',
  name: 'Lakeport',
  overworldX: 46, overworldY: 36,
  cols: 22, rows: 18,
  entryX: 11, entryY: 16,
  tiles: [
    [WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA],
    [WA, WA, WA, WA, DK, DK, DK, WA, WA, WA, WA, WA, WA, WA, WA, DK, DK, DK, WA, WA, WA, WA],
    [WA, WA, WA, WA, DK, _, _, _, _, _, _, _, _, _, _, _, _, DK, WA, WA, WA, WA],
    [WA, WA, WA, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, WA, WA, WA],
    [_, _, _, _, _, RF, RF, RF, _, _, _, _, _, RF, RF, RF, _, _, _, _, _, _],
    [_, _, _, _, _, WL, WL, WL, _, _, _, _, _, WL, WL, WL, _, _, _, _, _, _],
    [_, _, _, _, _, WL, DR, WL, _, _, _, _, _, WL, DR, WL, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, SM, _, _, _, SI, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, WE, _, _, WE, _, _, _, _, _, _, _, _, _],
    [_, _, _, RF, RF, RF, RF, _, _, _, _, _, _, _, _, RF, RF, RF, _, _, _, _],
    [_, _, _, WL, WL, WL, WL, _, _, _, _, _, _, _, _, WL, WL, WL, _, _, _, _],
    [_, _, _, WL, WL, DR, WL, _, _, _, _, _, _, _, _, WL, DR, WL, _, _, _, _],
    [_, _, _, _, _, _, _, SS, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, TT, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, TT, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [FC, FC, FC, FC, FC, EX, EX, EX, EX, EX, EX, EX, EX, EX, EX, EX, EX, FC, FC, FC, FC, FC],
  ],
  npcs: [
    { id: 'lp_harbormaster', name: 'Harbor Master Gull', x: 10, y: 8, direction: 'down',
      sprite: 'sailor', dialogue: ['Lakeport is the trade hub of the south.', 'Ships come from across the lake with goods.', 'Watch the docks — they can be slippery!'] },
    { id: 'lp_sailor1', name: 'Sailor Jack', x: 5, y: 2, direction: 'down',
      sprite: 'sailor', dialogue: ['The lake hides many secrets in its depths.', 'I once saw a glimmer deep below the surface.'] },
    { id: 'lp_sailor2', name: 'Sailor Mae', x: 16, y: 2, direction: 'down',
      sprite: 'sailor', dialogue: ['We trade fish for mountain ore.', 'It\'s an honest living!'] },
    { id: 'lp_fisher', name: 'Old Barnacle', x: 4, y: 3, direction: 'right',
      sprite: 'elder', dialogue: ['Been fishing this lake for fifty years.', 'The crystal shard fell into the water long ago.'] },
    { id: 'lp_child', name: 'Coral', x: 14, y: 14, direction: 'left',
      sprite: 'child', dialogue: ['I found a pretty shell by the dock!', 'Want to see? ...Oh, I lost it.'] },
    { id: 'lp_guard', name: 'Dock Warden', x: 8, y: 13, direction: 'right',
      sprite: 'soldier', dialogue: ['Keep an eye on your belongings near the docks.', 'Not everyone here is trustworthy.'] },
  ],
  buildings: [
    {
      id: 'lakeport_trade', name: 'Trade Shop',
      doorX: 6, doorY: 6,
      cols: 8, rows: 8,
      entryX: 3, entryY: 6,
      tiles: [
        [WL, WL, WL, WL, WL, WL, WL, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, BK, WF, WF, WF, WF, BK, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, CT, CT, CT, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, WL, WL, DR, WL, WL, WL, WL],
      ],
      npcs: [
        { id: 'lp_trader', name: 'Trader Morgan', x: 2, y: 3, direction: 'down',
          sprite: 'merchant', dialogue: ['Goods from every corner of Allendryll!'],
          isShopkeeper: true, shopId: 'lakeport_trade' },
      ]
    },
    {
      id: 'lakeport_inn', name: 'Sailor\'s Rest',
      doorX: 14, doorY: 6,
      cols: 10, rows: 8,
      entryX: 5, entryY: 6,
      tiles: [
        [WL, WL, WL, WL, WL, WL, WL, WL, WL, WL],
        [WL, WF, WF, WF, WF, WF, WF, WF, WF, WL],
        [WL, IB, WF, IB, WF, WF, IB, WF, IB, WL],
        [WL, WF, WF, WF, WF, WF, WF, WF, WF, WL],
        [WL, WF, WF, WF, CT, CT, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WF, WF, WL],
        [WL, WL, WL, WL, WL, DR, WL, WL, WL, WL],
      ],
      npcs: [
        { id: 'lp_innkeep', name: 'Barkeep Reef', x: 5, y: 3, direction: 'down',
          sprite: 'merchant', dialogue: ['Welcome to the Sailor\'s Rest!', 'Best ale on the lake, I promise.'] },
      ]
    },
    {
      id: 'lakeport_harbor', name: 'Harbor Master Office',
      doorX: 5, doorY: 12,
      cols: 8, rows: 8,
      entryX: 3, entryY: 6,
      tiles: [
        [WL, WL, WL, WL, WL, WL, WL, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, BK, WF, WF, WF, WF, BK, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, WF, WF, WF, WF, WF, WF, WL],
        [WL, WL, WL, DR, WL, WL, WL, WL],
      ],
      npcs: [
        { id: 'lp_clerk', name: 'Port Clerk Finn', x: 4, y: 3, direction: 'down',
          sprite: 'merchant', dialogue: ['All ships must register with the harbor master.', 'Trade manifests are filed here.'] },
      ]
    },
  ]
};

// Master town list
const TOWNS = [WILLOWMERE, STORMHAVEN, CRYSTALVALE, FERNHOLLOW, LAKEPORT];
