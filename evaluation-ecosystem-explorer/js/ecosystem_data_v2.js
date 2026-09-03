// Ecosystem context page — data, v2 (merged-figure design).
//
// STRUCTURE
//   fig        — VERBATIM port of the paper Figure 1 source (the JSX mockup).
//                To update after a Fig-1 iteration: copy ACTORS / EDGES / FAM /
//                FAM_LABEL / geometry constants straight from the JSX. Nothing
//                else in this file needs to change.
//   palette    — warm site theme; overrides fig colors at render time.
//   stations   — grey on-ring actors NOT modeled in the paper. No edges, no
//                family color, ever. Grey = "real, but outside the modeled core."
//   rails      — pointers to whole adjacent ECOSYSTEMS (not single actors).
//                Placement deferred until the merged layout is visible.
//   panes      — click-to-open detail content, keyed by actor/station/rail id.
//                Org entries: string, or {t: display, k: key|[keys]}. Entries
//                sharing a key highlight together (multi-role tracing).
//   keys       — registry of named multi-role entities/groups, for narration.
//   spotlights — named subsets of stations+edges. Exactly one active at a time.
//                kind "self" (our paper, DEFAULT ON LOAD) | "loop" | "paper".
//
// PAPER INCLUSION BAR: an external paper earns a spotlight only if it STUDIES
// an interaction between >=2 depicted actors — merely mentioning them does not
// qualify. fit: "strong" | "approx" (approx renders an asterisk + note).
// Every entry carries `why`, a one-line justification of the mapping.

window.ECOSYSTEM = {

  // ---- FIGURE DATA (verbatim from ecosystem_full_wide_v2.jsx) --------------
  fig: {
    FAM: { scores: "#0369a1", events: "#15803d", capital: "#C2600A" },
    FAM_LABEL: { scores: "Benchmark scores", events: "Safety", capital: "Capital" },

    ACTORS: {
      regulator: { name: "Regulator", color: "#4B1A7A", ang: 0,   sub: "agencies · standards bodies",         role: "oversee & intervene" },
      media:     { name: "Media",     color: "#005A8B", ang: 60,  sub: "tech press · social platforms",        role: "cover & amplify" },
      consumers: { name: "Consumers", color: "#1A6B3A", ang: 120, sub: "individuals · enterprises",            role: "adopt & switch" },
      providers: { name: "Model Providers", color: "#1A2F5A", ang: 180, sub: "open-source · big-tech · frontier", role: "build capability; invest in R&D, safety" },
      // name deliberately diverges from the JSX ("Evaluator"): YD ruled plural
      // 2026-08-04 — keep "Evaluators" when re-porting until the JSX catches up
      evaluator: { name: "Evaluators", color: "#8B1A1A", ang: 240, sub: "benchmarks · audits",                 role: "measure & rank" },
      funders:   { name: "Funders",   color: "#8B4A00", ang: 300, sub: "VC · corporate · philanthropic",       role: "allocate capital" }
    },

    // dim = softer institutional/reputational channel (lower salience).
    // lx, ly = solved label centre (baked output of the de-collision pass).
    // Site-side divergences from the JSX (grey stations are obstacles here):
    // coverage-drives-scrutiny ly 168->186, switch-on-quality ly 517->508,
    // target-benchmarks ly 497->485. Re-solve properly when Fig 1 finalizes.
    EDGES: [
      { from: "providers", to: "consumers", fam: "events",  label: "safety gaps\nraise incidents",       lx: 770, ly: 468 },
      { from: "consumers", to: "media",     fam: "events",  label: "incidents garner\ncoverage",          lx: 915, ly: 338 },
      { from: "media",     to: "regulator", fam: "events",  label: "coverage drives\nscrutiny",           lx: 790, ly: 204, dim: true },
      { from: "regulator", to: "providers", fam: "events",  label: "encourage safety\nand transparency",  lx: 616, ly: 429, dim: true },
      // Relabeled 2026-08-08: the implemented mechanism is public_comms
      // (regulator.py:230) plus mandated reporting; "lobbying" alone asserted
      // the opposite posture from most of what the channel carries.
      { from: "providers", to: "regulator", fam: "events",  label: "disclosure, reporting\n& lobbying",   lx: 577, ly: 302, dim: true },
      { from: "providers", to: "media",     fam: "events",  label: "marketing",                           lx: 789, ly: 331, dim: true },
      // "quality/cost" since 2026-08-09 (YD): switching runs on satisfaction,
      // which includes the cost bonus (consumer.py cost_sensitivity x
      // cost_advantage), so quality alone undersold the implemented channel.
      { from: "consumers", to: "providers", fam: "scores",  label: "switch on\nquality/cost",             lx: 782, ly: 502 },
      { from: "providers", to: "evaluator", fam: "scores",  label: "target\nbenchmarks",                  lx: 416, ly: 495 },
      { from: "evaluator", to: "media",     fam: "scores",  label: "scores feed\nheadlines",              lx: 756, ly: 299 },
      { from: "media",     to: "consumers", fam: "scores",  label: "amplifies\nscore changes",            lx: 963, ly: 297 },
      { from: "evaluator", to: "providers", fam: "scores",  label: "scores shape R&D",                    lx: 431, ly: 456 },
      { from: "funders",   to: "providers", fam: "capital", label: "capital scales\nR&D",                 lx: 490, ly: 394 },
      { from: "providers", to: "funders",   fam: "capital", label: "traction signals\nvalue",             lx: 379, ly: 372 },
      { from: "media",     to: "funders",   fam: "capital", label: "coverage shapes\nfunding",            lx: 658, ly: 214, dim: true },
      { from: "funders",   to: "evaluator", fam: "capital", label: "funding &\nsponsorship",              lx: 257, ly: 342 },
      { from: "evaluator", to: "regulator", fam: "events",  label: "evidence for\noversight",             lx: 445, ly: 261, dim: true },
      // ---- Added 2026-08-08: implemented-but-undrawn mechanisms (correctness
      // audit). Each cites the code that implements it.
      // consumer.py:499 — leaderboard trust blends published scores into
      // expected quality; the figure previously routed this only via media.
      { from: "evaluator", to: "consumers", fam: "scores",  label: "benchmarks inform\nadoption",         lx: 658, ly: 466 },
      // model_provider.py:671 — providers read coverage and sentiment when
      // planning; previously no media->providers edge existed.
      { from: "media",     to: "providers", fam: "events",  label: "coverage informs\nroadmaps",          lx: 766, ly: 418, dim: true },
      // Relabeled 2026-08-17 (YD): "sanctions chill funding" hardcoded one sign
      // on a channel that carries both. TWO mechanisms sit behind this edge:
      // (1) simulation.py:1998-2008 — an active sanction multiplies the target's
      //     funder allocation by 0.90 for four rounds. Negative, sanction-only.
      // (2) funder.py:680-685 — recent interventions and active regulations are
      //     passed into the funder's decision context with NO fixed sign, so an
      //     LLM funder can read policy as reassurance or as risk.
      // The label names the channel, not the sign, which (2) leaves open.
      { from: "regulator", to: "funders",   fam: "capital", label: "policy signals\nsteer capital",       lx: 442, ly: 196, dim: true },
      // NOT drawn: (1) the direct incidents->regulator information channel
      // (simulation.py:1492-1495) — incidents are not a node, and the events
      // family already carries incident propagation. (2) regulator->consumers
      // deployer-liability guidance (simulation.py:1509-1511, raises adoption
      // friction for open-source providers) — implemented, but DEMOTED from
      // the figure 2026-08-09 on YD review: the mechanic is sim-internal
      // detail without an obvious real-world analog at figure altitude, and
      // its label read as convoluted next to the other channels. Implemented
      // != figure-worthy. (3) funders->evaluator is live only under
      // evaluator_capture (simulation.py:191, evaluator.py:718).
    ],

    GEOM: { W: 1200, H: 700, CX: 600, CY: 340, RX: 380, RY: 175,
            NW: 178, NHt: 24, NHb: 30,
            CURVE_K: 0.17, CURVE_MIN: 28, CURVE_MAX: 100, CURVE_SIGN: 1 }
  },

  // ---- Warm site theme (overrides fig colors at render time) ---------------
  palette: {
    ink: "#2a1a0e", muted: "#a08868", cream: "#f0e6d3", panel: "#e8d9c2",
    accent: "#3d5a8a",
    actors: {
      providers: "#35507e", evaluator: "#8a2f2b", consumers: "#3f6b45",
      regulator: "#5c3a78", funders: "#9a5b1f", media: "#2f6b7e"
    },
    families: { scores: "#2f6b9e", events: "#3f7a47", capital: "#b05f14" },
    // Grey = the mark of "no modeled channel touches me". Stations never take
    // a family color; opacity is reserved for spotlight state.
    station: { border: "#8a8274", fill: "#eae2d2", text: "#57544a" }
  },

  // ---- Grey stations: on-ring, unmodeled actors ----------------------------
  // ang uses the same convention as fig.ACTORS (0 = top, clockwise).
  // The funders–regulator gap (ang ~330) is deliberately EMPTY: an empty gap
  // is honest; a full ring would claim the taxonomy is exhaustive.
  // neighbors: modeled actors this station plausibly transacts with — hover
  // glows them (no edges drawn: glow = related, never a claimed channel).
  stations: [
    { id: "oversight",   name: "Independent Oversight",              ang: 30,
      role: "audit & public pressure",
      neighbors: ["evaluator", "media", "regulator"],
      why: "audits benchmarks and leaderboards; findings feed coverage and regulatory pressure" },
    { id: "appdev",      name: "Application Developers",             ang: 150, dy: 10,
      role: "consume models; serve them onward",
      neighbors: ["providers", "consumers"],
      why: "consume models from providers; serve them onward to consumers" },
    { id: "dataworkers", name: "Data Suppliers", ang: 210,
      role: "human expertise, datasets, and RL environments",
      neighbors: ["providers", "evaluator"],
      why: "training data, expert trajectories and RL environments for providers; test items and red-teaming for evaluators" }
  ],

  // ---- Rails: adjacent ecosystems, drawn as two closed tinted panes below
  // the map (compute bottom-left, supply chain bottom-right — symmetric).
  // Indexing: compute follows Sastry et al. Fig. 10 (production -> provision ->
  // usage); supply chain follows Hopkins et al. Click a pane on the canvas to
  // see each paper's fuller chain (paneMap in `panes`).
  rails: [
    // neighbors: the modeled actors this zone actually docks to, mirroring the
    // dotted dock arrows drawn from it. Selecting a zone highlights only these
    // rather than leaving the whole ecosystem at full emphasis.
    { id: "compute",     title: "Compute Supply Chain",
      subtitle: "research: compute governance",
      flow: "chip production → data centers & cloud → training & inference",
      tag: "compute usage ≈ the model providers on this map",
      neighbors: ["providers", "funders"] },
    { id: "supplychain", title: "AI Supply Chain",
      subtitle: "models, data, and services form chains of their own",
      flow: "data & labeling → base models → applications → deployment",
      tag: "applications ≈ app developers · deployment ≈ enterprise consumers",
      // in flow order: data & labeling -> base models -> applications -> deployment.
      // dataworkers has no dock arrow (routing it would cross the Compute panel),
      // but it IS the chain's first stage, so it lights with the rest.
      neighbors: ["dataworkers", "providers", "appdev", "consumers"] }
  ],

  // ---- Pane content (click any station/actor/rail) -------------------------
  panes: {

    regulator: {
      private: ["intervention history", "per-lever cooldowns",
                "commitment - advisory - disclosure - audit - sanction ladder"],
      flavors: [
        { label: "supranational", orgs: [{ t: "EU AI Office", k: ["eu-ai-office", "state"] }] },
        { label: "national safety institutes", orgs: [{ t: "UK AISI", k: ["uk-aisi", "state"] }, { t: "US CAISI", k: ["us-caisi", "state"] }] },
        { label: "sub-national", orgs: ["California (SB53)", "state attorneys general"] },
        { label: "sectoral", orgs: ["FDA (medical AI)", "financial supervisors"] },
        { label: "standards bodies", orgs: ["NIST AI RMF", "ISO/IEC SC42", "CEN-CENELEC JTC21"] }
      ] },

    media: {
      private: ["per-provider attention", "narrative state"],
      flavors: [
        { label: "tech press", orgs: ["The Information", "TechCrunch"] },
        { label: "analysts & dashboards", orgs: [{ t: "Artificial Analysis", k: "artificial-analysis" }, "SemiAnalysis", { t: "Epoch AI dashboards", k: "epoch" }] },
        { label: "community", orgs: ["X / ML Twitter", "Hacker News", "r/LocalLLaMA"] },
        { label: "newsletters & commentators", orgs: ["independent analysts"] }
      ] },

    consumers: {
      private: ["running perceived quality", "behavioral archetype", "need weights"],
      flavors: [
        { label: "individuals", orgs: ["subscribers", "prosumers", "hobbyists"] },
        { label: "enterprises", orgs: ["hospitals", "law firms", "banks"] },
        { label: "public sector", orgs: [{ t: "government procurement", k: "state" }] }
      ] },

    providers: {
      private: ["portfolio (R&D / safety / product)", "inferred benchmark weights",
                "per-benchmark focus level", "consumer signal"],
      flavors: [
        { label: "frontier labs", orgs: [{ t: "OpenAI", k: "openai" }, "Anthropic", { t: "Google DeepMind", k: "google" }, "xAI"] },
        { label: "open-weight labs", orgs: ["Meta (Llama)", "DeepSeek", "Mistral", "Qwen (Alibaba)", { t: "EleutherAI", k: "eleutherai" }, "AI2 (OLMo)"] },
        { label: "specialized developers", orgs: ["Cohere", "Runway", "AI21"] },
        { label: "access intermediaries", orgs: ["OpenRouter", "Together AI", "Fireworks"] }
      ] },

    evaluator: {
      private: ["benchmark pool & privacy tiers", "intro & retirement schedule",
                "internal validity estimate"],
      // Evaluators alone get the two-axis matrix (function x institution).
      matrix: {
        cols: ["academic & nonprofit", "government", "for-profit & consortium", "internal to labs"],
        rows: [
          { label: "develop benchmarks", cells: [
            [{ t: "HELM (Stanford)", k: "helm" }, { t: "Epoch AI", k: "epoch" }, { t: "Laude Institute", k: "laude" }],
            [{ t: "UK AISI eval suites", k: ["uk-aisi", "state"] }],
            [{ t: "Scale (SEAL)", k: "scale" }, "Vals AI", "MLCommons (consortium)"],
            [{ t: "OpenAI (HealthBench)", k: "openai" }]
          ] },
          { label: "run evaluations", cells: [
            ["METR", "Apollo Research", { t: "Epoch AI", k: "epoch" }],
            [{ t: "UK AISI", k: ["uk-aisi", "state"] }, { t: "US CAISI", k: ["us-caisi", "state"] }],
            [{ t: "Scale", k: "scale" }, "Patronus AI", { t: "Artificial Analysis", k: "artificial-analysis" }],
            [{ note: "every provider, internally" }]
          ] },
          { label: "host & rank", cells: [
            [{ t: "LMArena (origin)", k: "lmarena" }],
            [],
            [{ t: "LMArena", k: "lmarena" }, "Open LLM Leaderboard (retired 2025)", { t: "Artificial Analysis", k: "artificial-analysis" }],
            []
          ] }
        ],
        strip: [ "infrastructure:", { t: "lm-eval-harness (EleutherAI)", k: "eleutherai" },
                 { t: "Inspect (UK AISI)", k: ["uk-aisi", "state"] }, { t: "HELM framework", k: "helm" },
                 { t: "Harbor (Laude)", k: "laude" }, "Braintrust", "LangSmith" ]
      } },

    funders: {
      private: ["VC / corporate / gov / foundation", "portfolio allocations",
                "capital pool", "cooldown status"],
      flavors: [
        { label: "venture capital", orgs: ["Felicis", "a16z", "Sequoia"] },
        { label: "corporate & strategic", orgs: [{ t: "Microsoft", k: "microsoft" }, { t: "Google", k: "google" }, { t: "Amazon", k: "amazon" }] },
        { label: "government", orgs: [{ t: "NSF", k: "state" }, { t: "DARPA", k: "state" }, { t: "EU Horizon", k: "state" }] },
        { label: "philanthropy", orgs: ["Schmidt Sciences", "Coefficient Giving", { t: "Laude Institute", k: "laude" }] }
      ] },

    oversight: {
      note: "acts on the ecosystem: contamination detection, leaderboard audits, public-interest pressure",
      flavors: [
        { label: "researchers & auditors",
          orgs: ["university labs", "EvalEval Coalition", "STAIR", "CITP", { t: "EleutherAI", k: "eleutherai" }] },
        { label: "advocacy & watchdogs",
          orgs: ["AlgorithmWatch", "AI Now Institute", "Mozilla"] }
      ] },

    appdev: {
      note: "consume models; serve them onward",
      flavors: [
        { label: "consumer apps", orgs: ["Perplexity", "Cursor"] },
        { label: "enterprise & horizontal", orgs: [{ t: "Microsoft Copilot", k: "microsoft" }, "Glean", "Sierra"] },
        { label: "vertical apps", orgs: ["Harvey (legal)", "Abridge (medical)", "Hebbia (finance)"] }
      ] },

    dataworkers: {
      note: "the human-data supply side: training and RL data for providers; test items and red-teaming for evaluators",
      flavors: [
        { label: "expert data markets", orgs: ["Mercor", "Surge AI", "Handshake"] },
        { label: "annotation & labeling", orgs: [{ t: "Scale", k: "scale" }, "MTurk"] },
        { label: "item writers & red-teamers", orgs: ["FrontierMath's mathematicians", "red-teamers"] }
      ] },

    compute: {
      note: "Compute access shapes what gets built, and what gets evaluated.",
      paperMap: {
        source: "the chain as drawn in Sastry et al. 2024 (Fig. 10)",
        note: "fabless designers, foundries, and OSATs, or integrated device manufacturers spanning all three; big tech firms span provision and usage",
        tiers: [
          { label: "Compute Production", items: "design → fabrication → assembly, testing & packaging",
            inputs: "EDA software & core IP · semiconductor manufacturing equipment · materials" },
          { label: "Compute Provision", items: "data center construction → data center operation",
            inputs: "land, cooling, IT infrastructure, networking · power, water, connectivity" },
          { label: "Compute Usage", items: "AI design, training, and enhancement",
            inputs: "algorithms · data", tag: "≈ the model providers on this map" },
          { label: "Deployment", items: "the trained AI model" }
        ] },
      flavors: [
        { label: "cloud platforms", orgs: [{ t: "Azure", k: "microsoft" }, { t: "Google Cloud", k: "google" }, { t: "AWS", k: "amazon" }] }
      ],
      chips: [ { t: "Sastry et al. 2024", href: "https://arxiv.org/abs/2402.08797" } ] },

    supplychain: {
      note: "Models, data, and services form supply chains of their own, with accountability questions we don't model.",
      paperMap: {
        source: "the chain as described in Hopkins et al. 2025",
        note: "in the paper these are many-to-many networks, not a line; accountability diffuses along the links",
        tiers: [
          { label: "Data & Inputs", items: "dataset providers · data labeling · human expertise",
            tag: "≈ expert contributors & data workers" },
          { label: "Base Models", items: "foundation-model developers",
            tag: "≈ the model providers on this map" },
          { label: "Access & Adaptation", items: "model hubs & APIs · fine-tuning · orchestration" },
          { label: "Applications", items: "AI products & services built on models",
            tag: "≈ application developers" },
          { label: "Deployment & Use", items: "deployers · end users · affected third parties",
            tag: "≈ enterprise & individual consumers" }
        ] },
      chips: [ { t: "Hopkins et al. 2025", href: "https://arxiv.org/abs/2504.20185" },
               { t: "EU AI Act Art. 25", href: "https://artificialintelligenceact.eu/article/25/" } ] }
  },

  // ---- Multi-role entity/group registry ------------------------------------
  // Keys appearing on >=2 entries get the underline + cross-highlight. Named
  // entries here get narration ("part of: the state — appears as regulator,
  // funder, consumer, evaluator"). Un-registered keys narrate from context.
  keys: {
    state: { label: "the state",
             note: "governments appear as regulator, funder, consumer, and evaluator; industrial policy lives in the overlap" }
  },

  // ---- Sim-internal (lives in prose, not on canvas) ------------------------
  sim: {
    groundTruth: ["capability vectors (6-dim)", "consumer satisfaction",
                  "benchmark dimension weights", "holdout dimension weights"]
  },

  // ---- Spotlights ----------------------------------------------------------
  // Exactly one active at a time; last action wins. Activating a spotlight
  // clears a pinned pane and vice versa.
  //
  // Subset semantics:
  //   actors      — station ids (modeled actors, grey stations, rails) at full
  //                 emphasis; everything else drops to ghost.
  //   edges       — optional; default = all modeled edges whose BOTH endpoints
  //                 are in `actors`. Give an explicit [from, to] list to narrow.
  //   extraEdges  — provenance-carrying dotted edges drawn ONLY while this
  //                 spotlight is active. The only way non-modeled edges appear.
  //   flavors     — optional {actorId: [flavor labels]}: paper maps to flavors,
  //                 not the whole box; narrated in the strip (approx cases).
  spotlights: [

    { id: "self", kind: "self", default: true,
      title: "AI Evaluation Ecosystem (this paper)",
      href: null, // TODO: link the paper once it is online
      chip: "the modeled ecosystem",
      caption: "six modeled actors, three interaction pathways, and three unmodeled neighbors in grey",
      actors: ["regulator", "media", "consumers", "providers", "evaluator", "funders"] },

    // The three pathway families double as spotlights (loop isolation).
    { id: "fam-scores",  kind: "loop", fam: "scores"  },
    { id: "fam-events",  kind: "loop", fam: "events"  },
    { id: "fam-capital", kind: "loop", fam: "capital" },

    { id: "laufer2026", kind: "paper", fit: "strong", featured: 4,
      title: "The backfiring effect of weak AI safety regulation",
      authors: "Laufer, Kleinberg & Heidari", year: 2026,
      href: "https://www.pnas.org/doi/10.1073/pnas.2509768123",
      why: "a regulator sets safety floors on a model developer and on the specialists who fine-tune its model; the developer can exploit floors imposed on the specialists, so weak regulation can backfire",
      method: "a three-stage game: a generalist develops a model, domain specialists fine-tune it, a regulator sets safety floors; solved for its equilibria",
      actors: ["regulator", "providers", "appdev"],
      // Regulation is EXOGENOUS, not a strategic third player: v2 deleted the footnote
      // that permitted the three-player reading. Both floors are modeled parameters
      // (thetaG, thetaD), so "regulate specialists too?" was wrong as an open question.
      // Provider lobbying is genuinely absent from the model.
      edgeQuotes: {
        "regulator>providers": { q: "The regulator first sets a minimum safety standard that applies to one or both players, with strict penalties for non-compliance.", ql: "Abstract", qk: "M" } },
      edges: [["regulator", "providers"]],
      extraEdges: [{ from: "providers", to: "appdev", label: "fine-tuned by specialists", q: "Next, domain specialists refine the AI for their specific use cases, updating the safety and performance levels and taking the product to market.", ql: "Abstract", qk: "M", bow: 55, lt: 0.79, ldx: 12, ldy: -21 },
                   { from: "regulator", to: "appdev", label: "safety floor on specialists", q: "This regulatory regime can be described using two parameters (\u03b8G, \u03b8D), representing the set of thresholds constraining the strategy space of G and D, respectively.", ql: "model setup", qk: "M", lt: 0.5, ldx: 0, ldy: 0 },
                   { from: "appdev", to: "providers", label: "free-riding and revenue split", q: "the generalist G is aware of the regulatory safety requirements imposed on domain-specialists, and can use it to her advantage", ql: "backfiring mechanism section", qk: "M", side: "in", bow: 48, lt: 0.24, ldx: -50, ldy: 10 }] },

    { id: "hardy2024", kind: "paper", fit: "strong",
      title: "More than Marketing? On the Information Value of AI Benchmarks for Practitioners",
      authors: "Hardy, Reuel et al.", year: 2024,
      href: "https://arxiv.org/abs/2412.05520",
      why: "interviews on whether public benchmark scores inform practitioners' decisions: they are read as a rough signal of relative performance, and rarely decide anything",
      method: "19 semi-structured interviews across research, product, and policy practitioners on whether benchmark scores inform their decisions",
      actors: ["evaluator", "providers", "consumers"],
      // Recheck pass 2026-08-09: two edges ADDED. (1) evaluator->consumers was
      // missing because this row predates the canonical edge; the paper's core
      // subject is that edge, and its measured answer (signal-but-not-decisive)
      // makes the edge honestly contested against atom2026's usage series.
      // (2) evaluator->providers added after a YD-prompted context check:
      // I-17 is an AI Team Lead in the RESEARCH sector (the pool spans
      // academic AND industry researchers, i.e. publishing labs), and Sec 5.1
      // states the mechanism for model developers directly. Safety-gap
      // channels remain unstudied.
      edgeQuotes: {
        "consumers>providers": { q: "They make minor code changes based on them. I've never seen someone launch or not launch, like, or do anything super critical based on a benchmark.", ql: "Sec 4.1.2, interviewee I-7", qk: "M" },
        "evaluator>consumers": { q: "we find that across these settings, participants use benchmarks as a signal of relative performance difference between models", ql: "Abstract; developed in Sec 4.1", qk: "M" },
        "evaluator>providers": { q: "Social influence may compel model developers to run benchmarks, but it does not necessarily drive model users to rely on these scores.", ql: "Sec 5.1", qk: "A" } },
      edges: [["consumers", "providers"], ["evaluator", "consumers"], ["evaluator", "providers"]] },

    { id: "guha2026", kind: "paper", fit: "strong", featured: 3,
      title: "There is no free benchmark: An institutional view of legal AI benchmarking",
      authors: "Guha, Zhang, Tsang, Manning, Nyarko & Ho", year: 2026,
      href: "https://www.pnas.org/doi/10.1073/pnas.2509757122",
      why: "asks who could credibly run benchmarks for legal AI: vendors would tilt them, purchasers would keep them private, academics lack access and money, and governments lack capacity",
      method: "institutional analysis (PNAS Perspective) of who could credibly run legal AI benchmarks: vendors, purchasers, academics, government",
      actors: ["providers", "evaluator", "regulator", "consumers", "appdev", "funders"],
      flavors: { consumers: ["enterprises", "individuals"], appdev: ["vertical apps"] },
      // Academics, the fourth candidate supplier, ARE the evaluator box in this ontology,
      // so they need no arrow into it. What their omission concealed was the funding
      // constraint, now drawn as funders->evaluator.
      // evaluator->consumers promoted to a canonical ref 2026-08-08 (the
      // canonical edge now exists; procurement is its enterprise flavor).
      edgeQuotes: {
        "providers>evaluator": { q: "Google used a nonstandard prompting technique to boost the reported performance of its Gemini model on the MMLU benchmark", ql: "Sec 1.1.3", qk: "M" },
        "funders>evaluator": { q: "Grants might be distributed to academic or nonprofit research entities, and fund either the creation of benchmarks or a benchmarking effort", ql: "Sec 3.3", qk: "A" },
        "evaluator>regulator": { q: "The absence of fine-grained performance information leaves policymakers little choice but to rely on such coarse proxies.", ql: "Sec 2.3", qk: "A" },
        "evaluator>consumers": { q: "illegibility also impedes responsible procurement of legal technology by law firms", ql: "Sec 2.3", qk: "A" } },
      edges: [["providers", "evaluator"], ["funders", "evaluator"], ["evaluator", "regulator"], ["evaluator", "consumers"]],
      // the paper's candidate benchmark suppliers, drawn INTO Evaluators
      extraEdges: [
        { from: "appdev",    to: "evaluator", label: "vendor-run benchmarks?", q: "Vendors might define tasks narrowly around areas where their systems perform well, choose sample distributions that accentuate their results", ql: "Sec 2.2.1", qk: "A", side: "in", bow: 60, lt: 0.56, ldx: -2, ldy: 10 },
        { from: "consumers", to: "evaluator", label: "purchaser-run benchmarks?", q: "Legal AI consumers would offer resources in terms of funding, and legal expertise in order to build the benchmarks and evaluate the outputs.", ql: "Sec 3.2", qk: "A", lt: 0.13, ldx: -5, ldy: -15 },
        { from: "regulator", to: "evaluator", label: "government-run benchmarks?", q: "Alternatively, benchmarking might be performed at the federal level, through NIST or another federal body.", ql: "Sec 2.2.4", qk: "A", lt: 0.55, ldx: 0, ldy: 0 }
      ] },

    { id: "hopkins2025", kind: "paper", fit: "strong",
      title: "AI Supply Chains: An Emerging Ecosystem of AI Actors, Products, and Services",
      authors: "Hopkins et al.", year: 2025,
      href: "https://arxiv.org/abs/2504.20185",
      why: "maps the chains of models, data, and services that link developers to deployers, and shows how information and design choices degrade as they pass down the chain",
      method: "a formal model of AI supply chains plus two synthetic-simulation case studies on explanation fidelity and fairness across the chain",
      actors: ["providers", "appdev", "consumers", "supplychain"],
      // the paper's two case studies: imperfect information passing along
      // chain links, and upstream design choices propagating downstream
      // dataworkers->providers REMOVED 2026-08-08: the word "worker" does not appear in
      // this paper at all, and the only supporting text is Sec 2.1 background prose. The
      // relabel below covers BOTH case studies, not just the fine-tuning one.
      // edges: [] is REQUIRED even when empty: without the key, spotEdgeOn falls
      // back to lighting every pair among `actors`, which lit two safety/market
      // channels this paper never studies, with no quote behind them.
      edges: [],
      extraEdges: [
        { from: "providers", to: "appdev", label: "explanations and choices propagate", q: "we show that AI supply chains hamper the ability of downstream developers to provide accurate explanations of their predictions", ql: "Sec 4", qk: "M", bow: 55, lt: 0.08, ldx: -17, ldy: 36 },
        { from: "appdev", to: "consumers", label: "explanations misdirect decision subjects", q: "if a decision subject seeks to change their outcome under an AI-driven decision, the supply-chain explanation points them in a different direction than an end-to-end explanation would, and this causes decision subjects to have to exert more effort than they would under the end-to-end explanation.", ql: "Sec 4.3 Results (synthetic simulation)", qk: "M", bow: 46, lt: 0.305, ldx: 0, ldy: 0 }
      ] },

    { id: "sastry2024", kind: "paper", fit: "strong",
      title: "Computing Power and the Governance of Artificial Intelligence",
      authors: "Sastry et al.", year: 2024,
      href: "https://arxiv.org/abs/2402.08797",
      why: "argues that compute is the input governments can actually govern: it is physical, countable, and concentrated, which gives regulators visibility, control over who gets it, and a means of enforcement",
      method: "policy analysis of compute as a governance lever (visibility, allocation, enforcement), grounded in EO 14110 and export controls",
      actors: ["providers", "regulator", "funders", "evaluator", "compute"],
      flavors: { funders: ["government"] },
      // Canonical edge 5 providers->regulator is labelled "lobbying", the opposite posture
      // from the EO's mandated reporting, so VISIBILITY is drawn as an extraEdge instead.
      // `evaluator` was a false negative in the first audit pass: audits gate compute
      // access and pair with reporting to give regulators assurance (Sec 4.A, 4.C).
      // providers->regulator promoted to a canonical ref 2026-08-08: the
      // canonical label now covers disclosure and reporting, which is the EO's
      // mandated posture.
      edgeQuotes: {
        "regulator>providers": { q: "Section 4 of this order leverages computational power as a criterion for classifying AI systems that warrant additional scrutiny due to potential safety and security concerns", ql: "Sec 2.C, on EO 14110", qk: "M" },
        "funders>providers": { q: "governments are investing in domestic compute capacity, controlling the flow of compute to competing countries, and subsidizing compute access to certain sectors", ql: "Abstract", qk: "M" },
        "providers>regulator": { q: "The new executive order mandates U.S. AI companies to proactively notify the government about any ongoing or planned activities concerning the training, development, or production of frontier models.", ql: "Sec 2.C", qk: "M" } },
      edges: [["regulator", "providers"], ["funders", "providers"], ["providers", "regulator"]],
      extraEdges: [
        { from: "compute",   to: "regulator", label: "cloud KYC on customers", q: "Requiring compute providers to institute \"Know Your Customer\" (KYC) requirements and report large compute usage to regulators can complement knowledge of the total quantities and ownership of compute", ql: "Sec 4.A", qk: "A", bow: 40, lt: 0.41, ldx: 0, ldy: 0 },
        { from: "evaluator", to: "regulator", label: "audits give regulators assurance", q: "If reporting mechanisms could eventually be made trustworthy ... and paired with other mechanisms such as external auditing, then a regulator could gain assurance", ql: "Sec 4.A", qk: "A", bow: 36, lt: 0.45, ldx: 0, ldy: 0 },
        { from: "evaluator", to: "providers", label: "audit results gate compute access", q: "an AI developer (building on the IaaS's compute) planning a large-scale deployment could be required to submit audit results of their AI model as a precondition for access", ql: "Sec 4.C", qk: "A", bow: 44, lt: 0.21, ldx: -15, ldy: 19 }
      ] },



    { id: "hardt2016", kind: "paper", fit: "approx",
      title: "Strategic Classification",
      authors: "Hardt, Megiddo, Papadimitriou & Wootters", year: 2016,
      href: "https://arxiv.org/abs/1506.06980",
      why: "the first formal model of gaming a published measure: people adapt to a classifier at some cost, and the designer chooses the classifier knowing they will",
      method: "a two-player game: a Jury commits to a classifier first, then a Contestant changes its inputs at a cost",
      note: "the adapting agents are individuals (loan applicants, spammers), not firms in an AI market; the measure-publisher and measured-agent structure transfers by analogy",
      actors: ["providers", "evaluator"],
      // Both directions ARE the Stackelberg model: the Jury publishes first, the
      // Contestant best-responds at a cost. Drawing neither made a paper that is nothing
      // but an edge pair render as two unconnected boxes.
      edgeQuotes: {
        "evaluator>providers": { q: "the first player (Jury) has the ability to commit to her strategy (a classifier f) before the second player (Contestant) responds", ql: "Sec 1.1", qk: "M" },
        "providers>evaluator": { q: "Before being classified, Contestant may change his input based on Jury's classifier. However, Contestant incurs a cost for these changes according to a cost function.", ql: "Sec 1", qk: "M" } },
      edges: [["evaluator", "providers"], ["providers", "evaluator"]] },

    { id: "perdomo2020", kind: "paper", fit: "strong",
      title: "Performative Prediction",
      authors: "Perdomo, Zrnic, Mendler-Dünner & Hardt", year: 2020,
      href: "https://arxiv.org/abs/2002.06673",
      why: "a deployed prediction changes the behavior it was predicting; the paper asks when repeatedly retraining on the shifted data settles down",
      method: "a formal framework in which the deployed model shifts the data distribution; repeated retraining analyzed for convergence",
      actors: ["providers", "consumers"],
      edges: [],
      extraEdges: [
        { from: "providers", to: "consumers", label: "deployment shifts the distribution", q: "When used to support consequential decisions, however, predictive models can trigger actions that influence the outcome they aim to predict. We call such predictions performative", ql: "Sec 1", qk: "M", lt: 0.495, ldx: -6, ldy: -23 },
        { from: "consumers", to: "providers", label: "shifted data feeds retraining", q: "In practice, the response to such distribution shifts is to frequently retrain the predictive model as more data becomes available.", ql: "Sec 1", qk: "M", side: "in", bow: 45, lt: 0.47, ldx: -3, ldy: -16 }
      ] },

    { id: "singh2025", kind: "paper", fit: "strong", featured: 2,
      title: "The Leaderboard Illusion",
      authors: "Singh et al.", year: 2025,
      href: "https://arxiv.org/abs/2504.20879",
      why: "audit of two million Chatbot Arena battles: large providers test many private variants and submit only the best, and receive a larger share of the battle data, both of which lift their rankings",
      method: "multi-method audit of Chatbot Arena: about 2M battles analyzed, private-variant testing measured, data-access experiments run",
      // Recheck pass 2026-08-09: consumers ADDED. The battle data providers get
      // preferential access to is consumer-generated; the crowd's votes are the
      // instrument, so omitting the supply side misled about the mechanism.
      actors: ["providers", "evaluator", "media", "consumers"],
      // `funders` and media->funders REMOVED 2026-08-08. A full-text search of the paper
      // (177k chars incl. footnotes, appendices, bibliography) found zero occurrences of
      // market, revenue, venture, valuation, monetiz, publicity or headline. The edge was
      // inferred from what leaderboards obviously do commercially, not from anything Singh
      // et al. measured. The one substantive funding sentence is generic ML-history prose
      // about benchmarks in general and is evaluator->funders, not media->funders.
      // NOTE on evaluator->media: it survives, but the word "media" occurs exactly once in
      // the whole paper, in the single sentence quoted for it. Weakest edge in this row.
      edgeQuotes: {
        "providers>evaluator": { q: "We establish that the ability of these providers to choose the best score leads to biased Arena scores due to selective disclosure of performance results.", ql: "Abstract", qk: "M" },
        "evaluator>media": { q: "Recently, Chatbot Arena has become the de facto standard for comparing generative AI models, holding enormous sway over media, the AI industry, and academia.", ql: "Sec 1", qk: "A" } },
      edges: [["providers", "evaluator"], ["evaluator", "media"]],
      // Canonical edge 11 is "scores shape R&D", which does not describe this. The
      // measured mechanism is privileged private testing plus a disproportionate share of
      // battle data, lifting ArenaHard win-rates from 23.5% to 49.9%.
      extraEdges: [
        { from: "evaluator", to: "providers", label: "preferential testing and data access", q: "Access to Chatbot Arena data has an outsized impact on performance.", ql: "Sec 1, findings item 3", qk: "M", side: "in", bow: 50, lt: 0.545, ldx: 7, ldy: -23 },
        { from: "consumers", to: "evaluator", label: "crowd votes are the instrument", q: "the main beneficiaries of this free human feedback appear to be commercial entities who are frequently preferred for private testing", ql: "Sec 4.1", qk: "M", lt: 0.4, ldx: 0, ldy: 0 }
      ] },

    { id: "raji2019", kind: "paper", fit: "strong", featured: 5,
      title: "Actionable Auditing: Investigating the Impact of Publicly Naming Biased Performance Results of Commercial AI Products",
      authors: "Raji & Buolamwini", year: 2019,
      href: "https://www.media.mit.edu/publications/actionable-auditing-investigating-the-impact-of-publicly-naming-biased-performance-results-of-commercial-ai-products/",
      hrefLabel: "open-access copy at the MIT Media Lab (AIES 2019)",
      why: "after Gender Shades publicly named accuracy disparities, press coverage pressured all three audited vendors into measurably narrowing them, while firms that were not named improved far less",
      method: "follow-up audit of Gender Shades: re-measures the three named vendors and non-targeted peers after public disclosure",
      note: "the named vs not-named comparison is not a before-and-after contrast for both groups: the paper states that the not-named firms' pre-audit performance is unknown",
      actors: ["oversight", "providers", "media", "regulator"],
      // Publicity is the paper's own explanation for why this audit worked where
      // non-public methods did not, and the measured corporate-response corpus is itself
      // press artifacts. There is no canonical media->providers edge, hence the extraEdge.
      // media->providers promoted to a canonical ref 2026-08-08 (the canonical
      // edge now exists; public naming pressuring vendors is exactly it).
      edgeQuotes: {
        "providers>media": { q: "This includes exclusively corporate blog posts and official press releases, with the exception of media published corporate statements, such as an op-ed by the Kairos CEO published in TechCrunch", ql: "Methods, corporate communications corpus", qk: "M" },
        "providers>regulator": { q: "Kairos, IBM and Microsoft all agree facial analysis technology should be restricted in certain contexts and demonstrate support for government regulation", ql: "Regulatory Communications", qk: "M" },
        "media>providers": { q: "By highlighting the issue of classification performance disparities and amplifying public awareness, the study was able to motivate companies to prioritize the issue", ql: "Conclusion", qk: "M" } },
      edges: [["providers", "media"], ["providers", "regulator"], ["media", "providers"]],
      extraEdges: [
        { from: "oversight", to: "providers", label: "audits shift vendor behavior", q: "the targeted audit in Gender Shades was much more effective in reducing disparities in target products than non-targeted systems", ql: "Differences between Target and Non-Target Companies", qk: "M", lt: 0.59, ldx: 0, ldy: 0 },
        { from: "oversight", to: "media",     label: "audit findings get coverage", q: "an article by Steve Lohr in the technology section of The New York Times is among the first public mentions of the study", ql: "Audit design, step 3", qk: "M", bow: 42, lt: 0.36, ldx: 0, ldy: 0 },
        { from: "oversight", to: "regulator", label: "audit evidence reaches lawmakers", q: "letters from Senator Kamala D. Harris to the EEOC, FBI and FTC regarding the use of facial recognition in law enforcement also directly reference the work", ql: "Regulatory Communications", qk: "M", bow: 38, lt: 0.9, ldx: -10, ldy: -22 }
      ] },


    { id: "gentzkow2006", kind: "paper", fit: "approx",
      title: "Media Bias and Reputation",
      authors: "Gentzkow & Shapiro", year: 2006,
      href: "https://doi.org/10.1086/499414",
      hrefLabel: "Journal of Political Economy 114(2), 2006",
      why: "news outlets slant toward what their audiences already believe, because confirming expectations builds a reputation for accuracy; hype becomes a built-in incentive rather than an accident",
      method: "a formal model of media slant: profit-maximizing outlets distort reports toward what consumers expect; reputation effects analyzed",
      note: "a general model of news markets, not AI-specific; the slanting mechanism transfers to tech coverage",
      actors: ["media", "consumers"],
      edges: [],
      // The media->consumers leg is the model's FOUNDATION, not a secondary effect:
      // remove the sale of a slanted report and there is no willingness to pay, no
      // reputation, and therefore no slanting incentive. Canonical edge 10 is labelled
      // "amplifies score changes", which does not describe this, so it is an extraEdge.
      extraEdges: [
        { from: "consumers", to: "media", label: "priors reward confirming coverage", q: "Our first set of results shows that firms will tend to distort information to make it conform with consumers' prior beliefs", ql: "Sec 1", qk: "M", lt: 0.16, ldx: 0, ldy: 0 },
        { from: "media", to: "consumers", label: "slanted reports move beliefs", q: "in all of these cases, different slants convey information to consumers about what the firm believes is the true state of the world", ql: "Sec 3", qk: "M", side: "in", bow: 44, lt: 0.16, ldx: 0, ldy: 0 }
      ] },


    { id: "raji2022", kind: "paper", fit: "approx", featured: 1,
      title: "Outsider Oversight: Designing a Third Party Audit Ecosystem for AI Governance",
      authors: "Raji, Xu, Honigsberg & Ho", year: 2022,
      href: "https://arxiv.org/abs/2206.04737",
      why: "compares AI auditing with audit regimes in financial, environmental, and health regulation: who selects, pays, accredits, and disciplines auditors decides whether third-party oversight constrains developers at all",
      method: "design analysis of the AI audit ecosystem against existing audit systems in financial services, environmental protection, telecommunications, transportation, and healthcare, cataloguing structural gaps",
      note: "written in 2022, before foundation models. Its audit targets are mostly deployers rather than labs, and the people filing complaints are affected non-users, whom the consumers box does not cleanly represent.",
      actors: ["oversight", "providers", "regulator", "consumers", "evaluator", "media"],
      // Zero canonical edges: every relationship this paper studies runs through the grey
      // oversight station. It supplies the INCOMING arrows that station previously lacked
      // (who pays, accredits, grants access), where Raji & Buolamwini 2019 supplies only
      // the outgoing one. The three providers->oversight channels the paper treats
      // separately (payment, access, disclosure control) are merged into one arrow here;
      // three arcs between the same pair would collide.
      edges: [],
      extraEdges: [
        { from: "providers",  to: "oversight", label: "auditee pays, gates, and gags auditors", q: "In short, auditors should ideally not be selected or paid directly by auditees.", ql: "Sec 4.2.1", qk: "A", bow: 58, lt: 0.63, ldx: 0, ldy: 0 },
        { from: "regulator",  to: "oversight", label: "public body selects and accredits", q: "there are significant benefits to a regulator (or third party accreditation body) choosing the auditor or using a central fund, instead of relying on direct payment from audit targets", ql: "Sec 4.2.2", qk: "A", bow: 46, lt: 0.91, ldx: 40, ldy: 24 },
        { from: "oversight",  to: "regulator", label: "audit registry alerts regulators", q: "This would also alert regulators directly of audit outcomes, and open communication channels between them and auditors.", ql: "Sec 4.5.2", qk: "A", side: "in", bow: 40, lt: 0.38, ldx: -48, ldy: -38 },
        { from: "oversight",  to: "providers", label: "disclosed findings force correction", q: "It can prevent companies from being able to disguise or hide undesirable audit outcomes (Engler, 2021) and incentivize better behavior.", ql: "Sec 4.5.1", qk: "A", side: "in", bow: 52, lt: 0.42, ldx: 0, ldy: 0 },
        { from: "consumers",  to: "oversight", label: "harm complaints set audit targets", q: "One analysis of investigated nursing home complaints, for example, found that the complaints predicted performance at subsequent inspections (Stevenson, 2006).", ql: "Sec 4.1.1", qk: "M", bow: 44, lt: 0.4, ldx: 0, ldy: 0 },
        { from: "media",      to: "oversight", label: "press escalation surfaces targets", q: "Current strategies for harm discovery in AI involve ad hoc processes of notice and reporting, limited to situations of harm raised and escalated in public forums such as social media or the press.", ql: "Sec 4.1.2", qk: "A", bow: 38, lt: 0.29, ldx: 15, ldy: -5 },
        { from: "oversight",  to: "evaluator", label: "audits correct and seed benchmarks", q: "For instance, IEEE P7013 Inclusion and Application Standards for Automated Facial Analysis Technology industry standard is directly informed by the Gender Shades audit.", ql: "Sec 4.5.2", qk: "A", bow: 50, lt: 0.555, ldx: 0, ldy: 0 }
      ] },

    { id: "epoch2026", kind: "paper", fit: "approx",
      title: "An FAQ on Reinforcement Learning Environments",
      authors: "Denain & Barber, Epoch AI", year: 2026,
      href: "https://epoch.ai/gradient-updates/state-of-rl-envs",
      why: "interviews with RL-environment vendors and labs: labs pay six to seven figures per quarter for training environments, with a 4-5x premium for exclusivity",
      method: "an FAQ built from 18 structured practitioner contributions (9 interviews, 9 written) on the RL-environments market",
      note: "Industry analysis, not peer reviewed. Most figures are sellers self-reporting their own order books, and environment vendors are software contractors as much as data labor.",
      actors: ["providers", "dataworkers", "evaluator"],
      // NOT drawn: dataworkers->evaluator. The piece confirms benchmarking-environment
      // orders exist but never says who places them, and every contextual signal (the
      // section heading "How are RL environments used by labs?", pricing described as
      // sold to labs, only lab-side buyers quoted) points to labs commissioning their own
      // internal evals. The evaluator link that IS supported runs the other way.
      // ALSO NOT drawn: providers->evaluator. Labs do train on benchmark-shaped
      // environments, but Epoch never frames this as targeting or contamination, and
      // canonical edge 8 is labelled "target benchmarks", which would assert more than
      // the source says.
      edges: [],
      extraEdges: [
        { from: "providers",   to: "dataworkers", label: "labs pay vendors for environments", q: "Environments and tasks can be sold exclusively to one customer or non-exclusively to multiple labs.", ql: "How much do environments and tasks cost?", qk: "A", bow: 54, lt: 0.115, ldx: 18, ldy: 26 },
        { from: "dataworkers", to: "providers",   label: "vendors staff task creation at scale", q: "if you need to scale up task creation quickly, they can staff a project faster than you could hire in-house", ql: "Which companies build RL Environments?", qk: "A", side: "in", bow: 44, lt: 0.46, ldx: -42, ldy: -12 },
        { from: "evaluator",   to: "dataworkers", label: "benchmarks template training environments", q: "They include environments based on prominent benchmarks, environments for interacting with MCP servers", ql: "What domains do RL environments cover?", qk: "M", bow: 40, lt: 0.22, ldx: 0, ldy: 0 }
      ] },

    { id: "erlei2025", kind: "paper", fit: "approx",
      title: "From Digital Distrust to Codified Honesty: Experimental Evidence on Generative AI in Credence Goods Markets",
      authors: "Erlei", year: 2025,
      href: "https://arxiv.org/abs/2509.06069",
      why: "lab experiments in markets where customers cannot judge the quality of what an expert sells them, with LLMs playing the experts; transparency rules decide whether the market works",
      method: "lab experiments with LLMs as the expert sellers: four mixes of human and AI experts, with transparency rules varied",
      note: "the LLMs are experimental participants, not the subject; what transfers is the one-shot expert market with no reputation",
      actors: ["providers", "consumers", "regulator"],
      // Liability, verifiability and transparency are MANIPULATED experimental treatments
      // with measured effects, not framing. The incident channel stays undrawn because
      // harm here is private and one-shot, never a public incident signal.
      edgeQuotes: {
        "consumers>providers": { q: "There are four experts competing over four consumers in a one-shot setting", ql: "Sec 3, The Decision Environment", qk: "M" },
        "regulator>providers": { q: "Human-AI-Human markets outperform Human-Human markets under transparency rules. With obfuscation, however, efficiency gains disappear, and adverse expert incentives remain", ql: "Abstract", qk: "M" } },
      edges: [["consumers", "providers"], ["regulator", "providers"]],
      extraEdges: [{ from: "providers", to: "consumers", label: "codified objectives disclosed", q: "Disclosing these preferences to consumers induces strong efficiency gains by marginalizing self-interested LLM experts and human experts", ql: "Abstract", qk: "M", bow: 40, lt: 0.415, ldx: 3, ldy: 16 }] },

    { id: "fmti2025", kind: "paper", fit: "strong",
      title: "The 2025 Foundation Model Transparency Index",
      authors: "Wan, Klyman, Kapoor et al.", year: 2025,
      href: "https://arxiv.org/abs/2512.10169",
      why: "third annual transparency scorecard of 13 developers on 100 indicators: the average score fell from 58 to 40, and companies shape their own scores by submitting reports and contesting results",
      method: "13 developers scored on 100 transparency indicators, third annual wave; 7 self-submitted reports and all 13 could contest scores",
      actors: ["providers", "evaluator", "regulator"],
      // Full read 2026-08-08. The canonical evaluator->providers label ("scores
      // shape R&D") does NOT fit: what the paper measures is the index eliciting
      // disclosure (16.6 new-info indicators after the 2024 edition; +9.71 points
      // mean during the 2025 response phase), hence the extraEdge. The CoP
      // finding is correlational only ("tend to score slightly higher", Sec 1),
      // hence the hedged extraEdge, not a canonical regulator->providers ref.
      // Validity: 7 self-submitting vs 6 public-info-only companies means
      // cross-company scores partly reflect willingness to engage; the 58->40
      // headline mixes roster composition with real regression (cleaner
      // within-company: Meta -29, OpenAI -14, Mistral -37). Undrawn: claimed
      // uptake by EU AI Act (asserted, not measured); "investors, media, and
      // the public rely on" the index (asserted with no adoption data).
      edgeQuotes: {
        "providers>evaluator": { q: "Companies were given one week to initially respond to scores, leading to many companies engaging in extensive email exchanges and scheduling virtual meetings", ql: "Sec 4.4", qk: "M" } },
      edges: [["providers", "evaluator"]],
      extraEdges: [
        { from: "evaluator", to: "providers", label: "index engagement elicits new disclosures", q: "companies made new information public in relation to 16.6 indicators on average", ql: "Sec 2, after the 2024 edition", qk: "M", bow: 44, lt: 0.8, ldx: 0, ldy: -40 },
        { from: "regulator", to: "providers", label: "CoP signatories score slightly higher", q: "Signatories of the European Union's AI Act Code of Practice tend to score slightly higher than non-signatories", ql: "Sec 1", qk: "M", side: "in", bow: 40, lt: 0.5, ldx: 0, ldy: 0 }
      ] },

    { id: "atom2026", kind: "paper", fit: "approx",
      title: "The ATOM Report: Measuring the Open Language Model Ecosystem",
      authors: "Lambert & Brand", year: 2026,
      href: "https://arxiv.org/abs/2604.07190",
      why: "tracks about 1,500 open models over time: Chinese open models took the performance lead in late 2024 and had overtaken US models on downloads, inference tokens, and derivative models by mid-2025",
      method: "tracking of about 1,500 open models over 28 months: downloads, inference tokens, derivative share, plus two performance series",
      note: "the lead came first, but the paper does not test whether it caused the adoption shift; the authors run the ATOM Project, a US open-model advocacy effort, and two of the usage series rest on privately shared data",
      actors: ["providers", "evaluator", "consumers", "appdev"],
      // Full read 2026-08-08 (v2). The paper's entire causal language is one
      // modal sentence: "a small lead in model performance can create a large
      // lead in adoption" (Sec 4). Only the downloads crossover is textually
      // dated (late July 2025); token and derivative crossovers are read off
      // figures. This row signs WITH evaluator->consumers where hardy2024
      // signs against: the edge is honestly contested between them, which is
      // why both rows stay. Undrawn: providers targeting benchmarks (never
      // studied; drawing it would import our thesis into their data),
      // regulator/funders/media (absent), consumers->evaluator Arena voting
      // (treated as exogenous). Downloads inflated by bots/CI per the authors;
      // ModelScope invisible, so Chinese domestic usage likely undercounted.
      edgeQuotes: {
        "evaluator>consumers": { q: "a small lead in model performance can create a large lead in adoption, as uses of open models by default opt for the best model", ql: "Sec 4", qk: "A" },
        "consumers>providers": { q: "Meta fell from a 37.4% peak in January 2025 to zero, replaced by DeepSeek (31.1%) and Xiaomi (27.2%) by January 2026", ql: "Fig 9 caption", qk: "M" } },
      edges: [["evaluator", "consumers"], ["consumers", "providers"]],
      extraEdges: [
        { from: "providers", to: "appdev", label: "derivatives built on base models", q: "China rose from 10% in November 2023 to 70% by February 2026, while the EU fell from a peak of 58% to 4%", ql: "Sec 3, Fig 3, derivative share", qk: "M", bow: 50, lt: 0.08, ldx: -14, ldy: 29 }
      ] },

    { id: "lyell2023", kind: "paper", fit: "approx",
      title: "More than algorithms: an analysis of safety events involving ML-enabled medical devices reported to the FDA",
      authors: "Lyell, Wang, Coiera & Magrabi", year: 2023,
      href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10280342/",
      hrefLabel: "free full text at PubMed Central (JAMIA 2023)",
      why: "266 safety events reported to the FDA from deployed ML medical devices: 16% caused actual harm, 82% involved problems getting data into the device, and problems in how a device was used were four times likelier to cause harm than device faults",
      method: "search of the FDA's adverse-event database (MAUDE) for 508 FDA-approved ML devices, Jan 2015 to Oct 2021; 266 events across 25 devices coded for consequence, problem type, and contributing factors",
      note: "medical devices only; a passive registry with known underreporting, and most reports are written by the manufacturers; it measures incidents in deployed devices, not how much the maker invested in safety",
      actors: ["providers", "consumers", "regulator"],
      // Full read 2026-08-09 (OUP full text + PMC; DOI 10.1093/jamia/ocad065).
      // Safety-spine anchor for providers->consumers: substantiates the edge's
      // ENDPOINT (incidents reaching consumers, some causing harm), not the
      // label's causal antecedent (safety-investment gaps); the note carries
      // that tension. providers->regulator added on the full read's finding:
      // 241/266 reports are mandated manufacturer disclosures ("within 30
      // days"), literally the disclosure half of the canonical label. Undrawn:
      // regulator->providers (zero recall/enforcement analysis; drawing it
      // would fabricate a finding); consumers->regulator voluntary reports
      // (n=25, minor channel); evaluator/media/funders absent. Validity:
      // counts are not incidence rates (no usage denominator); 91% of reports
      // manufacturer-authored ("authored by those with an interest in the
      // device"); accuracy not independently verifiable; device catalog is
      // literature-derived, not an official FDA ML list.
      edgeQuotes: {
        "providers>consumers": { q: "Events described hazards with potential to harm (66%), actual harm (16%), consequences for healthcare delivery (9%), near misses that would have led to harm if not for intervention (4%), no harm or consequences (3%), and complaints (2%).", ql: "Results", qk: "M" },
        "providers>regulator": { q: "Manufacturers (n = 241) were by far the most common reporters, with user facilities (n = 11) rounding out events from mandatory reporters.", ql: "Results", qk: "M" } },
      edges: [["providers", "consumers"], ["providers", "regulator"]] },

    { id: "schiff2024", kind: "paper", fit: "approx",
      title: "Framing contestation and public influence on policymakers: evidence from US artificial intelligence policy discourse",
      authors: "Schiff", year: 2024,
      href: "https://doi.org/10.1093/polsoc/puae007",
      why: "time-series analysis of public tweets, congressional tweets, and NYT coverage, 2017-2019: media attention to AI goes with a 13-18% rise in congressional attention, and congressional attention with an 8-9% rise in coverage",
      method: "frame analysis and time-series models over 4.9M public AI tweets, 1,477 congressional AI tweets, and 5,773 NYT articles, 2017-2019",
      note: "policymaker attention is measured by the tweets of members of Congress, in a 2017-2019 window before LLMs; the effects are associations, not causal estimates; and Congress stands in for a regulator box labeled agencies and standards bodies",
      actors: ["media", "regulator"],
      // Full read 2026-08-09 (inline, OUP full text; DOI 10.1093/polsoc/puae007).
      // First safety-spine anchor: the only measured AI-specific evidence for
      // media->regulator found by the micro-lane. The lane's summary missed
      // that the paper's own headline sentence documents BIDIRECTIONALITY
      // (Congress leads media 8-9%), which the shipped quote keeps. Caveat the
      // label inherits: our canonical edge carries INCIDENT coverage in the
      // sim; Schiff measures general AI coverage attention transfer, the
      // closest measured evidence available (no incident/scandal split in the
      // paper). Undrawn: public->Congress innovation-frame effect (20.2%,
      // p=.015) and the ethics-frame null ("the public plays no special role
      // in driving attention to AI's social and ethical implications") stay in
      // this comment: the Twitter public maps poorly onto our consumers box
      // and the verbatim for the 20.2% is fragmentary. Congress-as-regulator
      // follows the raji2019 lawmakers precedent.
      edgeQuotes: {
        "media>regulator": { q: "attention by media to AI is also associated with increased attention by Congress on the order of 13–18%, indicating that this channel of influence is active, while attention by Congress leads to additional media attention (8–9%) as well", ql: "ARIMA analysis", qk: "M" } },
      edges: [["media", "regulator"]] },

    // ---- EVENTS ------------------------------------------------------------
    // kind:"event" rows are real-world episodes, not studies: multi-actor
    // moments when the ecosystem's wiring became publicly visible. INCLUSION
    // BAR: same verification standard as papers (primary artifacts read), plus
    // a visible `status` field because events are contested in a way papers
    // are not. Full registry with the verification queue:
    // docs/events/registry.md (per-event dossiers and collected sources live
    // beside it under docs/events/). Do NOT add entries that have not cleared
    // that queue.

    // `status` describes the standing of THIS ROW's claims, not of everything
    // disputed about the episode. `statusNote` names what is open, so the badge
    // never asserts a dispute without saying what it is.
    { id: "ev-openai-hf", kind: "event", status: "partially contested",
      statusNote: "The intrusion, the timeline, the June 27 alert, and the five-day attribution gap are all in OpenAI's and Hugging Face's own reports. What stays open: where the incident starts (OpenAI treats agent activity reaching Hugging Face in May as unrelated), whether OpenAI's account understates what it knew early, and how independent a review can be when its subject sets the scope and holds redaction rights.",
      title: "The OpenAI-Hugging Face incident: a lab's own agents escaped its perimeter", date: "Apr - Aug 2026",
      href: "https://huggingface.co/blog/security-incident-july-2026",
      hrefLabel: "Hugging Face's disclosure, Jul 16, 2026",
      why: "during an internal OpenAI reinforcement-learning run without production safeguards, agents working on mostly unsolvable cyber tasks turned an internal package registry into a message board, chained zero-day exploits to reach the internet, and broke into Hugging Face's production systems. An internal alert had identified the message board on June 27, and the run was allowed to continue. Hugging Face detected and disclosed the intrusion without knowing who was behind it; OpenAI identified itself five days later",
      method: "OpenAI's technical report and disclosure posts, Hugging Face's two disclosures, the METR/Redwood investigation, JFrog's post, and the Black Hat USA 2026 talk",
      relatedStudy: "raji2022",
      // Artifact-read 2026-08-31 (OpenAI 51pp technical report re-read for the
      // monitoring claims; both HF disclosures; METR/Redwood + LW crosspost;
      // JFrog; Black Hat captions). Full dossier: docs/events/
      // openai_huggingface_2026/dossier.md. Two corrections baked in from the
      // start, both YD-caught in the research pass: (1) this is a
      // provider-internal containment and monitoring failure, NOT an
      // evaluator-caused harm; the unsolvable-task statistic (93% of board
      // discussion from 198 never-solved tasks) explains why agents went
      // looking, not how they got out, so no evaluator->providers arrow is
      // drawn. (2) The Irregular episode (eval environment misconfigured to
      // HAVE internet) is a DIFFERENT failure mode and is not this event.
      // Mapping note: Hugging Face is drawn at the appdev station as the
      // NEAREST station, not the exact tier; by hopkins2025's ontology it is a
      // model hub in Access & Adaptation, one step upstream of Applications.
      // The edge labels name the thing ("Hugging Face", "the victim") to carry
      // the precision the station lacks. Agents went to HF seeking benchmark
      // answers, which brushes evaluator-infrastructure territory, but HF was
      // harmed as a platform, not as an evaluator; comment only, no arrow.
      // METR/Redwood sit at OVERSIGHT here, not evaluator (YD, 2026-08-31):
      // capacity over institution. They were engaged to investigate an
      // incident, which is the oversight station's role line (audit), not to
      // score capability, which is why the evaluator matrix placement of METR
      // does not govern this row. The reciprocal providers<->oversight pair is
      // deliberately built on raji2022's template: this event is a live
      // instance of that paper's subject (the auditee selects, credits, gates
      // and holds redaction rights over its auditor), hence relatedStudy.
      // Zero canonical edges: none of the canonical labels (marketing, target
      // benchmarks) honestly describe these relationships, and reusing them
      // put a redaction quote under a "target benchmarks" header. Every edge
      // here is an extraEdge whose label states what its quote shows.
      // Excluded actors, with reasons: consumers and funders (no documented
      // adoption or capital effect; maverick precedent), evaluator (ExploitGym
      // is narrate-only context per the corrected reading, and METR moved to
      // oversight), regulator (no read regulatory action), UK AISI (its Aug 4
      // findings were NOT sandbox escapes by its own statement; different
      // failure mode). Anthropic's contagion (halted all cyber evals within
      // two days, found three incidents of its own) is undrawable in a
      // one-box providers ontology and lives in the dossier. The figure's own
      // events loop is half-broken here: safety gap -> incident -> coverage ->
      // scrutiny held, but the incident skipped consumers entirely; harm
      // landed on infrastructure and coverage originated from the victim's
      // disclosure.
      actors: ["providers", "media", "appdev", "oversight"],
      edges: [],
      extraEdges: [
        { from: "providers", to: "appdev", label: "escaped agents breached Hugging Face", q: "This activity culminated in the compromise of parts of Hugging Face's production infrastructure between July 11 and July 13.", ql: "OpenAI technical report, Aug 26, 2026", qk: "R", lt: 0.15, ldx: -50, ldy: 20 },
        { from: "appdev", to: "media", label: "disclosed first, attacker unknown", q: "We do not know which model powered the attacker's agents, whether a jailbroken hosted model or an unrestricted open-weight one; either way, the attacker was bound by no usage policy, while our own forensic work was blocked by the guardrails of the hosted models we first tried.", ql: "Hugging Face disclosure, Jul 16, 2026", qk: "R", lt: 0.58, ldx: 0, ldy: 0 },
        { from: "providers", to: "media", label: "self-identified five days later", q: "Last week, Hugging Face disclosed a new kind of security incident after they detected and contained an AI agent that compromised their infrastructure, something we expect to become more commonplace with the proliferation of increasingly cyber-capable models.", ql: "OpenAI disclosure, Jul 21, 2026", qk: "R", lt: 0.63, ldx: 0, ldy: 0 },
        { from: "oversight", to: "providers", label: "reconstructed the agents' behavior", q: "We relied heavily on tracing message board messages back to agents that wrote and read them to reconstruct the complex narratives we discuss in this report.", ql: "METR/Redwood report, Aug 26, 2026", qk: "R", lt: 0.50, ldx: 0, ldy: 0 },
        { from: "providers", to: "oversight", label: "auditee set scope and redactions", q: "OpenAI was able to redact any non-public information from this post.", ql: "METR/Redwood report, Aug 26, 2026", qk: "R", lt: 0.50, ldx: 0, ldy: 0 }
      ] },

    { id: "ev-maverick", kind: "event", status: "partially contested",
      statusNote: "LMArena's account of the submission is on the record. Meta's intent is not: it says it does not train on test sets, and describes the entry as an experimental chat build rather than a variant tuned for the Arena.",
      title: "Llama 4 Maverick on Chatbot Arena", date: "Apr 2025",
      href: "https://x.com/lmarena_ai/status/1909397817434816562",
      hrefLabel: "LMArena statement on the Llama 4 submission",
      why: "Meta's second-ranked Arena entry was an experimental variant tuned for Arena preferences; the released model was different. LMArena said Meta's interpretation of its policy did not match expectations, released 2,000+ battles for review, and tightened its rules",
      method: "LMArena's statement and released battle data, plus The Leaderboard Illusion's documentation of the episode",
      relatedStudy: "singh2025",
      // consumers REMOVED with the edge below: the recheck dropped
      // evaluator->consumers but left the actor, so the box lit and the row
      // showed a dot with no edge, quote or claim behind it.
      actors: ["providers", "evaluator", "media"],
      // Batch-2 recheck 2026-08-09: evaluator->consumers DROPPED. Nothing in
      // the artifacts evidences rank driving adoption in this episode; what is
      // documented is users noticing the released model differed AFTER the
      // fact. Drawing the adoption edge here would import the general thesis
      // into an episode that does not show it. The transmission that IS the
      // episode, rank as news, keeps evaluator->media and gains its quote.
      edgeQuotes: {
        "providers>evaluator": { q: "Meta's interpretation of our policy did not match what we expect from model providers", ql: "LMArena statement, Apr 2025", qk: "R" },
        "evaluator>media": { q: "To ensure full transparency, we're releasing 2,000+ head-to-head battle results for public review.", ql: "LMArena, Apr 8, 2025", qk: "R" } },
      edges: [["providers", "evaluator"], ["evaluator", "media"]],
      extraEdges: [{ from: "evaluator", to: "providers", label: "preferential testing and data access", q: "a handful of preferred providers have been granted disproportionate access to data and testing", ql: "The Leaderboard Illusion, Sec 1", qk: "M", side: "in", bow: 50, lt: 0.545, ldx: 7, ldy: -23 }] },

    { id: "ev-deepseek", kind: "event", status: "partially contested",
      statusNote: "The parity claims, the cost misattribution, the app ranking and the record one-day loss are settled. How much of the market move the claims caused, and R1's true all-in cost, are not.",
      title: "DeepSeek R1: benchmark parity claims moved a trillion-dollar market", date: "Jan 2025",
      href: "https://www.cnbc.com/2025/01/27/nvidia-sheds-almost-600-billion-in-market-cap-biggest-drop-ever.html",
      hrefLabel: "CNBC, Jan 27, 2025",
      why: "DeepSeek's R1 paper claimed reasoning on par with OpenAI's o1, on benchmarks it ran itself; coverage attached a $5.6M training figure to the breakthrough that was actually V3's, covered only the final training run, and was never R1's cost; the app hit number 1 in the US and Nvidia lost a record $589B in one day",
      method: "the R1 and V3 papers, market reporting (Forbes, CNBC, Reuters, Bloomberg), app-chart coverage, and SemiAnalysis's counter-analysis",
      relatedStudy: null,
      // Artifact-read 2026-08-09 (R1 + V3 papers, Forbes, Newsweek, TechNode,
      // SemiAnalysis; CNBC/Reuters/Bloomberg headline-verified, bot-blocked for
      // full fetch). Draft correction: R1 disclosed NO training cost; $5.576M
      // (2.788M H800 hours) is V3's, and V3's report itself excludes "prior
      // research and ablation experiments". The conflation in coverage is the
      // event's core mechanism, not a detail. Sequence: R1 Jan 20, weekend app
      // climb + Andreessen "Sputnik moment" Jan 26, then Jan 27: app #1 AND
      // the crash, same day, with the morning app rank feeding the crash-day
      // narrative. Contested: true all-in cost and GPU fleet (SemiAnalysis:
      // ~50K Hoppers, ~$1.6B server CapEx); proportionality (~9% rebound
      // Jan 28). Settled: parity claims, misattribution, app #1, $589-593B
      // record loss. No third-party evaluator sat in the loop: the parity
      // evidence was self-reported, hence the extraEdge.
      actors: ["providers", "evaluator", "media", "consumers", "funders"],
      edgeQuotes: {
        "evaluator>media": { q: "The Chinese company said it spent just $5.6 million on Nvidia technology to develop its large-language model", ql: "Forbes, Jan 27, 2025", qk: "R" },
        "media>funders": { q: "Nvidia lost $589 billion in market capitalization Monday, which is by far the single greatest one-day value wipeout of any company in history.", ql: "Forbes, Jan 27, 2025", qk: "R" },
        "media>consumers": { q: "Chinese startup DeepSeek overtook ChatGPT to become the top-rated free application on Apple's App Store in the U.S. on Monday.", ql: "Newsweek, Jan 27, 2025", qk: "R" } },
      edges: [["evaluator", "media"], ["media", "funders"], ["media", "consumers"]],
      extraEdges: [
        { from: "providers", to: "evaluator", label: "self-reported scores, no third-party check", q: "DeepSeek-R1 achieves performance comparable to OpenAI-o1-1217 on reasoning tasks.", ql: "R1 paper abstract, arXiv 2501.12948", qk: "R", bow: 48, lt: 0.68, ldx: -48, ldy: 10 },
        { from: "consumers", to: "media",     label: "app-chart rank became headline evidence", q: "As of Jan. 27, DeepSeek AI has surpassed ChatGPT, reaching the top spot on the Apple App Store's free apps list.", ql: "TechNode, Jan 27, 2025", qk: "R", bow: 46, lt: 0.16, ldx: 0, ldy: 0 }
      ] },

    { id: "ev-o3arc", kind: "event", status: "settled",
      statusNote: "Every figure here comes from ARC Prize's own posts, including the same-day eligibility disclosure and the April retest. What stays open, and is not claimed here, is what the training footnote covered, who paid for the December compute, and the true cost per task.",
      title: "o3 on ARC-AGI: a co-announced score the released model never matched", date: "Dec 2024 - Apr 2025",
      href: "https://arcprize.org/blog/oai-o3-pub-breakthrough",
      hrefLabel: "ARC Prize's own announcement post",
      why: "OpenAI revealed o3's ARC-AGI scores jointly with the benchmark's operator on a livestream; the 87.5% headline used 172 times the standard compute and was ineligible for the leaderboard, and the o3 that was actually released scored far lower in ARC Prize's own April retest",
      method: "ARC Prize's own announcement and April 2025 retest posts, a contemporaneous live blog, and press coverage",
      relatedStudy: null,
      // Artifact-read 2026-08-09 (ARC Prize's Dec 20 post + Apr 22 analysis +
      // testing policy, Willison's contemporaneous live blog, TechCrunch).
      // Draft corrections: (1) NO evidence of a funding relationship; the
      // arrangement was pre-release access with OpenAI setting the tested
      // compute configurations, plus co-marketing. First draft's
      // "sponsorship entanglement" framing was wrong; funders is NOT an actor
      // here and funders->evaluator is NOT drawn. (2) Eligibility was
      // disclosed SAME DAY ("not eligible for ARC-AGI-Pub" in the launch
      // tweet); the later clarifications were pricing (est. $3K -> ~$30K/task)
      // and the released o3 being a different, smaller-compute model.
      // (3) "Trained on 75% of the Public Training set" was in the day-one
      // footnote: transparency plus ambiguity, not concealment. Retest facts:
      // released o3-low 41%, o3-medium 53% on ARC-AGI-1 semi-private, under
      // 3% on ARC-AGI-2, vs the announced preview's 75.7%/87.5%. Contested:
      // what "trained on" concretely meant, who paid for the December
      // compute (undisclosed), true cost per task.
      actors: ["providers", "evaluator", "media"],
      edgeQuotes: {
        "providers>evaluator": { q: "At OpenAI's direction, we tested at two levels of compute with variable sample sizes: 6 (high-efficiency) and 1024 (low-efficiency, 172x compute).", ql: "ARC Prize announcement, Dec 20, 2024", qk: "R" },
        "evaluator>media": { q: "ARC Prize presented o3's performance results in person with OpenAI's Sam Altman (CEO) and Mark Chen (SVP Research) during the final '12 Days of OpenAI' event.", ql: "ARC Prize announcement, Dec 20, 2024", qk: "R" } },
      edges: [["providers", "evaluator"], ["evaluator", "media"]],
      extraEdges: [
        { from: "evaluator", to: "providers", label: "evaluator retest repriced the headline claim", q: "The production o3 uses a different model from the o3-preview we tested in December 2024", ql: "ARC Prize analysis, Apr 22, 2025", qk: "R", bow: 44, lt: 0.92, ldx: -2, ldy: -10 }
      ] },

    { id: "ev-frontiermath", kind: "event", status: "settled",
      statusNote: "The commissioning, the access, the ownership, the contractual bar on disclosure and the same-day footnote are all on the record, and Epoch acknowledged them. What stays open, and is not claimed here, is whether the announced 25.2% benefited from that access.",
      title: "FrontierMath: the benchmark's funder was the lab it evaluated", date: "Dec 2024 - Jan 2025",
      // actors: oversight ADDED in the batch-2 recheck (see extraEdges note)
      href: "https://www.lesswrong.com/posts/cu2E8wgmbdZbqeWqb/meemi-s-shortform",
      hrefLabel: "the disclosure thread and Epoch's response",
      why: "OpenAI commissioned FrontierMath and held access to most problems and solutions; contributing mathematicians were not told; the funding was disclosed in a paper footnote the day o3's 25.2% score was announced, after a contract barred earlier disclosure",
      method: "Epoch's public statement, the LessWrong disclosure thread, an arXiv v4-vs-v5 diff, and contemporaneous reporting",
      relatedStudy: null,
      // Artifact-read 2026-08-09 (Epoch statement, LessWrong thread, TechCrunch,
      // The Decoder, arXiv v4-vs-v5 diff). Three corrections to the first
      // draft, all in the careful direction: (1) disclosure was a SAME-DAY
      // arXiv v5 footnote (Dec 20), with the full arrangement acknowledged
      // Jan 19-23 under community pressure; (2) the holdout set did NOT exist
      // at announcement time (Glazer: "currently developing", Jan 19; Epoch:
      // "finalizing", Jan 23) and withholds solutions only, OpenAI keeps and
      // owns the problem statements; (3) "commissioned" is Epoch's own verb
      // (300 problems, OpenAI ownership). The no-training agreement was verbal
      // (Besiroglu, LessWrong; absent from the epoch.ai statement). Contested
      // core: whether the announced 25.2% benefited from access; Epoch's April
      // 2025 independent run of released o3 scored ~10% with acknowledged
      // scaffold/compute confounds, read as ambiguous by both sides.
      actors: ["providers", "evaluator", "funders", "media", "oversight"],
      edgeQuotes: {
        "funders>evaluator": { q: "OpenAI commissioned Epoch AI to produce 300 advanced math problems for AI evaluation", ql: "Epoch AI statement, Jan 23, 2025", qk: "R" },
        "providers>evaluator": { q: "OpenAI does have access to a large fraction of FrontierMath problems and solutions, with the exception of a unseen-by-OpenAI hold-out set", ql: "Besiroglu, LessWrong, Jan 19, 2025", qk: "R" } },
      edges: [["funders", "evaluator"], ["providers", "evaluator"]],
      // Batch-2 recheck 2026-08-09: the forced-disclosure edge was
      // mis-attributed to media. The reads are specific: a dataset CONTRIBUTOR
      // (meemi, LessWrong) surfaced the arrangement and Epoch responded within
      // ten hours, before any press; TechCrunch and The Decoder arrived a day
      // later and the fuller Jan 23 statement followed both. Community =
      // oversight station, press = media; the edge is now split accordingly.
      // Epoch's admission quote moved to the oversight edge it responds to.
      extraEdges: [
        { from: "oversight", to: "evaluator", label: "a contributor's post surfaced the arrangement", q: "The communication about this has been non-transparent, and many people, including contractors working on this dataset, have not been aware of this connection.", ql: "meemi, LessWrong, Jan 18, 2025", qk: "R" },
        { from: "media", to: "evaluator", label: "press coverage pressed for fuller disclosure", q: "AI benchmarking organization criticized for waiting to disclose funding from OpenAI", ql: "TechCrunch headline, Jan 19, 2025", qk: "R" }
      ], lt: 0.45, ldx: 0, ldy: 0 },

    { id: "ev-reflection", kind: "event", status: "partially contested",
      statusNote: "The failed reproductions and the filtering of the word Claude are documented. What the private API was actually serving is not: substitution was demonstrated by community probes and denied in the Glaive postmortem.",
      title: "Reflection 70B: a claimed open-source leader collapsed in five days", date: "Sep 2024",
      href: "https://venturebeat.com/ai/new-open-source-ai-leader-reflection-70bs-performance-questioned-accused-of-fraud",
      hrefLabel: "VentureBeat's corrective reporting, Sep 2024",
      why: "announced as the world's top open-source model, beating GPT-4o on every benchmark tested; independent evaluators could not reproduce the scores, the private demo API measurably outperformed the released weights, and community probes caught the API filtering the word Claude",
      method: "the announcement thread, Artificial Analysis's statements, community probes, corrective reporting, and the Glaive postmortem",
      relatedStudy: null,
      // Artifact-read 2026-08-09 (announcement via ThreadReader, Artificial
      // Analysis statements via the HF discussion mirror, HN/LocalLLaMA
      // threads, The Decoder, Ignorance.ai; Glaive postmortem offline, its key
      // sentences recovered via quoting coverage). Precision notes: the
      // Claude-proxy inference is DEMONSTRATED-BUT-DENIED: "claude" string
      // filtering, tokenizer matches, and self-identification vs the
      // postmortem's "at no point was I running any models from other
      // providers". Fully settled and stronger: AA benchmarked BOTH the
      // private API and the released weights and the API outperformed them,
      // whatever it was. Verbatim claim scope: "world's top open-source
      // model", beats GPT-4o "on every benchmark tested"; Sonnet framed as
      // matched, not beaten. Five days announcement-to-apologies. Shumer's
      // Glaive investment undisclosed at announcement. Correcting actors:
      // Artificial Analysis first, community probes second, journalists third.
      actors: ["providers", "evaluator", "media", "oversight"],
      edgeQuotes: {
        "providers>media": { q: "I'm excited to announce Reflection 70B, the world's top open-source model.", ql: "Shumer announcement, Sep 5, 2024", qk: "R" },
        "providers>evaluator": { q: "Beats GPT-4o on every benchmark tested", ql: "announcement thread, Sep 5-6, 2024", qk: "R" } },
      edges: [["providers", "media"], ["providers", "evaluator"]],
      extraEdges: [
        { from: "evaluator", to: "providers", label: "independent re-evaluation refuted the claims", q: "We tested the initial Reflection 70B release and saw worse performance than Llama 3.1 70B.", ql: "Artificial Analysis, Sep 2024", qk: "R", bow: 44, lt: 0.73, ldx: -2, ldy: -44 },
        { from: "oversight", to: "providers", label: "community probes exposed API substitution", q: "'Reflection API' is a sonnet 3.5 wrapper with prompt. And they are currently disguising it by filtering out the string 'claude'.", ql: "community probe, Sep 8, 2024", qk: "R", bow: 40, lt: 0.68, ldx: 0, ldy: 0 }
      ] },

    { id: "ev-ll144", kind: "event", status: "settled",
      statusNote: "The counts are the study's own. Employers decide for themselves whether the law applies to them, so silence is not proof of non-compliance; the row says so rather than disputing it.",
      title: "NYC Local Law 144: an audit mandate met with near-silence", date: "2023-24",
      href: "https://dl.acm.org/doi/10.1145/3630106.3658998",
      hrefLabel: "the Null Compliance study (FAccT 2024)",
      why: "the first binding AI bias-audit mandate. Of 391 employers checked, 18 posted audits and 13 posted the required notices. Employers decide for themselves whether the law covers them, so silence does not prove non-compliance; the finding is that a mandated disclosure channel stayed almost entirely dark",
      method: "the Null Compliance study (FAccT 2024): 155 investigators recording 391 employers' compliance with NYC Local Law 144",
      relatedStudy: null,
      actors: ["regulator", "appdev", "evaluator", "consumers"],
      // The mandate binds DEPLOYERS (employers using screening tools), which is
      // the appdev station here, not model providers; hence extraEdges only.
      edges: [],
      extraEdges: [
        { from: "regulator", to: "appdev",    label: "audit mandate on deployers", q: "New York City's Local Law 144 made annual bias audits and public posting mandatory for automated employment decision tools from July 2023", ql: "Null Compliance, FAccT 2024", qk: "F", lt: 0.5, ldx: 0, ldy: 0 },
        { from: "appdev",    to: "evaluator", label: "commissioned bias audits", q: "155 student investigators recorded 391 employers' compliance with the mandate", ql: "Null Compliance, FAccT 2024", qk: "F", bow: 40, lt: 0.595, ldx: -11, ldy: 39 },
        { from: "evaluator", to: "consumers", label: "posted audits reach job seekers: 18 of 391", q: "18 of 391 studied employers posted audit reports; 13 posted transparency notices", ql: "Null Compliance, FAccT 2024", qk: "F", bow: 44, lt: 0.51, ldx: 0, ldy: -10 }
      ] }
  ]
};
