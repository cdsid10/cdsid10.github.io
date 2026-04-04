/**
 * PROJECT DATA ARCHITECTURE
 * [GLOBAL]
 * This file acts as the central database for the portfolio. It defines the project 
 * schema and contains all written content, technical metadata, and visual assets.
 */

// ─── INTERFACES ──────────────────────────────────────────────────────────────

/**
 * Collection Item Interface
 * [GLOBAL]
 * Data structure for sub-projects within a featured collection card.
 */
export interface CollectionItem {
  id: string;
  title: string;
  thumbnail_16_9: string;
  thumbnail_mobile?: string;
  accentColor: string;
  link: string;
  roles: string[];
  year: string;
  storefronts?: {
    type: 'steam' | 'itch' | 'playstore' | 'website';
    url: string;
    label?: string;
  }[];
}

/**
 * Project Interface
 * [GLOBAL]
 * Standardized structure for all project entries.
 */
export interface Project {
  id: string;
  title: string;
  category: 'featured-works' | 'other-works';
  isExternalOnly?: boolean; // If true, clicking the card goes directly to 'link' instead of a deep-dive page.

  // Visuals
  /** [GLOBAL] Main display image (16:9 ratio) */
  thumbnail_16_9: string;
  /** [MOBILE] Optional mobile-specific display image */
  thumbnail_mobile?: string;
  /** [DESKTOP] Primary color used for hover states and UI highlights */
  accentColor: string;
  /** [GLOBAL] Array of strings for the ImageGallery component */
  gallery?: string[];

  // Metadata
  year: string;
  roles: string[];
  tech: string[];
  /** [GLOBAL] Specific game-design systems (mapped to techDefinitions) */
  systems?: string[];

  // Content
  summary: string;
  keyFeatures: string[];
  /** [GLOBAL] Full Markdown content for the Deep Dive page */
  deep_dive_content: string;

  // External
  link?: string;
  source?: string | { url: string; label: string };
  /** [GLOBAL] Links to external stores (Steam, Itch, etc.) */
  storefronts?: {
    type: 'steam' | 'itch' | 'playstore' | 'website';
    url: string;
    label?: string
  }[];

  // Collection
  /** [GLOBAL] Marks this project as a container for multiple smaller works */
  isCollection?: boolean;
  /** [MOBILE] Determines if collection shows as 2x2 grid or snap carousel on small screens */
  mobileLayout?: 'grid' | 'carousel';
  /** [GLOBAL] Array of sub-projects if this is a collection */
  collectionItems?: CollectionItem[];

  /** [GLOBAL] Specific internal page to navigate to if isExternalOnly is false */
  customInternalLink?: string;
}

// ─── TECHNICAL DEFINITIONS ───────────────────────────────────────────────────

/**
 * Technical Definitions Lookup
 * [GLOBAL]
 * Provides detailed explanations for technical jargon. These strings are 
 * usually displayed in tooltips or "Systems" sections on project pages.
 */
export const techDefinitions: Record<string, string> = {
  'State Machines': 'Built modular combat state systems handling attack chains, blocking, and timing-based transitions.',
  'Behaviour Trees': 'Designed AI decision systems for enemy behavior, prioritization, and adaptive combat responses.',
  'Save System': 'Designed save/load system managing player state, progression, and world persistence.',
  'Physics-Based Assembly': 'Engineered a modular assembly system where detached limbs snap to sockets using custom physics joints, dynamically recalculating the character\'s center of gravity and movement speed.',
  'Dynamic Camera': 'Implemented a POV system that physically binds the camera to the player\'s \'head\' socket. As the player reassembles their body, their perspective and verticality shift organically.',
  'Combat State Machines': 'Built a modular combat system using state machines to handle attack buffering, hit transitions, and recovery frames.',
  'Perfect Parry System': 'Engineered a frame-accurate parry window that rewards players with a critical stagger state on enemies.',
  'Animation-Driven Logic': 'Integrated combat logic directly into animation curves to ensure hitbox synchronization and physical momentum.'
};

// ─── PROJECT DATABASE ────────────────────────────────────────────────────────

/**
 * Projects Array
 * [GLOBAL]
 * All project data used across the website. 
 * Categorized comments indicate how specific fields influence the UI.
 */
export const projects: Project[] = [
  {
    // --- KATAVADER ---
    id: 'katavader',
    title: 'Katavader',
    category: 'featured-works',
    thumbnail_16_9: '/images/Katavader/Level_5_SS_NEW.webp',
    thumbnail_mobile: '/images/Katavader/Mobile/Level_5_SS_NEW_Mobile.webp',
    accentColor: '#7A1F2B', // [DESKTOP] Triggered on ProjectCard hover
    year: '2026',
    roles: ['Game Designer', 'Technical Designer'],
    tech: ['Unity', 'C#'],
    systems: ['State Machines', 'Behaviour Trees', 'Save System'],
    summary: 'A combat-focused action RPG where every encounter demands a decision. Players read enemy behavior, react with precision, and choose the correct response, turning combat into a constant negotiation between timing, risk, and control.',
    keyFeatures: [
    ],
    storefronts: [
      { type: 'steam', url: 'https://store.steampowered.com/app/3999010/Katavader/', label: 'View on Steam' },
    ],
    source: '#',
    gallery: [
      '/images/Katavader/Level_5_SS_NEW.webp',
      '/images/Katavader/Level_16_SS.webp',
      '/images/Katavader/Level_18_SS.webp',
      '/images/Katavader/Potion_Temple_SS_2.webp',
      '/images/Katavader/Training_Dummy_SS.webp',
      '/images/Katavader/Level_11_SS_2.webp',
      '/images/Katavader/Shrine_Level_Up_SS.webp'
    ],
    /** [GLOBAL] Full Markdown Content */
    deep_dive_content: `
# From Reaction to Decision: Designing Combat in Katavader
## Designing a combat system centered on decision-making, player intent, and meaningful encounters

**Katavader** started from a simple question: </br>
**What if a Souls-like combat system required *thinking* as much as reacting?**

While inspired by the genre, I wanted to move beyond passive evasion and toward **intentional decision-making**. The goal was to design what I began calling a ***combat puzzle*** - a system where every encounter demands the right choice, not just fast reflexes.

## The Design Philosophy: Beyond the Dodge Roll
At its core, Katavader is not just about reflex, it is about **reading situations and choosing the correct response**.

When an enemy winds up an attack, the player is forced into a real-time decision:

* Do I commit to a precise parry?  
* Do I dodge and give up space for safety?  
* Do I block and trade stamina for position?  
* Or do I disengage and reset?

These decisions are shaped by context - stamina, enemy attack type, positioning, and available resources such as abilities and player knowledge. 

Rather than “dodge everything,” the player is constantly evaluating the *correct response*.

By tying all of this to a strict stamina system, combat becomes less about execution alone and more about **judgment**. Every mistake has a cost, and every correct decision creates an opportunity.

## Enemy Design: Enforcing the System

Each encounter enforces a clear set of rules on the player:

- **Standard attacks** allow multiple responses - parry, dodge, or block  
- **Unblockable attacks** must be dodged  
- **Undodgeable attacks** must be blocked  
- **Heavy attacks** punish passive defense through stamina drain  

While every attack can be parried, some carry significantly higher risk, demanding tighter timing and punishing failure more severely.

<!-- VIDEO BLOCK — copy per video, change src + caption -->
<figure>
  <div class="vid-wrap" style="position:relative; width:100%; cursor:pointer;">
    <video
      autoplay loop muted playsinline webkit-playsinline
      preload="metadata"
      style="display:block; width:100%;"
    >
      <source src="/videos/Katavader/3_in_1_Enemy_Attacks.mp4" type="video/mp4" />
    </video>
    <div class="vid-overlay" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.2s; pointer-events:none; background:rgba(0,0,0,0.3);">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="5" width="4" height="14" rx="1"/>
        <rect x="14" y="5" width="4" height="14" rx="1"/>
      </svg>
    </div>
  </div>
  <figcaption class="caption">
    Distinct enemy attack types that reinforce the combat philosophy
  </figcaption>
</figure>
</br>

This prevents any single dominant strategy.  
Players cannot rely on habit, they must **adapt to each encounter**.

<!-- VIDEO BLOCK — copy per video, change src + caption -->
<figure>
  <div class="vid-wrap" style="position:relative; width:100%; cursor:pointer;">
    <video
      autoplay loop muted playsinline webkit-playsinline
      preload="metadata"
      style="display:block; width:100%;"
    >
      <source src="/videos/Katavader/Enemy_Combat_Mechanics.mp4" type="video/mp4" />
    </video>
    <div class="vid-overlay" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.2s; pointer-events:none; background:rgba(0,0,0,0.3);">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="5" width="4" height="14" rx="1"/>
        <rect x="14" y="5" width="4" height="14" rx="1"/>
      </svg>
    </div>
  </div>
  <figcaption class="caption">
    Enemy variations introducing offensive and defensive mechanics
  </figcaption>
</figure>
</br>

Even though enemies share core mechanics, each fight feels different because the *problem, and its solution changes*.

## Key System: Progressive Combat Complexity

One of the core goals was to scale difficulty through **understanding**, not added mechanics.

In the early game, enemies are simple and predictable.  
Single attack patterns and clear telegraphs establish how combat should be read.

In the mid game, variation is introduced.  
Enemies begin mixing timings, incorporating defensive and offensive mechanics, and forcing more deliberate responses.

By the late game, enemies combine multiple attack types and timings dynamically.</br>
This progression shifts complexity from mechanics to decision-making.

What this demands from the player:

- To identify attacks instantly  
- To recall the correct response  
- To adapt to changing combat patterns in real time  

<!-- VIDEO BLOCK — copy per video, change src + caption -->
<figure>
  <div class="vid-wrap" style="position:relative; width:100%; cursor:pointer;">
    <video
      autoplay loop muted playsinline webkit-playsinline
      preload="metadata"
      style="display:block; width:100%;"
    >
      <source src="/videos/Katavader/Player_Decision_Making.mp4" type="video/mp4" />
    </video>
    <div class="vid-overlay" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.2s; pointer-events:none; background:rgba(0,0,0,0.3);">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="5" width="4" height="14" rx="1"/>
        <rect x="14" y="5" width="4" height="14" rx="1"/>
      </svg>
    </div>
  </div>
  <figcaption class="caption">
    Combat scenarios requiring rapid decision-making and adaptation
  </figcaption>
</figure>
</br>

The mechanics themselves do not become more complex, the situations do.

This creates a strong sense of **earned mastery**.

## Evolution of the Game: A Lesson in Scope

Katavader did not start as the game it is now. </br>
It went through multiple major iterations, each one refining the project and exposing gaps in my production process.

<figure>
  <div class="img-wrap" style="position:relative; width:100%;">
    <img
      src="/images/Katavader/Blog/Unity_Earliest_Concept.webp"
      alt="Enemy combat mechanics"
      style="display:block; width:100%;"
    />
  </div>
  <figcaption class="caption">
    Earliest In Engine Concept Art Scene
  </figcaption>
</figure>
</br>

**Iteration 1 - Arena Fighter**  
A contained prototype focused purely on combat encounters.

<imagegrid 
  images='[
    "/images/Katavader/Blog/Early1.webp",
    "/images/Katavader/Blog/Early2.webp",
    "/images/Katavader/Blog/Early3.webp",
    "/images/Katavader/Blog/Early4.webp"
  ]'
  cols="2"
  caption="Initial arena prototype designed to isolate and test core combat systems"
/>

**Iteration 2 - Open-Area Soulslike**  
The game expanded from isolated encounters into a connected world structure. Multiple traversal paths and exploration were introduced, with levels designed around branching routes that reconnect into a central path.

<imagegrid 
  images='[
    "/images/Katavader/Blog/Mid1.webp",
    "/images/Katavader/Blog/Mid2.webp",
    "/images/Katavader/Blog/Mid3.webp",
    "/images/Katavader/Blog/Mid4.webp",
    "/images/Katavader/Blog/Mid5.webp",
    "/images/Katavader/Blog/Mid6.webp",
    "/images/Katavader/Blog/Mid7.webp",
    "/images/Katavader/Blog/Mid8.webp",
    "/images/Katavader/Blog/Mid9.webp",
    "/images/Katavader/Blog/Mid10.webp"
  ]'
  cols="2"
  caption="Open area level design focused on branching paths that reconnect into a central route"
/>
</br>

<!-- VIDEO BLOCK — copy per video, change src + caption -->
<figure>
  <div class="vid-wrap" style="position:relative; width:100%; cursor:pointer;">
    <video
      autoplay loop muted playsinline webkit-playsinline
      preload="metadata"
      style="display:block; width:100%;"
    >
      <source src="/videos/Katavader/Enemy_vs_Enemy.mp4" type="video/mp4" />
    </video>
    <div class="vid-overlay" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.2s; pointer-events:none; background:rgba(0,0,0,0.3);">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="5" width="4" height="14" rx="1"/>
        <rect x="14" y="5" width="4" height="14" rx="1"/>
      </svg>
    </div>
  </div>
  <figcaption class="caption">
    Enemies engage based on a faction system, prioritizing the closest target and the last attacker
  </figcaption>
</figure>
</br>

**Final Version - Boss Rush with Exploration Elements**  
Scope was deliberately reduced, allowing the project to refocus on its strongest element: combat. The game evolved into a boss-driven experience, with light exploration supporting progression between encounters.

<imagegrid 
  images='[
    "/images/Katavader/Blog/Late1.webp",
    "/images/Katavader/Blog/Late2.webp",
    "/images/Katavader/Blog/Late3.webp",
    "/images/Katavader/Blog/Late4.webp",
    "/images/Katavader/Blog/Late5.webp",
    "/images/Katavader/Blog/Late6.webp"
  ]'
  cols="2"
  caption="Top-down layouts of the final levels, illustrating structure and exploration flow between encounters"
/>
</br>

This process exposed a major weakness in my workflow:

**I was designing while building, instead of designing before building.**

These ideas were exciting, but they diluted focus and slowed meaningful progress.

## Technical Challenges

### Enemy AI: Simplicity is Deceptively Complex
Enemy AI sounds simple on paper - follow the player, attack, repeat. 

In practice, making enemies feel **intentional** was one of the hardest parts of the project.

With no prior experience in AI systems, everything had to be learned from scratch: </br>
* **Structuring state transitions**  </br>
* **Designing readable attack patterns**  </br>
* **Controlling aggression and timing**  </br>
* **Making enemies feel distinct despite shared systems**  </br>

The goal wasn’t complexity, it was clarity.  </br>
Enemies needed to feel fair, readable, and deliberate.

The final AI system was built using a node-based approach to keep behavior structured, readable, and easy to iterate on.</br>
This structure allowed behaviors to remain predictable, while still supporting variation and complexity.

<imagegrid 
  images='[
    "/images/Katavader/Blog/AI1.webp",
    "/images/Katavader/Blog/AI2.webp"
  ]'
  cols="2"
  caption="Node-based behavior system structuring enemy AI logic and state transitions"
/>

<!-- VIDEO BLOCK — copy per video, change src + caption -->
<figure>
  <div class="vid-wrap" style="position:relative; width:100%; cursor:pointer;">
    <video
      autoplay loop muted playsinline webkit-playsinline
      preload="metadata"
      style="display:block; width:100%;"
    >
      <source src="/videos/Katavader/Enemy_Early_AI.mp4" type="video/mp4" />
    </video>
    <div class="vid-overlay" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.2s; pointer-events:none; background:rgba(0,0,0,0.3);">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="5" width="4" height="14" rx="1"/>
        <rect x="14" y="5" width="4" height="14" rx="1"/>
      </svg>
    </div>
  </div>
  <figcaption class="caption">
    Early enemy AI behavior demonstrating initial combat interaction with the player
  </figcaption>
</figure>

### Save System: From PlayerPrefs to JSON

Another major step was moving from PlayerPrefs to a **JSON-based save system**.

This introduced a new set of challenges:
* **Structuring persistent data**  
* **Handling serialization and deserialization**  
* **Managing edge cases**  
* **Ensuring reliability across sessions**  

It was my first experience building a more scalable data system, and it fundamentally changed how I approached persistence going forward.

## Mistakes: The Cost of "Winging It"
The biggest mistakes on Katavader weren’t technical - they were **organizational**.
### 1. Poor Scope Control

Features were added because they felt interesting, not because they served the core experience.

This led to:
* Broken or incomplete systems  
* Repeated rework  
* Months of lost time  

### 2. Designing Systems Too Late
Many systems were built reactively instead of intentionally:
* Combat flow and interaction logic  
* Player movement and control systems  
* Enemy state handling and transitions 
* AI behavior and decision-making systems  
* Damage calculation and hit detection
* UI and feedback systems  
* Save and persistence systems

Planning these earlier would have resulted in cleaner, more scalable systems.

### 3. Lack of Modularity
Too many features were built as one-off implementations.

This slowed iteration and forced repeated work instead of building on existing systems.

### 4. Prioritizing Intensity Over Consistency
Development cycles fluctuated between overwork and inactivity.

Taking breaks wasn’t the issue. **Losing context** was.

Even short gaps meant:
* Re-learning the current state  
* Rebuilding mental context  
* Slowing down momentum  

Consistency proved far more valuable than bursts of effort.

## What I Learned

### 1. Plan Before You Build
Even rough planning — diagrams, notes, or simple documentation — can prevent days of rework.

### 2. Scope is a Design Tool
Cutting features is not failure — it is **focus**. </br>
Knowing what the game is ***not*** is just as important as defining what it is.

### 3. Build Modular Systems
Reusable systems allow faster iteration and cleaner design. </br>
Every system should be built with the expectation that it might be reused or expanded.

### 4. Iterate Constantly
Frequent testing leads to better decisions earlier, and ultimately, a stronger game.

### 5. Stay in Context Daily
Even minimal interaction helps maintain clarity. </br>
Losing context, even briefly, has a compounding cost.

## What I Would Do Differently

* Design and document all **core systems** before implementation  
* Build **modular, reusable systems** from the start  
* Define a **clear scope and production plan** early in development  
* Develop **combat systems and progression together**, not in isolation  
* Focus more on **enemy behavior variety** and **depth**
* Create **dedicated testing scenarios and debugging tools** to validate systems early  
* Iterate more frequently on **player feedback and combat readability**  
* Expand exploration and puzzle design beyond simple “A to B” interactions

## Why This Project Matters

Katavader represents:

- My first full **Souls-like combat system design implementation**  
- Hands-on experience with **Steam deployment and APIs**  
- A practical understanding of **scope, iteration, and system design** 

## Looking Forward
Katavader isn’t perfect.

There are systems I would push further, ideas I would refine, and depth I would expand.

But the core goal was achieved.</br>
A combat system built around **decision-making, not repetition**.

It works.  
It shipped.  
People can play it.

And that matters.

More importantly, it defines the direction for everything I build next.

**If this is my magnum opus, then it isn’t an ending.  
It’s where everything I’ve learned begins to compound.**
</br>

<figure>
  <div class="img-wrap" style="position:relative; width:100%;">
    <img
      src="/images/Katavader/Blog/LF.webp"
      alt="Enemy combat mechanics"
      style="display:block; width:100%;"
    />
  </div>
  <figcaption class="caption">
  </figcaption>
</figure>
`
  },
  {
    // --- SELF APART ---
    id: 'selfapart',
    title: 'Self Apart',
    category: 'featured-works',
    isExternalOnly: false,
    thumbnail_16_9: '/images/SelfApart/0.jpg',
    thumbnail_mobile: '/images/SelfApart/0.jpg',
    accentColor: '#4C7F33',
    year: '2022',
    roles: ['Game Designer', 'Additional Developer'],
    tech: ['Unity', 'C#'],
    systems: [],
    summary: 'A chaotic physics-puzzler where you play as Mr. Limbs, a fragmented monster trying to rebuild his body piece by piece. Each limb reshapes how you move, turning progression into a constant negotiation with physics and control.',
    keyFeatures: [
    ],
    link: 'https://el-studios.itch.io/self-apart',
    storefronts: [
      { type: 'itch', url: 'https://el-studios.itch.io/self-apart', label: 'View on Itch.io' },
    ],
    source:
    {
      url: "https://thegdwc.com/pages/game.php?game_guid=6bfe1aaf-7571-4fa6-bdfc-b15a0412880b",
      label: "View on GDWC"
    },
    gallery: [
      '/images/SelfApart/1.jpg',
      '/images/SelfApart/2.jpg',
      '/images/SelfApart/3.jpg',
      '/images/SelfApart/4.jpg',
      '/images/SelfApart/5.jpg'
    ],
    /** [GLOBAL] Narrative-focused deep dive */
    deep_dive_content: `
# Reassembling Mr. Limbs: The Physics of Disjunction

*Self Apart: The Unfathomable Misadventures of Mr. Limbs the Frankenjoined Monster* was born from a simple, chaotic question during the GMTK Game Jam 2021: **"What if you were the literal sum of your parts?"**

Under the theme **"Joined Together"**, the team spent 48 hours crafting a puzzle-platformer where the character's physical state is entirely fluid.

## The Core Loop: Finding Your Feet (Literally)
The player begin as a severed head, positioned at the edge of a table with a deliberately limited field of view. Progression is driven by locating scattered limbs, gaining control over movable parts, and reassembling their body piece by piece.

Each limb functions as more than a visual upgrade, it acts as a physics-driven component that directly alters player behavior. Adding an arm shifts the center of mass, while legs significantly expand movement possibilities. The core challenge emerges from managing increasingly unstable momentum as the player reconstructs their body.

## Technical Innovation: The Eye-Level Perspective
The camera system is directly tied to the player’s physical state, remaining anchored to Mr. Limbs’ head. As new body parts are attached, the player’s perspective naturally expands, transitioning from a constrained, ground-level view to a more elevated and complete field of vision. This creates an organic sense of progression driven entirely by the player’s reconstruction.

## Recognition & Achievements
*Self Apart* resonated with the jam community, achieving remarkable success:
- **GMTK Game Jam 2021**: Ranked **#217** out of over **5,800 entries**, with strong community reception and positive player feedback.
- **GDWC 2021 Finalist**: Nominated for the **"Best Game Jam Game"** at the Game Development World Championship.

## My Role: Game Design & Additional Programming
Designed and refined the limb-based interaction system, focusing on responsive interactions and organic puzzle integrations. Also, designed a minimal UI that stayed out of the way, while still guiding players through their available choices.
    `
  },
  // {
  //   id: 'dive',
  //   title: 'Diving Deeper',
  //   category: 'featured-works',
  //   isExternalOnly: true,
  //   thumbnail_16_9: '/images/Diving_Deeper/1.jpg',
  //   thumbnail_mobile: '/images/Diving_Deeper/1.jpg',
  //   accentColor: '#3B2202',
  //   year: '2024',
  //   roles: ['Game Designer', 'Developer'],
  //   tech: ['Unity', 'C#'],
  //   summary: '',
  //   keyFeatures: [
  //   ],
  //   link: 'https://g-ratta.itch.io/divingdeep',
  //   storefronts: [
  //     { type: 'itch', url: 'https://g-ratta.itch.io/divingdeep', label: 'View on Itch.io' }
  //   ],
  //   gallery: [
  //     ''
  //   ],
  //   /** [GLOBAL] Narrative-focused content */
  //   deep_dive_content: ''
  // },
  {
    id: 'mobile_releases',
    title: 'Mobile Releases',
    category: 'featured-works',
    isExternalOnly: false,
    customInternalLink: '/mobile-works',
    thumbnail_16_9: '/images/Football_Academy/1.jpg',
    thumbnail_mobile: '/images/Football_Academy/1.jpg',
    accentColor: '#599ad8', //'#59A5D8'
    year: '2023-2024',
    roles: ['Junior Developer - Rawky Games'],
    tech: ['Unity', 'C#'],
    summary: 'A collection of smaller mobile games, and experimental works published by others.',
    keyFeatures: [],
    deep_dive_content: ''
  }
];

/**
 * Mobile Projects Array
 * [GLOBAL]
 * Secondary works displayed in a grid on the "/mobile-works" page.
 */
export const mobileProjects: Project[] = [
  {
    id: 'football_academy',
    title: 'Football Academy',
    category: 'other-works',
    isExternalOnly: true,
    thumbnail_16_9: '/images/Football_Academy/1.jpg',
    thumbnail_mobile: '/images/Football_Academy/1.jpg',
    accentColor: '#599ad8',
    year: '2023',
    roles: ['Junior Developer - Rawky Games'],
    tech: ['Unity', 'C#'],
    summary: '',
    keyFeatures: [],
    link: 'https://appmagic.rocks/google-play/soccer-academy/com.RawkyStudios.SoccerAcademy',
    deep_dive_content: '',
  },
  {
    id: 'musicalDIY',
    title: 'Musical Instruments DIY',
    category: 'other-works',
    isExternalOnly: true,
    thumbnail_16_9: '/images/Musical_DIY/1.jpg',
    thumbnail_mobile: '/images/Musical_DIY/1.jpg',
    accentColor: '#4C8F88',
    year: '2023',
    roles: ['Junior Developer - Rawky Games'],
    tech: ['Unity', 'C#'],
    summary: '',
    keyFeatures: [],
    link: 'https://appmagic.rocks/iphone/musical-instruments-diy/6443856611',
    deep_dive_content: '',
  },
  {
    id: 'laser',
    title: 'Largest Laser Gun',
    category: 'other-works',
    isExternalOnly: true,
    thumbnail_16_9: '/images/Largest_Laser/1.jpg',
    thumbnail_mobile: '/images/Largest_Laser/1.jpg',
    accentColor: '#5A3D5C',
    year: '2023',
    roles: ['Junior Developer - Rawky Games'],
    tech: ['Unity', 'C#'],
    summary: '',
    keyFeatures: [],
    link: 'https://appmagic.rocks/google-play/largest-laser-gun/com.rawkystudios.lasergun',
    deep_dive_content: '',
  },
  {
    id: 'spiral_clicker',
    title: 'Spiral Clicker 3D',
    category: 'other-works',
    isExternalOnly: true,
    thumbnail_16_9: '/images/Spiral_Clicker/1.jpg',
    thumbnail_mobile: '/images/Spiral_Clicker/1.jpg',
    accentColor: '#7A84D9',
    year: '2023',
    roles: ['Junior Developer - Rawky Games'],
    tech: ['Unity', 'C#'],
    summary: '',
    keyFeatures: [],
    link: 'https://appmagic.rocks/google-play/spiral-clicker/com.rawkystudios.spiralclicker',
    deep_dive_content: '',
  }
];

/**
 * Other Projects Array
 * [GLOBAL]
 * Secondary works displayed in a grid on the "/other-works" page.
 * These typically feature more direct external links.
 */
export const otherProjects: Project[] = [
  {
    id: 'dive',
    title: 'Diving Deeper',
    category: 'other-works',
    isExternalOnly: true,
    thumbnail_16_9: '/images/Archive/Diving_Deeper/1.jpg',
    accentColor: '',
    year: '2024',
    roles: ['Game Designer', 'Developer'],
    tech: ['Unity', 'C#'],
    summary: '',
    keyFeatures: [],
    link: 'https://g-ratta.itch.io/divingdeep',
    source: 'https://github.com/cdsid10/ProjectDive/tree/main/Assets/PersonalSpace/Sid',
    deep_dive_content: '',
  },
  {
    id: 'bhief',
    title: 'Bhief',
    category: 'other-works',
    isExternalOnly: true,
    thumbnail_16_9: '/images/Archive/Bhief/1.jpg',
    accentColor: '',
    year: '2022',
    roles: ['Game Designer'],
    tech: ['Unity', 'C#'],
    summary: '',
    keyFeatures: [],
    link: 'https://cdsid10.itch.io/bhief',
    source: 'https://github.com/cdsid10/chaos-brackeysgamejam2021.2',
    deep_dive_content: '',
  },
  {
    id: 'nwo',
    title: 'NWO Chamber',
    category: 'other-works',
    isExternalOnly: true,
    thumbnail_16_9: '/images/Archive/NWO/1.jpg',
    accentColor: '',
    year: '2022',
    roles: ['Game Designer'],
    tech: ['Unity', 'C#'],
    summary: '',
    keyFeatures: [],
    link: 'https://el-studios.itch.io/nwo-chamber',
    source: 'https://github.com/cdsid10/no_way_out-lmobgamejam22',
    deep_dive_content: '',
  },
  {
    id: 'for_the_ring',
    title: 'For The Ring!',
    category: 'other-works',
    isExternalOnly: true,
    thumbnail_16_9: '/images/Archive/For_The_Ring/1.jpg',
    accentColor: '',
    year: '2022',
    roles: ['Game Designer'],
    tech: ['Unity', 'C#'],
    summary: '',
    keyFeatures: [],
    link: 'https://cdsid10.itch.io/for-the-ring',
    source: 'https://github.com/cdsid10/bats-lmobgamjam18',
    deep_dive_content: '',
  },
  {
    id: 'dimensio',
    title: 'Dimensio',
    category: 'other-works',
    isExternalOnly: true,
    thumbnail_16_9: '/images/Archive/Dimensio/1.jpg',
    accentColor: '',
    year: '2022',
    roles: ['Game Designer'],
    tech: ['Unity', 'C#'],
    summary: '',
    keyFeatures: [],
    link: 'https://cdsid10.itch.io/dimensio',
    source: 'https://github.com/cdsid10/dimensions-lmobgamejam20',
    deep_dive_content: '',
  },
  {
    id: 'cryofected',
    title: 'Cryofected',
    category: 'other-works',
    isExternalOnly: true,
    thumbnail_16_9: '/images/Archive/Cryo/1.PNG',
    accentColor: '',
    year: '2021',
    roles: ['Game Designer'],
    tech: ['Unity', 'C#'],
    summary: '',
    keyFeatures: [],
    link: 'https://cdsid10.itch.io/cryofected',
    source: 'https://github.com/cdsid10/reset-byog2021',
    deep_dive_content: '',
  },
  {
    id: 'saber',
    title: 'Saber Chronicles',
    category: 'other-works',
    isExternalOnly: true,
    thumbnail_16_9: '/images/Archive/Saber/1.png',
    accentColor: '',
    year: '2021',
    roles: ['Game Designer'],
    tech: ['Unity', 'C#'],
    summary: '',
    keyFeatures: [],
    link: 'https://cdsid10.itch.io/saber-chronicles',
    source: 'https://github.com/cdsid10/no_ammo-lmobgamejam16',
    deep_dive_content: '',
  },
  {
    id: 'kibi',
    title: 'Kibi : The Lost Harmony',
    category: 'other-works',
    isExternalOnly: true,
    thumbnail_16_9: '/images/Archive/Kibi/1.png',
    accentColor: '',
    year: '2021',
    roles: ['Game Designer'],
    tech: ['Unity', 'C#'],
    summary: '',
    keyFeatures: [],
    link: 'https://cdsid10.itch.io/kibi',
    source: 'https://github.com/cdsid10/kibi-brackeysgamejam2021.1',
    deep_dive_content: '',
  },
  {
    id: 'nothing',
    title: 'Nothing',
    category: 'other-works',
    isExternalOnly: true,
    thumbnail_16_9: '/images/Archive/Nothing/1.png',
    accentColor: '',
    year: '2020',
    roles: ['Game Designer'],
    tech: ['Unity', 'C#'],
    summary: '',
    keyFeatures: [],
    link: 'https://cdsid10.itch.io/nothing',
    source: 'https://github.com/cdsid10/nothing-lmobgamejam14',
    deep_dive_content: '',
  },
  {
    id: 'direlude',
    title: 'DireLude',
    category: 'other-works',
    isExternalOnly: true,
    thumbnail_16_9: '/images/Archive/Direlude/1.png',
    accentColor: '',
    year: '2020',
    roles: ['Game Designer - LBU Final Year Project'],
    tech: ['Unity', 'C#'],
    summary: '',
    keyFeatures: [],
    link: 'https://cdsid10.itch.io/direlude',
    source: 'https://github.com/cdsid10/Uni-Final-Project-Direlude',
    deep_dive_content: '',
  }
];