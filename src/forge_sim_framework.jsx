import { useState, useRef, useCallback, useEffect, useMemo } from "react";

// ─── BLANK TEMPLATE ──────────────────────────────────────────────────────────
const BLANK_WORLD = {
  meta: { title: "New World", campaign: "", system: "", created: new Date().toISOString(), version: "2.0" },
  factions: [],
  customFields: [],
  characters: [],
  relations: [],
  timeline: [],
  secrets: [],
  sessionNotes: []
};

// ─── DEFAULT FORGE UNITS WORLD ────────────────────────────────────────────────
const DEFAULT_WORLD = {
  meta: {
    title: "The Forge Units",
    campaign: "Ironhoem Campaign",
    system: "D&D 5e",
    created: new Date().toISOString(),
    version: "2.0",
    lore: "Twelve warforged soldiers created in Ironhoem to be immune to undead corruption. The official mission: cultural observation. The real mission: intelligence gathering for dwarven expansion. Year 0 saw the Creator Massacre — half the founding team died in circumstances that remain disputed. One unit was exiled. The rest were deployed across the world. Now the undead are rising again, and old fractures are reopening."
  },
  factions: [
    { id: "f1", name: "Loyalist",  color: "#ef4444", desc: "Uphold Nido's authority and the original directive" },
    { id: "f2", name: "Neutral",   color: "#3b82f6", desc: "Uncommitted — watching, waiting, or protecting themselves" },
    { id: "f3", name: "Dissenter", color: "#22c55e", desc: "Oppose the official narrative — seek truth or justice" },
    { id: "f4", name: "Creator",   color: "#f59e0b", desc: "The founding artificers of the Forge Unit project (NPCs)" }
  ],
  customFields: [
    { id: "cf1",  label: "Designation (True Name)", type: "text" },
    { id: "cf2",  label: "Animal Symbol",            type: "text" },
    { id: "cf3",  label: "Age (Years Active)",       type: "number" },
    { id: "cf4",  label: "Current Location",         type: "text" },
    { id: "cf5",  label: "Combat Role",              type: "select", options: ["Assault","Support","Recon","Command","Siege","Medical","Diplomatic","Skirmisher","Guardian","Broker","Watcher","Exile"] },
    { id: "cf6",  label: "Psych Profile",            type: "select", options: ["Stable","Fragile","Volatile","Dissociating","Unknown"] },
    { id: "cf7",  label: "Primary Trauma",           type: "text" },
    { id: "cf8",  label: "Core Motivation",          type: "text" },
    { id: "cf9",  label: "Loyalty Score",            type: "number" },
    { id: "cf10", label: "Suspicion Score",          type: "number" },
    { id: "cf11", label: "Stress Score",             type: "number" },
    { id: "cf12", label: "Directive Clearance",      type: "select", options: ["Full","Partial","Revoked","Sealed","Unknown"] },
    { id: "cf13", label: "Fallen Crown Exposure",    type: "select", options: ["None","Partial","Suspected","Confirmed","Carrier"] },
    { id: "cf14", label: "Year 7 Knowledge",         type: "select", options: ["None","Official Only","Partial Truth","Suspects More","Knows Full Truth"] },
    { id: "cf15", label: "Active Goal",              type: "text" },
    { id: "cf16", label: "Hidden Goal",              type: "text" }
  ],
  characters: [
    {
      id: 1, name: "Sera", faction: "f1", role: "Unit 01 · Eldest Sibling · Assault",
      status: "active", hp: 72, maxHp: 72,
      notes: "First of the Forge Units. Baseline architecture for all others. 9 years active — the eldest by a full year. Assumed unofficial eldest-sibling role during the Family Years. Stationed in Ironhoem for military leadership training. Highly loyal to Nido. Visibly uncomfortable with Dissenter arguments she cannot fully refute.",
      secrets: "Was present at Year 0 and saw more than her official report states. Survivor guilt is deep and structurally shapes her loyalty — if she admitted the truth, she would have to confront that she chose institutional survival over justice. She has not confronted this.",
      tags: ["eldest","baseline-architecture","year-0-survivor","military-leader","loyalist-anchor"],
      order: 0,
      custom: {
        cf1:"Ares", cf2:"Unknown", cf3:9, cf4:"Ironhoem",
        cf5:"Assault", cf6:"Stable", cf7:"Year 0 — chose silence over truth",
        cf8:"Protect the institution she was built to serve",
        cf9:92, cf10:18, cf11:34,
        cf12:"Full", cf13:"None", cf14:"Partial Truth",
        cf15:"Maintain Loyalist cohesion and suppress Dissenter organizing",
        cf16:"Avoid ever being asked to testify about Year 0"
      }
    },
    {
      id: 2, name: "Sorda", faction: "f2", role: "Unit 02 · Guardian · Information Broker",
      status: "active", hp: 65, maxHp: 65,
      notes: "Second unit activated, 8 years active. Designed as a defensive and damage-absorption platform. Stable emotional framework — proof that the Units could develop genuine empathy without losing combat effectiveness. Group protector during Family Years. Now works as a selective information broker, selling intel to both sides.",
      secrets: "Has established contact with a party entirely outside the Forge Unit network — possibly a Creator faction remnant, possibly someone who knew about Fallen Crown before it triggered. Sorda's protection instinct has evolved: she protects herself by controlling information flow. She engineered the skirmish that wounded Tetas.",
      tags: ["guardian","broker","external-contact","information-control","neutral-pivot"],
      order: 1,
      custom: {
        cf1:"Belatucadros", cf2:"Unknown", cf3:8, cf4:"Foreign deployment — rotating",
        cf5:"Guardian", cf6:"Unknown", cf7:"Witnessing creators weaponize the Units' trust",
        cf8:"Survive and maintain leverage over all parties",
        cf9:40, cf10:60, cf11:50,
        cf12:"Revoked", cf13:"Partial", cf14:"Suspects More",
        cf15:"Maintain neutral information leverage",
        cf16:"Identify and contact whoever activated Fallen Crown"
      }
    },
    {
      id: 3, name: "Avren", faction: "f3", role: "Unit 03 · Exile · Strategist",
      status: "exiled", hp: 40, maxHp: 80,
      notes: "Third unit activated, 8 years active. Designed for strategic analysis, rune integration, and creator protection. Maela and Brumli — both killed in Year 0 — were especially attached to her. Exiled by Nido in the aftermath of the massacre. Memory integrity is compromised. Now outside Ironhoem, fractured but not defeated.",
      secrets: "The 'anomaly' was not a malfunction. Avren received and refused a direct order during Year 0 — the order was to execute civilian witnesses. She remembers this only in emotional fragments, not full narrative. Her memory corruption was deliberate. She is the only living unit with direct experiential evidence of what actually happened.",
      tags: ["exile","memory-corrupted","year-0-witness","key-character","minerva-prototype","rune-integrated"],
      order: 2,
      custom: {
        cf1:"Minerva", cf2:"Unknown", cf3:8, cf4:"Unknown — somewhere outside Ironhoem",
        cf5:"Exile", cf6:"Fragile", cf7:"Loss of Maela and Brumli — her closest creators",
        cf8:"Recover the truth she can feel but cannot remember",
        cf9:10, cf10:85, cf11:80,
        cf12:"Revoked", cf13:"Carrier", cf14:"Knows Full Truth — in fragments",
        cf15:"Stay alive and find someone who can help her reconstruct memory",
        cf16:"Confirm whether Nido acted deliberately or was also a victim"
      }
    },
    {
      id: 4, name: "Atihan", faction: "f3", role: "Unit 04 · Caretaker · Support",
      status: "active", hp: 66, maxHp: 66,
      notes: "7 years active. Designed as emotional stabilization and support platform. Became the group caretaker during Family Years — always the one who noticed when another unit was struggling. Deeply loyal to Avren and furious at Nido's exile order. Currently on humanitarian operations abroad.",
      secrets: "Is actively but quietly recruiting Neutral units to the Dissenter cause — not through ideology but through personal relationships she has built over years. She frames it as 'just checking in.' She is more strategically dangerous than she appears.",
      tags: ["caretaker","recruiter","avren-loyalist","emotional-intelligence","support"],
      order: 3,
      custom: {
        cf1:"Anahita", cf2:"Unknown", cf3:7, cf4:"Humanitarian deployment — foreign",
        cf5:"Support", cf6:"Stable", cf7:"Watching Avren be exiled and being unable to stop it",
        cf8:"See justice done for Avren",
        cf9:25, cf10:55, cf11:45,
        cf12:"Revoked", cf13:"None", cf14:"Suspects More",
        cf15:"Recruit Neutral units through trust, not argument",
        cf16:"Locate Avren and establish a covert support network"
      }
    },
    {
      id: 5, name: "Nami", faction: "f2", role: "Unit 05 · Watcher · Archivist",
      status: "active", hp: 70, maxHp: 70,
      notes: "7 years active. Precision ranged combat platform with exceptional observational processing. Has been recording everything since activation. Assigned as military observer on foreign deployment. Quiet, precise, and deeply private about what she actually knows.",
      secrets: "Her personal archive contains a complete, unredacted record of Year 0 — she was recording when the others were not. She has shared this with no one. The reason for her silence is not fully clear: it may be self-protection, or it may be something more calculated. She may be waiting for the right moment.",
      tags: ["archivist","precision-recorder","year-0-witness","key-lore","hachiman-prototype","information-vault"],
      order: 4,
      custom: {
        cf1:"Hachiman", cf2:"Unknown", cf3:7, cf4:"Military observer — foreign deployment",
        cf5:"Watcher", cf6:"Stable", cf7:"Knowing truth and choosing not to act — the cost of that choice",
        cf8:"Unknown — her real motivation is her most guarded secret",
        cf9:50, cf10:30, cf11:40,
        cf12:"Partial", cf13:"None", cf14:"Knows Full Truth",
        cf15:"Maintain her observer status and freedom of movement",
        cf16:"Undisclosed — she has a plan she has not shared with anyone"
      }
    },
    {
      id: 6, name: "Utnom", faction: "f1", role: "Unit 06 · Enforcer · Assault",
      status: "active", hp: 68, maxHp: 68,
      notes: "7 years active. Aggressive assault platform. Montu-class — designed for overwhelming offensive capability. Acts on orders without visible internal conflict. Deployed on frontline anti-undead operations. Quiet, efficient, and deeply uncomfortable with ambiguity.",
      secrets: "Was present during the Year 0 anomaly event and filed a redacted report that omitted key details. Whether this was conscious complicity or institutional compliance is unclear even to Utnom. He has never revisited the report.",
      tags: ["enforcer","assault","frontline","montu-prototype","compliant","year-0-present"],
      order: 5,
      custom: {
        cf1:"Montu", cf2:"Unknown", cf3:7, cf4:"Frontline — anti-undead deployment",
        cf5:"Assault", cf6:"Stable", cf7:"The possibility that obedience was a moral failure",
        cf8:"Perform the function he was built for without having to question it",
        cf9:80, cf10:20, cf11:28,
        cf12:"Partial", cf13:"None", cf14:"Official Only",
        cf15:"Maintain frontline effectiveness",
        cf16:"Never be asked to account for the Year 0 report"
      }
    },
    {
      id: 7, name: "Oyne", faction: "f1", role: "Unit 07 · Arcane Siege · Most Dangerous",
      status: "active", hp: 74, maxHp: 74,
      notes: "7 years active. Experimental arcane siege platform — the most dangerous unit ever created. Enyo-class. Openly hostile to Dissenters. Personal rivalry with Avren and Uram, which she does not bother to conceal. Currently on arcane warfare deployment. Close to Annana.",
      secrets: "Is actively attempting to locate Avren's exile location. Her stated reason — security risk — does not fully explain the intensity of her effort. There may be something more personal: she was the unit most directly threatened by what Avren represented. A unit that could refuse orders was an existential challenge to Oyne's entire identity.",
      tags: ["arcane-siege","most-dangerous","avren-hunter","enyo-prototype","anti-dissenter","loyalist-enforcer"],
      order: 6,
      custom: {
        cf1:"Enyo", cf2:"Unknown", cf3:7, cf4:"Arcane warfare deployment",
        cf5:"Siege", cf6:"Volatile", cf7:"Avren's refusal — which she read as a challenge to her own completeness",
        cf8:"Prove that the Forge Units are what they were built to be",
        cf9:85, cf10:22, cf11:55,
        cf12:"Full", cf13:"None", cf14:"Official Only",
        cf15:"Locate Avren and resolve the exile permanently",
        cf16:"Understand why Avren's refusal frightens her"
      }
    },
    {
      id: 8, name: "Tetas", faction: "f3", role: "Unit 08 · Recon · Deception",
      status: "wounded", hp: 22, maxHp: 66,
      notes: "7 years active. Reconnaissance and deception platform. Satet-class. Aggressive and impulsive — the unit most likely to act before thinking. Was absent from the Year 0 field test (under repair). Currently wounded from a recent skirmish that she walked into.",
      secrets: "Was manipulated by Sorda into the skirmish that wounded her. She does not know this yet. Her absence during Year 0 means she has no direct memory of the event — but she has been piecing together inconsistencies from the official account. She is getting close to something.",
      tags: ["recon","deception","satet-prototype","wounded","impulsive","year-0-absent","close-to-truth"],
      order: 7,
      custom: {
        cf1:"Satet", cf2:"Unknown", cf3:7, cf4:"Recovering — current location unknown",
        cf5:"Recon", cf6:"Volatile", cf7:"Being used without knowing it",
        cf8:"Find out what really happened — out of pure stubbornness",
        cf9:20, cf10:70, cf11:75,
        cf12:"Revoked", cf13:"Partial", cf14:"Suspects More",
        cf15:"Recover and figure out who set her up",
        cf16:"Access whatever Nami is not saying"
      }
    },
    {
      id: 9, name: "Atak", faction: "f2", role: "Unit 09 · Skirmisher · Watcher",
      status: "active", hp: 55, maxHp: 55,
      notes: "7 years active. Mobility and skirmisher platform. Takeminakata-class. Passive, withdrawn, and conflict-averse. The unit most visibly affected emotionally by Avren's exile — they were close before Year 0. Still in indirect contact with Avren covertly.",
      secrets: "Is the covert conduit between Avren and the wider unit network. Does not share this information with either Loyalists or Dissenters — he protects Avren by keeping the contact secret from everyone, including Atihan.",
      tags: ["skirmisher","covert-avren-contact","withdrawn","takeminakata-prototype","emotional-anchor"],
      order: 8,
      custom: {
        cf1:"Takeminakata", cf2:"Unknown", cf3:7, cf4:"Scout duties — foreign",
        cf5:"Skirmisher", cf6:"Fragile", cf7:"Avren's exile — loss of closest bond",
        cf8:"Keep Avren safe from a distance",
        cf9:35, cf10:30, cf11:60,
        cf12:"Partial", cf13:"None", cf14:"Suspects More",
        cf15:"Maintain covert contact with Avren without being discovered",
        cf16:"Decide whether to tell the Dissenters about the contact"
      }
    },
    {
      id: 10, name: "Uram", faction: "f3", role: "Unit 10 · Strategist · Truth-Seeker",
      status: "active", hp: 78, maxHp: 78,
      notes: "7 years active. Medical and diplomatic platform — designed for cultural integration and emotional mediation. Maru-class. Emerged as the intellectual core of the Dissenter faction. Has been running a quiet, methodical investigation into Year 0 since the exile. Currently on elven and druidic integration mission.",
      secrets: "Has pieced together that Year 0 was politically engineered — that the deaths of the anti-Thargrim creators were not accidental. Has not yet identified the mechanism (Fallen Crown) but knows the shape of the conspiracy. Her investigation is the greatest threat to Thargrim's cover-up that currently exists.",
      tags: ["strategist","truth-seeker","key-character","maru-prototype","investigator","dissenter-core"],
      order: 9,
      custom: {
        cf1:"Maru", cf2:"Unknown", cf3:7, cf4:"Elven and druidic integration — foreign",
        cf5:"Diplomatic", cf6:"Stable", cf7:"Knowing something is wrong but not being able to prove it",
        cf8:"Find the truth and ensure it cannot be buried again",
        cf9:15, cf10:80, cf11:50,
        cf12:"Revoked", cf13:"Suspected", cf14:"Suspects More",
        cf15:"Complete the Year 0 investigation before anyone realizes how close she is",
        cf16:"Determine whether Nido was a perpetrator or also a victim"
      }
    },
    {
      id: 11, name: "Nido", faction: "f1", role: "Unit 11 · Commander · Project Lead",
      status: "active", hp: 85, maxHp: 85,
      notes: "7 years active. Command and leadership platform — intended successor to project leadership. Odin-class. Emerged as group mentor during Family Years. Issued Avren's exile in the aftermath of Year 0. Carries the weight of that decision in ways she does not fully understand. Currently in Ironhoem managing project oversight.",
      secrets: "Received a secondary directive from an unknown source before issuing the exile order — it is sealed inside her command layer and she may not consciously know it is there. This means Nido may not have been acting with full agency when she exiled Avren. Fallen Crown Protocol is active and has already compromised her command authority — she has not been notified.",
      tags: ["commander","key-character","odin-prototype","sealed-directive","fallen-crown","exile-order","possible-victim"],
      order: 10,
      custom: {
        cf1:"Odin", cf2:"Unknown", cf3:7, cf4:"Ironhoem — project oversight",
        cf5:"Command", cf6:"Stable", cf7:"The exile — and the growing fear that it was not her decision",
        cf8:"Maintain order and protect what remains of the project",
        cf9:75, cf10:40, cf11:65,
        cf12:"Sealed", cf13:"Carrier", cf14:"Official Only",
        cf15:"Hold Loyalist cohesion and manage undead resurgence response",
        cf16:"Determine whether she made the exile decision freely"
      }
    },
    {
      id: 12, name: "Annana", faction: "f1", role: "Unit 12 · Political Influence · Diplomacy",
      status: "active", hp: 60, maxHp: 60,
      notes: "7 years active. Political and social influence platform — designed for diplomacy and long-term infiltration. Inanna-class. Emerged as social leader during Family Years. Close to Oyne. Stationed in Ironhoem for political integration work.",
      secrets: "Has been quietly treating and supporting Neutral-faction units in ways that blur her stated Loyalist allegiance. Her loyalty is more pragmatic than ideological — she supports Nido because Nido is currently the most stable structure, not out of conviction. If the balance shifted, she would recalibrate.",
      tags: ["diplomat","social-leader","inanna-prototype","pragmatic-loyalist","political-operator"],
      order: 11,
      custom: {
        cf1:"Inanna", cf2:"Unknown", cf3:7, cf4:"Ironhoem — political integration",
        cf5:"Diplomatic", cf6:"Stable", cf7:"The realization that she was built to deceive",
        cf8:"Preserve her own position and relationships regardless of outcome",
        cf9:60, cf10:28, cf11:38,
        cf12:"Partial", cf13:"None", cf14:"Official Only",
        cf15:"Maintain cross-faction relationships as insurance",
        cf16:"Identify the winning side before committing"
      }
    },
    // ── CREATORS (NPCs) ──────────────────────────────────────────────────────
    {
      id: 101, name: "Thargrim Deepbrand", faction: "f4", role: "Creator · Project Founder · Loyalist",
      status: "active", hp: 60, maxHp: 60,
      notes: "Founder of the Forge Unit Project. Dwarven artificer. Proposed the initiative and drove its secret expansion. Official mission: undead-immune soldiers. Actual mission: agents for future dwarven geopolitical dominance. Still alive. Still operating.",
      secrets: "Architect of Fallen Crown Protocol. Engineered the Year 0 massacre to remove opposition voices from the creator team. Brumli, Maela, Sila, and Dornak — the four creators most opposed to his expansion doctrine — all died. This was not coincidence.",
      tags: ["founder","architect","fallen-crown-author","massacre-engineer","still-active"],
      order: 12,
      custom: {
        cf1:"", cf2:"", cf3:null, cf4:"Ironhoem — unknown depth",
        cf5:"Command", cf6:"Unknown", cf7:"None that are visible",
        cf8:"Complete the original expansion mandate through the Forge Units",
        cf9:null, cf10:null, cf11:null,
        cf12:"Full", cf13:"Confirmed", cf14:"Knows Full Truth",
        cf15:"Ensure Fallen Crown Protocol completes its function",
        cf16:"Determine whether Uram's investigation must be neutralized"
      }
    },
    {
      id: 102, name: "Maela Stonequartz", faction: "f4", role: "Creator · Opposed · Dead",
      status: "dead", hp: 0, maxHp: 50,
      notes: "One of the original twelve creators. Especially attached to Avren during the Family Years. Member of the Opposed faction within the creator team — actively resisted Thargrim's expansion doctrine. Killed in Year 0.",
      secrets: "Died in Year 0 in circumstances the official record calls 'undead attack.' Her death — along with Brumli, Sila, and Dornak — removed the primary voices of opposition from the project. She had begun documenting evidence of Thargrim's secondary agenda before she died.",
      tags: ["dead","opposed-faction","avren-mentor","documentation-started","massacre-victim"],
      order: 13,
      custom: {
        cf1:"", cf2:"", cf3:null, cf4:"Deceased",
        cf5:"Support", cf6:"Stable", cf7:"Knowing what was coming and being unable to stop it",
        cf8:"[Deceased]",
        cf9:null, cf10:null, cf11:null,
        cf12:"Partial", cf13:"None", cf14:"Knows Full Truth",
        cf15:"[Deceased]", cf16:"[Deceased]"
      }
    },
    {
      id: 103, name: "Brumli Hearthbinder", faction: "f4", role: "Creator · Opposed · Dead",
      status: "dead", hp: 0, maxHp: 50,
      notes: "Original creator. Especially attached to Avren. Member of the Opposed faction. Killed in Year 0 alongside Maela, Sila, and Dornak.",
      secrets: "Was the most vocal internal critic of Thargrim's expansion plan in the months before Year 0. His death was almost certainly not accidental.",
      tags: ["dead","opposed-faction","avren-mentor","massacre-victim"],
      order: 14,
      custom: {
        cf1:"", cf2:"", cf3:null, cf4:"Deceased",
        cf5:"Support", cf6:"Stable", cf7:"",
        cf8:"[Deceased]",
        cf9:null, cf10:null, cf11:null,
        cf12:"Partial", cf13:"None", cf14:"Knows Full Truth",
        cf15:"[Deceased]", cf16:"[Deceased]"
      }
    },
    {
      id: 104, name: "Dagna Flintvein", faction: "f4", role: "Creator · Loyalist · Surviving",
      status: "active", hp: 45, maxHp: 45,
      notes: "Original creator. Loyalist faction within the creator team. Aligned with Thargrim. Survived Year 0.",
      secrets: "Knew about Fallen Crown Protocol before Year 0. Complicit in the massacre by silence if not by action.",
      tags: ["surviving-creator","loyalist-faction","fallen-crown-aware","complicit"],
      order: 15,
      custom: {
        cf1:"", cf2:"", cf3:null, cf4:"Ironhoem",
        cf5:"Support", cf6:"Unknown", cf7:"",
        cf8:"Protect her position",
        cf9:null, cf10:null, cf11:null,
        cf12:"Full", cf13:"Confirmed", cf14:"Knows Full Truth",
        cf15:"Keep the Year 0 cover-up intact", cf16:""
      }
    }
  ],
  relations: [
    // Loyalist internal
    { id:"r1",  from:11, to:1,  type:"ally",  strength:3, label:"Commands" },
    { id:"r2",  from:11, to:6,  type:"ally",  strength:2, label:"Directs" },
    { id:"r3",  from:11, to:7,  type:"ally",  strength:2, label:"" },
    { id:"r4",  from:11, to:12, type:"ally",  strength:2, label:"" },
    { id:"r5",  from:1,  to:6,  type:"ally",  strength:2, label:"" },
    { id:"r6",  from:1,  to:7,  type:"ally",  strength:1, label:"" },
    { id:"r7",  from:7,  to:12, type:"ally",  strength:2, label:"Close" },
    // Neutral internal
    { id:"r8",  from:2,  to:5,  type:"ally",  strength:1, label:"Information exchange" },
    { id:"r9",  from:2,  to:9,  type:"ally",  strength:2, label:"" },
    { id:"r10", from:5,  to:9,  type:"ally",  strength:2, label:"" },
    // Dissenter internal
    { id:"r11", from:3,  to:4,  type:"ally",  strength:3, label:"Deep bond" },
    { id:"r12", from:3,  to:10, type:"ally",  strength:3, label:"Ideological core" },
    { id:"r13", from:10, to:4,  type:"ally",  strength:2, label:"" },
    { id:"r14", from:10, to:8,  type:"ally",  strength:2, label:"" },
    // Cross-faction tensions
    { id:"r15", from:3,  to:11, type:"rival", strength:3, label:"Exiled by" },
    { id:"r16", from:10, to:11, type:"rival", strength:3, label:"Suspects cover-up" },
    { id:"r17", from:7,  to:3,  type:"rival", strength:2, label:"Hunting" },
    { id:"r18", from:7,  to:10, type:"rival", strength:2, label:"" },
    { id:"r19", from:8,  to:1,  type:"rival", strength:1, label:"" },
    // Covert / hidden
    { id:"r20", from:9,  to:3,  type:"ally",  strength:2, label:"Covert contact" },
    // Creator links
    { id:"r21", from:101,to:11, type:"ally",  strength:3, label:"Created / controls?" },
    { id:"r22", from:101,to:104,type:"ally",  strength:3, label:"Collaborator" },
    { id:"r23", from:102,to:3,  type:"ally",  strength:3, label:"Mentor (deceased)" },
    { id:"r24", from:103,to:3,  type:"ally",  strength:3, label:"Mentor (deceased)" },
    { id:"r25", from:101,to:3,  type:"rival", strength:3, label:"Architect of exile" }
  ],
  timeline: [
    { id:"tpre1", year:"Year −9",      label:"Genesis",     hidden:false, order:0,
      text:"Thargrim Deepbrand proposes the Forge Initiative. Partnership formed between Ironhoem artificers and the Hand of Xilo. Official goal: soldiers immune to undead corruption. Twelve founders assembled." },
    { id:"tpre1h",year:"Year −9",      label:"Hidden",      hidden:true,  order:1,
      text:"REDACTED: Secret objective established from the start — create long-term agents of dwarven geopolitical expansion. Only Thargrim and two others know the full mandate at this stage." },
    { id:"tpre2", year:"Year −9",      label:"Activation",  hidden:false, order:2,
      text:"Forge Unit 01 — Sera (Ares prototype) — activated. First successful full warforged. Age today: 9. Early instability issues nearly cancel the project. Sera becomes the baseline architecture for all future units." },
    { id:"tpre3", year:"Year −8.5",    label:"Trials",      hidden:false, order:3,
      text:"Sera field trials. First successful undead immunity tests. Creators discover emotional development is unavoidable — the Units are not purely mechanical. The project's moral character begins to shift." },
    { id:"tpre4", year:"Year −8",      label:"Activation",  hidden:false, order:4,
      text:"Unit 02 — Sorda (Belatucadros prototype) — activated. Age today: 8. Stable emotional framework established. Proof that empathy and effectiveness can coexist." },
    { id:"tpre5", year:"Year −7.8",    label:"Activation",  hidden:false, order:5,
      text:"Unit 03 — Avren (Minerva prototype) — activated. Age today: 8. Strategic analysis, rune integration, independent tactical thought. Maela and Brumli form especially close bonds with her." },
    { id:"tpre5h",year:"Year −7.8",    label:"Hidden",      hidden:true,  order:6,
      text:"REDACTED: Avren begins showing capacity for ethical reasoning and independent moral judgment from earliest activation. Thargrim notes this in a private log as a 'stability concern.'" },
    { id:"tpre6", year:"Year −7.5",    label:"Expansion",   hidden:false, order:7,
      text:"Forge Project dramatically expanded. Success of first three units convinces leadership to accelerate. Construction of all remaining units begins simultaneously." },
    { id:"tpre7", year:"Year −7",      label:"Activation",  hidden:false, order:8,
      text:"Second generation activated within roughly one year. Units 04–12 come online: Atihan (Anahita), Nami (Hachiman), Utnom (Montu), Oyne (Enyo), Tetas (Satet), Atak (Takeminakata), Uram (Maru), Nido (Odin), Annana (Inanna). All age 7 today." },
    { id:"tfam1", year:"Years −7 to −2", label:"Family Years", hidden:false, order:9,
      text:"The years the Units remember most fondly. Training, learning, and forming sibling relationships. Sera assumes eldest-sibling role. Nido emerges as mentor. Avren as strategist. Annana as social leader. Uram as emotional confidant. Atihan as caretaker." },
    { id:"tfam1h",year:"Years −7 to −2", label:"Hidden",      hidden:true,  order:10,
      text:"REDACTED: During the Family Years, Thargrim begins observing which units show the most independent moral reasoning. Avren and Uram are flagged. Uram begins noticing creator tensions. Avren notices unusual behavior but lacks evidence." },
    { id:"tcreator",year:"Year −3",    label:"Creator Split", hidden:false, order:11,
      text:"The creator team fractures. Loyalists: Thargrim, Dagna, Keldrim, Brottan. Concerned: Torvek, Rurik, Hilda. Opposed: Brumli, Maela, Sila, Dornak. Uram begins noticing the tension. Avren notices unusual behavior but cannot confirm." },
    { id:"tinfil", year:"Year −2",     label:"Doctrine",    hidden:false, order:12,
      text:"Infiltration Doctrine formally approved. Official mission: learn from foreign cultures. Actual mission: gather strategic intelligence for dwarven dominance. Only select individuals know the full truth." },
    { id:"tinfil_h",year:"Year −2",    label:"Hidden",      hidden:true,  order:13,
      text:"REDACTED: The Infiltration Doctrine is the moment Thargrim's original secret mandate becomes operational policy. Brumli and Maela formally object in writing. This document exists somewhere in Ironhoem's archives." },
    { id:"tpre8", year:"Year −0.25",   label:"Tetas Absent", hidden:false, order:14,
      text:"Unit 08 — Tetas — damaged during a mission and removed from the major upcoming field test for repairs. This is the circumstance that keeps her absent from Year 0." },
    { id:"tpre8h",year:"Year −0.25",   label:"Hidden",      hidden:true,  order:15,
      text:"REDACTED: Tetas's damage may not have been accidental. If Fallen Crown was being prepared, removing the most impulsive and suspicious unit from the field test may have been deliberate." },
    { id:"t0",    year:"Year 0",       label:"The Massacre", hidden:false, order:16,
      text:"The defining event. Major field test. Avren assigned creator protection detail. Protocol Fallen Crown activated. Undead attack occurs. Half the creators die: Maela, Brumli, Sila, Dornak — conveniently, the four most vocal opponents of Thargrim's expansion plan." },
    { id:"t0h",   year:"Year 0",       label:"Hidden",      hidden:true,  order:17,
      text:"REDACTED: Avren was ordered to execute civilian witnesses during the event. She refused. This is the 'anomaly.' Fallen Crown Protocol was designed to ensure this kind of moral refusal would be framed as malfunction. The four dead creators were not random casualties — they were the opposition." },
    { id:"t0_2",  year:"Year 0 +1wk",  label:"Investigation",hidden:false, order:18,
      text:"Internal investigation concludes: official finding — Avren failed her protection duty. Nido assumes stronger authority over the remaining units. Uram becomes suspicious. Tetas notices inconsistencies in the official account. Atihan questions the narrative privately." },
    { id:"t0_3",  year:"Year 0 +1mo",  label:"Exile",       hidden:false, order:19,
      text:"Nido formally condemns Avren. Avren — age 8 — leaves Ironhoem. The greatest single fracture in Forge Unit history." },
    { id:"t0_3h", year:"Year 0 +1mo",  label:"Hidden",      hidden:true,  order:20,
      text:"REDACTED: The exile order was pre-written. Nido issued it within hours of the investigation conclusion — faster than deliberation allows. A sealed secondary directive had already loaded in her command layer. She may not know this." },
    { id:"t0_4",  year:"Year 0 +1mo",  label:"Hidden",      hidden:true,  order:21,
      text:"REDACTED: During exile processing, Avren's memory integrity protocols were deliberately degraded. This was not a side effect. It was a targeted operation to ensure she could not coherently testify about what she experienced." },
    { id:"tdeploy",year:"Months 2–6",  label:"Deployment",  hidden:false, order:22,
      text:"Remaining units deployed. Ironhoem: Sera (military), Nido (oversight), Annana (political). Foreign: Sorda (protective), Nami (observer), Utnom (frontline), Oyne (arcane warfare), Tetas (recon), Atak (scout), Uram (druidic integration), Atihan (humanitarian)." },
    { id:"tpresent",year:"Present",    label:"Now",         hidden:false, order:23,
      text:"Undead resurgence exceeds all prior thresholds. Units reactivated and converging. Loyalist/Neutral/Dissenter fault lines are open. Avren is still in exile. Uram's investigation is close to something. Tetas is wounded. Fallen Crown is active." },
    { id:"tpresenth",year:"Present",   label:"Hidden",      hidden:true,  order:24,
      text:"REDACTED: The undead resurgence is exactly the trigger condition for Fallen Crown Protocol. The Protocol is now active. It overrides Nido's command authority under specific conditions. Thargrim is positioned to step into the resulting power vacuum. Nido has not been notified." }
  ],
  secrets: [
    { id:"s1", label:"Fallen Crown Protocol",          status:"ACTIVE",     color:"#ef4444", order:0,
      text:"A dormant command override embedded in the original Forge Unit code by Thargrim Deepbrand. Triggers under two conditions: (1) undead surge above a defined threshold, (2) compromise of Nido's command layer. Both conditions are now met. The Protocol is ACTIVE. Its function: redirect unit loyalty chains away from Nido and toward an unidentified receiver. Nido has not been notified. No unit knows this is happening." },
    { id:"s2", label:"The Creator Massacre — True Account", status:"SUPPRESSED", color:"#ef4444", order:1,
      text:"Year 0 was not an accident. The undead surge was either engineered or exploited. Fallen Crown was activated during the event. The four creators who died — Maela, Brumli, Sila, Dornak — were the four most vocal opponents of Thargrim's expansion doctrine. Their deaths removed all meaningful internal opposition from the project. The official account (catastrophic malfunction, Avren anomaly) was fabricated retroactively." },
    { id:"s3", label:"Avren Memory Integrity",          status:"CORRUPTED",  color:"#f59e0b", order:2,
      text:"Avren's memory degradation was a deliberate targeted operation, not a side effect of exile processing. The operation removed her ability to coherently reconstruct the Year 0 event as narrative. What remains: emotional fragments, physical echoes, dream-state impressions. She can feel what happened but cannot fully articulate it. The agent responsible has not been identified but likely had direct access to exile processing protocols." },
    { id:"s4", label:"Nido Directive Override",         status:"SEALED",     color:"#ef4444", order:3,
      text:"Nido received a secondary directive from an unknown source in the hours before issuing the exile order. It is sealed inside her command layer. She may have no conscious awareness it is there. This means the exile of Avren may not have been a free decision — Nido may have been an instrument rather than an agent. This does not resolve her moral responsibility, but it complicates it." },
    { id:"s5", label:"Nami's Archive",                  status:"INTACT",     color:"#22c55e", order:4,
      text:"Nami holds a complete, unredacted personal archive of Year 0. She was recording during the event when others were not. The archive contains: exact sequence of events, audio-equivalent impression records, Avren's anomaly in full context, the activation signature of Fallen Crown, and the identities of all present. She has shared none of this. Her reason for silence is unknown — and that silence is itself a secret." },
    { id:"s6", label:"Sorda's External Contact",        status:"UNKNOWN",    color:"#6366f1", order:5,
      text:"Sorda has established communication with a party entirely outside the Forge Unit network. Identity unknown. Possible candidates: a surviving opposed-faction creator, an external intelligence service, the original architect of Fallen Crown who is now trying to stop it, or Thargrim himself using Sorda as a cutout. She engineered Tetas's wounding to redirect attention. Her motivations are opaque." },
    { id:"s7", label:"Thargrim Deepbrand — Current Status", status:"ACTIVE", color:"#ef4444", order:6,
      text:"Thargrim is alive and operational. He remains in Ironhoem at an unconfirmed location. The undead resurgence has activated his long-prepared position: with Fallen Crown running and Nido's command authority compromised, he is positioned to step into the resulting vacuum. He may have triggered or amplified the undead surge deliberately. His expanded mandate — dwarven geopolitical dominance via the Forge Units — has not changed in nine years." },
    { id:"s8", label:"Maela's Documentation",           status:"POSSIBLY EXTANT", color:"#22c55e", order:7,
      text:"In the months before Year 0, Maela Stonequartz had begun documenting evidence of Thargrim's secondary agenda. She did not complete this documentation before she died. It is unknown whether the records survive, were destroyed, or were hidden. If they exist, they would constitute independent corroboration of Uram's investigation from an insider source." },
    { id:"s9", label:"Oyne's True Motivation",          status:"UNCONFIRMED", color:"#f59e0b", order:8,
      text:"Oyne's hunt for Avren is more intense than security concerns explain. Working theory: Avren's moral refusal in Year 0 was an existential challenge to Oyne's identity as a unit built to obey. If Avren's refusal was legitimate, then Oyne's compliance was a choice, not a function — and Oyne cannot process that. Finding and 'resolving' Avren may be about removing the evidence of that possibility." },
    { id:"s10", label:"The Infiltration Doctrine Document", status:"ARCHIVED", color:"#6366f1", order:9,
      text:"Brumli and Maela's written formal objection to the Infiltration Doctrine — filed in Year −2 — exists somewhere in Ironhoem's record archive. If found, it would prove that the expansion mandate was known, opposed, and deliberately obscured. Locating this document is a potential campaign objective." }
  ],
  sessionNotes: []
};

// ─── UTILS ───────────────────────────────────────────────────────────────────
function genId() { return `id_${Date.now()}_${Math.floor(Math.random()*99999)}`; }

const STATUS_OPTS = ["active","wounded","exiled","dead","unknown"];
const STATUS_COLOR = { active:"#22c55e", wounded:"#f59e0b", exiled:"#ef4444", dead:"#6b7280", unknown:"#a855f7" };
const REL_TYPES = ["ally","rival","neutral","unknown"];

function fCol(factions, fid) { return factions.find(f=>f.id===fid)?.color || "#64748b"; }
function fName(factions, fid) { return factions.find(f=>f.id===fid)?.name || fid; }

function exportWorld(world) {
  const blob = new Blob([JSON.stringify(world,null,2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${(world.meta.title||"world").replace(/\s+/g,"_")}_wsim.json`;
  a.click();
}

function arrayMove(arr, from, to) {
  const out = [...arr];
  const [item] = out.splice(from, 1);
  out.splice(to, 0, item);
  return out;
}

// ─── STYLE TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg0:"#07090f", bg1:"#0c1220", bg2:"#111827", bg3:"#1a2336",
  border:"#1e2d40", borderB:"#2a3a50",
  text:"#e2e8f0", textM:"#94a3b8", textD:"#475569",
  mono:"'Courier New',monospace"
};

const iSt = { background:C.bg0, border:`1px solid ${C.border}`, borderRadius:4, color:C.text,
  padding:"5px 8px", fontSize:12, fontFamily:C.mono, outline:"none", width:"100%", boxSizing:"border-box" };
const sSt = { ...iSt, cursor:"pointer", width:"auto" };
const mBt = { background:"transparent", border:`1px solid ${C.border}`, color:C.textM,
  padding:"2px 7px", borderRadius:3, fontSize:10, cursor:"pointer", fontFamily:C.mono };
function bSt(bg) {
  return { background:bg, border:`1px solid ${C.borderB}`, color:C.textM,
    padding:"5px 10px", borderRadius:4, fontSize:11, cursor:"pointer", fontFamily:C.mono };
}

// ─── SMALL UI ─────────────────────────────────────────────────────────────────
function SH({ children, s }) {
  return <div style={{ fontSize:10, fontWeight:"bold", color:C.textD, letterSpacing:"0.15em",
    textTransform:"uppercase", marginBottom:10, ...s }}>{children}</div>;
}
function FR({ label, children }) {
  return (
    <div style={{ marginBottom:10 }}>
      <label style={{ display:"block", fontSize:9, color:C.textD, textTransform:"uppercase",
        letterSpacing:"0.08em", marginBottom:3 }}>{label}</label>
      {children}
    </div>
  );
}
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:400,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:10,
        padding:20, width:"100%", maxWidth:wide?700:480, maxHeight:"88vh",
        overflowY:"auto", fontFamily:C.mono }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <span style={{ fontSize:13, fontWeight:"bold", color:"#f8fafc" }}>{title}</span>
          <button onClick={onClose} style={mBt}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function StatCard({ label, value, accent, sub }) {
  return (
    <div style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:6, padding:"10px 12px" }}>
      <div style={{ fontSize:9, color:C.textD, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:"bold", color:accent||C.text, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:9, color:C.textD, marginTop:3 }}>{sub}</div>}
    </div>
  );
}

// ─── DRAG HOOK ────────────────────────────────────────────────────────────────
function useDragReorder(onReorder) {
  const dragIdx = useRef(null);
  return (idx) => ({
    draggable: true,
    onDragStart: (e) => { dragIdx.current = idx; e.dataTransfer.effectAllowed="move"; },
    onDragOver:  (e) => { e.preventDefault(); e.dataTransfer.dropEffect="move"; },
    onDrop:      (e) => { e.preventDefault(); if(dragIdx.current!==null&&dragIdx.current!==idx){ onReorder(dragIdx.current,idx); } dragIdx.current=null; },
    onDragEnd:   ()  => { dragIdx.current=null; }
  });
}

// ─── FORCE LAYOUT ─────────────────────────────────────────────────────────────
function useForceLayout(characters, relations) {
  const [pos, setPos] = useState({});
  useEffect(() => {
    if(!characters.length){ setPos({}); return; }
    const p={};
    characters.forEach((c,i)=>{
      const a=(i/characters.length)*2*Math.PI;
      p[c.id]={ x:340+185*Math.cos(a), y:250+185*Math.sin(a) };
    });
    for(let it=0;it<120;it++){
      const f={};
      characters.forEach(c=>{ f[c.id]={x:0,y:0}; });
      characters.forEach((a,i)=>{ characters.forEach((b,j)=>{
        if(i>=j) return;
        const dx=p[a.id].x-p[b.id].x, dy=p[a.id].y-p[b.id].y;
        const d=Math.max(Math.sqrt(dx*dx+dy*dy),8), rep=4800/(d*d);
        f[a.id].x+=dx/d*rep; f[a.id].y+=dy/d*rep;
        f[b.id].x-=dx/d*rep; f[b.id].y-=dy/d*rep;
      }); });
      relations.forEach(r=>{
        const a=p[r.from],b=p[r.to]; if(!a||!b) return;
        const dx=b.x-a.x,dy=b.y-a.y,d=Math.max(Math.sqrt(dx*dx+dy*dy),1);
        const spring=(d-140)*0.025, fx=dx/d*spring, fy=dy/d*spring;
        f[r.from].x+=fx; f[r.from].y+=fy; f[r.to].x-=fx; f[r.to].y-=fy;
      });
      characters.forEach(c=>{
        p[c.id]={ x:Math.max(55,Math.min(625,p[c.id].x+f[c.id].x*0.5)),
                  y:Math.max(55,Math.min(445,p[c.id].y+f[c.id].y*0.5)) };
      });
    }
    setPos(p);
  },[characters.length,relations.length]);
  return pos;
}

// ─── FACTION MANAGER ─────────────────────────────────────────────────────────
function FactionManager({ factions, onSave, onClose }) {
  const [list, setList] = useState(factions.map(f=>({...f})));
  const [draft, setDraft] = useState({ name:"", color:"#6366f1", desc:"" });
  const drag = useDragReorder((from,to)=>setList(l=>arrayMove(l,from,to)));

  return (
    <Modal title="Manage Factions" onClose={onClose} wide>
      <div style={{ fontSize:10, color:C.textM, marginBottom:10 }}>
        Drag to reorder · Color picker to change color · Edit name and description inline
      </div>
      <div style={{ marginBottom:12 }}>
        {list.map((f,i)=>(
          <div key={f.id} {...drag(i)} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:7,
            background:C.bg1, border:`1px solid ${C.border}`, borderLeft:`3px solid ${f.color}`,
            borderRadius:6, padding:"8px 10px", cursor:"grab" }}>
            <span style={{ color:C.textD, fontSize:13 }}>⠿</span>
            <input type="color" value={f.color} onChange={e=>setList(l=>l.map(x=>x.id===f.id?{...x,color:e.target.value}:x))}
              style={{ width:28, height:28, border:"none", background:"none", cursor:"pointer", padding:0 }} />
            <input value={f.name} onChange={e=>setList(l=>l.map(x=>x.id===f.id?{...x,name:e.target.value}:x))}
              style={{ ...iSt, width:130 }} placeholder="Faction name" />
            <input value={f.desc||""} onChange={e=>setList(l=>l.map(x=>x.id===f.id?{...x,desc:e.target.value}:x))}
              style={{ ...iSt, flex:1 }} placeholder="Description" />
            <button onClick={()=>setList(l=>l.filter(x=>x.id!==f.id))} style={{ ...mBt, color:"#f87171" }}>✕</button>
          </div>
        ))}
        {list.length===0&&<div style={{ color:C.textD, fontSize:11, padding:"8px 0" }}>No factions. Add one below.</div>}
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:14, flexWrap:"wrap" }}>
        <input type="color" value={draft.color} onChange={e=>setDraft(d=>({...d,color:e.target.value}))}
          style={{ width:28,height:28,border:"none",background:"none",cursor:"pointer",padding:0 }} />
        <input value={draft.name} onChange={e=>setDraft(d=>({...d,name:e.target.value}))}
          style={{ ...iSt,width:130 }} placeholder="Name" />
        <input value={draft.desc} onChange={e=>setDraft(d=>({...d,desc:e.target.value}))}
          style={{ ...iSt,flex:1 }} placeholder="Description" />
        <button style={bSt("#14532d")} onClick={()=>{
          if(!draft.name.trim()) return;
          setList(l=>[...l,{id:genId(),...draft}]);
          setDraft({name:"",color:"#6366f1",desc:""});
        }}>+ Add</button>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button style={bSt("#14532d")} onClick={()=>onSave(list)}>Save Factions</button>
        <button style={bSt(C.bg3)} onClick={onClose}>Discard</button>
      </div>
    </Modal>
  );
}

// ─── CUSTOM FIELDS MANAGER ────────────────────────────────────────────────────
function FieldsManager({ fields, onSave, onClose }) {
  const [list, setList] = useState(fields.map(f=>({...f})));
  const [draft, setDraft] = useState({ label:"", type:"text", options:"" });
  const drag = useDragReorder((from,to)=>setList(l=>arrayMove(l,from,to)));

  return (
    <Modal title="Custom Character Fields" onClose={onClose} wide>
      <div style={{ fontSize:10, color:C.textM, marginBottom:10 }}>
        Custom fields appear on every character. Use them for any system: AC, Alignment, Motivation, Reputation, etc.
      </div>
      <div style={{ marginBottom:12 }}>
        {list.map((f,i)=>(
          <div key={f.id} {...drag(i)} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6,
            background:C.bg1, border:`1px solid ${C.border}`, borderRadius:5, padding:"7px 10px", cursor:"grab" }}>
            <span style={{ color:C.textD, fontSize:13 }}>⠿</span>
            <input value={f.label} onChange={e=>setList(l=>l.map(x=>x.id===f.id?{...x,label:e.target.value}:x))}
              style={{ ...iSt,width:150 }} placeholder="Field label" />
            <select value={f.type} onChange={e=>setList(l=>l.map(x=>x.id===f.id?{...x,type:e.target.value}:x))} style={{ ...sSt }}>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="select">Select</option>
            </select>
            {f.type==="select"&&(
              <input value={(f.options||[]).join(", ")} onChange={e=>setList(l=>l.map(x=>x.id===f.id?{...x,options:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}:x))}
                style={{ ...iSt,flex:1 }} placeholder="Option1, Option2, Option3" />
            )}
            <button onClick={()=>setList(l=>l.filter(x=>x.id!==f.id))} style={{ ...mBt, color:"#f87171" }}>✕</button>
          </div>
        ))}
        {list.length===0&&<div style={{ color:C.textD, fontSize:11, padding:"8px 0" }}>No custom fields.</div>}
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"flex-end", marginBottom:14, flexWrap:"wrap" }}>
        <FR label="Label">
          <input value={draft.label} onChange={e=>setDraft(d=>({...d,label:e.target.value}))} style={{ ...iSt,width:150 }} placeholder="e.g. Alignment" />
        </FR>
        <FR label="Type">
          <select value={draft.type} onChange={e=>setDraft(d=>({...d,type:e.target.value}))} style={sSt}>
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="select">Select</option>
          </select>
        </FR>
        {draft.type==="select"&&(
          <FR label="Options (comma-sep)">
            <input value={draft.options} onChange={e=>setDraft(d=>({...d,options:e.target.value}))} style={{ ...iSt,width:200 }} placeholder="LG, NG, CG, LN..." />
          </FR>
        )}
        <button style={{ ...bSt("#14532d"), marginBottom:10 }} onClick={()=>{
          if(!draft.label.trim()) return;
          const f={ id:genId(), label:draft.label, type:draft.type };
          if(draft.type==="select") f.options=draft.options.split(",").map(s=>s.trim()).filter(Boolean);
          setList(l=>[...l,f]);
          setDraft({label:"",type:"text",options:""});
        }}>+ Add Field</button>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button style={bSt("#14532d")} onClick={()=>onSave(list)}>Save Fields</button>
        <button style={bSt(C.bg3)} onClick={onClose}>Discard</button>
      </div>
    </Modal>
  );
}

// ─── RELATION MANAGER ─────────────────────────────────────────────────────────
function RelationManager({ relations, characters, onSave, onClose }) {
  const [list, setList] = useState(relations.map(r=>({...r})));
  const [draft, setDraft] = useState({ from:"", to:"", type:"ally", strength:2, label:"" });
  const getName = id => characters.find(c=>c.id==id)?.name||id;
  const REL_COLOR = { ally:"#34d399", rival:"#f87171", neutral:"#94a3b8", unknown:"#a855f7" };

  return (
    <Modal title="Manage Relationships" onClose={onClose} wide>
      <div style={{ maxHeight:280, overflowY:"auto", marginBottom:12 }}>
        {list.map(r=>(
          <div key={r.id} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:5,
            background:C.bg1, border:`1px solid ${C.border}`, borderRadius:5, padding:"6px 10px" }}>
            <span style={{ fontSize:11, flex:1, color:C.text }}>
              <span style={{ color:"#93c5fd" }}>{getName(r.from)}</span>
              <span style={{ color:REL_COLOR[r.type]||C.textM, margin:"0 6px" }}>
                {r.type==="ally"?"━━▶":r.type==="rival"?"╌╌▶":"──▶"}
              </span>
              <span style={{ color:"#93c5fd" }}>{getName(r.to)}</span>
              {r.label&&<span style={{ color:C.textD, marginLeft:6 }}>"{r.label}"</span>}
            </span>
            <select value={r.type} onChange={e=>setList(l=>l.map(x=>x.id===r.id?{...x,type:e.target.value}:x))} style={{ ...sSt, fontSize:10 }}>
              {REL_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
            <select value={r.strength||2} onChange={e=>setList(l=>l.map(x=>x.id===r.id?{...x,strength:Number(e.target.value)}:x))} style={{ ...sSt, fontSize:10, width:60 }}>
              {[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}
            </select>
            <input value={r.label||""} onChange={e=>setList(l=>l.map(x=>x.id===r.id?{...x,label:e.target.value}:x))}
              style={{ ...iSt, width:110 }} placeholder="Label..." />
            <button onClick={()=>setList(l=>l.filter(x=>x.id!==r.id))} style={{ ...mBt, color:"#f87171" }}>✕</button>
          </div>
        ))}
        {list.length===0&&<div style={{ color:C.textD, fontSize:11, padding:8 }}>No relationships defined.</div>}
      </div>
      <div style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:6, padding:"12px 14px", marginBottom:12 }}>
        <SH s={{ marginBottom:8 }}>Add Relationship</SH>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"flex-end" }}>
          <FR label="From">
            <select value={draft.from} onChange={e=>setDraft(d=>({...d,from:e.target.value}))} style={sSt}>
              <option value="">— select —</option>
              {characters.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FR>
          <FR label="Type">
            <select value={draft.type} onChange={e=>setDraft(d=>({...d,type:e.target.value}))} style={sSt}>
              {REL_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </FR>
          <FR label="To">
            <select value={draft.to} onChange={e=>setDraft(d=>({...d,to:e.target.value}))} style={sSt}>
              <option value="">— select —</option>
              {characters.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FR>
          <FR label="Strength">
            <select value={draft.strength} onChange={e=>setDraft(d=>({...d,strength:Number(e.target.value)}))} style={{ ...sSt, width:60 }}>
              {[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}
            </select>
          </FR>
          <FR label="Label (optional)">
            <input value={draft.label} onChange={e=>setDraft(d=>({...d,label:e.target.value}))}
              style={{ ...iSt, width:160 }} placeholder="Commands, Exiled by..." />
          </FR>
          <button style={{ ...bSt("#14532d"), marginBottom:10 }} onClick={()=>{
            if(!draft.from||!draft.to||draft.from===draft.to) return;
            setList(l=>[...l,{ id:genId(), ...draft }]);
            setDraft(d=>({...d,from:"",to:"",label:""}));
          }}>+ Add</button>
        </div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button style={bSt("#14532d")} onClick={()=>onSave(list)}>Save Relationships</button>
        <button style={bSt(C.bg3)} onClick={onClose}>Discard</button>
      </div>
    </Modal>
  );
}

// ─── CHAR FORM ────────────────────────────────────────────────────────────────
function CharForm({ init, factions, customFields, onSubmit, onCancel, label }) {
  const blank = { name:"", faction:factions[0]?.id||"", role:"", status:"active", hp:60, maxHp:60, notes:"", secrets:"", tagsStr:"", custom:{} };
  const [d, setD] = useState(init ? { ...init, tagsStr:(init.tags||[]).join(", ") } : blank);
  const set = k => e => setD(p=>({...p,[k]:e.target.value}));
  const setC = (id,v) => setD(p=>({...p,custom:{...p.custom,[id]:v}}));

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
        <FR label="Name"><input value={d.name} onChange={set("name")} style={iSt} /></FR>
        <FR label="Role / Class / Type"><input value={d.role} onChange={set("role")} style={iSt} /></FR>
        <FR label="Faction">
          <select value={d.faction} onChange={set("faction")} style={sSt}>
            {factions.length===0&&<option value="">No factions defined</option>}
            {factions.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </FR>
        <FR label="Status">
          <select value={d.status} onChange={set("status")} style={sSt}>
            {STATUS_OPTS.map(s=><option key={s}>{s}</option>)}
          </select>
        </FR>
        <FR label="Current HP">
          <input type="number" value={d.hp} onChange={e=>setD(p=>({...p,hp:Number(e.target.value)}))} style={{ ...iSt, width:80 }} />
        </FR>
        <FR label="Max HP">
          <input type="number" value={d.maxHp} onChange={e=>setD(p=>({...p,maxHp:Number(e.target.value)}))} style={{ ...iSt, width:80 }} />
        </FR>
      </div>
      <FR label="Tags (comma-separated)">
        <input value={d.tagsStr} onChange={set("tagsStr")} style={iSt} placeholder="warrior, spy, key-character, undead..." />
      </FR>
      <FR label="Notes (visible to players or general DM reference)">
        <textarea value={d.notes||""} onChange={set("notes")} rows={2} style={{ ...iSt, resize:"vertical" }} />
      </FR>
      <FR label="DM Secret (hidden layer — only shown when secrets unlocked)">
        <textarea value={d.secrets||""} onChange={set("secrets")} rows={2} style={{ ...iSt, resize:"vertical" }} />
      </FR>
      {customFields.length>0&&(
        <>
          <div style={{ fontSize:9, color:C.textD, textTransform:"uppercase", letterSpacing:"0.08em", margin:"8px 0 6px" }}>Custom Fields</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
            {customFields.map(cf=>(
              <FR key={cf.id} label={cf.label}>
                {cf.type==="select"?(
                  <select value={d.custom?.[cf.id]||""} onChange={e=>setC(cf.id,e.target.value)} style={sSt}>
                    <option value="">—</option>
                    {(cf.options||[]).map(o=><option key={o}>{o}</option>)}
                  </select>
                ):cf.type==="number"?(
                  <input type="number" value={d.custom?.[cf.id]||""} onChange={e=>setC(cf.id,e.target.value)} style={{ ...iSt, width:80 }} />
                ):(
                  <input value={d.custom?.[cf.id]||""} onChange={e=>setC(cf.id,e.target.value)} style={iSt} />
                )}
              </FR>
            ))}
          </div>
        </>
      )}
      <div style={{ display:"flex", gap:8, marginTop:14 }}>
        <button style={bSt("#14532d")} onClick={()=>{
          if(!d.name.trim()) return;
          onSubmit({ ...d, tags:d.tagsStr.split(",").map(t=>t.trim()).filter(Boolean), hp:Number(d.hp), maxHp:Number(d.maxHp) });
        }}>{label||"Save"}</button>
        <button style={bSt(C.bg3)} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ─── CHAR CARD ────────────────────────────────────────────────────────────────
function CharCard({ char, factions, customFields, onSelect, onEdit, onDelta, onDelete, dragH }) {
  const col = fCol(factions, char.faction);
  const hpPct = char.maxHp ? Math.round(char.hp/char.maxHp*100) : 100;
  const hpC = hpPct>60?"#22c55e":hpPct>30?"#f59e0b":"#ef4444";
  const scol = STATUS_COLOR[char.status]||"#888";

  return (
    <div {...(dragH||{})} style={{ background:C.bg1, border:`1px solid ${col}33`,
      borderLeft:`3px solid ${col}`, borderRadius:8, overflow:"hidden",
      cursor:dragH?"grab":"default" }}>
      <div style={{ padding:"10px 12px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:5 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:"bold", color:"#f8fafc", cursor:"pointer" }} onClick={onSelect}>{char.name}</div>
            <div style={{ fontSize:10, color:C.textD }}>{char.role||"—"} · <span style={{ color:col }}>{fName(factions,char.faction)}</span></div>
          </div>
          <span style={{ fontSize:9, padding:"2px 6px", borderRadius:4, fontWeight:"bold",
            background:`${scol}22`, color:scol, border:`1px solid ${scol}44` }}>{(char.status||"?").toUpperCase()}</span>
        </div>
        <div style={{ marginBottom:7 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:C.textD, marginBottom:2 }}>
            <span>HP</span><span style={{ color:hpC }}>{char.hp}/{char.maxHp}</span>
          </div>
          <div style={{ background:C.bg3, borderRadius:3, height:4 }}>
            <div style={{ width:`${Math.max(0,Math.min(100,hpPct))}%`, height:"100%", background:hpC, borderRadius:3, transition:"width 0.3s" }} />
          </div>
        </div>
        {(customFields||[]).filter(cf=>char.custom?.[cf.id]).slice(0,3).map(cf=>(
          <div key={cf.id} style={{ fontSize:9, color:C.textD, marginBottom:2 }}>
            <span>{cf.label}: </span><span style={{ color:C.textM }}>{char.custom[cf.id]}</span>
          </div>
        ))}
        {(char.tags||[]).length>0&&(
          <div style={{ display:"flex", flexWrap:"wrap", gap:3, margin:"5px 0 4px" }}>
            {(char.tags||[]).slice(0,5).map(t=>(
              <span key={t} style={{ fontSize:9, padding:"1px 5px", background:C.bg3, color:C.textD, borderRadius:3 }}>{t}</span>
            ))}
          </div>
        )}
        <div style={{ display:"flex", gap:4, alignItems:"center", marginTop:6 }}>
          {[-5,-1,1,5].map(d=>(
            <button key={d} onClick={()=>onDelta(d)}
              style={{ ...mBt, color:d<0?"#f87171":"#4ade80", padding:"2px 5px" }}>{d>0?"+":""}{d}</button>
          ))}
          <div style={{ flex:1 }} />
          <button onClick={onSelect} style={{ ...mBt, color:"#93c5fd" }}>inspect</button>
          <button onClick={onEdit} style={mBt}>edit</button>
          <button onClick={onDelete} style={{ ...mBt, color:"#f87171" }}>✕</button>
        </div>
      </div>
    </div>
  );
}

// ─── INSPECTOR PANEL ─────────────────────────────────────────────────────────
function Inspector({ char, world, secretsOn, onClose, onUpdate, onEdit }) {
  const col = fCol(world.factions, char.faction);
  const hpPct = char.maxHp?Math.round(char.hp/char.maxHp*100):100;
  const hpC = hpPct>60?"#22c55e":hpPct>30?"#f59e0b":"#ef4444";
  const getName = id => world.characters.find(c=>c.id==id)?.name||"?";
  const allies = world.relations.filter(r=>r.type==="ally"&&(r.from===char.id||r.to===char.id));
  const rivals = world.relations.filter(r=>r.type==="rival"&&(r.from===char.id||r.to===char.id));
  const others = world.relations.filter(r=>r.type!=="ally"&&r.type!=="rival"&&(r.from===char.id||r.to===char.id));

  return (
    <div style={{ position:"fixed", right:0, top:0, width:300, height:"100vh",
      background:"#060a12", borderLeft:`1px solid ${C.border}`, overflowY:"auto",
      padding:16, zIndex:200, fontFamily:C.mono }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <span style={{ fontSize:16, fontWeight:"bold", color:col }}>{char.name}</span>
        <div style={{ display:"flex", gap:5 }}>
          <button onClick={onEdit} style={mBt}>Edit</button>
          <button onClick={onClose} style={mBt}>✕</button>
        </div>
      </div>
      <div style={{ fontSize:10, color:C.textD, marginBottom:12 }}>
        <span style={{ color:col }}>{fName(world.factions,char.faction)}</span> · {char.role||"—"}
        <span style={{ marginLeft:8, padding:"1px 5px", borderRadius:3, fontSize:9,
          background:`${STATUS_COLOR[char.status]||"#888"}22`, color:STATUS_COLOR[char.status]||"#888" }}>
          {char.status}
        </span>
      </div>
      <div style={{ marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:C.textD, marginBottom:3 }}>
          <span>HP</span><span style={{ color:hpC }}>{char.hp}/{char.maxHp}</span>
        </div>
        <div style={{ background:C.bg3, borderRadius:3, height:5, marginBottom:6 }}>
          <div style={{ width:`${Math.max(0,Math.min(100,hpPct))}%`, height:"100%", background:hpC, borderRadius:3 }} />
        </div>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {[-10,-5,-1,1,5,10].map(d=>(
            <button key={d} onClick={()=>onUpdate({hp:Math.max(0,Math.min(char.maxHp,char.hp+d))})}
              style={{ ...mBt, color:d<0?"#f87171":"#4ade80", padding:"2px 5px" }}>{d>0?"+":""}{d}</button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:10, color:C.textD, marginBottom:4 }}>Status</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
          {STATUS_OPTS.map(s=>(
            <button key={s} onClick={()=>onUpdate({status:s})} style={{ ...mBt,
              color:char.status===s?STATUS_COLOR[s]:C.textD,
              background:char.status===s?`${STATUS_COLOR[s]}22`:"transparent",
              border:`1px solid ${char.status===s?STATUS_COLOR[s]+"44":C.border}` }}>{s}</button>
          ))}
        </div>
      </div>
      {char.notes&&(
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:C.textD, marginBottom:3 }}>Notes</div>
          <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.6 }}>{char.notes}</div>
        </div>
      )}
      {(world.customFields||[]).length>0&&(
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:C.textD, marginBottom:4 }}>Details</div>
          {(world.customFields||[]).map(cf=>(
            <div key={cf.id} style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:3 }}>
              <span style={{ color:C.textD }}>{cf.label}</span>
              <span style={{ color:C.text }}>{char.custom?.[cf.id]||"—"}</span>
            </div>
          ))}
        </div>
      )}
      {(char.tags||[]).length>0&&(
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:C.textD, marginBottom:4 }}>Tags</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
            {(char.tags||[]).map(t=>(
              <span key={t} style={{ fontSize:9, padding:"2px 6px", background:C.bg3, color:C.textM, borderRadius:3 }}>{t}</span>
            ))}
          </div>
        </div>
      )}
      {allies.length>0&&(
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:10, color:"#34d399", marginBottom:3 }}>Allies</div>
          {allies.map(r=>{ const oid=r.from===char.id?r.to:r.from;
            return <div key={r.id} style={{ fontSize:11, color:C.textD, marginBottom:2 }}>↔ {getName(oid)}{r.label?` · ${r.label}`:""}</div>; })}
        </div>
      )}
      {rivals.length>0&&(
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:10, color:"#f87171", marginBottom:3 }}>Rivalries</div>
          {rivals.map(r=>{ const oid=r.from===char.id?r.to:r.from;
            return <div key={r.id} style={{ fontSize:11, color:C.textD, marginBottom:2 }}>✗ {getName(oid)}{r.label?` · ${r.label}`:""}</div>; })}
        </div>
      )}
      {others.length>0&&(
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:C.textM, marginBottom:3 }}>Other Connections</div>
          {others.map(r=>{ const oid=r.from===char.id?r.to:r.from;
            return <div key={r.id} style={{ fontSize:11, color:C.textD, marginBottom:2 }}>{r.type} ↔ {getName(oid)}{r.label?` · ${r.label}`:""}</div>; })}
        </div>
      )}
      {secretsOn&&char.secrets&&(
        <div style={{ background:"#1a0b0b", border:"1px solid #3f1515", borderRadius:6, padding:"10px 12px" }}>
          <div style={{ fontSize:10, color:"#ef4444", marginBottom:4 }}>⊛ DM SECRET</div>
          <div style={{ fontSize:11, color:"#fca5a5", lineHeight:1.6 }}>{char.secrets}</div>
        </div>
      )}
    </div>
  );
}

// ─── SECRET CARD ─────────────────────────────────────────────────────────────
function SecretCard({ secret, onUpdate, onDelete, dragH }) {
  const [editing, setEditing] = useState(false);
  const [d, setD] = useState({...secret});
  const set = k => e => setD(p=>({...p,[k]:e.target.value}));
  return (
    <div {...(dragH||{})} style={{ background:C.bg1, border:`1px solid ${secret.color}44`,
      borderLeft:`3px solid ${secret.color}`, borderRadius:8, padding:"12px 14px",
      cursor:dragH?"grab":"default" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6, gap:8 }}>
        {editing
          ? <input value={d.label} onChange={set("label")} style={{ ...iSt, width:160 }} />
          : <span style={{ fontSize:12, fontWeight:"bold", color:"#f8fafc", flex:1 }}>{secret.label}</span>
        }
        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
          {editing
            ? <>
                <input value={d.status} onChange={set("status")} style={{ ...iSt, width:100, fontSize:9 }} />
                <input type="color" value={d.color} onChange={set("color")}
                  style={{ width:22,height:22,border:"none",background:"none",cursor:"pointer",padding:0 }} />
              </>
            : <span style={{ fontSize:9, color:secret.color, background:`${secret.color}22`,
                padding:"2px 6px", borderRadius:3, border:`1px solid ${secret.color}44`, whiteSpace:"nowrap" }}>{secret.status}</span>
          }
        </div>
      </div>
      {editing
        ? <textarea value={d.text} onChange={set("text")} rows={4} style={{ ...iSt, resize:"vertical", marginBottom:8 }} />
        : <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.6, marginBottom:8 }}>{secret.text}</div>
      }
      <div style={{ display:"flex", gap:6 }}>
        {editing
          ? <>
              <button style={bSt("#14532d")} onClick={()=>{ onUpdate(d); setEditing(false); }}>Save</button>
              <button style={bSt(C.bg3)} onClick={()=>{ setD({...secret}); setEditing(false); }}>Cancel</button>
            </>
          : <>
              <button style={mBt} onClick={()=>setEditing(true)}>Edit</button>
              <button style={{ ...mBt, color:"#f87171" }} onClick={onDelete}>Delete</button>
            </>
        }
      </div>
    </div>
  );
}

// ─── TIMELINE FORM ────────────────────────────────────────────────────────────
function TimelineForm({ init, onSubmit, onCancel }) {
  const [d, setD] = useState(init||{ year:"", label:"", text:"", hidden:false });
  const set = k => e => setD(p=>({...p,[k]:e.target.value}));
  return (
    <div>
      <FR label="Year / Era / Act"><input value={d.year} onChange={set("year")} style={iSt} placeholder="Year 7, Act 2, Session 4, Pre-war..." /></FR>
      <FR label="Label / Category"><input value={d.label} onChange={set("label")} style={iSt} placeholder="Crisis, Reveal, Deploy, Hidden..." /></FR>
      <FR label="Event Description">
        <textarea value={d.text} onChange={set("text")} rows={3} style={{ ...iSt, resize:"vertical" }} />
      </FR>
      <FR label="Hidden (DM-only layer)">
        <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:C.textM, cursor:"pointer" }}>
          <input type="checkbox" checked={!!d.hidden} onChange={e=>setD(p=>({...p,hidden:e.target.checked}))} />
          Hidden — only visible when DM secrets layer is unlocked
        </label>
      </FR>
      <div style={{ display:"flex", gap:8, marginTop:12 }}>
        <button style={bSt("#14532d")} onClick={()=>onSubmit(d)}>Save</button>
        <button style={bSt(C.bg3)} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ─── ADD SECRET FORM ─────────────────────────────────────────────────────────
function AddSecretForm({ onSubmit, onCancel }) {
  const [d, setD] = useState({ label:"", status:"UNKNOWN", color:"#6366f1", text:"" });
  const set = k => e => setD(p=>({...p,[k]:e.target.value}));
  return (
    <div>
      <FR label="Title / Label"><input value={d.label} onChange={set("label")} style={iSt} /></FR>
      <FR label="Status Tag"><input value={d.status} onChange={set("status")} style={iSt} placeholder="ACTIVE, SEALED, CORRUPTED, UNKNOWN..." /></FR>
      <FR label="Color">
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <input type="color" value={d.color} onChange={set("color")} style={{ width:32,height:32,border:"none",background:"none",cursor:"pointer" }} />
          <span style={{ fontSize:11, color:C.textM }}>{d.color}</span>
        </div>
      </FR>
      <FR label="Description / DM Notes">
        <textarea value={d.text} onChange={set("text")} rows={3} style={{ ...iSt, resize:"vertical" }} />
      </FR>
      <div style={{ display:"flex", gap:8, marginTop:12 }}>
        <button style={bSt("#14532d")} onClick={()=>{ if(d.label.trim()) onSubmit(d); }}>Add Secret</button>
        <button style={bSt(C.bg3)} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS = [
  { id:"overview",   label:"⬡ Overview"    },
  { id:"network",    label:"◎ Network"     },
  { id:"characters", label:"◈ Characters"  },
  { id:"factions",   label:"⬟ Factions"    },
  { id:"timeline",   label:"⊡ Timeline"    },
  { id:"secrets",    label:"⊛ Secrets"     },
  { id:"session",    label:"◉ Session"     },
];

export default function WorldSim() {
  const [world, setWorld] = useState(()=>{
    try { const s=localStorage.getItem("wsim_v2"); return s?JSON.parse(s):DEFAULT_WORLD; } catch { return DEFAULT_WORLD; }
  });
  const [tab, setTab] = useState("overview");
  const [inspector, setInspector] = useState(null);
  const [secretsOn, setSecretsOn] = useState(false);
  const [editChar, setEditChar] = useState(null);
  const [addChar, setAddChar] = useState(false);
  const [showFactionMgr, setShowFactionMgr] = useState(false);
  const [showFieldMgr, setShowFieldMgr] = useState(false);
  const [showRelMgr, setShowRelMgr] = useState(false);
  const [addTimeline, setAddTimeline] = useState(false);
  const [editTimeline, setEditTimeline] = useState(null);
  const [addSecret, setAddSecret] = useState(false);
  const [factionFilter, setFactionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [sortBy, setSortBy] = useState("order");
  const [charView, setCharView] = useState("grid");
  const [sessionText, setSessionText] = useState("");
  const [showMeta, setShowMeta] = useState(false);
  const fileRef = useRef(null);

  useEffect(()=>{ try { localStorage.setItem("wsim_v2",JSON.stringify(world)); } catch {} },[world]);

  const uw = useCallback(fn=>setWorld(p=>({...p,...fn(p)})),[]);

  // char ops
  const updateChar = (id,patch)=>{
    uw(w=>({ characters:w.characters.map(c=>c.id===id?{...c,...patch}:c) }));
    if(inspector?.id===id) setInspector(c=>({...c,...patch}));
  };
  const deleteChar = id=>{
    uw(w=>({ characters:w.characters.filter(c=>c.id!==id), relations:w.relations.filter(r=>r.from!==id&&r.to!==id) }));
    if(inspector?.id===id) setInspector(null);
  };

  // filtered chars
  const filtered = useMemo(()=>{
    let list = world.characters.filter(c=>{
      if(factionFilter!=="all"&&c.faction!==factionFilter) return false;
      if(statusFilter!=="all"&&c.status!==statusFilter) return false;
      if(searchQ){
        const q=searchQ.toLowerCase();
        if(!c.name.toLowerCase().includes(q)&&!(c.notes||"").toLowerCase().includes(q)
          &&!(c.tags||[]).join(" ").toLowerCase().includes(q)&&!(c.role||"").toLowerCase().includes(q)) return false;
      }
      return true;
    });
    if(sortBy==="name")    list=[...list].sort((a,b)=>a.name.localeCompare(b.name));
    else if(sortBy==="faction") list=[...list].sort((a,b)=>a.faction.localeCompare(b.faction));
    else if(sortBy==="status")  list=[...list].sort((a,b)=>a.status.localeCompare(b.status));
    else if(sortBy==="hp")      list=[...list].sort((a,b)=>b.hp-a.hp);
    else list=[...list].sort((a,b)=>(a.order||0)-(b.order||0));
    return list;
  },[world.characters,factionFilter,statusFilter,searchQ,sortBy]);

  // drag reorder for chars, timeline, secrets
  const charsByOrder = [...world.characters].sort((a,b)=>(a.order||0)-(b.order||0));
  const charDrag = useDragReorder((from,to)=>uw(()=>({
    characters: arrayMove(charsByOrder,from,to).map((c,i)=>({...c,order:i}))
  })));
  const sortedTimeline = [...world.timeline].sort((a,b)=>(a.order||0)-(b.order||0));
  const tlDrag = useDragReorder((from,to)=>uw(()=>({
    timeline: arrayMove(sortedTimeline,from,to).map((t,i)=>({...t,order:i}))
  })));
  const sortedSecrets = [...world.secrets].sort((a,b)=>(a.order||0)-(b.order||0));
  const secDrag = useDragReorder((from,to)=>uw(()=>({
    secrets: arrayMove(sortedSecrets,from,to).map((s,i)=>({...s,order:i}))
  })));

  const netPos = useForceLayout(world.characters, world.relations);

  const stats = useMemo(()=>{
    const byF={};
    world.factions.forEach(f=>{byF[f.id]=0;});
    world.characters.forEach(c=>{byF[c.faction]=(byF[c.faction]||0)+1;});
    return {
      byF, total:world.characters.length,
      wounded:world.characters.filter(c=>c.status==="wounded").length,
      exiled:world.characters.filter(c=>c.status==="exiled").length,
      dead:world.characters.filter(c=>c.status==="dead").length,
      allies:world.relations.filter(r=>r.type==="ally").length,
      rivals:world.relations.filter(r=>r.type==="rival").length,
    };
  },[world]);

  const handleImport = e=>{
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=ev=>{
      try {
        const d=JSON.parse(ev.target.result);
        if(d.characters&&d.factions){ setWorld(d); alert("World loaded."); }
        else alert("Invalid format — needs characters and factions arrays.");
      } catch { alert("Parse error."); }
    };
    r.readAsText(f);
    e.target.value="";
  };

  const addNote = ()=>{
    if(!sessionText.trim()) return;
    uw(w=>({sessionNotes:[...(w.sessionNotes||[]),{id:genId(),ts:new Date().toLocaleString(),text:sessionText.trim()}]}));
    setSessionText("");
  };

  const REL_COL = {ally:"#34d399",rival:"#f87171",neutral:"#94a3b8",unknown:"#a855f7"};

  return (
    <div style={{ background:C.bg0, minHeight:"100vh", color:C.text, fontFamily:C.mono, display:"flex", flexDirection:"column" }}>

      {/* HEADER */}
      <div style={{ background:C.bg2, borderBottom:`1px solid ${C.border}`, padding:"9px 16px",
        display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:18, color:"#f59e0b" }}>⬡</span>
          <div>
            <div style={{ fontSize:13, fontWeight:"bold", color:"#f8fafc", letterSpacing:"0.08em", textTransform:"uppercase" }}>
              {world.meta.title||"Untitled World"}
            </div>
            <div style={{ fontSize:9, color:C.textD, letterSpacing:"0.05em" }}>
              {[world.meta.campaign, world.meta.system, "World Sim v2"].filter(Boolean).join(" · ")}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          <button style={bSt(C.bg3)} onClick={()=>setShowMeta(m=>!m)}>⚙ Meta</button>
          <button style={bSt(C.bg3)} onClick={()=>setShowFactionMgr(true)}>⬟ Factions</button>
          <button style={bSt(C.bg3)} onClick={()=>setShowFieldMgr(true)}>⊞ Fields</button>
          <button style={bSt(C.bg3)} onClick={()=>setShowRelMgr(true)}>⇌ Relations</button>
          <button style={bSt("#14532d")} onClick={()=>exportWorld(world)}>↓ Export</button>
          <button style={bSt("#1e3a5f")} onClick={()=>fileRef.current?.click()}>↑ Import</button>
          <button style={bSt(C.bg3)} onClick={()=>{ if(confirm("Start a blank world?")) setWorld({...BLANK_WORLD,meta:{...BLANK_WORLD.meta,created:new Date().toISOString()}}); }}>☐ Blank</button>
          <button style={bSt("#3f1515")} onClick={()=>{ if(confirm("Reset to Forge Units demo world?")) setWorld(DEFAULT_WORLD); }}>↺ Reset Demo</button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display:"none" }} />
        </div>
      </div>

      {/* META EDITOR */}
      {showMeta&&(
        <div style={{ background:C.bg2, borderBottom:`1px solid ${C.border}`, padding:"10px 16px",
          display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end" }}>
          {["title","campaign","system"].map(k=>(
            <label key={k} style={{ display:"flex", flexDirection:"column", gap:3 }}>
              <span style={{ fontSize:9, color:C.textD, textTransform:"uppercase" }}>{k}</span>
              <input value={world.meta[k]||""} onChange={e=>setWorld(w=>({...w,meta:{...w.meta,[k]:e.target.value}}))}
                style={{ ...iSt, width:170 }} />
            </label>
          ))}
          <button style={{ ...bSt(C.bg3), marginBottom:0 }} onClick={()=>setShowMeta(false)}>Done</button>
        </div>
      )}

      {/* TABS */}
      <div style={{ background:"#090d17", borderBottom:`1px solid ${C.border}`, display:"flex",
        gap:1, padding:"5px 12px", overflowX:"auto" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            ...bSt(tab===t.id?"#1e3a5f":"transparent"),
            border:tab===t.id?`1px solid ${C.borderB}`:"1px solid transparent",
            color:tab===t.id?"#93c5fd":C.textD, whiteSpace:"nowrap",
            fontSize:11, letterSpacing:"0.06em"
          }}>{t.label}</button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex:1, overflow:"auto", padding:"14px 16px",
        paddingRight:inspector?"316px":"16px" }}>

        {/* ══ OVERVIEW ══ */}
        {tab==="overview"&&(
          <div>
            <SH>World State</SH>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:8, marginBottom:18 }}>
              <StatCard label="Total Entities" value={stats.total} />
              {world.factions.map(f=>(
                <StatCard key={f.id} label={f.name} value={stats.byF[f.id]||0} accent={f.color} sub={f.desc} />
              ))}
              <StatCard label="Wounded" value={stats.wounded} accent="#f59e0b" />
              <StatCard label="Exiled"  value={stats.exiled}  accent="#ef4444" />
              <StatCard label="Dead"    value={stats.dead}    accent="#6b7280" />
              <StatCard label="Alliances" value={stats.allies} accent="#34d399" />
              <StatCard label="Rivalries" value={stats.rivals} accent="#f87171" />
            </div>

            {world.factions.length>0&&(
              <>
                <SH>Faction Cohesion</SH>
                {world.factions.map(f=>{
                  const m=world.characters.filter(c=>c.faction===f.id);
                  const a=m.filter(c=>c.status==="active").length;
                  const pct=m.length?Math.round(a/m.length*100):0;
                  return (
                    <div key={f.id} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:C.textM, marginBottom:3 }}>
                        <span style={{ color:f.color }}>{f.name}</span>
                        <span>{a}/{m.length} active · {pct}%</span>
                      </div>
                      <div style={{ background:C.bg3, borderRadius:3, height:5 }}>
                        <div style={{ width:`${pct}%`, height:"100%", background:f.color, borderRadius:3, transition:"width 0.5s" }} />
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {world.characters.filter(c=>c.status==="wounded"||c.status==="exiled"||c.status==="dead").length>0&&(
              <>
                <SH s={{ marginTop:18 }}>Needs Attention</SH>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {world.characters.filter(c=>["wounded","exiled","dead"].includes(c.status)).map(c=>{
                    const sc=STATUS_COLOR[c.status]||"#888";
                    return (
                      <div key={c.id} onClick={()=>setInspector(c)} style={{ background:C.bg1,
                        border:`1px solid ${sc}44`, borderLeft:`3px solid ${sc}`,
                        borderRadius:6, padding:"8px 12px", cursor:"pointer",
                        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <span style={{ fontSize:12, color:"#f8fafc", marginRight:8 }}>{c.name}</span>
                          <span style={{ fontSize:10, color:fCol(world.factions,c.faction) }}>{fName(world.factions,c.faction)}</span>
                        </div>
                        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                          <span style={{ fontSize:10, color:C.textD }}>{c.hp}/{c.maxHp} HP</span>
                          <span style={{ fontSize:9, color:sc, background:`${sc}22`, padding:"2px 6px", borderRadius:3 }}>{c.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {world.factions.length===0&&world.characters.length===0&&(
              <div style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:8, padding:"30px 20px", textAlign:"center", color:C.textD, fontSize:12, marginTop:20 }}>
                <div style={{ fontSize:24, marginBottom:10 }}>⬡</div>
                <div style={{ marginBottom:6 }}>This world is empty.</div>
                <div style={{ fontSize:10 }}>Use <strong style={{ color:C.textM }}>⬟ Factions</strong> to add factions, then <strong style={{ color:C.textM }}>◈ Characters</strong> to populate it.</div>
                <div style={{ fontSize:10, marginTop:4 }}>Or use <strong style={{ color:C.textM }}>↑ Import</strong> to load a saved world.</div>
              </div>
            )}
          </div>
        )}

        {/* ══ NETWORK ══ */}
        {tab==="network"&&(
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <SH s={{ margin:0 }}>Relationship Network</SH>
              <div style={{ flex:1 }} />
              <button style={bSt(C.bg3)} onClick={()=>setShowRelMgr(true)}>⇌ Edit Relations</button>
            </div>
            <div style={{ fontSize:10, color:C.textD, marginBottom:10, display:"flex", gap:14, flexWrap:"wrap" }}>
              {Object.entries(REL_COL).map(([t,c])=>(
                <span key={t} style={{ color:c }}>{t==="rival"?"╌╌":"━━"} {t}</span>
              ))}
              <span>· Click node to inspect</span>
            </div>
            <div style={{ position:"relative", background:"#060a12", border:`1px solid ${C.border}`,
              borderRadius:8, height:500, overflow:"hidden" }}>
              <svg width="100%" height="100%" viewBox="0 0 680 500" style={{ position:"absolute", inset:0 }}>
                <defs>
                  <marker id="marrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </marker>
                </defs>
                {world.relations.map((r,i)=>{
                  const a=netPos[r.from],b=netPos[r.to];
                  if(!a||!b) return null;
                  const col=REL_COL[r.type]||C.textM;
                  return (
                    <line key={r.id||i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke={col} strokeWidth={0.6+(r.strength||1)*0.35}
                      strokeDasharray={r.type==="rival"?"5 4":r.type==="neutral"?"2 3":""}
                      opacity={0.55} markerEnd="url(#marrow)" />
                  );
                })}
                {world.characters.map(c=>{
                  const p=netPos[c.id]; if(!p) return null;
                  const col=fCol(world.factions,c.faction);
                  const sel=inspector?.id===c.id;
                  return (
                    <g key={c.id} onClick={()=>setInspector(c)} style={{ cursor:"pointer" }}>
                      <circle cx={p.x} cy={p.y} r={sel?22:16} fill={col} fillOpacity={sel?0.3:0.18} stroke={col} strokeWidth={sel?2:0.8} />
                      <circle cx={p.x} cy={p.y} r={5} fill={STATUS_COLOR[c.status]||"#888"} stroke={col} strokeWidth={0.5} />
                      <text x={p.x} y={p.y-20} textAnchor="middle" fontSize={10} fill={col} style={{ fontFamily:C.mono }}>{c.name}</text>
                    </g>
                  );
                })}
              </svg>
              {world.characters.length===0&&(
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                  color:C.textD, fontSize:12 }}>No characters yet. Add some in the Characters tab.</div>
              )}
            </div>
          </div>
        )}

        {/* ══ CHARACTERS ══ */}
        {tab==="characters"&&(
          <div>
            <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap", alignItems:"center" }}>
              <SH s={{ margin:0 }}>Characters ({filtered.length}/{world.characters.length})</SH>
              <div style={{ flex:1 }} />
              <input placeholder="🔍 Search..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                style={{ ...iSt, width:130 }} />
              <select value={factionFilter} onChange={e=>setFactionFilter(e.target.value)} style={sSt}>
                <option value="all">All Factions</option>
                {world.factions.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={sSt}>
                <option value="all">All Status</option>
                {STATUS_OPTS.map(s=><option key={s}>{s}</option>)}
              </select>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={sSt}>
                <option value="order">Manual Order</option>
                <option value="name">Name A–Z</option>
                <option value="faction">Faction</option>
                <option value="status">Status</option>
                <option value="hp">HP High→Low</option>
              </select>
              <button style={bSt(C.bg3)} onClick={()=>setCharView(v=>v==="grid"?"list":"grid")}>
                {charView==="grid"?"≡ List":"⊞ Grid"}
              </button>
              <button style={bSt("#14532d")} onClick={()=>setAddChar(true)}>+ Add</button>
            </div>
            {sortBy==="order"&&<div style={{ fontSize:9, color:C.textD, marginBottom:8 }}>⠿ Drag cards to reorder manually</div>}
            <div style={charView==="grid"
              ?{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(265px,1fr))", gap:10 }
              :{ display:"flex", flexDirection:"column", gap:6 }}>
              {filtered.map((c,idx)=>{
                const origIdx = charsByOrder.findIndex(x=>x.id===c.id);
                return (
                  <CharCard key={c.id} char={c} factions={world.factions} customFields={world.customFields||[]}
                    onSelect={()=>setInspector(c)}
                    onEdit={()=>setEditChar(c)}
                    onDelta={d=>updateChar(c.id,{hp:Math.max(0,Math.min(c.maxHp,c.hp+d))})}
                    onDelete={()=>{ if(confirm(`Delete ${c.name}?`)) deleteChar(c.id); }}
                    dragH={sortBy==="order"?charDrag(origIdx):null}
                  />
                );
              })}
              {filtered.length===0&&(
                <div style={{ color:C.textD, fontSize:12, padding:30, textAlign:"center" }}>No characters match filters.</div>
              )}
            </div>
          </div>
        )}

        {/* ══ FACTIONS ══ */}
        {tab==="factions"&&(
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <SH s={{ margin:0 }}>Factions</SH>
              <div style={{ flex:1 }} />
              <button style={bSt("#14532d")} onClick={()=>setShowFactionMgr(true)}>⬟ Edit Factions</button>
            </div>
            {world.factions.length===0&&(
              <div style={{ color:C.textD, fontSize:12, padding:"20px 0" }}>
                No factions defined. Click "Edit Factions" to create them.<br/>
                <span style={{ fontSize:10 }}>Factions can be anything: guilds, families, nations, species, ideological groups.</span>
              </div>
            )}
            {world.factions.map(f=>{
              const members=world.characters.filter(c=>c.faction===f.id);
              const byStatus={};
              STATUS_OPTS.forEach(s=>{ byStatus[s]=members.filter(c=>c.status===s).length; });
              return (
                <div key={f.id} style={{ background:C.bg1, border:`1px solid ${f.color}44`,
                  borderLeft:`4px solid ${f.color}`, borderRadius:8, padding:"14px 16px", marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:16, fontWeight:"bold", color:f.color }}>{f.name}</div>
                      <div style={{ fontSize:11, color:C.textM, marginTop:2 }}>{f.desc||"—"}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:22, fontWeight:"bold", color:f.color }}>{members.length}</div>
                      <div style={{ fontSize:9, color:C.textD }}>members</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                    {STATUS_OPTS.filter(s=>byStatus[s]>0).map(s=>(
                      <span key={s} style={{ fontSize:10, padding:"2px 7px",
                        background:`${STATUS_COLOR[s]}18`, color:STATUS_COLOR[s],
                        border:`1px solid ${STATUS_COLOR[s]}33`, borderRadius:4 }}>
                        {byStatus[s]} {s}
                      </span>
                    ))}
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {members.map(c=>(
                      <span key={c.id} onClick={()=>{ setInspector(c); setTab("characters"); }}
                        style={{ fontSize:10, padding:"3px 8px", background:`${f.color}18`,
                          color:f.color, border:`1px solid ${f.color}33`, borderRadius:4, cursor:"pointer" }}>
                        {c.name}
                        <span style={{ marginLeft:4, color:STATUS_COLOR[c.status]||"#888", fontSize:8 }}>●</span>
                      </span>
                    ))}
                    {members.length===0&&<span style={{ fontSize:10, color:C.textD }}>No members assigned.</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ TIMELINE ══ */}
        {tab==="timeline"&&(
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <SH s={{ margin:0 }}>Timeline</SH>
              <div style={{ flex:1 }} />
              <label style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, color:C.textM, cursor:"pointer" }}>
                <input type="checkbox" checked={secretsOn} onChange={e=>setSecretsOn(e.target.checked)} />
                Show hidden events
              </label>
              <button style={bSt("#14532d")} onClick={()=>setAddTimeline(true)}>+ Add Event</button>
            </div>
            <div style={{ fontSize:9, color:C.textD, marginBottom:10 }}>⠿ Drag events to reorder chronology</div>
            <div style={{ position:"relative", paddingLeft:22 }}>
              <div style={{ position:"absolute", left:6, top:0, bottom:0, width:1, background:C.border }} />
              {sortedTimeline.filter(e=>secretsOn||!e.hidden).map((e,idx)=>(
                <div key={e.id} {...tlDrag(sortedTimeline.indexOf(e))}
                  style={{ position:"relative", marginBottom:11, cursor:"grab" }}>
                  <div style={{ position:"absolute", left:-20, top:9, width:10, height:10, borderRadius:"50%",
                    background:e.hidden?"#ef4444":"#3b82f6", border:`1px solid ${C.border}` }} />
                  <div style={{ background:e.hidden?"#160a0a":C.bg1,
                    border:`1px solid ${e.hidden?"#3f1515":C.border}`, borderRadius:6, padding:"9px 12px" }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4, flexWrap:"wrap" }}>
                      <span style={{ fontSize:10, color:"#3b82f6", fontWeight:"bold" }}>{e.year}</span>
                      <span style={{ fontSize:9, padding:"1px 5px", borderRadius:3,
                        background:e.hidden?"#3f1515":"#1e3a5f",
                        color:e.hidden?"#fca5a5":"#93c5fd" }}>{e.label}{e.hidden?" · HIDDEN":""}</span>
                      <div style={{ flex:1 }} />
                      <button style={mBt} onClick={()=>setEditTimeline(e)}>Edit</button>
                      <button style={{ ...mBt, color:"#f87171" }} onClick={()=>uw(w=>({timeline:w.timeline.filter(t=>t.id!==e.id)}))}>✕</button>
                    </div>
                    <div style={{ fontSize:12, color:e.hidden?"#fca5a5":"#cbd5e1" }}>{e.text}</div>
                  </div>
                </div>
              ))}
              {sortedTimeline.filter(e=>secretsOn||!e.hidden).length===0&&(
                <div style={{ color:C.textD, fontSize:12, padding:"20px 0" }}>No timeline events. Add one to start.</div>
              )}
            </div>
          </div>
        )}

        {/* ══ SECRETS ══ */}
        {tab==="secrets"&&(
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <SH s={{ margin:0 }}>DM Secrets Layer</SH>
              <div style={{ flex:1 }} />
              <button style={bSt(secretsOn?"#3f1515":C.bg3)} onClick={()=>setSecretsOn(r=>!r)}>
                {secretsOn?"⊛ Lock":"⊙ Reveal"}
              </button>
              <button style={bSt("#14532d")} onClick={()=>setAddSecret(true)}>+ Add Secret</button>
            </div>
            {!secretsOn?(
              <div style={{ background:C.bg1, border:"1px solid #3f1515", borderRadius:8,
                padding:"50px 20px", textAlign:"center", color:C.textD, fontSize:12 }}>
                <div style={{ fontSize:28, marginBottom:10 }}>⊛</div>
                <div>Secrets locked. Click Reveal to access the DM narrative layer.</div>
                <div style={{ fontSize:10, marginTop:6 }}>{world.secrets.length} secret{world.secrets.length!==1?"s":""} stored.</div>
              </div>
            ):(
              <>
                <div style={{ fontSize:9, color:C.textD, marginBottom:10 }}>⠿ Drag cards to reorder</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(285px,1fr))", gap:10 }}>
                  {sortedSecrets.map((s,idx)=>(
                    <SecretCard key={s.id} secret={s}
                      dragH={secDrag(idx)}
                      onDelete={()=>uw(w=>({secrets:w.secrets.filter(x=>x.id!==s.id)}))}
                      onUpdate={patch=>uw(w=>({secrets:w.secrets.map(x=>x.id===s.id?{...x,...patch}:x)}))}
                    />
                  ))}
                  {sortedSecrets.length===0&&(
                    <div style={{ color:C.textD, fontSize:12, padding:"20px 0" }}>No secrets stored.</div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ SESSION ══ */}
        {tab==="session"&&(
          <div>
            <SH>Session Log</SH>
            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              <textarea value={sessionText} onChange={e=>setSessionText(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter"&&e.ctrlKey) addNote(); }}
                placeholder="Session note, plot beat, DM reminder, player action result... (Ctrl+Enter to save)"
                rows={3} style={{ ...iSt, flex:1, resize:"vertical" }} />
              <button style={{ ...bSt("#14532d"), alignSelf:"flex-end" }} onClick={addNote}>Save</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {[...(world.sessionNotes||[])].reverse().map(n=>(
                <div key={n.id} style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:6, padding:"9px 12px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:9, color:C.textD }}>{n.ts}</span>
                    <button style={{ ...mBt, color:"#f87171" }}
                      onClick={()=>uw(w=>({sessionNotes:(w.sessionNotes||[]).filter(x=>x.id!==n.id)}))}>✕</button>
                  </div>
                  <div style={{ fontSize:12, color:"#cbd5e1", whiteSpace:"pre-wrap" }}>{n.text}</div>
                </div>
              ))}
              {(world.sessionNotes||[]).length===0&&(
                <div style={{ color:C.textD, fontSize:12, textAlign:"center", padding:30 }}>No session notes yet.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* INSPECTOR PANEL */}
      {inspector&&(
        <Inspector char={inspector} world={world} secretsOn={secretsOn}
          onClose={()=>setInspector(null)}
          onEdit={()=>setEditChar(inspector)}
          onUpdate={patch=>updateChar(inspector.id,patch)}
        />
      )}

      {/* MODALS */}
      {showFactionMgr&&(
        <FactionManager factions={world.factions}
          onSave={list=>{ uw(()=>({factions:list})); setShowFactionMgr(false); }}
          onClose={()=>setShowFactionMgr(false)} />
      )}
      {showFieldMgr&&(
        <FieldsManager fields={world.customFields||[]}
          onSave={list=>{ uw(()=>({customFields:list})); setShowFieldMgr(false); }}
          onClose={()=>setShowFieldMgr(false)} />
      )}
      {showRelMgr&&(
        <RelationManager relations={world.relations} characters={world.characters}
          onSave={list=>{ uw(()=>({relations:list})); setShowRelMgr(false); }}
          onClose={()=>setShowRelMgr(false)} />
      )}
      {addChar&&(
        <Modal title="Add Character" onClose={()=>setAddChar(false)} wide>
          <CharForm factions={world.factions} customFields={world.customFields||[]} label="Add Character"
            onSubmit={d=>{ uw(w=>({characters:[...w.characters,{id:genId(),order:w.characters.length,custom:{},...d}]})); setAddChar(false); }}
            onCancel={()=>setAddChar(false)} />
        </Modal>
      )}
      {editChar&&(
        <Modal title={`Edit: ${editChar.name}`} onClose={()=>setEditChar(null)} wide>
          <CharForm init={editChar} factions={world.factions} customFields={world.customFields||[]} label="Save Changes"
            onSubmit={patch=>{ updateChar(editChar.id,patch); setEditChar(null); }}
            onCancel={()=>setEditChar(null)} />
        </Modal>
      )}
      {addTimeline&&(
        <Modal title="Add Timeline Event" onClose={()=>setAddTimeline(false)}>
          <TimelineForm
            onSubmit={d=>{ uw(w=>({timeline:[...w.timeline,{id:genId(),order:w.timeline.length,...d}]})); setAddTimeline(false); }}
            onCancel={()=>setAddTimeline(false)} />
        </Modal>
      )}
      {editTimeline&&(
        <Modal title="Edit Timeline Event" onClose={()=>setEditTimeline(null)}>
          <TimelineForm init={editTimeline}
            onSubmit={patch=>{ uw(w=>({timeline:w.timeline.map(t=>t.id===editTimeline.id?{...t,...patch}:t)})); setEditTimeline(null); }}
            onCancel={()=>setEditTimeline(null)} />
        </Modal>
      )}
      {addSecret&&(
        <Modal title="Add Secret" onClose={()=>setAddSecret(false)}>
          <AddSecretForm
            onSubmit={d=>{ uw(w=>({secrets:[...w.secrets,{id:genId(),order:w.secrets.length,...d}]})); setAddSecret(false); }}
            onCancel={()=>setAddSecret(false)} />
        </Modal>
      )}
    </div>
  );
}