// Item catalog
const ITEMS = {
  // Consumables
  herb:         { id: 'herb',         name: 'Herb',           type: 'consumable', price: 8,   desc: 'Restores 30 HP' },
  potion:       { id: 'potion',       name: 'Potion',         type: 'consumable', price: 25,  desc: 'Restores 80 HP' },
  hiPotion:     { id: 'hiPotion',     name: 'Hi-Potion',      type: 'consumable', price: 60,  desc: 'Restores 200 HP' },
  ether:        { id: 'ether',        name: 'Ether',          type: 'consumable', price: 30,  desc: 'Restores 30 MP' },
  hiEther:      { id: 'hiEther',      name: 'Hi-Ether',       type: 'consumable', price: 80,  desc: 'Restores 80 MP' },
  antidote:     { id: 'antidote',     name: 'Antidote',       type: 'consumable', price: 12,  desc: 'Cures poison' },
  phoenixDown:  { id: 'phoenixDown',  name: 'Phoenix Down',   type: 'consumable', price: 150, desc: 'Revives a fallen ally' },
  // Weapons
  bronzeSword:  { id: 'bronzeSword',  name: 'Bronze Sword',   type: 'weapon',     price: 50,  desc: 'ATK +5. A basic blade.', atk: 5 },
  ironSword:    { id: 'ironSword',    name: 'Iron Sword',     type: 'weapon',     price: 120, desc: 'ATK +12. Sturdy steel.', atk: 12 },
  steelSword:   { id: 'steelSword',   name: 'Steel Sword',    type: 'weapon',     price: 300, desc: 'ATK +22. Fine craftsmanship.', atk: 22 },
  oakStaff:     { id: 'oakStaff',     name: 'Oak Staff',      type: 'weapon',     price: 40,  desc: 'ATK +3, MAG +5. A mage\'s staff.', atk: 3 },
  crystalStaff: { id: 'crystalStaff', name: 'Crystal Staff',  type: 'weapon',     price: 250, desc: 'ATK +8, MAG +15. Channels magic.', atk: 8 },
  shortBow:     { id: 'shortBow',     name: 'Short Bow',      type: 'weapon',     price: 60,  desc: 'ATK +7. Light and quick.', atk: 7 },
  longBow:      { id: 'longBow',      name: 'Long Bow',       type: 'weapon',     price: 180, desc: 'ATK +15. Greater range.', atk: 15 },
  // Armor
  clothRobe:    { id: 'clothRobe',    name: 'Cloth Robe',     type: 'armor',      price: 30,  desc: 'DEF +3. Light fabric.', def: 3 },
  leatherArmor: { id: 'leatherArmor', name: 'Leather Armor',  type: 'armor',      price: 80,  desc: 'DEF +8. Tanned hide.', def: 8 },
  chainMail:    { id: 'chainMail',    name: 'Chain Mail',     type: 'armor',      price: 200, desc: 'DEF +15. Linked rings.', def: 15 },
  plateArmor:   { id: 'plateArmor',   name: 'Plate Armor',    type: 'armor',      price: 500, desc: 'DEF +25. Heavy steel plates.', def: 25 },
  // Accessories
  silverRing:   { id: 'silverRing',   name: 'Silver Ring',    type: 'accessory',  price: 100, desc: 'MAG +5. Faint glow.' },
  guardAmulet:  { id: 'guardAmulet',  name: 'Guard Amulet',   type: 'accessory',  price: 150, desc: 'DEF +5. Protective charm.' },
};

// Shop inventories — each lists item IDs available for purchase
const SHOPS = {
  willowmere_general: {
    name: 'Willowmere General Store',
    items: ['herb', 'antidote', 'potion', 'ether', 'clothRobe', 'bronzeSword']
  },
  stormhaven_armory: {
    name: 'Stormhaven Armory',
    items: ['ironSword', 'steelSword', 'shortBow', 'longBow', 'chainMail', 'plateArmor', 'guardAmulet']
  },
  crystalvale_weapon: {
    name: 'Crystalvale Weapon Shop',
    items: ['bronzeSword', 'ironSword', 'steelSword', 'shortBow', 'longBow', 'oakStaff', 'crystalStaff']
  },
  crystalvale_armor: {
    name: 'Crystalvale Armor Shop',
    items: ['clothRobe', 'leatherArmor', 'chainMail', 'plateArmor', 'guardAmulet', 'silverRing']
  },
  crystalvale_item: {
    name: 'Crystalvale Item Shop',
    items: ['herb', 'potion', 'hiPotion', 'ether', 'hiEther', 'antidote', 'phoenixDown']
  },
  fernhollow_potion: {
    name: 'Fernhollow Potion Shop',
    items: ['herb', 'potion', 'hiPotion', 'ether', 'hiEther', 'antidote', 'phoenixDown', 'silverRing']
  },
  lakeport_trade: {
    name: 'Lakeport Trade Shop',
    items: ['potion', 'hiPotion', 'ether', 'phoenixDown', 'leatherArmor', 'ironSword', 'shortBow', 'guardAmulet']
  }
};
