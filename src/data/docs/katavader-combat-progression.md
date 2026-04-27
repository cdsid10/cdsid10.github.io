# COMBAT PROGRESSION & BALANCE DESIGN

**Project:** Katavader  
**Genre:** Action RPG · Boss Rush · Hack-and-Slash  
**Platform:** PC (Steam) · Single-player  

## DOCUMENT OVERVIEW

Defines player progression, boss scaling, and encounter pacing.

> Player damage values assume **Base Normal = 20** and **Base Ability = 40**, scaled by the damage multiplier at each level (1×, 1.4×, 2×).

---

## DESIGN INTENT

Progression increases player efficiency without significantly increasing survivability.

Players deal more damage and gain limited stamina capacity, reducing encounter duration while maintaining high lethality. This ensures that mastery reduces time-to-kill rather than lowering combat risk.

---

## PLAYER PROGRESSION

### 1. PLAYER STAT GROWTH

Player stats across three upgrade tiers.

| Stat | Level 1 | Level 2 | Level 3 |
|:---:|:---:|:---:|:---:|
| Health | 100 | 200 | 400 |
| Stamina | 4 | 6 | 9 |
| Damage Multiplier | 1× | 1.4× | 2× |

---

### 2. SCALING PATTERN

Stat increases per upgrade tier.

| Stat | Upgrade 1 (L1 → L2) | Upgrade 2 (L2 → L3) | |
|:---:|:---:|:---:|:---:|
| Health | +100 (100 → 200) | +200 (200 → 400) | |
| Stamina | +2 (4 → 6) | +3 (6 → 9) | |
| Damage | +0.4× (1× → 1.4×) | +0.6× (1.4× → 2×) | |

---

### 3. PLAYER DAMAGE PER HIT

Player damage per hit at each level.

| Attack Type | Level 1 | Level 2 | Level 3 |
|:---:|:---:|:---:|:---:|
| Normal attack | 20 | 28 | 40 |
| Ability attack | 40 | 56 | 80 |

---

### 4. PROGRESSION SUMMARY

- **Health: 100 → 400 (4×)**
- **Stamina: 4 → 9 (2.25×)**
- **Damage: 1× → 2× (2×)**

---

## BOSS & COMBAT SCALING

### BOSS → PLAYER DAMAGE

Boss damage dealt to player by attack type.

| # | Boss Name | HP | Normal | Large | Reduced | Stamina |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
|   |   |   | *(Standard hit)* | *(Heavy hit)* | *(Mitigated hit)* | *(Stamina damage)* |
| 1 | The Ichi-Nagi | 264 | 14 | 28 | 9 | 1 |
| 2 | The Öxdrengr | 336 | 16 | 32 | 12 | 1 |
| 3 | The Ni-Nagi | 432 | 21 | 41 | 14 | 1.25 |
| 4 | The Mercenary | 540 | 25 | 50 | 16 | 1.25 |
| 5 | The Skjaldmærin | 672 | 32 | 64 | 22 | 1.5 |
| 6 | The Fencer | 864 | 37 | 74 | 24 | 1.75 |
| 7 | The San-Nagi | 1320 | 41 | 82 | 28 | 2 |
| 8 | The Reiðøxdrengr | 1800 | 52 | 104 | 35 | 2.5 |
| 9 | The Oath Keeper | 2400 | 58 | 114 | 38 | 6 |
| 10 | The Gunslinger | 3200 | 69 | 138 | 46 | 4 |

---

### PLAYER → BOSS HIT-TO-KILL

Hits required to defeat each boss by player level.

- **Damage Level 1:** <b>N</b>ormal = 20 | <b>A</b>bility = 40  
- **Damage Level 2:** <b>N</b>ormal = 28 | <b>A</b>bility = 56  
- **Damage Level 3:** <b>N</b>ormal = 40 | <b>A</b>bility = 80  

| # | Boss Name | HP | L1 N | L1 A | L2 N | L2 A | L3 N | L3 A |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | The Ichi-Nagi | 264 | 14 | 7 | 10 | 5 | 7 | 4 |
| 2 | The Öxdrengr | 336 | 17 | 9 | 12 | 6 | 9 | 5 |
| 3 | The Ni-Nagi | 432 | 22 | 11 | 16 | 8 | 11 | 6 |
| 4 | The Mercenary | 540 | 27 | 14 | 20 | 10 | 14 | 7 |
| 5 | The Skjaldmærin | 672 | 34 | 17 | 24 | 12 | 17 | 9 |
| 6 | The Fencer | 864 | 44 | 22 | 31 | 16 | 22 | 11 |
| 7 | The San-Nagi | 1320 | 66 | 33 | 48 | 24 | 33 | 17 |
| 8 | The Reiðøxdrengr | 1800 | 90 | 45 | 65 | 33 | 45 | 23 |
| 9 | The Oath Keeper | 2400 | 120 | 60 | 86 | 43 | 60 | 30 |
| 10 | The Gunslinger | 3200 | 160 | 80 | 115 | 58 | 80 | 40 |

---

### COMBAT PACING ANALYSIS

Progression improves efficiency, not safety.

While player damage scales significantly across levels, boss damage remains high relative to player health. As a result, players defeat enemies faster but remain vulnerable to mistakes.

This ensures that progression rewards mastery through reduced encounter duration rather than increased survivability.

---

### ASSUMPTIONS & LIMITATIONS
- All hit-to-kill values assume hits land without interruption. Actual encounter duration varies based on player accuracy, defensive success, and repositioning.

---