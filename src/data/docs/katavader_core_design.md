# CORE GAMEPLAY DESIGN

**Project:** Katavader  
**Genre:** Action RPG · Boss Rush · Hack-and-Slash  
**Platform:** PC (Steam) · Single-player  

## PROJECT OVERVIEW

Katavader is a third-person boss-rush action RPG centered on decision-driven combat. Encounters require players to interpret enemy intent, manage resources, and commit to actions under pressure.

---

## DESIGN INTENT

Combat prioritizes decision-making over mechanical execution.

Each action is a commitment, requiring the player to evaluate timing, positioning, and resource state before execution. Difficulty emerges from increasing decision pressure rather than mechanical execution.

---

## DESIGN INSPIRATIONS

- **Sekiro: Shadows Die Twice** → Parry-driven combat, posture-based pressure, and the principle that failure is tied to player decisions.  
- **Sifu** → Readable enemy patterns, tight combat loops, and mastery through repetition.  
- **Dark Souls series** → Deliberate pacing, stamina-constrained actions, and risk-reward decision-making.  

---

## COMBAT PRINCIPLES

Combat is governed by three core principles:

* **Commitment Over Cancellation**
  Actions cannot be freely canceled; every input carries risk

* **Read Before React**
  Correct response depends on identifying attack type, not reflex alone

* **Resource-Gated Agency**
  Stamina defines how many decisions a player can execute

---

<!-- ## DESIGN GOALS

Goal | Design Outcome
|---|---|
Decision Clarity | Combat rewards correct decisions over reflex execution |
System Readability | Players can clearly interpret threats and outcomes |
Skill Through Consistency | Consistent rules enable learning and mastery |
Resource Pressure | Limited resources create meaningful tension |
Risk–Reward Balance | Players choose between safe and high-reward options |
Control Fidelity | Movement supports deliberate combat and exploration |

--- -->

## SYSTEMIC OUTCOMES

Each design goal is enforced through measurable gameplay constraints:

| Goal                      | System Enforcement                                                       |
| ------------------------- | ------------------------------------------------------------------------ |
| Decision Clarity          | Limited valid responses per attack (maximum two correct options)         |
| System Readability        | Telegraph window is always readable before impact                        |
| Skill Through Consistency | No hidden rules; all mechanics behave deterministically                  |
| Resource Pressure         | Stamina limits prevent more than two full attack chains without recovery |
| Risk–Reward Balance       | Parry windows are tighter than dodge windows but grant higher reward     |
| Control Fidelity          | Input buffering is limited to prevent spam correction                    |

---

## DESIGN PILLARS

### 1. Intentional Combat

All inputs are commitments. Actions lock movement and require evaluation of:

- **Stamina state** → Does the current action budget allow follow-through?  
- **Attack type** → What attack is incoming, and what is the correct response?  
- **Positioning** → Is the current distance and angle optimal?  

---

### 2. Resource-Constrained Action

At its core are two primary resources:

| Resource | Function | Restoration Method |
|---|---|---|
| **Health** | Determines survivability during encounters | Restored using healing beans collected during Between Realm exploration |
| **Stamina** | Governs all actions such as attacks, dodges, blocks, and parries | Passive recovery between actions |

Stamina functions as the primary decision constraint. Every action consumes it, forcing players to evaluate risk and timing.

Health acts as a limited buffer. Recovery is not freely available during combat and depends on healing beans gathered during exploration. Players enter encounters with a fixed, finite supply, linking combat performance to prior decisions made outside the fight.

In addition, **IR (Interactive Response) Abilities** act as temporary modifiers that alter the resource model:

- **Unlimited Stamina**  
- **Temporary Invulnerability**  
- **Increased Damage Output**  

These abilities are selected at shrines between encounters, reinforcing preparation as a pre-combat decision rather than an in-combat reaction.

---

### 3. Readable Threat Design

| Attack Type | Player Response | Penalty for Incorrect Response |
|---|---|---|
| **Blockable** | Parry, block, or dodge | Stamina loss; posture break if stamina is depleted |
| **Unblockable** | Parry or dodge | Heavy damage if blocked |
| **Undodgeable** | Parry or block | Heavy damage if dodged |
| **Stamina-draining** | Parry, avoid, or disengage | Rapid stamina depletion; posture break if stamina is exhausted |

A **perfect parry** against any attack type staggers the enemy and creates a punish window. 

---

### 4. Spatial Decision-Making

Two distinct movement modes support different combat and traversal needs:

- **Lock-on mode** enables controlled strafing, maintains enemy facing, and allows precise dodge direction, attack alignment, and spacing.  
- **Free movement mode** supports exploration between encounters, including navigation, resource collection, puzzle solving, and environmental interaction.  

---

### 5. Causal Failure System

Failure is deterministic and decision-driven:

- **Over-commitment** → Spending stamina without reading the situation creates vulnerability windows.  
- **Misinterpretation** → Responding incorrectly to incoming attacks results in guaranteed damage (if hit).  
- **Resource mismanagement** → Depleting stamina triggers a posture break and exposes the player to high-damage follow-ups.  

All failure states are:

- **Predictable**
- **Learnable**
- **Directly tied to player decisions**

---

### 6. Exploration as Strategic Layer

Between Realm traversal spaces function as controlled downtime where players recover, prepare, and make forward-looking decisions that directly impact upcoming encounters.

1. **Resource replenishment** → Healing beans and stat manuals are acquired through exploration and platforming.  
2. **Tension maintenance** → Resources are limited per traversal segment, so players enter encounters with a known, finite supply.  

This structure links exploration decisions directly to combat outcomes and extends the resource system beyond individual encounters.

Shrines act as preparation nodes, providing upgrades, ability selection, and recovery between encounters.

---

## CORE GAMEPLAY FLOW

Katavader operates across two interconnected loops:

- **Combat Loop** → Moment-to-moment decision-making within encounters  
- **Exploration Loop** → Preparation, resource acquisition, and recovery between encounters  

---

## DECISION ECONOMY

At any moment, the player operates under constrained decision bandwidth:

* Maximum of **2–3 viable actions** per scenario
* Each action consumes **time (frames) and stamina**
* Incorrect decisions result in **immediate or delayed punishment**

Combat difficulty is driven by:

* **Increasing decision frequency**
* **Reducing reaction windows**
* **Increasing punishment severity**

---

## PLAYER DECISION SPACE

Within these constraints, the player selects from:

* **Defensive actions** → Block, dodge, or disengage to avoid damage
* **Offensive actions** → Commit to attacks during valid punish windows
* **Positional adjustments** → Reposition to control distance, angle, and pressure

The available decision space is context-dependent.

---

## COMBAT LOOP

Combat resolves through a consistent decision loop that governs all encounters:

```text
  Engage Enemy ◄──────────────────────┐
       │                              │
       ▼                              │
  Read Attack Type                    │
       │                              │
       ▼                              │
  Choose Response                     │
  (Parry / Block / Dodge)             │
       │                              │
       ▼                              │
  Manage Stamina                      │
       │                              │
       ▼                              │
  Counterattack                       │
       │                              │
       ▼                              │
  Recover ────────────────────────────┘
```

**READ → DECIDE → EXECUTE → RECOVER**

---

### TIMING MODEL

Combat pacing is governed by:

* **Telegraph Duration** → Reaction window
* **Active Frames** → Threat window
* **Recovery Frames** → Punish window

### TIMING RULES

* **Telegraphs are always readable before commitment**
* **Recovery always creates punish opportunities**
* **No action is risk-free**

### TIMING IMPACT
Timing directly controls:

* **Decision Speed**
* **Punish Windows**
* **Encounter Pacing**

---

## POSTURE SYSTEM

Enemies have a posture meter separate from health that represents their defensive stability under pressure.

Posture builds from **0 → Max** through successful defensive interactions (perfect player parries).

When posture reaches **Max**, the enemy enters a **Vulnerable State**, allowing a high-damage execution window.

### POSTURE RULES

* Posture increases only through:
  * **Perfect player parries**

* At **Max Posture**:
  * Enemy enters **Vulnerable State**
  * Player gains a **guaranteed punish window**

* After Vulnerable State ends:
  * Posture resets to **near-max (not zero)**
  * Enemy can be broken again with minimal additional parries

### DESIGN INTENT

The system introduces an alternative win condition:

* **Health path** → Safe, consistent, slower
* **Posture path** → Risky, pressure-based, faster

This enables:

* **Player expression** through playstyle choice
* **Skill scaling**, where higher skill favors posture chaining

Players can choose between sustained damage or pressure-focused play depending on risk tolerance and execution ability.

```text
Parry → Posture Damage Applied
      → Posture Depleted?
            YES → Vulnerable State → Execution Strike
            NO  → Continue Combat Loop
```
---

## PLAYER SKILL EXPRESSION

Skill is expressed through:

* **Recognition Speed** → Identifying attack types quickly
* **Execution Precision** → Timing parries and dodges accurately
* **Resource Management** → Optimizing stamina usage
* **Pressure Handling** → Maintaining performance under threat

Higher skill results in:

* **Shorter encounters**
* **Fewer mistakes**
* **Greater reliance on posture-based strategies**

---

## ENCOUNTER STRUCTURE

Encounter progression is driven by **player skill expression** and **performance**.

Each encounter transitions through three phases:

### ENGAGEMENT PHASE

Player observes and reads enemy behavior.

### ADAPTATION PHASE

Player adjusts responses, timing, and positioning.

### MASTERY PHASE

Player exploits openings and optimizes damage output.

---