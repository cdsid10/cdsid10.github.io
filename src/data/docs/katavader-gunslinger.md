# ENEMY DESIGN: THE GUNSLINGER

**Project:** Katavader  
**Genre:** Action RPG · Boss Rush · Hack-and-Slash  
**Platform:** PC (Steam) · Single-player  

## OVERVIEW

A pressure-driven boss that enforces reactive play through context-based weapon switching and recovery punishment.

---

<!-- ## DESIGN PILLARS

### 1. REACTIVE PRESSURE
The Gunslinger responds directly to player actions through context-based weapon selection. Defensive and recovery behaviours are evaluated and can be countered, preventing passive play.

---

### 2. RANGE CONTROL
The boss maintains effective combat distance by selecting weapons and movement behaviours based on spacing. This forces the player to continuously adjust positioning.

---

### 3. RECOVERY PUNISH
Healing introduces risk. When a recovery state is detected, the AI can prioritize interrupt tools, requiring the player to time healing carefully.

--- -->

## DESIGN INTENT & PLAYER EXPERIENCE

The Gunslinger enforces decision-making under pressure through reactive weapon systems that adapt to player behaviour, particularly defensive and recovery actions.

The player is required to:
- **Manage distance to avoid unfavorable weapon states**
- **Time healing carefully to avoid interruption**
- **Adapt to weapon switching rather than rely on fixed patterns**

---

## CORE PROPERTIES

| Property | Value |
|---|---|
| AI System | FSM (Behavior Trees per state) |
| Phases | Single (no transitions) |
| Weapon Slots | 3 (1 active at a time) |
| Weapon Switching | Context-based (weighted selection) |
| Targeting | Player lock with predictive aim |
| Posture System | Enabled (break → vulnerability) |
| Attack Range | 25 units |
| Melee Range | 3 units |
| Run Speed | 6 |

---

## COMBAT SYSTEMS

### WEAPON SYSTEMS

The Gunslinger carries three weapons and can switch between them freely. Weapon selection is driven by real-time contextual evaluation.

| Weapon | Role | Player Defense Interaction | Behaviour |
|---|---|---|---|
| **Revolver** | Single / Burst | Can Parry & Can Block | Rapid shots for sustained pressure and combos |
| **Double Barrel Shotgun** | Execution / Denial | Can Parry but Cannot Block | High-damage shot that forces a defensive response |
| **Sawed-Off Shotgun** | Interrupt / Homing | Can Parry & Can Block | Homing shots to catch the player off guard and interrupt recovery |

---

## WEAPON SYNERGY (MECHANICS & DYNAMICS)

### 1. HEAL INTERRUPT 
Weighted weapon switching allows healing after a Double Barrel hit to be interrupted by Sawed-Off priority.
This interaction punishes unsafe recovery attempts and reinforces timing discipline.

```text
                    ┌─────────────────────┐
                    │    Double Barrel    │
                    │   High damage hit   │
                    └─────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               │                               │
               ▼                               ▼
        AI continues                    Player attempts
        evaluation                           heal
               │                               │
               ▼                               │
    Weighted selection                         │
    Switch to Sawed-Off                        │
               │                               │
               ▼                               │
        ┌─────────────────┐                    │
        │   Sawed-Off     │                    │
        │ Homing shot     │────────────────────┤
        └─────────────────┘                    │
                               ┌───────────────┴───────────────┐
                               │                               │
                               ▼                               ▼
                     ┌──────────────────┐           ┌──────────────────┐
                     │   INTERRUPTED    │           │    COMPLETED     │
                     │ Hit during heal  │           │ Heal completes   │
                     │ Heal cancelled   │           │ before impact    │
                     └──────────────────┘           └──────────────────┘
                               │                               │
                               └───────────────┬───────────────┘
                                               │
                                               ▼
                                    ┌─────────────────────┐
                                    │ Return to Evaluation│
                                    └─────────────────────┘
```

---

## AI SYSTEMS

### STRUCTURE

Three decision layers:

- **Positioning Layer** → controls distance, movement, and spatial control  
- **Weapon Selection Layer** → determines weapon choice based on context  
- **Attack Execution Layer** → selects and executes attacks  

---

### AI DECISION FLOW

The AI operates as a continuous evaluation loop driven by distance, player state, and cooldown availability.

```text
Enter Combat
      │
      ▼
Combat Evaluation
      │
      ▼
Evaluate Distance
      │
      ▼
Decision Layer (Context + Weighted Selection)
      │
      ├── Maintain / Control Distance
      │       │
      │       ▼
      │   Movement Behaviour
      │       ├── Move Towards
      │       └── Reposition (Roll / Dodge)
      │       │
      │       ▼
      │   Weapon Selection
      │       │
      │       ├── Revolver
      │       │      ├── Single Shot (aimed pressure)
      │       │      ├── Combo A (short burst)
      │       │      └── Combo B (extended burst)
      │       │
      │       ├── Double Barrel
      │       │      └── Timing Roll (50%)
      │       │             ├── Instant Burst
      │       │             └── Delayed Burst
      │       │
      │       └── Sawed-Off
      │              └── Timing Roll (50%)
      │                     ├── Instant Shot
      │                     └── Delayed Shot
      │
      └── Rush State
              │
              ▼
      Evaluate Distance + Weighted Selection
        │
        ├── Melee → Melee Strike
        │
        └── Ranged → Revolver Variant
                     (Single / Combo A / Combo B)
              │
              ▼
        Post-Attack Recovery
              │
              ▼
        Combat Evaluation
```
---

### STATE CONTROLS

State overrides define how the AI prioritizes behavior and interrupts ongoing actions.

- **Rush** → Forces close-range behavior  
- **Reposition** → Overrides current action when spacing is invalid  
- **Recovery** → Locks behavior until complete  

All states return to Combat Evaluation.

---

### MOVEMENT & COMBAT REGULATORS

Combat regulators define how the AI is constrained and stabilized during combat. These systems prevent repetition, enforce readability, and maintain pressure balance.

#### PRIORITY ORDER

Interrupts > State Overrides > Movement > Attack Execution

---

#### INTERRUPTS

Interrupts override current actions based on player interaction.

- **Hit (On Damage Received)** 
     - Cancels current action 
     - Enters Stagger State (short duration) 
- **Parried (On Player Parry)**  
     - Cancels current action
     - Enters Extended Recovery State (longer vulnerability)

All interrupt states disable action execution and return to Combat Evaluation on completion.

---

#### MOVEMENT BEHAVIOR

Movement is used to maintain effective combat positioning and reset decision flow.

- **Reposition** 
     - Triggered when distance is outside preferred range 
     - Moves to restore optimal spacing 
- **Roll / Dodge**  
     - Used as reactive reposition during pressure or recovery
     - Can interrupt non-locked actions

Movement occurs between attack cycles and feeds back into decision evaluation.

---

#### TARGETING

Targeting controls aim consistency and tracking.

- Maintains continuous **player lock**
- Applies **predictive aiming** for projectile weapons
- Updates in real-time during movement and attack execution

---

#### COOLDOWNS

Cooldowns regulate action frequency and enforce variation.

- Each attack has an **independent cooldown timer**
- Actions on cooldown are **excluded from selection**
- Cooldowns influence **weighted decision outcomes**

---