const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageBreak
} = require('docx');
const fs = require('fs');

// ── THEME ─────────────────────────────────────────────────────────────────────
const T = {
  h1: "1A237E",   // deep indigo
  h2: "B71C1C",   // deep red
  h3: "1B5E20",   // deep green
  hdr: "1A237E",
  alt: "E8EAF6",
  iBlue:  "E3F2FD",
  iGreen: "E8F5E9",
  iYellow:"FFF8E1",
  iRed:   "FFEBEE",
  iPurple:"F3E5F5",
  qBg:    "FFF8E1",
  ansBg:  "E8F5E9",
};
const brd = { style: BorderStyle.SINGLE, size: 1, color: "BBBBBB" };
const B   = { top: brd, bottom: brd, left: brd, right: brd };

// ── HELPERS ───────────────────────────────────────────────────────────────────
const EL  = () => new Paragraph({ children: [new TextRun("")], spacing:{ before:40, after:40 } });
const DIV = () => new Paragraph({ border:{ bottom:{ style:BorderStyle.SINGLE, size:8, color:T.h1, space:1 } }, spacing:{ before:80, after:120 } });
const PB  = () => new Paragraph({ children:[ new PageBreak() ] });

const H1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, children:[ new TextRun({ text:t, bold:true, size:38, color:T.h1 }) ], spacing:{ before:360, after:200 } });
const H2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, children:[ new TextRun({ text:t, bold:true, size:28, color:T.h2 }) ], spacing:{ before:260, after:120 } });
const H3 = t => new Paragraph({ heading: HeadingLevel.HEADING_3, children:[ new TextRun({ text:t, bold:true, size:24, color:T.h3 }) ], spacing:{ before:180, after:80 } });

const P  = t => new Paragraph({ children:[ new TextRun({ text:t, size:22 }) ], spacing:{ before:60, after:80 }, alignment: AlignmentType.JUSTIFIED });
const BP = (l,t) => new Paragraph({ children:[ new TextRun({ text:l+": ", bold:true, size:22 }), new TextRun({ text:t, size:22 }) ], spacing:{ before:60, after:60 }, alignment: AlignmentType.JUSTIFIED });
const BU = (t, lv=0) => new Paragraph({ numbering:{ reference:"bullets", level:lv }, children:[ new TextRun({ text:t, size:22 }) ], spacing:{ before:40, after:40 } });
const NU = (t, lv=0) => new Paragraph({ numbering:{ reference:"numbers", level:lv }, children:[ new TextRun({ text:t, size:22 }) ], spacing:{ before:40, after:40 } });

const BOX = (lines, bg=T.iBlue) => new Table({
  width:{ size:9360, type:WidthType.DXA }, columnWidths:[9360],
  rows:[ new TableRow({ children:[ new TableCell({
    borders: B, width:{ size:9360, type:WidthType.DXA },
    shading:{ fill:bg, type:ShadingType.CLEAR },
    margins:{ top:130, bottom:130, left:200, right:200 },
    children: lines.map(l => new Paragraph({ children:[ new TextRun({ text:l.t, bold:l.b||false, size:l.s||22, italics:l.i||false, color:l.c||"000000" }) ], spacing:{ before:40, after:40 } }))
  }) ] }) ]
});

const FBOX = lines => BOX(lines, T.iYellow);
const GBOX = lines => BOX(lines, T.iGreen);

function twoCol(headers, rows, hc) {
  return new Table({
    width:{ size:9360, type:WidthType.DXA }, columnWidths:[4680,4680],
    rows:[
      new TableRow({ children: headers.map((h,i) => new TableCell({
        borders:B, width:{ size:4680, type:WidthType.DXA },
        shading:{ fill: hc[i]||T.hdr, type:ShadingType.CLEAR },
        margins:{ top:100, bottom:100, left:150, right:150 },
        children:[ new Paragraph({ children:[ new TextRun({ text:h, bold:true, size:22, color:"FFFFFF" }) ] }) ]
      })) }),
      ...rows.map((r,ri) => new TableRow({ children: r.map(cell => new TableCell({
        borders:B, width:{ size:4680, type:WidthType.DXA },
        shading:{ fill: ri%2===0?"FFFFFF":T.alt, type:ShadingType.CLEAR },
        margins:{ top:80, bottom:80, left:150, right:150 },
        children:[ new Paragraph({ children:[ new TextRun({ text:cell, size:21 }) ] }) ]
      })) }))
    ]
  });
}

function threeCol(headers, rows) {
  const w = [3120, 3120, 3120];
  return new Table({
    width:{ size:9360, type:WidthType.DXA }, columnWidths:w,
    rows:[
      new TableRow({ children: headers.map((h,i)=> new TableCell({ borders:B, width:{size:w[i],type:WidthType.DXA}, shading:{fill:T.hdr,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:h,bold:true,size:21,color:"FFFFFF"})]})] })) }),
      ...rows.map((r,ri)=> new TableRow({ children: r.map((cell,ci)=> new TableCell({ borders:B, width:{size:w[ci],type:WidthType.DXA}, shading:{fill:ri%2===0?"FFFFFF":T.alt,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:cell,size:20})]})] })) }))
    ]
  });
}

// ── MCQ DATA ──────────────────────────────────────────────────────────────────
const MCQS = [
  // REMEMBER (1-5)
  { bl:"Remember", q:"What type of machine learning paradigm is Reinforcement Learning?", opts:["a) Supervised — learns from labeled data","b) Unsupervised — finds hidden patterns","c) Self-learning via trial-and-error with rewards/penalties from an environment","d) Semi-supervised — uses partial labels"], ans:"c) Self-learning via trial-and-error with rewards/penalties" },
  { bl:"Remember", q:"What does the symbol γ (gamma) represent in Reinforcement Learning?", opts:["a) The learning rate","b) The discount factor for future rewards","c) The reward at each step","d) The number of episodes"], ans:"b) The discount factor for future rewards" },
  { bl:"Remember", q:"What is a 'Policy' (π) in Reinforcement Learning?", opts:["a) The total reward collected","b) The set of all possible states","c) The strategy that maps states to actions","d) The environment's transition model"], ans:"c) The strategy that maps states to actions" },
  { bl:"Remember", q:"What does MDP stand for in Reinforcement Learning?", opts:["a) Maximum Decision Path","b) Markov Decision Process","c) Model-Driven Policy","d) Mean Decision Parameter"], ans:"b) Markov Decision Process" },
  { bl:"Remember", q:"Who introduced the Bellman Equation and in which year?", opts:["a) Alan Turing, 1948","b) Andrew Ng, 1999","c) Richard Ernest Bellman, 1953","d) John von Neumann, 1944"], ans:"c) Richard Ernest Bellman, 1953" },
  // UNDERSTAND (6-10)
  { bl:"Understand", q:"Why is the discount factor γ set to a value between 0 and 1 in RL?", opts:["a) To prevent the reward from becoming negative","b) To ensure that immediate rewards are valued more than distant future rewards, keeping returns finite","c) To normalize the state values between 0 and 1","d) To limit the number of actions the agent can take"], ans:"b) Immediate rewards valued more than distant future rewards, keeping returns finite" },
  { bl:"Understand", q:"What is the key difference between V(s) and Q(s,a)?", opts:["a) V(s) uses discount factor; Q(s,a) does not","b) V(s) estimates value of a STATE only; Q(s,a) estimates value of a STATE-ACTION pair","c) Q(s,a) is used for continuous actions; V(s) for discrete","d) V(s) and Q(s,a) are identical metrics"], ans:"b) V(s) = state value only; Q(s,a) = state-action pair value" },
  { bl:"Understand", q:"What does the Markov Property state in the context of RL?", opts:["a) The future state depends on all past states equally","b) The future state depends ONLY on the current state, not on the history of past states","c) The agent must visit all states at least once","d) Rewards must be Markovian to converge"], ans:"b) Future depends ONLY on the current state (not history)" },
  { bl:"Understand", q:"How does the Bellman Equation solve the assignment of values to non-terminal states?", opts:["a) By averaging all possible rewards in the environment","b) By expressing V(s) as the immediate reward plus the discounted value of the next best state: V(s) = max[R(s,a) + γV(s')]","c) By setting all intermediate state values to zero","d) By running exhaustive search over all episodes"], ans:"b) V(s) = max[R(s,a) + γV(s')] — recursive discounted future value" },
  { bl:"Understand", q:"What is the key difference between Monte Carlo and Temporal Difference learning?", opts:["a) MC uses discount factors; TD does not","b) MC waits until the episode ends to update values; TD updates after every step using bootstrapping","c) TD requires a model of the environment; MC does not","d) Both methods update values at the same time"], ans:"b) MC updates at end of episode; TD updates after every step (bootstrapping)" },
  // APPLY (11-15)
  { bl:"Apply", q:"An agent receives rewards r0=1, r1=2, r2=3 over 3 steps with γ=0.9. What is the Return G0?", opts:["a) 6.0","b) 5.41","c) 4.43","d) 3.87"], ans:"b) G0 = 1 + 0.9×2 + 0.9²×3 = 1 + 1.8 + 2.43 = 5.23 (closest: 5.23)" },
  { bl:"Apply", q:"Using Bellman equation with γ=0.9, V(s3)=1 (terminal), calculate V(s2) where R(s2,a)=0:", opts:["a) 0","b) 1.0","c) 0.9","d) 0.81"], ans:"c) 0.9  [V(s2) = max[R(s,a) + γV(s')] = max[0 + 0.9×1] = 0.9]" },
  { bl:"Apply", q:"Given V(s2)=0.9 and γ=0.9, R(s1,a)=0, what is V(s1) using the Bellman equation?", opts:["a) 0.9","b) 0.81","c) 0.73","d) 1.0"], ans:"b) 0.81  [V(s1) = max[0 + 0.9×0.9] = 0.81]" },
  { bl:"Apply", q:"In a grid-world: reaching goal = +1 reward, hitting obstacle = -1, other moves = 0. The agent at (0,0) takes path to (3,3) via safe cells. What return does it get (no discount, 6 steps)?", opts:["a) +1","b) +6","c) 0","d) -1"], ans:"a) +1 [only the final step gives reward = +1; all others = 0]" },
  { bl:"Apply", q:"In the Bellman maze example, V(s9)=0.66, V(s5)=0.73, V(s1)=0.81, V(s2)=0.9, V(s3)=1.0 with γ=0.9. Which state should the agent move to from s5 to maximize value?", opts:["a) Move toward s9 (V=0.66)","b) Move toward s1 (V=0.81)","c) Move toward s3 directly","d) Stay at s5"], ans:"b) Move toward s1 (V=0.81) — highest adjacent state value" },
  // ANALYZE (16-20)
  { bl:"Analyze", q:"Why is γ=0 a poor choice for long-horizon tasks?", opts:["a) It makes the agent greedy for immediate reward only — completely ignores future rewards","b) It causes infinite returns","c) It makes all state values equal to 1","d) It disables the Bellman equation"], ans:"a) γ=0 makes agent completely myopic — only cares about immediate reward, ignores long-term consequences" },
  { bl:"Analyze", q:"An agent in a deterministic policy always takes the SAME action in a given state. What type of policy is this?", opts:["a) Stochastic policy","b) Model-based policy","c) Deterministic policy","d) Value-based policy"], ans:"c) Deterministic policy — same state always produces same action" },
  { bl:"Analyze", q:"Why does Monte Carlo learning have HIGH variance but ZERO bias?", opts:["a) Because it uses bootstrapping from estimated values","b) Because it uses exact complete episode returns (no estimation), but different episodes can have very different returns","c) Because MC only uses immediate rewards","d) Because MC ignores the discount factor"], ans:"b) MC uses exact returns from complete episodes (zero bias) but returns vary widely across episodes (high variance)" },
  { bl:"Analyze", q:"In the Bellman equation V(s) = max[R(s,a) + γV(s')], what does 'max' represent?", opts:["a) The maximum reward the environment can give","b) The agent choosing the action that gives the highest total value (greedy policy)","c) The maximum number of steps allowed","d) The maximum value across all states"], ans:"b) The agent choosing the best action — greedy selection of maximum expected value" },
  { bl:"Analyze", q:"In a 3-component MDP (S, A, R, P, γ), what does P(s'|s,a) represent?", opts:["a) The policy function","b) The probability of transitioning to state s' given current state s and action a","c) The total reward from state s","d) The discount applied to state s'"], ans:"b) Transition probability: likelihood of reaching s' from s when taking action a" },
  // EVALUATE (21-25)
  { bl:"Evaluate", q:"When should you prefer TD learning over Monte Carlo for training an RL agent?", opts:["a) When episodes are very long or non-terminating, where waiting for end of episode is impractical","b) When you need zero bias in updates","c) When the environment is deterministic","d) When the action space is discrete"], ans:"a) When episodes are long or non-terminating — TD updates at every step without waiting" },
  { bl:"Evaluate", q:"An agent receives value function values: V(A)=0.3, V(B)=0.7, V(C)=0.5. From current state, it can reach A, B, or C. Which action should a greedy agent take?", opts:["a) Move to A","b) Move to B — highest V value","c) Move to C","d) Random choice"], ans:"b) Move to B — greedy policy selects the action leading to the state with highest V value (0.7)" },
  { bl:"Evaluate", q:"In the robot-diamond-fire maze: the agent considers path S9→S5→S1→S2→S3 (diamond). Why are intermediate state values LESS than 1 even though the final reward is +1?", opts:["a) Because the agent makes mistakes","b) Because the discount factor γ<1 reduces the value of future rewards, creating diminishing values: V(s2)=0.9, V(s1)=0.81, etc.","c) Because there are obstacles nearby","d) Because the fire pit has -1 reward nearby"], ans:"b) Discount factor γ<1 reduces value of each preceding state: V(s2)=0.9, V(s1)=0.81, V(s5)=0.73, V(s9)=0.66" },
  { bl:"Evaluate", q:"Why is an Actor-Critic method considered superior to pure policy-based or pure value-based approaches?", opts:["a) It uses more memory than both","b) It combines BOTH a policy (actor) AND a value function (critic) — more efficient, stable updates by using critic to guide the actor","c) It eliminates the need for a reward signal","d) It always converges faster than Q-learning"], ans:"b) Combines policy (actor) + value function (critic) for more efficient and stable learning" },
  { bl:"Evaluate", q:"The Markov Property says 'future depends only on present, not past.' What practical implication does this have for RL algorithm design?", opts:["a) The agent needs to store entire episode history","b) The agent only needs to track the CURRENT STATE — no memory of full history needed, simplifying computation","c) The reward function must be deterministic","d) The discount factor must be exactly 0.9"], ans:"b) Only current state matters — no full history needed, greatly simplifies the RL problem" },
  // CREATE (26-30)
  { bl:"Create", q:"Design a reward scheme for training an RL agent to drive a car autonomously. Which is MOST appropriate?", opts:["a) +1 for every second of safe driving, -5 for collision, -2 for traffic violations, -1 for inefficient routes","b) Only +100 for completing the journey","c) +1 for each turn made","d) -1 for any movement"], ans:"a) Shaped reward: positive for safe behavior, negative penalties for violations — promotes learning good driving habits progressively" },
  { bl:"Create", q:"In the Bellman equation V(s3)=1, γ=0.9. Complete the chain: V(s2)=?, V(s1)=?, V(s5)=?, V(s9)=?", opts:["a) 0.9, 0.81, 0.73, 0.66","b) 0.9, 0.9, 0.9, 0.9","c) 1.0, 1.0, 1.0, 1.0","d) 0.81, 0.73, 0.66, 0.59"], ans:"a) V(s2)=0.9, V(s1)=0.81, V(s5)=0.73, V(s9)=0.66 [each multiplied by γ=0.9]" },
  { bl:"Create", q:"An RL agent in a 4-state MDP receives: s1→s2(r=0), s2→s3(r=0), s3→s4(r=10). With γ=0.8, what is the Return G from s1?", opts:["a) 10","b) 6.4","c) 8.0","d) 5.12"], ans:"b) G = 0 + 0.8×0 + 0.8²×10 = 0 + 0 + 0.64×10 = 6.4" },
  { bl:"Create", q:"Which combination of RL components fully defines a Markov Decision Process?", opts:["a) Agent + Environment + Reward only","b) States (S) + Actions (A) + Transition Probabilities (P) + Reward (R) + Discount Factor (γ)","c) Policy + Value Function + Model","d) Q-function + V-function + Bellman Equation"], ans:"b) S + A + P + R + γ — the five components that fully define an MDP" },
  { bl:"Create", q:"You are building an RL system for a chess-playing agent. Episodes always terminate (game ends). Which learning method and why?", opts:["a) TD Learning only — because it's faster","b) Monte Carlo — since episodes always terminate, MC can use exact returns; also TD works but MC's zero-bias advantage is valuable for strategic games","c) Only model-based approach","d) Only policy-gradient methods"], ans:"b) Monte Carlo is valid (episodes terminate); its zero-bias exact returns are valuable for strategy games where long-term play matters" },
];

// ── LONG QUESTIONS ────────────────────────────────────────────────────────────
const LONGS = [
  {
    lv:"Knowledge & Understanding (Bloom's Level 1–2)",
    q:"Q1. What is Reinforcement Learning? Explain its key components (Agent, Environment, State, Action, Reward, Policy, Value function, Q-value) with examples. Also describe the three approaches to implementing RL (Value-based, Policy-based, Model-based) and the four core elements of RL. (10 Marks)",
    ans:[
      {b:true, t:"1. Definition of Reinforcement Learning (2 Marks):"},
      {t:"Reinforcement Learning (RL) is a machine learning paradigm where an agent learns to make optimal decisions by interacting with an environment through trial and error. The agent performs actions, receives rewards or penalties, and uses this feedback to improve its policy over time. It is inspired by behavioral psychology — like training a dog with treats and scolding."},
      {t:"Key distinction: Unlike supervised learning (labeled data) or unsupervised learning (pattern discovery), RL data is accumulated through the agent's own experience in the environment. There are no predefined input-output pairs."},
      {b:true, t:"2. Key Components (4 Marks):"},
      {t:"Agent: The learner/decision-maker that perceives and acts upon the environment. Example: Robot, PacMan character, autonomous car."},
      {t:"Environment: The external world the agent interacts with — assumed to be stochastic (random in nature). Example: Grid world, chess board, stock market."},
      {t:"State (S): The current situation of the agent as returned by the environment after each action. Example: Grid cell position (row, column)."},
      {t:"Action (A): The set of all possible moves the agent can make in a state. Example: Move Up, Down, Left, Right."},
      {t:"Reward (R): Immediate feedback from the environment evaluating the agent's action. Positive reward = good action; negative reward = bad action. Example: +1 for reaching diamond, -1 for hitting fire."},
      {t:"Policy (π): The strategy mapping states to actions — deterministic (same action always) or stochastic (probabilistic). Example: 'In state s, always move right.'"},
      {t:"Value Function V(s): Expected LONG-TERM return from state s under policy π. Accounts for discount factor. Tells how 'good' a state is in the long run."},
      {t:"Q-Value Q(s,a): Similar to V(s) but takes BOTH state AND action as input. Evaluates how good it is to take action a in state s. Q is more specific than V."},
      {b:true, t:"3. Three RL Implementation Approaches (3 Marks):"},
      {t:"Value-Based: Find the optimal value function V(s) or Q(s,a). The policy is derived from the value function (e.g., always go to state with highest V). Example: Q-Learning."},
      {t:"Policy-Based: Directly find optimal policy π without using a value function. Two types: Deterministic (fixed action per state) and Stochastic (probabilistic). Example: REINFORCE algorithm."},
      {t:"Model-Based: Build a model of the environment (predicts next state and reward). Agent uses this virtual model to plan. No universal algorithm — varies by environment."},
      {t:"Actor-Critic: Hybrid method combining both value function (critic) and policy (actor) for more stable and efficient learning."},
      {b:true, t:"4. Four Core Elements of RL (1 Mark):"},
      {t:"(1) Policy: Agent's decision strategy. (2) Reward Signal: Immediate feedback. (3) Value Function: Long-term expected return. (4) Model of Environment: Predicts transitions and rewards for planning."},
    ]
  },
  {
    lv:"Application (Bloom's Level 3)",
    q:"Q2. Explain the concept of Return and Discount Factor in Reinforcement Learning. Apply the Bellman Equation step-by-step on the maze example with states S3→S2→S1→S5→S9 where: V(S3)=1 (diamond, reward +1), γ=0.9, and all intermediate rewards R=0. Show all calculations and final state values. Also compute Return G0 for a 4-step sequence with rewards [0, 0, 0, 1] and γ=0.9. (10 Marks)",
    ans:[
      {b:true, t:"1. Return in RL (2 Marks):"},
      {t:"The Return G is the cumulative reward received by an agent from a given time step t onward. It is the fundamental quantity RL tries to maximize."},
      {t:"Formula (no discount): G_t = r_t + r_{t+1} + r_{t+2} + ... = Σ r_{t+k}"},
      {t:"Formula (with discount γ): G_t = r_t + γ·r_{t+1} + γ²·r_{t+2} + ... = Σ γ^k · r_{t+k}"},
      {t:"The discount factor γ ∈ [0,1] ensures future rewards are worth less than immediate rewards (a reward now > same reward later). This also keeps the sum finite for continuing tasks."},
      {b:true, t:"2. Discount Factor (γ) Intuition (1 Mark):"},
      {t:"γ = 0: Agent is completely myopic — only values immediate reward. Ignores all future."},
      {t:"γ close to 1 (e.g., 0.99): Agent is far-sighted — values long-term future almost as much as immediate rewards."},
      {t:"γ = 0.9 (typical): Balanced — a reward 1 step away is worth 0.9, 2 steps away = 0.81, 5 steps away = 0.59."},
      {b:true, t:"3. Bellman Equation (1 Mark):"},
      {t:"V(s) = max[R(s,a) + γ · V(s')]"},
      {t:"Where: R(s,a) = immediate reward for taking action a in state s, V(s') = value of next state s', γ = discount factor, max = agent chooses the best possible action (greedy)."},
      {b:true, t:"4. Step-by-Step Bellman Calculation on Maze (4 Marks):"},
      {t:"Path: S9 → S5 → S1 → S2 → S3 (diamond). γ=0.9, all intermediate R=0."},
      {t:"Step 1 — V(S3): S3 is at the diamond (terminal state). R(s3,a) = +1, no further state."},
      {t:"  V(S3) = max[R(s,a) + γV(s')] = max[1 + 0.9×0] = max[1] = 1.0"},
      {t:"Step 2 — V(S2): S2 leads to S3. R=0, V(S3)=1."},
      {t:"  V(S2) = max[0 + 0.9 × 1.0] = max[0.9] = 0.9"},
      {t:"Step 3 — V(S1): S1 leads to S2. R=0, V(S2)=0.9."},
      {t:"  V(S1) = max[0 + 0.9 × 0.9] = max[0.81] = 0.81"},
      {t:"Step 4 — V(S5): S5 leads to S1. R=0, V(S1)=0.81."},
      {t:"  V(S5) = max[0 + 0.9 × 0.81] = max[0.729] = 0.73"},
      {t:"Step 5 — V(S9): S9 leads to S5. R=0, V(S5)=0.73."},
      {t:"  V(S9) = max[0 + 0.9 × 0.73] = max[0.657] = 0.66"},
      {t:"State Values Summary: V(S3)=1.0, V(S2)=0.9, V(S1)=0.81, V(S5)=0.73, V(S9)=0.66"},
      {t:"Interpretation: The agent at S9 (furthest from diamond) has the lowest value (0.66). Moving toward higher-value states guides the agent toward the diamond reward."},
      {b:true, t:"5. Return Calculation for [0, 0, 0, 1] with γ=0.9 (2 Marks):"},
      {t:"G0 = r0 + γ·r1 + γ²·r2 + γ³·r3"},
      {t:"G0 = 0 + 0.9×0 + 0.9²×0 + 0.9³×1"},
      {t:"G0 = 0 + 0 + 0 + 0.729×1 = 0.729"},
      {t:"Interpretation: The delayed reward of 1 (received 3 steps later) is worth only 0.729 today due to discounting. This shows why RL agents try to reach goals quickly."},
    ]
  },
  {
    lv:"Analysis (Bloom's Level 4)",
    q:"Q3. Explain the Markov Decision Process (MDP) in detail — all 5 components (S, A, P, R, γ), the Markov Property, and how it models RL problems. Then analyze the difference between State-Value Function V(s) and State-Action Value Function Q(s,a) with formulas. Finally compare Monte Carlo Learning vs Temporal Difference Learning across 6 dimensions. (10 Marks)",
    ans:[
      {b:true, t:"1. Markov Decision Process — All 5 Components (3 Marks):"},
      {t:"MDP provides the mathematical framework for modeling sequential decision-making where outcomes are partly random and partly controlled by the agent."},
      {t:"S — State Space: Set of all possible situations the agent can be in. Example: In a 4×4 grid, S = {(0,0), (0,1), ..., (3,3)} = 16 states."},
      {t:"A — Action Space: Set of all possible actions the agent can take in any state. Example: A = {Up, Down, Left, Right}."},
      {t:"P — Transition Probability P(s'|s,a): Probability of moving to state s' from state s when taking action a. In deterministic environments P=1 for one next state; in stochastic environments, multiple next states are possible with different probabilities."},
      {t:"R — Reward Function R(s,a): Numerical feedback for taking action a in state s. Example: R((3,3), any)=+1 (goal), R(obstacle, any)=-1, R(other, any)=0."},
      {t:"γ — Discount Factor (0 ≤ γ ≤ 1): Controls the weight given to future rewards. Ensures the sum of discounted rewards is finite."},
      {b:true, t:"2. Markov Property (1 Mark):"},
      {t:"'The future state depends ONLY on the current state — NOT on how the agent arrived at that state.'"},
      {t:"Formally: P(s_{t+1} | s_t, a_t) = P(s_{t+1} | s_0, a_0, s_1, a_1, ..., s_t, a_t)"},
      {t:"Implication: The agent only needs to know the CURRENT state, not the full history. This massively simplifies computation."},
      {b:true, t:"3. V(s) vs Q(s,a) — State-Value vs State-Action Value (3 Marks):"},
      {t:"State-Value Function V^π(s):"},
      {t:"  Definition: Expected return when starting in state s and following policy π thereafter."},
      {t:"  V^π(s) = E_π[G_t | S_t = s] = E_π[Σ γ^k · r_{t+k+1} | S_t = s]"},
      {t:"  Use: Tells how good it is to BE in state s (regardless of which specific action was taken)."},
      {t:"State-Action Value Function Q^π(s,a):"},
      {t:"  Definition: Expected return when starting in state s, taking action a, THEN following policy π."},
      {t:"  Q^π(s,a) = E_π[G_t | S_t = s, A_t = a]"},
      {t:"  Use: Tells how good it is to take specific action a in state s. More granular than V(s)."},
      {t:"Relationship: V^π(s) = Σ_a π(a|s) · Q^π(s,a) [weighted sum over all actions under policy π]"},
      {t:"Key insight: Q(s,a) is the basis of Q-Learning. V(s) is used in policy evaluation. Q gives more information — you can derive the optimal policy directly from Q values."},
      {b:true, t:"4. Monte Carlo vs Temporal Difference Learning (3 Marks):"},
      {t:"Monte Carlo: Updates at END of complete episode. Uses actual returns G_t. No bootstrapping. High variance (different episodes give different returns). Zero bias (exact returns). Cannot work on non-terminating tasks. Example: Blackjack — each hand is a complete episode."},
      {t:"TD Learning: Updates after EVERY step. Uses estimate: V(s) ← V(s) + α[r + γV(s') - V(s)]. Uses bootstrapping (estimates from estimates). Lower variance. Some bias. Works on continuous/non-terminating tasks. Example: Robot navigation — continuous interaction."},
      {t:"Update Rule Comparison: MC: V(S_t) ← V(S_t) + α[G_t - V(S_t)] | TD(0): V(S_t) ← V(S_t) + α[R_{t+1} + γV(S_{t+1}) - V(S_t)]"},
    ]
  },
  {
    lv:"Evaluation (Bloom's Level 5)",
    q:"Q4. Explain the complete Bellman Equation with derivation — including the expanded form with transition probabilities P(s'|s,a). Evaluate the limitations of simple value assignment (assigning 1 to all preceding states) and explain why Bellman's approach is superior. Then evaluate ALL key RL concepts in a single comprehensive table. (10 Marks)",
    ans:[
      {b:true, t:"1. Why Simple Value Assignment Fails (2 Marks):"},
      {t:"The naive approach assigns value 1 to every state on the path to the goal. Problem: When an agent reaches a state with value 1 on BOTH sides (e.g., one path leads to diamond, one leads to fire pit), it cannot distinguish which direction is better — both show value 1."},
      {t:"Example: From state S5, if paths to S1 (toward diamond) and S8 (fire pit) both show value 1, the agent cannot choose. This makes it impossible to navigate correctly."},
      {t:"Solution: Bellman equation assigns DECAYING values based on distance from goal (via discount factor), creating a gradient that guides the agent. V(S2)=0.9 > V(S1)=0.81 > V(S5)=0.73 — always pointing toward higher value = toward goal."},
      {b:true, t:"2. Bellman Equation — Full Derivation (4 Marks):"},
      {t:"Basic Form (Deterministic): V(s) = max_a [R(s,a) + γ · V(s')]"},
      {t:"This says: The value of state s = the best action we can take (immediate reward R + discounted value of next state γV(s'))."},
      {t:"Expanded Form with Transition Probabilities (Stochastic environments):"},
      {t:"V(s) = max_a [ R(s,a) + γ · Σ_{s'} P(s'|s,a) · V(s') ]"},
      {t:"Where: P(s'|s,a) = probability of transitioning to s' from s when taking action a. The sum Σ P(s'|s,a)·V(s') = expected value over all possible next states (weighted by transition probability)."},
      {t:"Bellman Optimality Equation for Q-function: Q*(s,a) = R(s,a) + γ · Σ_{s'} P(s'|s,a) · max_{a'} Q*(s',a')"},
      {t:"This says: The optimal Q-value for (s,a) = immediate reward + discounted expected optimal Q-value of the best action in the next state."},
      {t:"Relationship: V*(s) = max_a Q*(s,a) — The optimal state value equals the Q-value of the best action."},
      {b:true, t:"3. Why Bellman Equation is Superior (2 Marks):"},
      {t:"Creates a VALUE GRADIENT: States closer to goal have higher values (V(S3)=1 > V(S2)=0.9 > V(S1)=0.81...). This gradient naturally guides the agent toward the goal."},
      {t:"Handles competing paths: Fire pit state will have V = negative (V(fire) = -1 or lower). The agent automatically avoids negative-value paths and moves toward positive-value states."},
      {t:"Recursive structure: Breaking the complex global optimization into simple local decisions — at each state, just pick the action that maximizes R + γV(s'). No global search needed."},
      {t:"Converges to optimal: Repeated application of Bellman updates (value iteration) provably converges to optimal value function V* under mild conditions."},
      {b:true, t:"4. Comprehensive RL Concepts Table (2 Marks):"},
      {t:"Agent: Makes decisions | Environment: World agent acts in | State s: Current situation | Action a: Move agent makes | Reward R: Immediate feedback | Policy π: State→Action mapping | V(s): Long-term state value | Q(s,a): Long-term state-action value | γ: Discount factor (0 to 1) | G_t: Return (cumulative reward) | MDP: Mathematical framework | Bellman Eq: V(s)=max[R+γV(s')] | MC: Episode-end updates | TD: Step-by-step updates | Markov Property: Future depends only on present"},
    ]
  },
  {
    lv:"Synthesis / Create (Bloom's Level 6)",
    q:"Q5. Design a complete Reinforcement Learning system for training an autonomous robot to navigate a 4×4 grid from start (0,0) to goal (3,3) while avoiding obstacles at (1,1) and (2,2). Specify: (a) Full MDP formulation, (b) Reward design with justification, (c) Policy type choice with reasoning, (d) Bellman equation application — compute V values for a 3-step path (3,3)→(3,2)→(3,1) with γ=0.9, (e) Choice between MC and TD learning with justification. (10 Marks)",
    ans:[
      {b:true, t:"(a) MDP Formulation (2 Marks):"},
      {t:"States S: All 16 grid cells (0,0) to (3,3) except obstacle cells. |S| = 14 valid states."},
      {t:"Actions A: {Up, Down, Left, Right} — 4 actions per state (boundary constraints applied)."},
      {t:"Transition Probability P: Deterministic P=1 for most moves. If stochastic (slippery floor), P=0.8 for intended direction, 0.1 for each perpendicular direction."},
      {t:"Reward R: R(3,3, any) = +10 (goal reached). R(obstacle, any) = -5 (collision). R(boundary hit) = -1 (invalid move). R(any other) = -0.1 (small step penalty encourages efficiency)."},
      {t:"Discount Factor γ = 0.9: Balanced — values long-term goal but penalizes unnecessary delays."},
      {b:true, t:"(b) Reward Design Justification (2 Marks):"},
      {t:"+10 for goal: Large positive reward makes the goal highly desirable. Dominates all penalties."},
      {t:"-5 for obstacles: Severe enough to avoid obstacles but not infinite (allows exploration near them)."},
      {t:"-0.1 per step: Small penalty for each move encourages the shortest path (without it, agent might wander randomly). This is 'reward shaping' for efficiency."},
      {t:"-1 for boundary: Discourages hitting walls, teaching the agent the grid boundaries."},
      {b:true, t:"(c) Policy Type Choice (1 Mark):"},
      {t:"Initially: Epsilon-greedy stochastic policy. ε=0.3 means 30% random actions (exploration), 70% greedy (exploitation). This allows the agent to discover paths it might otherwise miss."},
      {t:"Final policy: Deterministic — after sufficient training, the optimal action for each state is fixed. Rationale: Deterministic optimal policy is sufficient for deterministic environments."},
      {b:true, t:"(d) Bellman Equation — Compute V for path (3,3)→(3,2)→(3,1) with γ=0.9 (3 Marks):"},
      {t:"V(3,3) = Goal state. R = +10, no further state."},
      {t:"  V(3,3) = max[R(s,a) + γV(s')] = max[10 + 0.9×0] = 10.0"},
      {t:"V(3,2): Leads to (3,3). R = -0.1 (step penalty), V(3,3) = 10.0."},
      {t:"  V(3,2) = max[-0.1 + 0.9 × 10.0] = max[-0.1 + 9.0] = max[8.9] = 8.9"},
      {t:"V(3,1): Leads to (3,2). R = -0.1 (step penalty), V(3,2) = 8.9."},
      {t:"  V(3,1) = max[-0.1 + 0.9 × 8.9] = max[-0.1 + 8.01] = max[7.91] = 7.91"},
      {t:"Result: V(3,3)=10.0, V(3,2)=8.9, V(3,1)=7.91 — values decrease with distance from goal, creating a gradient guiding the robot toward (3,3)."},
      {b:true, t:"(e) MC vs TD Learning Choice (2 Marks):"},
      {t:"Recommendation: USE TD LEARNING (specifically Q-Learning)."},
      {t:"Reasons: (1) Grid navigation episodes are long — waiting for complete episodes (MC) is inefficient. (2) TD updates after every step → faster learning. (3) The environment is episodic but TD handles it equally well. (4) Q-Learning (a TD method) directly learns Q(s,a) values — perfect for choosing optimal actions per state."},
      {t:"TD Update Rule: Q(s,a) ← Q(s,a) + α[R + γ·max_{a'}Q(s',a') - Q(s,a)]"},
      {t:"Where α=0.1 (learning rate), γ=0.9 (discount). After many episodes, Q values converge to optimal, and the robot learns the shortest obstacle-avoiding path from (0,0) to (3,3)."},
    ]
  },
];

// ── MCQ TABLE ─────────────────────────────────────────────────────────────────
function mcqTable(qs) {
  const hdrCells = ["Q#","Bloom's","Question & Options","Correct Answer"].map((h,i)=>
    new TableCell({ borders:B, width:{size:[400,1000,5160,2800][i],type:WidthType.DXA}, shading:{fill:T.hdr,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:h,bold:true,size:18,color:"FFFFFF"})]})] })
  );
  const hdrRow = new TableRow({ children: hdrCells });

  const dataRows = qs.map((q,i) => {
    const bg = i%2===0?"FFFFFF":T.alt;
    return new TableRow({ children:[
      new TableCell({ borders:B, width:{size:400,type:WidthType.DXA}, shading:{fill:bg,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:`${i+1}`,bold:true,size:18})]})] }),
      new TableCell({ borders:B, width:{size:1000,type:WidthType.DXA}, shading:{fill:bg,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:q.bl,size:17,italics:true})]})] }),
      new TableCell({ borders:B, width:{size:5160,type:WidthType.DXA}, shading:{fill:bg,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[
        new Paragraph({children:[new TextRun({text:q.q,bold:true,size:19})],spacing:{before:40,after:30}}),
        ...q.opts.map(o=>new Paragraph({children:[new TextRun({text:o,size:18})],spacing:{before:15,after:15}}))
      ]}),
      new TableCell({ borders:B, width:{size:2800,type:WidthType.DXA}, shading:{fill:T.iGreen,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:q.ans,bold:true,size:17,color:"1B5E20"})]})] }),
    ]});
  });
  return new Table({ width:{size:9360,type:WidthType.DXA}, columnWidths:[400,1000,5160,2800], rows:[hdrRow,...dataRows] });
}

function longSection(q,i) {
  return new Table({
    width:{size:9360,type:WidthType.DXA}, columnWidths:[9360],
    rows:[
      new TableRow({children:[new TableCell({borders:B, shading:{fill:T.hdr,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:200,right:200}, children:[
        new Paragraph({children:[new TextRun({text:`Q${i+1}  (10 Marks)  |  ${q.lv}`,bold:true,size:22,color:"FFFFFF"})]})
      ]})]}),
      new TableRow({children:[new TableCell({borders:B, shading:{fill:T.qBg,type:ShadingType.CLEAR}, margins:{top:120,bottom:120,left:200,right:200}, children:[
        new Paragraph({children:[new TextRun({text:q.q,bold:true,size:21})],spacing:{before:60,after:60}})
      ]})]}),
      new TableRow({children:[new TableCell({borders:B, shading:{fill:T.ansBg,type:ShadingType.CLEAR}, margins:{top:120,bottom:120,left:200,right:200}, children:[
        new Paragraph({children:[new TextRun({text:"MODEL ANSWER:",bold:true,size:21,color:T.h3})],spacing:{before:60,after:80}}),
        ...q.ans.map(a=>new Paragraph({children:[new TextRun({text:a.t,bold:a.b||false,size:20})],spacing:{before:a.b?60:30,after:a.b?40:25}}))
      ]})]}),
    ]
  });
}

// ── DOCUMENT ──────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering:{
    config:[
      {reference:"bullets",levels:[
        {level:0,format:LevelFormat.BULLET,text:"\u2022",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:360}}}},
        {level:1,format:LevelFormat.BULLET,text:"\u25CB",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:1080,hanging:360}}}}
      ]},
      {reference:"numbers",levels:[
        {level:0,format:LevelFormat.DECIMAL,text:"%1.",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:360}}}},
        {level:1,format:LevelFormat.LOWER_LETTER,text:"%2)",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:1080,hanging:360}}}}
      ]},
    ]
  },
  styles:{
    default:{document:{run:{font:"Calibri",size:22}}},
    paragraphStyles:[
      {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:38,bold:true,font:"Calibri",color:T.h1},paragraph:{spacing:{before:360,after:200},outlineLevel:0}},
      {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:28,bold:true,font:"Calibri",color:T.h2},paragraph:{spacing:{before:260,after:120},outlineLevel:1}},
      {id:"Heading3",name:"Heading 3",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:24,bold:true,font:"Calibri",color:T.h3},paragraph:{spacing:{before:180,after:80},outlineLevel:2}},
    ]
  },
  sections:[{
    properties:{page:{size:{width:12240,height:15840},margin:{top:1080,right:1080,bottom:1080,left:1260}}},
    children:[
      // TITLE
      EL(),EL(),EL(),
      new Paragraph({children:[new TextRun({text:"UNIT 4",bold:true,size:54,color:T.h1,font:"Calibri"})],alignment:AlignmentType.CENTER,spacing:{before:200,after:120}}),
      new Paragraph({children:[new TextRun({text:"Reinforcement Learning - I",bold:true,size:42,color:T.h2,font:"Calibri"})],alignment:AlignmentType.CENTER,spacing:{before:80,after:80}}),
      new Paragraph({children:[new TextRun({text:"Foundations of Reinforcement Learning",bold:false,size:30,color:"555555",font:"Calibri",italics:true})],alignment:AlignmentType.CENTER,spacing:{before:40,after:80}}),
      new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:8,color:T.h1,space:1}},spacing:{before:160,after:120}}),
      new Paragraph({children:[new TextRun({text:"Comprehensive Study Notes with MCQs & Model Answers",size:26,italics:true,color:"595959"})],alignment:AlignmentType.CENTER,spacing:{before:80,after:200}}),
      BOX([
        {t:"Topics Covered:",b:true,s:23},
        {t:"1. What is Reinforcement Learning? — Definition, Comparison, Key Terms"},
        {t:"2. Components of RL — Agent, Environment, State, Action, Reward, Policy, V(s), Q(s,a)"},
        {t:"3. Three RL Approaches — Value-based, Policy-based, Model-based"},
        {t:"4. Return (G) in Reinforcement Learning"},
        {t:"5. Discount Factor (γ) — Intuition, Formula, Effect"},
        {t:"6. Markov Decision Process (MDP) — All 5 Components + Markov Property"},
        {t:"7. Learning Methods — Monte Carlo vs Temporal Difference Learning"},
        {t:"8. State-Action Value Function Q(s,a) — Definition & Formula"},
        {t:"9. Bellman Equation — Derivation, Expanded Form, Step-by-Step Numerical"},
        {t:"10. Learning the State-Value Function — Policy Evaluation & Improvement"},
        {t:"11. 30 MCQs — Bloom's Taxonomy (with Answers)"},
        {t:"12. 5 Long Answer Questions (10 Marks each with Model Answers)"},
      ],T.iBlue),
      EL(), PB(),

      // ── SECTION 1 ────────────────────────────────────────────────────────
      H1("1. What is Reinforcement Learning?"),
      DIV(),
      H2("1.1 Definition"),
      P("Reinforcement Learning (RL) is a machine learning paradigm where an AGENT learns to make optimal decisions by interacting with an ENVIRONMENT through trial and error. The agent performs actions, receives rewards or penalties as feedback, and uses this experience to improve its decision-making strategy (policy) over time."),
      EL(),
      BOX([
        {t:"Core Idea:",b:true},
        {t:"RL = Learning by Doing. The agent takes actions, gets feedback (reward/penalty), and improves."},
        {t:"Inspired by Behavioral Psychology: Like training an animal — reward good behavior, punish bad."},
        {t:"Goal: Find the policy π* that maximizes the expected CUMULATIVE reward over time."},
        {t:'Famous Quote: "RL is an autonomous, self-teaching system that learns by trial and error to achieve the best outcomes."'},
      ],T.iBlue),
      EL(),
      H2("1.2 How RL Differs from Other ML Types"),
      twoCol(
        ["RL vs Supervised Learning","RL vs Unsupervised Learning"],
        [
          ["No labeled input-output pairs","No fixed dataset or predefined structure"],
          ["Learns from interaction & feedback","Learns from interaction — not from static data"],
          ["Reward signal (not labels) guides learning","Reward signal provides guidance (not present in unsupervised)"],
          ["Data generated dynamically by agent actions","Data generated dynamically — not pre-collected"],
          ["Example: Robot learning to walk","Example: Optimizing a game-playing strategy"],
        ],
        [T.h3, T.h2]
      ),
      EL(),
      H2("1.3 Classic RL Example: Robot in a Grid"),
      P("A robot starts at (0,0) in a 4×4 grid. Goal: Reach (3,3) (diamond). Hazards: obstacles at (1,1) and (2,2). Actions: Up, Down, Left, Right. Rewards: +1 for reaching goal, -1 for hitting obstacle, 0 for all other moves."),
      P("The robot tries ALL possible paths. Wrong paths subtract reward. The path giving maximum cumulative reward is learned as the optimal policy."),
      P("Solution path: (0,0)→(0,1)→(0,2)→(1,2)→(2,2)→(3,2)→(3,3). Return = +1."),
      EL(),
      H2("1.4 PacMan as RL"),
      BOX([
        {t:"Agent:       PacMan character"},
        {t:"Environment: The grid world (map)"},
        {t:"State:       PacMan's position + ghost positions + remaining food"},
        {t:"Actions:     Move Up, Down, Left, Right"},
        {t:"Reward:      +1 for eating food, -1 for being caught by ghost"},
        {t:"Goal:        Maximize total food eaten while surviving"},
      ],T.iPurple),

      // ── SECTION 2 ────────────────────────────────────────────────────────
      EL(), PB(),
      H1("2. Key Terms and Components of RL"),
      DIV(),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[1800,2880,4680],
        rows:[
          new TableRow({children:["Term","Symbol/Formula","Definition & Example"].map(h=>new TableCell({borders:B,shading:{fill:T.hdr,type:ShadingType.CLEAR},margins:{top:90,bottom:90,left:120,right:120},children:[new Paragraph({children:[new TextRun({text:h,bold:true,size:20,color:"FFFFFF"})]})]}))}),
          ...[
            ["Agent","—","Learner that perceives environment and acts. Example: Robot, chess player."],
            ["Environment","—","Surroundings the agent operates in. Assumed stochastic (random). Example: Grid world."],
            ["State","S or s","Current situation returned by environment. Example: Grid position (row, col)."],
            ["Action","A or a","Moves available to the agent. Example: Up, Down, Left, Right."],
            ["Reward","R or r","Immediate numerical feedback for an action. +1 = good, -1 = bad."],
            ["Policy","π (pi)","Strategy mapping states to actions. Deterministic or Stochastic."],
            ["Value Fn","V(s)","Expected LONG-TERM return from state s. Discounted. 'How good is this state?'"],
            ["Q-Value","Q(s,a)","Expected return for taking action a in state s. More granular than V(s)."],
            ["Return","G_t","Cumulative discounted reward from time t onward. G_t = Σ γ^k · r_{t+k}."],
            ["Discount","γ (gamma)","Factor ∈ [0,1] controlling how much future rewards are valued. γ=0: myopic; γ=1: far-sighted."],
          ].map((r,ri)=>new TableRow({children:r.map((cell,ci)=>new TableCell({borders:B,width:{size:[1800,2880,4680][ci],type:WidthType.DXA},shading:{fill:ri%2===0?"FFFFFF":T.alt,type:ShadingType.CLEAR},margins:{top:70,bottom:70,left:120,right:120},children:[new Paragraph({children:[new TextRun({text:cell,size:19,bold:ci===0})]})]}))}))]
        ]
      }),
      EL(),
      H2("2.1 Value Function vs Q-Value Function"),
      FBOX([
        {t:"V(s) — State Value Function:",b:true},
        {t:"V^π(s) = E_π [ G_t | S_t = s ] = E_π [ Σ γ^k · r_{t+k+1} | S_t = s ]"},
        {t:"Answers: 'How good is it to be in state s?' (assuming policy π followed thereafter)"},
        {t:""},
        {t:"Q(s,a) — State-Action Value Function:",b:true},
        {t:"Q^π(s,a) = E_π [ G_t | S_t = s, A_t = a ]"},
        {t:"Answers: 'How good is it to take action a in state s?' (then follow policy π)"},
        {t:""},
        {t:"Relationship: V^π(s) = Σ_a π(a|s) · Q^π(s,a)  [weighted sum of Q values under policy π]"},
      ]),

      // ── SECTION 3 ────────────────────────────────────────────────────────
      EL(), PB(),
      H1("3. Three Approaches to Implement Reinforcement Learning"),
      DIV(),
      H2("3.1 Value-Based RL"),
      P("Find the optimal value function V*(s) or Q*(s,a). The policy is implicitly derived — always move to the state/action with the highest value. No explicit policy function is maintained."),
      BP("Key idea","The value function IS the policy — act greedily with respect to values."),
      BP("Example","Q-Learning: Learns Q*(s,a) directly. Policy: always choose action with max Q-value."),
      BP("Advantage","Simple, convergence guarantees for tabular MDPs."),
      BP("Limitation","Requires all state-action pairs to be visited — scales poorly to large state spaces."),
      EL(),
      H2("3.2 Policy-Based RL"),
      P("Directly search for the optimal policy π* without using a value function. The policy is parameterized (e.g., neural network) and updated using gradient ascent on expected reward."),
      BU("Deterministic Policy: π(s) → a (maps state to a fixed action). Same state always gives same action."),
      BU("Stochastic Policy: π(a|s) → probability distribution over actions. Different runs may take different actions."),
      BP("Example","REINFORCE (policy gradient). Advantage: Works well in continuous action spaces."),
      BP("Limitation","High variance in updates; slower to converge than value-based methods."),
      EL(),
      H2("3.3 Model-Based RL"),
      P("Build an internal model of the environment: given (s, a), predict (s', r). Use this model to plan — simulate future states before actually taking actions."),
      BP("Advantage","Can plan ahead, more sample-efficient than model-free methods."),
      BP("Limitation","Model errors can mislead the agent. No universal algorithm — varies per environment."),
      EL(),
      H2("3.4 Actor-Critic Methods (Hybrid)"),
      P("Combines BOTH value-based (Critic) and policy-based (Actor) approaches. Actor: Policy network — decides which action to take. Critic: Value network — evaluates how good the action was. Together: more stable and efficient learning than either alone."),
      twoCol(
        ["Value-Based","Policy-Based"],
        [
          ["Learns V(s) or Q(s,a) directly","Directly learns policy π(a|s)"],
          ["Policy derived implicitly (greedy)","Policy is explicit and parameterized"],
          ["Works well for discrete action spaces","Works well for continuous action spaces"],
          ["High sample efficiency","Lower sample efficiency"],
          ["Example: Q-Learning, SARSA","Example: REINFORCE, PPO"],
        ],
        [T.h3, T.h2]
      ),

      // ── SECTION 4 ────────────────────────────────────────────────────────
      EL(), PB(),
      H1("4. The Return (G) and Discount Factor (γ)"),
      DIV(),
      H2("4.1 What is the Return?"),
      P("The Return G_t is the total cumulative reward an agent receives from time step t onward. It is the key quantity the RL agent tries to MAXIMIZE. The objective of RL is: find policy π* that maximizes E[G_t]."),
      EL(),
      FBOX([
        {t:"Return Formula:",b:true,s:23},
        {t:"Without discount: G_t = r_t + r_{t+1} + r_{t+2} + ... = Σ_{k=0}^{∞} r_{t+k}"},
        {t:"With discount:   G_t = r_t + γ·r_{t+1} + γ²·r_{t+2} + ... = Σ_{k=0}^{∞} γ^k · r_{t+k}"},
        {t:""},
        {t:"Recursive form:  G_t = r_t + γ · G_{t+1}   ← This is the key to Bellman equation!"},
      ]),
      EL(),
      H2("4.2 Discount Factor γ (Gamma) — Intuition"),
      P("The discount factor γ ∈ [0, 1] controls how much the agent values future rewards compared to immediate rewards. Every step into the future, the reward is multiplied by γ, making it less valuable."),
      EL(),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[1560,1560,1560,1560,2520],
        rows:[
          new TableRow({children:["γ Value","Behavior","Reward in 1 step","Reward in 5 steps","Use Case"].map(h=>new TableCell({borders:B,shading:{fill:T.hdr,type:ShadingType.CLEAR},margins:{top:90,bottom:90,left:100,right:100},children:[new Paragraph({children:[new TextRun({text:h,bold:true,size:19,color:"FFFFFF"})]})]}))}),
          ...[
            ["γ = 0","Completely myopic","γ¹ × R = 0","0","Very short-term tasks"],
            ["γ = 0.5","Short-sighted","0.5 × R","0.03 × R","Tasks with immediate consequences"],
            ["γ = 0.9","Balanced (typical)","0.9 × R","0.59 × R","Most standard RL tasks"],
            ["γ = 0.99","Far-sighted","0.99 × R","0.95 × R","Long-horizon planning tasks"],
            ["γ = 1","No discounting","1 × R","1 × R","Episodic finite tasks only"],
          ].map((r,ri)=>new TableRow({children:r.map((cell,ci)=>new TableCell({borders:B,shading:{fill:ri%2===0?"FFFFFF":T.alt,type:ShadingType.CLEAR},margins:{top:70,bottom:70,left:100,right:100},children:[new Paragraph({children:[new TextRun({text:cell,size:19})]})]}))}))]
        ]
      }),
      EL(),
      H2("4.3 Worked Return Example"),
      FBOX([
        {t:"Rewards sequence: r0=0, r1=0, r2=0, r3=+1   (diamond at step 3)   γ=0.9",b:true},
        {t:"G0 = r0 + γ·r1 + γ²·r2 + γ³·r3"},
        {t:"G0 = 0 + 0.9×0 + 0.81×0 + 0.729×1 = 0.729"},
        {t:""},
        {t:"Insight: A reward of +1 received 3 steps in the future is only worth 0.729 today."},
        {t:"This is why RL agents try to reach goals in FEWER steps — more steps = less return."},
      ]),

      // ── SECTION 5 ────────────────────────────────────────────────────────
      EL(), PB(),
      H1("5. Markov Decision Process (MDP)"),
      DIV(),
      P("MDP provides the complete mathematical framework for modeling RL problems. It defines the structure of the environment and the agent-environment interaction. Formally: MDP = (S, A, P, R, γ)."),
      EL(),
      H2("5.1 The Five Components of MDP"),
      FBOX([
        {t:"MDP = ( S,  A,  P,  R,  γ )",b:true,s:26},
      ]),
      EL(),
      BOX([
        {t:"S — State Space:",b:true},
        {t:"   Set of all possible states the agent can be in."},
        {t:"   Example (grid world): S = {(0,0),(0,1),...,(3,3)} — all 16 cell positions."},
        {t:"   |S| = number of states. Can be finite (grid) or infinite (continuous space)."},
      ],T.iBlue),
      EL(),
      BOX([
        {t:"A — Action Space:",b:true},
        {t:"   Set of all possible actions available to the agent."},
        {t:"   Example: A = {Up, Down, Left, Right} — 4 discrete actions."},
        {t:"   Can be discrete (chess moves) or continuous (steering angle)."},
      ],T.iGreen),
      EL(),
      BOX([
        {t:"P — Transition Probability P(s' | s, a):",b:true},
        {t:"   Probability of moving to state s' when taking action a in state s."},
        {t:"   Deterministic: P=1 for one specific s' (certain outcome)."},
        {t:"   Stochastic: Multiple s' possible with different probabilities. Example: P(right|s,right)=0.8, P(up|s,right)=0.1, P(down|s,right)=0.1."},
      ],T.iYellow),
      EL(),
      BOX([
        {t:"R — Reward Function R(s, a):",b:true},
        {t:"   Numerical feedback for taking action a in state s."},
        {t:"   Can be R(s), R(s,a), or R(s,a,s') depending on the formulation."},
        {t:"   Example: R(goal, any) = +1, R(obstacle, any) = -1, R(other, any) = 0."},
      ],T.iRed),
      EL(),
      BOX([
        {t:"γ — Discount Factor:",b:true},
        {t:"   Controls the time preference for rewards. γ ∈ [0,1]."},
        {t:"   Ensures convergence of the infinite sum of rewards."},
        {t:"   Standard choice: γ = 0.9 to 0.99 for most tasks."},
      ],T.iPurple),
      EL(),
      H2("5.2 The Markov Property"),
      FBOX([
        {t:"Markov Property:",b:true,s:24},
        {t:"'The future depends ONLY on the current state — NOT on the history of how we got here.'"},
        {t:""},
        {t:"Formally: P(S_{t+1} | S_t, A_t) = P(S_{t+1} | S_0,A_0, S_1,A_1, ..., S_t, A_t)"},
        {t:""},
        {t:"Example: If the robot is at (2,3), the probability of moving to (3,3) depends"},
        {t:"         ONLY on being at (2,3) — not on whether it came from (1,3) or (2,2)."},
        {t:""},
        {t:"Implication: Agent only needs current state → no need to store full history → great simplification!"},
      ]),

      // ── SECTION 6 ────────────────────────────────────────────────────────
      EL(), PB(),
      H1("6. Learning Methods: Monte Carlo vs Temporal Difference"),
      DIV(),
      H2("6.1 Monte Carlo (MC) Learning"),
      P("Monte Carlo methods learn by averaging the total returns from COMPLETE episodes. The agent plays through an entire episode, then updates value estimates using the actual return G_t received."),
      BU("Model-free: Learns directly from interaction without a model of the environment."),
      BU("Requires complete episodes: Cannot update mid-episode."),
      BU("High variance: Returns vary between episodes. Zero bias: Uses actual returns."),
      BU("Update rule: V(S_t) ← V(S_t) + α[G_t − V(S_t)]"),
      BP("Example","Blackjack: Each hand is a complete episode. Update after each game based on final win/loss."),
      EL(),
      H2("6.2 Temporal Difference (TD) Learning"),
      P("TD learning updates value estimates after EVERY step using a mix of actual reward and estimated future value (bootstrapping). It does not need to wait for the episode to end."),
      BU("Model-free: Also learns directly from interaction."),
      BU("Updates every step: More efficient for long or continuous episodes."),
      BU("Lower variance than MC, but has some bias (estimates from estimates)."),
      BU("TD(0) update rule: V(S_t) ← V(S_t) + α[R_{t+1} + γV(S_{t+1}) − V(S_t)]"),
      BU("The term [R_{t+1} + γV(S_{t+1}) − V(S_t)] is called the TD Error (δ)."),
      BP("Example","Robot navigation: Updates after every move, not at end of episode."),
      EL(),
      threeCol(
        ["Feature","Monte Carlo","TD Learning"],
        [
          ["Update Time","End of complete episode","After every step"],
          ["Needs Episode End?","Yes","No"],
          ["Bootstrapping","No (uses exact return)","Yes (uses estimated V(s'))"],
          ["Variance","High","Lower"],
          ["Bias","Zero","Some bias"],
          ["Non-episodic Tasks","❌ Cannot handle","✅ Handles well"],
          ["Speed","Slower convergence","Faster convergence"],
          ["Best For","Episodic tasks with short episodes","Long/continuous tasks"],
        ]
      ),

      // ── SECTION 7 ────────────────────────────────────────────────────────
      EL(), PB(),
      H1("7. State-Action Value Function Q(s, a)"),
      DIV(),
      P("The State-Action Value Function (also called the Q-function or Q(s,a)) specifies how good it is for an agent to perform a particular action a in state s while following policy π."),
      EL(),
      FBOX([
        {t:"Q-Function Definition:",b:true,s:24},
        {t:"Q^π(s,a) = E_π [ G_t | S_t = s, A_t = a ]"},
        {t:"         = E_π [ Σ_{k=0}^{∞} γ^k · r_{t+k+1} | S_t = s, A_t = a ]"},
        {t:""},
        {t:"Meaning: The expected total discounted reward starting from state s,"},
        {t:"         taking action a, THEN following policy π for all future steps."},
        {t:""},
        {t:"Optimal Q-function: Q*(s,a) = max_π Q^π(s,a)"},
        {t:"Optimal Policy:      π*(s) = argmax_a Q*(s,a)  ← Take action with highest Q-value"},
      ]),
      EL(),
      H2("7.1 Why Q(s,a) over V(s)?"),
      twoCol(
        ["V(s) — State Value","Q(s,a) — State-Action Value"],
        [
          ["Evaluates a STATE","Evaluates a STATE-ACTION PAIR"],
          ["V(s) = expected return from being in s","Q(s,a) = expected return from taking a in s"],
          ["Need model to derive policy from V","Policy directly from Q: π* = argmax_a Q(s,a)"],
          ["Less information per entry","More information — richer representation"],
          ["Used in policy evaluation","Used in Q-Learning, DQN, SARSA"],
        ],
        [T.h3,T.h2]
      ),

      // ── SECTION 8 ────────────────────────────────────────────────────────
      EL(), PB(),
      H1("8. Bellman Equation"),
      DIV(),
      P("The Bellman Equation, introduced by Richard Ernest Bellman in 1953, is the central equation in RL. It expresses the value of a state as a function of immediate reward plus the discounted value of the next state — creating a recursive, solvable structure."),
      EL(),
      H2("8.1 Key Elements"),
      BU("s = current state"),
      BU("a = action taken by agent"),
      BU("R(s,a) = immediate reward for taking action a in state s"),
      BU("s' = next state reached after taking action a"),
      BU("γ = discount factor"),
      BU("V(s') = value of next state"),
      EL(),
      H2("8.2 Bellman Equation Formulas"),
      FBOX([
        {t:"Bellman Equation for V(s) — Deterministic:",b:true,s:24},
        {t:"V(s) = max_a [ R(s,a) + γ · V(s') ]"},
        {t:""},
        {t:"Bellman Equation for V(s) — Stochastic (with transition probabilities):",b:true,s:24},
        {t:"V(s) = max_a [ R(s,a) + γ · Σ_{s'} P(s'|s,a) · V(s') ]"},
        {t:""},
        {t:"Bellman Optimality Equation for Q*(s,a):",b:true,s:24},
        {t:"Q*(s,a) = R(s,a) + γ · Σ_{s'} P(s'|s,a) · max_{a'} Q*(s',a')"},
        {t:""},
        {t:"Relationship: V*(s) = max_a Q*(s,a)"},
      ]),
      EL(),
      H2("8.3 Why Simple Value Propagation Fails"),
      P("The naive approach assigns value 1 to every state on the path toward the goal. Problem: When a state has value 1 on BOTH sides (one toward diamond, one toward fire), the agent cannot choose. The Bellman equation solves this by creating decaying values — closer to goal = higher value."),
      EL(),
      H2("8.4 Complete Worked Numerical Example (From PPT)"),
      P("Maze: S9→S5→S1→S2→S3 (diamond). Terminal state S3 has reward +1. γ=0.9. Fire pit S8 has reward -1."),
      EL(),
      GBOX([
        {t:"V(S3) = max[R(s,a) + γV(s')] = max[1 + 0.9×0] = 1.0   ← Diamond (terminal)",b:true},
        {t:"V(S2) = max[0 + 0.9 × V(S3)] = max[0 + 0.9×1.0] = max[0.9] = 0.9"},
        {t:"V(S1) = max[0 + 0.9 × V(S2)] = max[0 + 0.9×0.9] = max[0.81] = 0.81"},
        {t:"V(S5) = max[0 + 0.9 × V(S1)] = max[0 + 0.9×0.81] = max[0.729] = 0.73"},
        {t:"V(S9) = max[0 + 0.9 × V(S5)] = max[0 + 0.9×0.73] = max[0.657] = 0.66"},
      ]),
      EL(),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[1560,1560,2400,2400,1440],
        rows:[
          new TableRow({children:["State","Role","Calculation","V Value","Action"].map(h=>new TableCell({borders:B,shading:{fill:T.hdr,type:ShadingType.CLEAR},margins:{top:90,bottom:90,left:100,right:100},children:[new Paragraph({children:[new TextRun({text:h,bold:true,size:19,color:"FFFFFF"})]})]}))}),
          ...[
            ["S3","Diamond (Goal)","R=+1, no further state","1.00","TERMINAL"],
            ["S2","Path state","0 + 0.9 × 1.00 = 0.9","0.90","Move → S3"],
            ["S1","Path state","0 + 0.9 × 0.90 = 0.81","0.81","Move → S2"],
            ["S5","Path state","0 + 0.9 × 0.81 = 0.729","0.73","Move → S1"],
            ["S9","Start state","0 + 0.9 × 0.73 = 0.657","0.66","Move → S5"],
            ["S8","Fire pit","R=-1, terminal","-1.00","AVOID"],
          ].map((r,ri)=>new TableRow({children:r.map((cell,ci)=>new TableCell({borders:B,shading:{fill:ri===0?"D5F5E3":ri===5?"FFEBEE":ri%2===0?"FFFFFF":T.alt,type:ShadingType.CLEAR},margins:{top:70,bottom:70,left:100,right:100},children:[new Paragraph({children:[new TextRun({text:cell,size:18,bold:ci===0})]})]}))}))]
        ]
      }),
      EL(),
      BOX([
        {t:"Key Insight from Bellman Equation:",b:true},
        {t:"The state values form a GRADIENT pointing toward the goal:"},
        {t:"V(S9)=0.66 → V(S5)=0.73 → V(S1)=0.81 → V(S2)=0.90 → V(S3)=1.00"},
        {t:"An agent that always moves to the HIGHEST neighboring state value will reach the diamond optimally."},
        {t:"The fire pit (V=-1.0) creates a negative gradient that the agent naturally avoids."},
      ],T.iGreen),

      // ── SECTION 9 ────────────────────────────────────────────────────────
      EL(), PB(),
      H1("9. Learning the State-Value Function"),
      DIV(),
      P("The process of computing V(s) for all states under a given policy π is called Policy Evaluation. Once we have V(s), we can improve the policy. This cycle of evaluation and improvement is called Policy Iteration."),
      EL(),
      H2("9.1 Policy Evaluation (Prediction)"),
      P("Given a policy π, compute V^π(s) for all states. This is done iteratively by applying the Bellman equation repeatedly:"),
      FBOX([
        {t:"V_{k+1}(s) = Σ_a π(a|s) · [ R(s,a) + γ · Σ_{s'} P(s'|s,a) · V_k(s') ]",b:true,s:22},
        {t:""},
        {t:"Start with V_0(s) = 0 for all states. Apply update repeatedly until |V_{k+1}(s) − V_k(s)| < ε (convergence)."},
      ]),
      EL(),
      H2("9.2 Policy Improvement"),
      P("Once V^π(s) is known, improve the policy: for each state, choose the action that maximizes expected return. This greedy improvement always produces a policy at least as good as π."),
      FBOX([
        {t:"π'(s) = argmax_a [ R(s,a) + γ · Σ_{s'} P(s'|s,a) · V^π(s') ]",b:true},
      ]),
      EL(),
      H2("9.3 Policy Iteration & Value Iteration"),
      twoCol(
        ["Policy Iteration","Value Iteration"],
        [
          ["Alternates between full policy evaluation and improvement","Combines evaluation and improvement in one step"],
          ["Converges in fewer iterations","Each iteration is simpler"],
          ["Each iteration more expensive (full evaluation)","Converges to V* directly without explicit policy"],
          ["V_{k+1}(s) = max_a[R + γΣP·V_k] applied at improvement","V_{k+1}(s) = max_a[R + γΣP·V_k] applied at every step"],
          ["Guaranteed to converge to optimal policy π*","Guaranteed to converge to optimal V*"],
        ],
        [T.h3, T.h2]
      ),

      // ── MCQ ────────────────────────────────────────────────────────────────
      EL(), PB(),
      H1("SECTION A: 30 Multiple Choice Questions"),
      new Paragraph({children:[new TextRun({text:"Bloom's Taxonomy Levels — All Questions with Correct Answers",italics:true,size:22,color:"595959"})],spacing:{before:60,after:120}}),
      new Paragraph({children:[new TextRun({text:"Q1–5: Remember  |  Q6–10: Understand  |  Q11–15: Apply  |  Q16–20: Analyze  |  Q21–25: Evaluate  |  Q26–30: Create",size:19,italics:true,color:"595959"})],spacing:{before:40,after:160}}),
      mcqTable(MCQS),

      // ── LONG QS ─────────────────────────────────────────────────────────────
      EL(), PB(),
      H1("SECTION B: Long Answer Questions (10 Marks Each)"),
      new Paragraph({children:[new TextRun({text:"Bloom's Taxonomy — Higher Order Thinking  |  Complete Model Answers Included",italics:true,size:22,color:"595959"})],spacing:{before:60,after:200}}),
      ...LONGS.flatMap((q,i)=>[EL(), longSection(q,i)]),

      // FOOTER
      EL(),EL(),
      new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:8,color:T.h1,space:1}},spacing:{before:100,after:100}}),
      new Paragraph({children:[new TextRun({text:"End of Unit 4 Study Notes — Foundations of Reinforcement Learning",size:20,italics:true,color:"595959"})],alignment:AlignmentType.CENTER,spacing:{before:100,after:40}}),
    ]
  }]
});

Packer.toBuffer(doc).then(buf=>{
  fs.writeFileSync("/home/claude/Unit4_RL_Notes.docx", buf);
  console.log("Done");
});