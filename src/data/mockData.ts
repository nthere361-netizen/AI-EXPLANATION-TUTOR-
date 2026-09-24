import { ExplanationData, ExplanationLevel, StudyMaterial, LearningPath } from '../types';

export const POPULAR_SUGGESTIONS = [
  'Explain photosynthesis',
  'What is an API?',
  'Explain recursion',
  'How does AI work?',
  'Why does inflation happen?'
];

export const PRESET_EXPLANATIONS: Record<string, ExplanationData> = {
  'explain photosynthesis': {
    id: 'photosynthesis',
    topic: 'Photosynthesis',
    level: 'beginner',
    simpleExplanation: 'Photosynthesis is how plants turn sunlight, water, and carbon dioxide into food (sugar) and fresh oxygen. Without it, almost all life on Earth would run out of energy and air.',
    inSimpleWords: 'Think of a leaf as a tiny solar-powered bakery. The baker (chloroplast) catches sunshine on the solar roof, mixes in tap water from the soil and carbon dioxide from the air, and bakes sweet energy snacks (glucose) while venting out fresh oxygen as pleasant bakery aroma.',
    realWorldExample: {
      title: 'The Solar-Powered Kitchen',
      scenario: 'Imagine you have an oven that costs zero dollars to run because it only turns on when sunlight hits its roof. You feed in everyday tap water and carbon dioxide, and in return it dispenses fruit smoothies for plant energy and pumps clean mountain-fresh air into your living room.',
      takeaway: 'Plants don’t "eat" dirt—they manufacture their own fuel strictly from air, light, and water.'
    },
    visualExplanation: {
      title: 'The Photosynthesis Energy Conversion Flow',
      type: 'flow',
      stages: [
        { label: '1. Light & Water Intake', description: 'Chlorophyll traps solar photons while plant roots pull water (H₂O) upward.', badge: 'Inputs: Sunlight + H₂O' },
        { label: '2. Light Reactions (Thylakoids)', description: 'Solar energy splits water molecules, generating ATP energy and releasing Oxygen (O₂) into the air.', badge: 'Release: Oxygen' },
        { label: '3. Calvin Cycle (Stroma)', description: 'Carbon Dioxide (CO₂) from air is bonded into energy-dense glucose sugar using stored ATP.', badge: 'Fixation: CO₂ → Glucose' },
        { label: '4. Plant Growth & Life Support', description: 'Glucose fuels leaves, roots, flowers, and feeds herbivores across the planetary food web.', badge: 'Output: Biomass' }
      ],
      caption: 'Chemical Equation: 6CO₂ + 6H₂O + Light Energy ➔ C₆H₁₂O₆ + 6O₂'
    },
    stepByStep: [
      { stepNumber: 1, title: 'Photons hit chlorophyll', explanation: 'Green pigments inside leaf cells absorb red and blue light wavelengths while reflecting green light.', tip: 'This is why most healthy leaves appear vibrant green.' },
      { stepNumber: 2, title: 'Water molecules split', explanation: 'Inside thylakoid membranes, water (H₂O) is cleaved into hydrogen ions, energetic electrons, and free oxygen atoms.', tip: 'The plant does not need excess oxygen, so it exhales it through microscopic pores called stomata.' },
      { stepNumber: 3, title: 'Energy packets form', explanation: 'Sunlight-excited electrons power molecular turbines to create ATP and NADPH, the cell’s universal rechargeable batteries.' },
      { stepNumber: 4, title: 'Sugar synthesis (Calvin Cycle)', explanation: 'Using carbon atoms pulled from atmospheric carbon dioxide, the plant builds durable six-carbon glucose molecules.' }
    ],
    keyTakeaways: [
      'Inputs: Sunlight + Carbon Dioxide (CO₂) + Water (H₂O)',
      'Outputs: Glucose (plant food/energy) + Oxygen (O₂ for breathing)',
      'Site of action: Chloroplasts containing light-absorbing chlorophyll pigments',
      'Two main phases: Light-dependent reactions (daylight) and the Calvin cycle (carbon fixation)'
    ],
    checkUnderstanding: {
      question: 'Where does the oxygen released by plants during photosynthesis actually originate from?',
      options: [
        { text: 'From Carbon Dioxide (CO₂)', isCorrect: false, explanation: 'Common misconception! Carbon dioxide provides carbon and oxygen for glucose sugar, not the liberated oxygen gas.' },
        { text: 'From Water molecules (H₂O) split by sunlight', isCorrect: true, explanation: 'Spot on! Photolysis splits water (H₂O) into protons, electrons, and O₂ gas which diffuses into our atmosphere.' },
        { text: 'From soil minerals absorbed by roots', isCorrect: false, explanation: 'Soil minerals like nitrogen and potassium support plant health, but do not yield atmospheric oxygen.' },
        { text: 'From broken down glucose molecules', isCorrect: false, explanation: 'Glucose is the end product synthesized, not the initial source of liberated oxygen.' }
      ],
      hint: 'Think about what molecule gets broken apart at the very beginning of the light-dependent reaction.'
    },
    goDeeper: {
      concept: 'Rubisco Enzyme Inefficiency & C4 / CAM Evolution',
      whyItMatters: 'The primary enzyme driving carbon fixation, RuBisCO, is notoriously slow and frequently mistakes Oxygen for Carbon Dioxide (photorespiration), wasting up to 25% of the plant’s energy. Desert cacti (CAM) and corn (C4) evolved specialized biochemical pathways to bypass this flaw.',
      curiousQuestion: 'How could synthetic biology bioengineer faster Rubisco to boost global crop yields and fight climate change?'
    },
    suggestedNext: [
      'What is Cellular Respiration?',
      'How does the Calvin Cycle differ from Light Reactions?',
      'Why are leaves yellow and red in Autumn?'
    ],
    timestamp: Date.now()
  },

  'what is an api?': {
    id: 'api',
    topic: 'Application Programming Interface (API)',
    level: 'beginner',
    simpleExplanation: 'An API (Application Programming Interface) is a secure bridge and messenger that allows two different software applications to talk to each other and share information without needing to know each other’s internal code.',
    inSimpleWords: 'Think of an API as a polite restaurant waiter. You (the client/app) sit at a table looking at a menu. You cannot walk directly into the hot kitchen to cook or rummage through their pantry. Instead, you give your order to the waiter. The waiter takes it to the kitchen, gets your prepared food, and brings it back to your table safely.',
    realWorldExample: {
      title: 'Booking a Flight on Kayak or Skyscanner',
      scenario: 'When you search for flights on Skyscanner, Skyscanner doesn’t own airline reservation databases. Instead, Skyscanner’s software talks to United, Delta, and British Airways through their official APIs, asks "What seats are available for $400?", and shows you all results in one unified view.',
      takeaway: 'APIs allow distinct companies to cooperate seamlessly behind the scenes.'
    },
    visualExplanation: {
      title: 'Client - API - Server Request Architecture',
      type: 'flow',
      stages: [
        { label: '1. Client (You)', description: 'Your browser or phone app triggers an action (e.g., clicking "Check Weather").', badge: 'HTTP Request' },
        { label: '2. API Gateway & Contract', description: 'Validates API keys, checks authentication, rate limits, and routes the formatted payload.', badge: 'REST / JSON' },
        { label: '3. Backend Server & DB', description: 'Database processes query securely without exposing raw database credentials to client.', badge: 'Data Query' },
        { label: '4. JSON Response', description: 'Server sends structured payload (e.g., { temp: 72, condition: "Sunny" }) back to your screen.', badge: 'HTTP 200 OK' }
      ],
      caption: 'The client never touches the raw database; the API acts as a secure, structured intermediary.'
    },
    stepByStep: [
      { stepNumber: 1, title: 'Request is formatted', explanation: 'The client constructs an HTTP request with an endpoint URL, method (GET, POST, etc.), and optional parameters or headers.', tip: 'Example: GET https://api.weather.com/v1/forecast?city=Boston' },
      { stepNumber: 2, title: 'Authentication check', explanation: 'The server verifies your API key or bearer token to ensure you are authorized to read or modify this data.' },
      { stepNumber: 3, title: 'Business logic execution', explanation: 'The remote server handles internal algorithms and database lookups safely behind its firewall.' },
      { stepNumber: 4, title: 'Structured response returned', explanation: 'The API packages the resulting data, usually in JSON format, accompanied by an HTTP status code (like 200 for success).' }
    ],
    keyTakeaways: [
      'API stands for Application Programming Interface',
      'Acts as an abstraction layer: lets programs connect without sharing source code',
      'Most modern web APIs use HTTP verbs (GET, POST, PUT, DELETE) and JSON data formats',
      'Enables modular microservices, third-party integrations (payments, maps, AI), and mobile apps'
    ],
    checkUnderstanding: {
      question: 'Which of the following is the best example of an API in action?',
      options: [
        { text: 'A ride-share app displaying an interactive Google Map inside its own ride tracking screen', isCorrect: true, explanation: 'Exact match! The ride-share app uses Google Maps API to fetch map tiles and routing without having to launch satellites or build mapping tech from scratch.' },
        { text: 'A monitor displaying pixels sent from an HDMI cable', isCorrect: false, explanation: 'That is a hardware hardware video protocol, not a software programming interface.' },
        { text: 'Saving a text document directly to your laptop hard drive', isCorrect: false, explanation: 'That is standard local operating system file I/O, not software-to-software API communication.' },
        { text: 'Typing letters on a mechanical keyboard', isCorrect: false, explanation: 'That is human-computer interaction via physical peripherals.' }
      ],
      hint: 'Look for two independent software products cooperating with each other.'
    },
    goDeeper: {
      concept: 'REST vs GraphQL vs gRPC Architecture',
      whyItMatters: 'While traditional REST APIs return fixed endpoints (which can suffer from over-fetching or under-fetching), GraphQL allows clients to specify the exact fields desired, and gRPC utilizes binary Protocol Buffers over HTTP/2 for microsecond inter-service communication in high-scale backends.',
      curiousQuestion: 'When should a financial trading platform choose gRPC over REST?'
    },
    suggestedNext: [
      'What is JSON and how does it work?',
      'What is the difference between GET and POST?',
      'How does OAuth authentication work?'
    ],
    timestamp: Date.now()
  },

  'explain recursion': {
    id: 'recursion',
    topic: 'Recursion in Computer Science',
    level: 'beginner',
    simpleExplanation: 'Recursion is a programming technique where a function solves a big problem by calling itself with smaller and smaller pieces of the problem, until it hits a simple "base case" stop rule.',
    inSimpleWords: 'Imagine you are standing in a huge line of people in a movie theater and you want to know what row you are in. You don’t walk to the front to count. Instead, you tap the shoulder of the person right in front of you and ask: "What row are you in?" That person asks the person in front of them, all the way to the first person (who answers "Row 1!"). Then everyone adds 1 on the way back to you.',
    realWorldExample: {
      title: 'Russian Nesting Dolls (Matryoshka)',
      scenario: 'To find the tiny wooden baby doll hidden inside a big nesting doll, you open the outer doll. Inside is another doll of the exact same shape, just smaller. You keep repeating the exact same "open doll" action until you finally reach the solid, unopenable doll in the center.',
      takeaway: 'Opening each doll is the recursive step; the smallest solid doll is your base case stop condition.'
    },
    visualExplanation: {
      title: 'The Call Stack Unwinding Cycle (Factorial of 3)',
      type: 'flow',
      stages: [
        { label: 'factorial(3)', description: '3 * factorial(2) → Pushes stack frame #1 and pauses.', badge: 'Stack Call 1' },
        { label: 'factorial(2)', description: '2 * factorial(1) → Pushes stack frame #2 and pauses.', badge: 'Stack Call 2' },
        { label: 'factorial(1) [Base Case!]', description: 'Hits if (n === 1) return 1. Stops recurring, begins return.', badge: 'Base Hit: returns 1' },
        { label: 'Unwinding Stack', description: 'Stack unwinds: frame 2 computes 2*1=2; frame 1 computes 3*2=6.', badge: 'Result: 6' }
      ],
      caption: 'Every recursive call consumes memory on the Call Stack until the base case initiates the return phase.'
    },
    stepByStep: [
      { stepNumber: 1, title: 'Check the Base Case', explanation: 'The very first line of a recursive function must be a condition that stops recursion when the problem is trivially simple.', tip: 'Without this, your function will run forever and cause a "Stack Overflow" crash!' },
      { stepNumber: 2, title: 'Reduce the problem', explanation: 'Call the function again, but with an input that is guaranteed to be closer to the base case (e.g., n - 1 or tree.left).' },
      { stepNumber: 3, title: 'Store state in Call Stack', explanation: 'Each call pauses, placing its local variables onto the call stack memory waiting for child calls to finish.' },
      { stepNumber: 4, title: 'Bubble up results', explanation: 'Once the base case returns, values propagate backward through each pending frame to assemble the final answer.' }
    ],
    keyTakeaways: [
      'Two essential ingredients: 1) Base Case (stop rule) and 2) Recursive Step (smaller problem)',
      'Natural fit for tree traversal, nested folders, fractals, and divide-and-conquer algorithms',
      'Consumes memory on the call stack proportional to recursion depth',
      'Every recursive problem can theoretically be written iteratively with loops, but recursion is often far more elegant'
    ],
    checkUnderstanding: {
      question: 'What happens if a recursive function does not have a properly reachable base case?',
      options: [
        { text: 'The computer instantly fixes it by converting it into a while loop', isCorrect: false, explanation: 'Compilers cannot guess your mathematical intention automatically.' },
        { text: 'The program crashes with a "Stack Overflow" error because call memory runs out', isCorrect: true, explanation: 'Correct! Every function call uses memory on the call stack. Without a stopping condition, available stack frames are exhausted.' },
        { text: 'The function returns undefined immediately', isCorrect: false, explanation: 'It continues calling itself until memory limits are breached.' },
        { text: 'The CPU slows down time to calculate infinity', isCorrect: false, explanation: 'Computers have strict physical memory boundaries.' }
      ],
      hint: 'Consider what happens when you stack books until they hit the ceiling.'
    },
    goDeeper: {
      concept: 'Tail Call Optimization (TCO)',
      whyItMatters: 'If the recursive call is the very last operation performed in a function (a tail call), modern compilers can reuse the existing stack frame instead of allocating a new one, eliminating stack overflow risks and matching loop efficiency.',
      curiousQuestion: 'Why does JavaScript support TCO in the ECMAScript spec, yet most browser engines chose not to implement it?'
    },
    suggestedNext: [
      'How does the Call Stack work?',
      'Recursion vs Iteration: When to use which?',
      'How does Merge Sort use recursion?'
    ],
    timestamp: Date.now()
  },

  'how does ai work?': {
    id: 'how-ai-works',
    topic: 'How Artificial Intelligence & Neural Networks Work',
    level: 'beginner',
    simpleExplanation: 'Modern AI does not "think" like a human conscious mind. Instead, it is an advanced mathematical pattern recognizer that learns from billions of examples by adjusting internal dial weights until it can predict the most accurate answer or next word.',
    inSimpleWords: 'Think of AI like learning to throw darts in a dim room. At first, you throw completely blindly and miss the board. Someone tells you: "You were 2 feet too far right and too high!" You tweak your arm angle slightly. After throwing 10 million practice darts with immediate feedback, your muscle memory (weights) becomes so well tuned that you hit the bullseye every single time.',
    realWorldExample: {
      title: 'How Spotify or Netflix Knows What You Like',
      scenario: 'You didn’t program Spotify with a rule like "If user likes guitar, play Rock." Instead, machine learning compares your listening habits with millions of other users. When thousands of people with your exact musical tastes love a new indie song, the model computes a high mathematical correlation and recommends it.',
      takeaway: 'AI finds subtle statistical relationships that human programmers could never hand-code.'
    },
    visualExplanation: {
      title: 'Neural Network Learning Pipeline',
      type: 'flow',
      stages: [
        { label: '1. Training Data & Tokens', description: 'Raw text, images, or audio are converted into lists of numbers (vectors/embeddings).', badge: 'Input Layer' },
        { label: '2. Feedforward Propagation', description: 'Numbers pass through layers of artificial neurons, multiplied by adjustable weights.', badge: 'Hidden Layers' },
        { label: '3. Loss Calculation', description: 'The model compares its guess to the true answer and calculates the error magnitude.', badge: 'Loss Function' },
        { label: '4. Backpropagation & Update', description: 'Calculus (gradient descent) calculates how to tweak every weight to reduce future error.', badge: 'Optimizer (Adam)' }
      ],
      caption: 'With billions of parameters, repetition transforms random guesses into superhuman pattern recognition.'
    },
    stepByStep: [
      { stepNumber: 1, title: 'Data representation (Vectors)', explanation: 'Computers cannot read words directly; they convert words into coordinates in high-dimensional space where words with similar meanings sit close together.' },
      { stepNumber: 2, title: 'Forward pass prediction', explanation: 'Input numbers are multiplied across layers of connections to generate a probability distribution of possible outputs.' },
      { stepNumber: 3, title: 'Measuring the mistake (Loss)', explanation: 'The model checks how far off its answer was from the real truth (the loss score).' },
      { stepNumber: 4, title: 'Adjusting the weights (Backprop)', explanation: 'Using calculus (the chain rule), the algorithm nudges millions of parameters in the direction that lowers future errors.' }
    ],
    keyTakeaways: [
      'AI learns from data examples, rather than human-written rule sets (if/else)',
      'Deep Learning uses layers of artificial neurons to learn hierarchical features (edges → shapes → objects)',
      'Large Language Models (LLMs) predict the most probable next token based on training context',
      'Training requires immense compute; inference (using the trained model) is much lighter'
    ],
    checkUnderstanding: {
      question: 'What actually happens inside an artificial neural network during "training"?',
      options: [
        { text: 'A human programmer writes thousands of if-then statements for every situation', isCorrect: false, explanation: 'That was early "expert systems" in the 1980s, which failed because real-world exceptions are limitless.' },
        { text: 'Numerical weights on connections between neurons are adjusted to minimize error', isCorrect: true, explanation: 'Exactly! Training is mathematical optimization: adjusting weights using gradient descent so predictions match target outcomes.' },
        { text: 'The computer downloads human emotions from the internet', isCorrect: false, explanation: 'AI is purely mathematical optimization; it has no subjective feelings or consciousness.' },
        { text: 'The CPU permanently rewrites its silicon transistors into new physical shapes', isCorrect: false, explanation: 'Hardware remains the same; only the software values in memory change.' }
      ],
      hint: 'Think about adjusting volume knobs on an audio mixer to remove static.'
    },
    goDeeper: {
      concept: 'The Transformer Architecture & Self-Attention',
      whyItMatters: 'Introduced in the 2017 paper "Attention Is All You Need", transformers revolutionized AI by processing entire sentences at once instead of one word at a time, calculating how every word relates to every other word regardless of distance.',
      curiousQuestion: 'How does self-attention enable a model to understand that "bank" means financial institution in one sentence and river bank in another?'
    },
    suggestedNext: [
      'What is the Attention Mechanism in Transformers?',
      'How does Gradient Descent work visually?',
      'What is the difference between Supervised and Reinforcement Learning?'
    ],
    timestamp: Date.now()
  },

  'why does inflation happen?': {
    id: 'inflation',
    topic: 'Why Inflation Happens',
    level: 'beginner',
    simpleExplanation: 'Inflation happens when prices for goods and services steadily rise across the economy, meaning each dollar, euro, or pound buys less than it did before. It is usually caused by too much money chasing too few goods.',
    inSimpleWords: 'Imagine an auction room with 10 people and only 1 rare baseball card. If everyone in the room has only $10 in their wallet, the card cannot sell for more than $10. But if a helicopter suddenly drops $1,000 into everyone’s hands, the same card will sell for hundreds of dollars. The card didn’t get better—there is just more cash competing for it.',
    realWorldExample: {
      title: 'Shortage of Concert Tickets',
      scenario: 'When a major pop star comes to town, only 20,000 arena seats exist. If 200,000 fans desperately want to go and have savings ready to spend, scalpers and ticket markets surge from $80 to $800.',
      takeaway: 'When demand dramatically outpaces supply, prices inevitably skyrocket.'
    },
    visualExplanation: {
      title: 'The Supply & Demand Balance of Purchasing Power',
      type: 'comparison',
      stages: [
        { label: 'Demand-Pull Inflation', description: 'Consumers and businesses have high cash & low interest rates → spending exceeds available goods.', badge: 'Too Much Demand' },
        { label: 'Cost-Push Inflation', description: 'Disruptions (oil spikes, war, factory droughts) raise production costs → businesses pass costs to buyers.', badge: 'Supply Shortage' },
        { label: 'Built-in / Wage Spiral', description: 'Workers demand higher wages to cover living costs → companies raise prices further to afford wages.', badge: 'Feedback Loop' },
        { label: 'Central Bank Response', description: 'Central banks raise interest rates to cool down borrowing and stabilize prices.', badge: 'Interest Rate Hike' }
      ],
      caption: 'Inflation is the interplay between monetary expansion, consumer demand, and physical supply constraints.'
    },
    stepByStep: [
      { stepNumber: 1, title: 'Money supply expansion', explanation: 'Governments or banks issue stimulus or lower interest rates, making borrowing cheap and pumping liquidity into circulation.' },
      { stepNumber: 2, title: 'Surging aggregate demand', explanation: 'Consumers and companies spend enthusiastically, buying vehicles, houses, dining, and electronics.' },
      { stepNumber: 3, title: 'Supply constraints hit', explanation: 'Factories, shipping lines, and raw material mines cannot instantly double their output overnight.' },
      { stepNumber: 4, title: 'Price equilibrium rises', explanation: 'Sellers raise prices to balance demand, eroding the purchasing power of idle savings.' }
    ],
    keyTakeaways: [
      'Inflation = general rise in overall price level and decline in purchasing power',
      'Primary causes: Demand-pull (excess demand), Cost-push (rising production costs), and Money supply expansion',
      'Moderate predictable inflation (~2%) is considered healthy by central banks to encourage investment over hoarding',
      'Hyperinflation occurs when trust in currency collapses due to uncontrolled money printing'
    ],
    checkUnderstanding: {
      question: 'Which of the following scenarios is an example of Cost-Push inflation?',
      options: [
        { text: 'A sudden global oil shortage increases fuel and transport costs for all groceries and goods', isCorrect: true, explanation: 'Correct! Oil is a foundational input for agriculture, manufacturing, and transport. When its production cost spikes, it pushes all consumer prices up.' },
        { text: 'Everyone gets a surprise $5,000 tax refund and rushes to buy video game consoles', isCorrect: false, explanation: 'That is Demand-Pull inflation driven by excess consumer spending power.' },
        { text: 'A bank offers 0% interest loans for new car purchases', isCorrect: false, explanation: 'That is monetary expansion stimulating demand.' },
        { text: 'A technology breakthrough makes solar panels 50% cheaper', isCorrect: false, explanation: 'That is deflationary (cost-reducing), which lowers prices.' }
      ],
      hint: 'Look for a shock that makes producing goods more expensive for companies.'
    },
    goDeeper: {
      concept: 'The Phillips Curve & Quantitative Tightening',
      whyItMatters: 'Historically, economists modeled an inverse relationship between inflation and unemployment (the Phillips Curve). Central banks navigate this tightrope: raising interest rates curbs inflation, but risks triggering recessions and job losses if done too aggressively.',
      curiousQuestion: 'Can an economy suffer high inflation and high unemployment simultaneously? (The stagflation dilemma)'
    },
    suggestedNext: [
      'How do Central Banks use Interest Rates to control Inflation?',
      'What is the difference between Inflation and Deflation?',
      'Why is Hyperinflation so devastating?'
    ],
    timestamp: Date.now()
  }
};

export const PRESET_EXPLANATIONS_INTERMEDIATE: Record<string, ExplanationData> = {
  'explain photosynthesis': {
    id: 'photosynthesis-intermediate',
    topic: 'Photosynthesis',
    level: 'intermediate',
    simpleExplanation: 'Photosynthesis is a two-stage biochemical process in chloroplasts where light-dependent reactions convert solar photon energy into chemical bond energy (ATP and NADPH), which the light-independent Calvin cycle uses to enzymatically fix atmospheric CO₂ into triose phosphate sugars.',
    inSimpleWords: 'Think of photosynthesis as a biological two-stage power generation and chemical manufacturing facility: the light reactions act as a solar power plant that hydrolyzes water to generate electrical charge packets (ATP and NADPH), while the stroma acts as a chemical synthesis lab using that stored charge to assemble CO₂ molecules into stable sugar reserves.',
    realWorldExample: {
      title: 'Commercial Greenhouse CO₂ Enrichment & Photoperiod Control',
      scenario: 'Commercial Dutch greenhouse operators inject liquid CO₂ to raise ambient concentrations from 420 ppm to 1,200 ppm and deploy 660nm red/blue LED arrays. Because light reactions produce surplus ATP and NADPH under intense lighting, elevated CO₂ eliminates the carbon-fixation bottleneck in the Calvin cycle, accelerating crop biomass growth by over 35%.',
      takeaway: 'Photosynthetic throughput is governed by the slower of two decoupled sub-systems: electron transport rate vs enzymatic carbon fixation capacity.'
    },
    visualExplanation: {
      title: 'Two-Stage Photosynthetic Pipeline (Light Reactions & Calvin Cycle)',
      type: 'flow',
      stages: [
        { label: '1. Photolysis & PSII Activation', description: 'Photons excite P680 reaction centers in thylakoid membranes; water is split (2H₂O → 4H⁺ + 4e⁻ + O₂).', badge: 'Thylakoid Membrane' },
        { label: '2. Electron Transport & Chemiosmosis', description: 'Electrons traverse Plastoquinone, Cytochrome b6f, and Plastocyanin, generating a proton gradient that drives ATP synthase.', badge: 'Proton Motive Force' },
        { label: '3. PSI & NADPH Generation', description: 'P700 absorbs light to excite electrons through ferredoxin to NADP⁺ reductase, synthesizing reducing agent NADPH.', badge: 'Reducing Power' },
        { label: '4. Calvin Cycle (Stroma Fixation)', description: 'RuBisCO carboxylates RuBP with CO₂, and ATP/NADPH reduce the intermediate 3-PGA into glyceraldehyde-3-phosphate (G3P).', badge: 'Stroma: Carbon Fixation' }
      ],
      caption: 'Light-dependent thylakoid reactions produce ATP + NADPH; light-independent stroma reactions consume them to synthesize G3P sugars.'
    },
    stepByStep: [
      { stepNumber: 1, title: 'Photon absorption & photolysis in PSII', explanation: 'Chlorophyll molecules channel light energy to the P680 reaction center, elevating electrons to a higher energy orbital. The oxygen-evolving complex strips replacement electrons from water, releasing O₂ as a byproduct.', tip: 'Water photolysis is the sole evolutionary origin of Earth’s oxygen-rich atmosphere.' },
      { stepNumber: 2, title: 'Proton pumping across thylakoid membrane', explanation: 'As high-energy electrons flow down the electron transport chain (ETC) through Cytochrome b6f, protons (H⁺) are translocated from the stroma into the thylakoid lumen, establishing a steep electrochemical gradient.', tip: 'Lumen pH drops to ~5 while stroma pH remains ~8.' },
      { stepNumber: 3, title: 'Photophosphorylation via ATP Synthase', explanation: 'Protons diffuse back into the stroma through the rotary CF₀CF₁-ATP synthase complex, driving ADP phosphorylation into ATP via chemiosmotic coupling.' },
      { stepNumber: 4, title: 'NADP⁺ reduction in Photosystem I', explanation: 'Electrons re-energized at the P700 reaction center pass through ferredoxin to the enzyme FNR (ferredoxin-NADP⁺ reductase), reducing NADP⁺ to NADPH.' },
      { stepNumber: 5, title: 'Calvin Cycle enzymatic synthesis', explanation: 'In the stroma, RuBisCO catalyzes the carboxylation of ribulose-1,5-bisphosphate (RuBP). The resulting 3-carbon phosphoglycerate molecules are phosphorylated by ATP and reduced by NADPH to form G3P sugar precursors.' }
    ],
    keyTakeaways: [
      'Site separation: Light reactions occur in thylakoid membranes; the Calvin cycle occurs in the aqueous stroma',
      'The oxygen released originates strictly from the photolysis of water molecules (H₂O), not from carbon dioxide',
      'Energy carriers ATP and NADPH act as chemical bridges coupling the two decoupled stages',
      'RuBisCO is the rate-limiting carbon-fixation enzyme, susceptible to competitive photorespiration when O₂ is abundant'
    ],
    checkUnderstanding: {
      question: 'What is the direct biochemical function of NADPH produced during the light-dependent reactions when utilized in the Calvin cycle?',
      options: [
        { text: 'It donates high-energy electrons to reduce 1,3-bisphosphoglycerate into glyceraldehyde-3-phosphate (G3P)', isCorrect: true, explanation: 'Correct! NADPH serves as the essential biological reducing agent, donating electrons and hydrogen to reduce the phosphorylated carboxyl group into a high-energy aldehyde (G3P).' },
        { text: 'It directly splits CO₂ molecules into individual carbon and oxygen atoms', isCorrect: false, explanation: 'Incorrect. RuBisCO fixes CO₂ by attaching it directly to a 5-carbon RuBP skeleton without breaking the C=O bonds upfront.' },
        { text: 'It pumps hydrogen ions out of the chloroplast into the cytoplasm', isCorrect: false, explanation: 'Incorrect. Proton pumping occurs across the internal thylakoid membrane via the electron transport chain.' },
        { text: 'It regenerates chlorophyll pigments after photon bleaching', isCorrect: false, explanation: 'Incorrect. Chlorophyll electrons are replenished by the photolysis of water at PSII.' }
      ],
      hint: 'Remember that NADPH is a reducing agent (electron donor) that transforms organic acids into energy-dense carbohydrates.'
    },
    goDeeper: {
      concept: 'Photorespiration & C4 / CAM Adaptive Mechanisms',
      whyItMatters: 'RuBisCO exhibits carboxylase and oxygenase activity. In warm climates with closed stomata, high O₂ concentrations induce photorespiration, squandering up to 30% of energy. C4 plants (like maize) decouple carbon fixation physically into mesophyll and bundle sheath cells, while CAM plants (like pineapples) decouple them temporally between night and day.',
      curiousQuestion: 'How could synthetic biology engineering of synthetic bypass shunt pathways (like the synthetic AP carboxylase) increase cereal crop yields by 20%?'
    },
    suggestedNext: [
      'How does the Cytochrome b6f Q-cycle amplify proton translocation?',
      'What is Non-Photochemical Quenching (NPQ) during excess light stress?',
      'How does C4 Kranz anatomy eliminate RuBisCO photorespiration?'
    ],
    timestamp: Date.now()
  },

  'what is an api?': {
    id: 'api-intermediate',
    topic: 'Application Programming Interface (API)',
    level: 'intermediate',
    simpleExplanation: 'An API (Application Programming Interface) is an explicit architectural contract and communication protocol that allows distinct software systems to exchange data and invoke remote procedures over structured interfaces (such as REST over HTTP/HTTPS, GraphQL, or gRPC) without exposing underlying implementation logic or database internals.',
    inSimpleWords: 'Think of an API like an official international customs checkpoint with standardized paperwork: instead of letting foreign trucks drive uncontrolled into private domestic factories, all trade must pass through designated gate inspection terminals with authenticated credentials, standard manifests (JSON payloads), and strict protocol rules (HTTP status codes).',
    realWorldExample: {
      title: 'Stripe Payment Processing Gateway in E-Commerce',
      scenario: 'When a shopper clicks "Pay Now" on Shopify, Shopify’s frontend never stores or touches credit card numbers directly (PCI compliance). Instead, an encrypted token is sent to Stripe’s `/v1/charges` endpoint with an Idempotency-Key header. Stripe processes the banking settlement, verifies 3D-Secure protocols, and returns a structured JSON payload with status 200 and a transaction ID within 300ms.',
      takeaway: 'APIs decouple security-critical financial infrastructure from customer-facing application code through standardized request/response protocols.'
    },
    visualExplanation: {
      title: 'Modern RESTful Client-Server API Request Lifecycle',
      type: 'flow',
      stages: [
        { label: '1. Client HTTP Request', description: 'Client issues HTTP verb (POST/GET) with URI path, query params, Bearer token, and JSON body.', badge: 'HTTPS / TLS 1.3' },
        { label: '2. API Gateway & Middleware', description: 'Gateway validates authentication token (JWT), verifies CORS policy, and enforces rate limit throttling.', badge: 'Gateway / WAF' },
        { label: '3. Controller & Business Logic', description: 'Controller deserializes JSON, executes database queries via ORM, and validates schema constraints.', badge: 'Service Core' },
        { label: '4. Serialized Response Payload', description: 'Server encodes structured JSON payload with corresponding HTTP status code (200, 201, 400, 404, 500).', badge: 'HTTP Status + JSON' }
      ],
      caption: 'The API boundary protects internal database records, enforces authorization, and serializes bidirectional state changes.'
    },
    stepByStep: [
      { stepNumber: 1, title: 'Contract definition & endpoint routing', explanation: 'The API server defines URL path routes mapped to specific controller functions using standard HTTP verbs: GET (read), POST (create), PUT/PATCH (update), DELETE (remove).', tip: 'Following RESTful conventions ensures deterministic predictability across developer teams.' },
      { stepNumber: 2, title: 'Header parsing & cryptographic authentication', explanation: 'Incoming requests carry headers including Authorization (Bearer JWT or API Key), Content-Type (application/json), and Accept. Gateways verify digital signatures before forwarding to backend microservices.', tip: 'Stateless JWT tokens avoid database session lookups on every single call.' },
      { stepNumber: 3, title: 'Input validation & sanitization', explanation: 'The backend validates payload fields against an explicit schema (e.g. Zod or JSON Schema), returning immediate 400 Bad Request or 422 Unprocessable Entity responses if invalid.', tip: 'Early validation prevents SQL injection and buffer overflow vectors.' },
      { stepNumber: 4, title: 'Database transaction & serialization', explanation: 'The service executes application logic and database queries within transactional boundaries, serializing internal entities into safe public response objects.', tip: 'Never leak raw database passwords, internal IDs, or stack traces in public API payloads.' }
    ],
    keyTakeaways: [
      'Standardized HTTP verbs convey intent: GET (idempotent read), POST (non-idempotent create), PUT (idempotent replace)',
      'Headers govern metadata: authentication tokens, caching directives (ETag, Cache-Control), and payload formats',
      'Status code classes signal deterministic state: 2xx (Success), 3xx (Redirection), 4xx (Client fault), 5xx (Server fault)',
      'Modern architectures select protocols according to use case: REST/JSON for web, gRPC/Protobuf for high-throughput microservices'
    ],
    checkUnderstanding: {
      question: 'Why is a GET request defined as "idempotent" and "safe" under standard HTTP API specifications?',
      options: [
        { text: 'Executing the GET request multiple times does not alter the underlying server state and produces the same outcome', isCorrect: true, explanation: 'Correct! An HTTP method is safe and idempotent if calling it once has the exact same side-effect on server resources as calling it 100 times (reads only, no mutations).' },
        { text: 'GET requests encrypt the payload with stronger cryptography than POST requests', isCorrect: false, explanation: 'Incorrect. Encryption is handled identically at the TLS layer regardless of HTTP method.' },
        { text: 'GET requests can only be invoked by administrators with root privileges', isCorrect: false, explanation: 'Incorrect. GET is the standard method used by every browser to retrieve public web pages and assets.' },
        { text: 'GET requests bypass all caching layers and firewalls automatically', isCorrect: false, explanation: 'Incorrect. In fact, GET responses are the primary candidates for HTTP proxy and CDN edge caching.' }
      ],
      hint: 'Consider the side-effects on the database when reading data versus creating new records.'
    },
    goDeeper: {
      concept: 'Idempotency Keys, Webhooks & Asynchronous Event Processing',
      whyItMatters: 'In distributed payment or booking systems, network drops may occur before a client receives a response. By supplying a unique `Idempotency-Key` header, duplicate client retries can never double-charge an account. Meanwhile, webhooks reverse the request direction, allowing the server to push HTTP POST events to clients as soon as long-running jobs finalize.',
      curiousQuestion: 'How does an API gateway implement distributed rate limiting with millisecond precision using Redis token-bucket algorithms?'
    },
    suggestedNext: [
      'How does JWT signature verification work cryptographically?',
      'What are the performance differences between REST and gRPC/Protobuf?',
      'How do rate-limiting algorithms like Token Bucket and Leaky Bucket work?'
    ],
    timestamp: Date.now()
  },

  'explain recursion': {
    id: 'recursion-intermediate',
    topic: 'Recursion in Computer Science',
    level: 'intermediate',
    simpleExplanation: 'Recursion is an algorithmic paradigm where a function decomposes a problem by invoking itself with progressively smaller sub-problems until an invariant termination condition—the base case—is satisfied, after which the accumulated call stack frames unwind and compute the final composite value.',
    inSimpleWords: 'Think of recursion like opening a set of nested Chinese puzzle boxes: you inspect the current box; if it contains a gold coin (the base case), you immediately stop and hand it back; otherwise, you call the exact same "open box" procedure on the smaller box inside. When the bottom box returns the coin, every open box in the stack receives it in reverse order.',
    realWorldExample: {
      title: 'File System Directory Tree Traversal',
      scenario: 'When your operating system calculates the total storage consumed by a folder containing thousands of nested subdirectories, it runs a recursive `calculateSize(folder)` function. For each file, it adds file bytes; for each subfolder, it calls `calculateSize(subfolder)` recursively until all leaf folders have been evaluated.',
      takeaway: 'Hierarchical, self-similar data structures (trees, graphs, JSON documents) naturally map to recursive traversal algorithms.'
    },
    visualExplanation: {
      title: 'Call Stack Allocation & Unwinding Lifecycle (Factorial 3)',
      type: 'flow',
      stages: [
        { label: '1. Initial Call: fact(3)', description: 'Pushes Activation Record #1 (param n=3, return address to main). Halts on 3 * fact(2).', badge: 'Stack Frame #1 (n=3)' },
        { label: '2. Nested Call: fact(2)', description: 'Pushes Activation Record #2 (param n=2). Halts pending 2 * fact(1).', badge: 'Stack Frame #2 (n=2)' },
        { label: '3. Base Case: fact(1)', description: 'Pushes Frame #3 (n=1). Evaluates `if (n <= 1) return 1`. Halts recursive expansion.', badge: 'Base Case Return: 1' },
        { label: '4. Stack Unwinding & Bubbling', description: 'Frame #3 pops (returns 1); Frame #2 evaluates 2*1=2 and pops; Frame #1 evaluates 3*2=6 and returns to caller.', badge: 'Result: 6' }
      ],
      caption: 'Each recursive invocation consumes an activation frame on the execution call stack until the base case initiates reverse propagation.'
    },
    stepByStep: [
      { stepNumber: 1, title: 'Establish the base case invariant', explanation: 'The base case must evaluate without recursive invocation and must be guaranteed to be reachable across all valid input domains.', tip: 'Always write and guard the base case first to avoid infinite recursion.' },
      { stepNumber: 2, title: 'Define the induction / recursive step', explanation: 'Formulate the recurrence relation that expresses the solution in terms of smaller instances of itself (e.g., $T(n) = 2T(n/2) + O(n)$ in merge sort).', tip: 'Ensure each recursive call strictly reduces distance to the base case.' },
      { stepNumber: 3, title: 'Activation record allocation on Call Stack', explanation: 'The CPU execution thread pushes an activation record holding parameters, local variables, registers, and return addresses onto stack memory.', tip: 'Call stack memory is strictly finite (typically 1MB-8MB depending on OS/runtime).' },
      { stepNumber: 4, title: 'Stack frame unwinding and value propagation', explanation: 'As base cases resolve, pending mathematical operations in waiting stack frames complete their computation and pop their memory frames in LIFO (Last-In, First-Out) order.', tip: 'Return values bubble upward from child frames to parent caller frames.' }
    ],
    keyTakeaways: [
      'Two foundational requirements: Base Case (termination criteria) + Recursive Step (monotonic reduction of problem size)',
      'Space complexity: Recursion requires $O(d)$ auxiliary memory on the call stack, where $d$ is the maximum recursion depth',
      'Call stack mechanics: Memory exhaustion occurs (StackOverflowError) if recursion depth exceeds the OS stack limit',
      'Recursion and iteration are mathematically equivalent in computational power, but recursion maps cleanly to divide-and-conquer logic'
    ],
    checkUnderstanding: {
      question: 'What is the primary factor that causes a StackOverflowError in recursive programming?',
      options: [
        { text: 'The call stack runs out of allocated memory because too many activation frames are pushed without reaching a base case', isCorrect: true, explanation: 'Correct! Each nested invocation allocates a new activation frame on the execution stack. If base case conditions are missing or unreachable, memory allocation exceeds available stack memory.' },
        { text: 'The CPU encounters a division by zero error in the mathematical coprocessor', isCorrect: false, explanation: 'Incorrect. Division by zero throws an ArithmeticException, not a stack overflow.' },
        { text: 'The garbage collector deletes function variables before the return statement executes', isCorrect: false, explanation: 'Incorrect. Active stack frames are referenced by the thread execution pointer and are never garbage collected.' },
        { text: 'The compiler converts recursion into an unindexed database query', isCorrect: false, explanation: 'Incorrect. Compilers manage CPU execution instructions and stack memory pointers, not external databases.' }
      ],
      hint: 'Think about physical memory limits when stack frames are added without ever being popped.'
    },
    goDeeper: {
      concept: 'Tail Call Optimization (TCO) & Continuation-Passing Style (CPS)',
      whyItMatters: 'When the recursive call is the strict final operation in a function, a compiler supporting Tail Call Optimization can overwrite the current stack frame instead of pushing a new one, reducing stack space from $O(n)$ down to $O(1)$ and matching iterative performance.',
      curiousQuestion: 'How can any recursive function be mechanically rewritten into an iterative loop using an explicit Stack data structure?'
    },
    suggestedNext: [
      'How does Merge Sort achieve O(n log n) time complexity via recursion?',
      'What is Dynamic Programming memoization vs plain recursion?',
      'How does Tail Call Optimization work at the assembly bytecode level?'
    ],
    timestamp: Date.now()
  },

  'how does ai work?': {
    id: 'how-ai-works-intermediate',
    topic: 'How Artificial Intelligence & Neural Networks Work',
    level: 'intermediate',
    simpleExplanation: 'Modern AI and deep learning systems operate as parameterized mathematical function approximators. Neural networks map high-dimensional input vectors (tokens, pixels, or audio embeddings) across hidden layers of weighted matrix multiplications and non-linear activations, optimizing parameter weights via gradient descent and backpropagation to minimize empirical loss.',
    inSimpleWords: 'Think of training an artificial neural network like tuning a complex electronic audio synthesizer with millions of knobs: initially, sound inputs produce noisy static. By calculating how much each knob contributed to the noise (the gradient of the loss function), an automated tuner nudges every knob in the direction that makes the output clearer, repeating this billions of times until the synthesizer plays flawless music.',
    realWorldExample: {
      title: 'Automated Medical Diagnostic Imaging (CNNs)',
      scenario: 'Radiology AI models process high-resolution chest CT scans. Convolutional kernels slide across pixels to detect raw contrast edges, pooling layers extract geometric textures, and deeper dense layers assemble composite representations of pulmonary nodules. If the predicted malignancy probability differs from biopsy ground truth, backpropagation adjusts convolutional filter weights across all layers.',
      takeaway: 'Deep neural networks learn hierarchical feature abstractions automatically from empirical data without manual rule engineering.'
    },
    visualExplanation: {
      title: 'Supervised Deep Learning Training Pipeline',
      type: 'flow',
      stages: [
        { label: '1. Vectorization & Tokenization', description: 'Inputs are mapped to high-dimensional embedding spaces (e.g., 4096-dimensional vectors).', badge: 'Input Representation' },
        { label: '2. Forward Pass (Linear & Non-linear)', description: 'Activations propagate through $W \\cdot x + b$ matrix multiplications and non-linear functions (ReLU, GELU).', badge: 'Hidden Transformations' },
        { label: '3. Loss Calculation', description: 'Objective function (Cross-Entropy, MSE) measures divergence between predicted probabilities and ground truth.', badge: 'Loss Function' },
        { label: '4. Backpropagation & Optimizer', description: 'Calculus chain rule computes partial derivatives $\\frac{\\partial L}{\\partial W}$; Adam optimizer updates weights.', badge: 'Weight Update ($W \\leftarrow W - \\eta \\nabla L$)' }
      ],
      caption: 'Iterative forward-pass inference and backward-pass gradient optimization systematically minimize predictive error.'
    },
    stepByStep: [
      { stepNumber: 1, title: 'Data representation & embedding projection', explanation: 'Raw text or sensory data is tokenized and projected into dense vector embeddings where geometric cosine distance correlates with semantic similarity.', tip: 'Similar semantic concepts cluster closely together in multi-dimensional vector space.' },
      { stepNumber: 2, title: 'Forward propagation through network layers', explanation: 'Activations pass through sequential layers of artificial neurons. Each layer applies a linear transformation followed by a non-linear activation function (like GELU or Swish) to enable modeling of non-linear decision boundaries.', tip: 'Without non-linear activations, deep networks collapse into a single trivial linear regression.' },
      { stepNumber: 3, title: 'Loss evaluation against ground truth', explanation: 'The final layer outputs a probability distribution via softmax. A loss function (e.g., cross-entropy loss) mathematically measures the discrepancy between predicted logits and actual training labels.', tip: 'Loss serves as the objective metric governing all weight adjustments.' },
      { stepNumber: 4, title: 'Backpropagation via the chain rule', explanation: 'The algorithm applies the calculus chain rule in reverse, calculating the partial derivative of the total loss with respect to every single parameter weight in the model.', tip: 'This gradient vector points in the direction of greatest error increase.' },
      { stepNumber: 5, title: 'Parameter optimization via Gradient Descent', explanation: 'Optimizers like AdamW nudge weights in the negative gradient direction scaled by the learning rate, steadily descending toward a local minimum in the high-dimensional loss landscape.', tip: 'Learning rate schedules prevent models from overshooting optimal weights.' }
    ],
    keyTakeaways: [
      'Neural networks are universal function approximators capable of modeling arbitrary continuous functions',
      'Training consists of two complementary phases: forward inference propagation and backward gradient backpropagation',
      'Non-linear activation functions (ReLU, GELU) allow networks to capture complex multi-variable interactions',
      'Modern LLMs build on the Transformer architecture, using self-attention mechanisms to weigh relationships between all tokens in parallel'
    ],
    checkUnderstanding: {
      question: 'Why are non-linear activation functions (such as ReLU or GELU) mathematically required between layers in deep neural networks?',
      options: [
        { text: 'Without non-linear activations, stacking multiple layers mathematically collapses into a single linear regression transformation', isCorrect: true, explanation: 'Correct! The product of linear matrix transformations ($W_2 \\cdot W_1 \\cdot x$) is mathematically identical to a single matrix $W_{combined} \\cdot x$. Non-linear activations introduce non-linearity, enabling deep networks to learn complex decision boundaries.' },
        { text: 'Non-linear activations encrypt user data to prevent unauthorized interception', isCorrect: false, explanation: 'Incorrect. Activations perform mathematical transformations, not cryptographic hashing.' },
        { text: 'They allow the CPU to run without consuming electricity during training', isCorrect: false, explanation: 'Incorrect. Training neural networks consumes significant electrical power.' },
        { text: 'They prevent the training dataset from expanding beyond 100 gigabytes', isCorrect: false, explanation: 'Incorrect. Dataset size is managed externally in storage pipelines.' }
      ],
      hint: 'Recall what happens in linear algebra when you multiply multiple linear equations together.'
    },
    goDeeper: {
      concept: 'Transformer Self-Attention & Query-Key-Value Mechanisms',
      whyItMatters: 'Unlike Recurrent Neural Networks (RNNs) that process text sequentially word-by-word, Transformers compute pairwise attention matrices across all tokens concurrently using the equation $\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$. This parallelization unlocked modern large-scale foundational models.',
      curiousQuestion: 'How does FlashAttention optimize the quadratic memory complexity of self-attention by leveraging GPU SRAM tiling?'
    },
    suggestedNext: [
      'How does the Self-Attention mechanism compute Q, K, and V matrices?',
      'What is the difference between Pre-training, Fine-tuning, and RLHF?',
      'How does the Adam optimizer calculate momentum and adaptive learning rates?'
    ],
    timestamp: Date.now()
  },

  'why does inflation happen?': {
    id: 'inflation-intermediate',
    topic: 'Why Inflation Happens',
    level: 'intermediate',
    simpleExplanation: 'Inflation represents a macroeconomic decrease in currency purchasing power characterized by an aggregate increase in the general price level of goods and services. It is driven by monetary supply expansion exceeding real output growth, aggregate demand shocks exceeding short-run production capacity (demand-pull), and exogenous supply-chain input cost increases (cost-push).',
    inSimpleWords: 'Think of money like tickets at a carnival where only 100 plush teddy bears exist to win: if the carnival manager doubles the ticket reward for every game without stocking additional teddy bears, stall operators will quickly demand 20 tickets per bear instead of 10. The value of each ticket drops because the ratio of tickets to real physical goods increased.',
    realWorldExample: {
      title: 'Post-Pandemic Global Semiconductor & Shipping Container Crunch (2021-2022)',
      scenario: 'Simultaneous stimulus cash injections boosted consumer demand for personal electronics and home appliances just as maritime shipping hubs and microchip fabrication plants faced COVID-19 lockdowns. Container freight shipping rates spiked from $1,800 to $14,000 per 40ft container, compelling automakers and electronics manufacturers to hike retail sticker prices across the economy.',
      takeaway: 'Simultaneous demand-pull stimulus and cost-push supply bottlenecks create rapid, compounding inflationary pressure.'
    },
    visualExplanation: {
      title: 'Macroeconomic Drivers & Central Bank Transmission Loop',
      type: 'flow',
      stages: [
        { label: '1. Monetary & Fiscal Stimulus', description: 'Low central bank interest rates, quantitative easing, and deficit spending expand broader money supply (M2).', badge: 'Monetary Driver' },
        { label: '2. Demand-Pull / Supply Shock', description: 'Aggregate demand outpaces short-run aggregate supply (SRAS), or energy/commodity disruptions increase marginal costs.', badge: 'Equilibrium Shift' },
        { label: '3. Wage-Price Feedback Loop', description: 'Higher living costs lead workers to negotiate increased nominal wages, prompting firms to raise consumer prices further.', badge: 'Propagation Loop' },
        { label: '4. Central Bank Tightening', description: 'Central bank raises policy benchmark rate to suppress borrowing, cooling aggregate consumption toward target inflation (~2%).', badge: 'Policy Response' }
      ],
      caption: 'Equilibrium price levels reflect the interaction between money velocity, aggregate demand, and production capacity.'
    },
    stepByStep: [
      { stepNumber: 1, title: 'Money supply expansion (Quantity Theory of Money)', explanation: 'Expressed by Fisher’s equation $M \\cdot V = P \\cdot Y$: if money supply ($M$) grows faster than real GDP output ($Y$) while velocity ($V$) is stable, the general price level ($P$) must mathematically rise.', tip: 'Printing fiat currency without accompanying productivity growth dilutes purchasing power.' },
      { stepNumber: 2, title: 'Demand-pull dynamics', explanation: 'Low borrowing rates and rising employment increase aggregate consumer demand ($C + I + G + NX$). When factories operate at near 100% capacity utilization, firms clear excess demand by raising prices.', tip: 'Occurs when an economy overheats above its potential output frontier.' },
      { stepNumber: 3, title: 'Cost-push supply disruption', explanation: 'Inelastic input commodities like crude oil, agricultural fertilizers, or shipping freight suffer supply shocks, shifting the Short-Run Aggregate Supply (SRAS) curve upward and leftward.', tip: 'Energy spikes trigger rapid downstream price increases across manufacturing and food supply chains.' },
      { stepNumber: 4, title: 'Expectation anchoring and wage-price spirals', explanation: 'If businesses and households expect higher ongoing inflation, workers demand cost-of-living raises and suppliers contract with built-in annual rate hikes, embedding inflation structurally.', tip: 'Anchoring inflation expectations is the primary rationale for central bank credibility.' },
      { stepNumber: 5, title: 'Monetary policy contraction', explanation: 'Central banks raise the federal funds rate, elevating borrowing costs for mortgages, business loans, and credit cards to compress aggregate demand back into balance with supply.', tip: 'Higher real interest rates incentivize saving over immediate consumption.' }
    ],
    keyTakeaways: [
      'Core drivers: Demand-Pull (excess spending), Cost-Push (input shortages), and Monetary Expansion (M2 supply)',
      'The Quantity Equation of Money: $M \\cdot V = P \\cdot Y$ relates monetary liquidity to real economic output',
      'The Consumer Price Index (CPI) tracks fixed consumer baskets, while Core CPI excludes volatile food and energy sectors',
      'Central banks deploy benchmark interest rates and Quantitative Tightening (QT) to cool down overheated inflationary cycles'
    ],
    checkUnderstanding: {
      question: 'Under the Quantity Theory of Money equation $MV = PY$, what happens to the price level ($P$) if the money supply ($M$) increases by 10% while velocity ($V$) and real output ($Y$) remain strictly unchanged?',
      options: [
        { text: 'The price level ($P$) increases by exactly 10%', isCorrect: true, explanation: 'Correct! Rearranging Fisher’s equation gives $P = (M \\cdot V) / Y$. If $V$ and $Y$ are constant, changes in $P$ are directly proportional to changes in $M$, meaning a 10% monetary expansion produces a 10% price increase.' },
        { text: 'The price level ($P$) drops to zero because of consumer panic', isCorrect: false, explanation: 'Incorrect. Increasing money supply does not eliminate prices.' },
        { text: 'The price level ($P$) remains constant while employment drops', isCorrect: false, explanation: 'Incorrect. If real output $Y$ is held constant, the equation dictates that nominal prices must absorb the monetary expansion.' },
        { text: 'The government replaces all paper cash with gold coins', isCorrect: false, explanation: 'Incorrect. Fiat monetary systems adjust prices through market transactions.' }
      ],
      hint: 'Examine the algebraic balance of the equation $M \\cdot V = P \\cdot Y$ when only $M$ changes.'
    },
    goDeeper: {
      concept: 'The Taylor Rule & Inflation Expectations Anchoring',
      whyItMatters: 'Central bankers use monetary reaction functions like the Taylor Rule: $i_t = r^* + \\pi_t + 0.5(\\pi_t - \\pi^*) + 0.5(y_t - y^*)$ to set nominal interest rates scientifically based on inflation deviation and GDP output gaps. If expectations become unanchored, restoring price stability requires severe interest rate hikes that risk triggering recessions.',
      curiousQuestion: 'How can an economy become trapped in Stagflation (high inflation combined with economic stagnation) like the 1970s oil crises?'
    },
    suggestedNext: [
      'What is the difference between Headline CPI, Core CPI, and PCE index?',
      'How does the Federal Reserve use the Reverse Repo Facility (ON RRP)?',
      'What is Modern Monetary Theory (MMT) and why is it debated?'
    ],
    timestamp: Date.now()
  }
};

export const PRESET_EXPLANATIONS_DEEP_DIVE: Record<string, ExplanationData> = {
  'explain photosynthesis': {
    id: 'photosynthesis-deep-dive',
    topic: 'Photosynthesis',
    level: 'deep_dive',
    simpleExplanation: 'Oxygenic photosynthesis is a quantum-coupled bioenergetic transduction system operating across thylakoid lipid bilayers and the chloroplastic stroma. It couples ultra-fast exciton energy transfer within light-harvesting pigment complexes (LHCII) to charge separation in Photosystem II (P680, $E_m \\approx +1.25\\,\\text{V}$), driving the four-electron Kok S-state cycle at the catalytic $\\text{Mn}_4\\text{CaO}_5$ oxygen-evolving complex (OEC). The resultant proton motive force ($\\Delta p = \\Delta\\Psi + \\Delta\\text{pH}$) powers rotational chemiosmosis via $\\text{CF}_0\\text{CF}_1$-ATP synthase, while linear and cyclic electron pathways generate NADPH. In the stroma, ribulose-1,5-bisphosphate carboxylase/oxygenase (RuBisCO) drives carbon fixation through an enediolate intermediate, tightly regulated by ferredoxin-thioredoxin cascades and constrained by competitive photorespiration.',
    inSimpleWords: 'At the biophysical and thermodynamic limit, photosynthesis is an anisotropic photo-electrochemical reactor: photons pump electrons uphill against a massive +1.25V electrochemical potential gradient (the Z-scheme), translocating protons into a nanoscale vesicular compartment to generate a ~200mV proton motive force across a 4nm lipid bilayer. Simplified models of "light + water makes sugar" completely miss the quantum coherence in antenna complexes, the thermodynamic limits of the Kok cycle, and the competitive oxygenase kinetics of RuBisCO that cap terrestrial photosynthetic solar conversion efficiency below 4.6% (C3) and 6.0% (C4).',
    realWorldExample: {
      title: 'Directed Bioengineering of Synthetic RuBisCO Shunts & NPQ Relaxation Kinetics',
      scenario: 'In agricultural field trials (e.g. the RIPE project), bioengineers genetically modified tobacco and soybean plants by expressing synthetic glycolate catabolic bypass pathways inside chloroplasts and overexpressing three photoprotective proteins (violaxanthin de-epoxidase, PsbS, and zeaxanthin epoxidase). By accelerating the recovery of Non-Photochemical Quenching (NPQ) when leaves transition from bright sunlight to cloud shade, photosynthetic carbon fixation efficiency jumped by 20% under real canopy field conditions.',
      takeaway: 'Overcoming quantum yield saturation limits and slow relaxation of photo-protective non-photochemical quenching represents the premier frontier for boosting agricultural crop yields.'
    },
    visualExplanation: {
      title: 'Biophysical Z-Scheme, Proton Motive Force & Calvin-Benson Cycle Architecture',
      type: 'flow',
      stages: [
        { label: '1. P680 Exciton & Kok Cycle ($Mn_4CaO_5$)', description: 'Absorption at 680nm generates P680*+ / Pheo- radical pair; oxygen-evolving complex steps through S₀-S₄ oxidation states, stripping 4e⁻ from 2H₂O to liberate O₂ and 4H⁺ into the lumen.', badge: 'Em = +1.25V Redox Potential' },
        { label: '2. Q-Cycle & Cytochrome b6f Complex', description: 'Plastoquinol (PQH₂) oxidation translocates 4H⁺ per electron pair via the Q-cycle through Rieske Fe-S and heme bL/bH centers into the thylakoid lumen.', badge: 'Trans-membrane ΔpH Gradient' },
        { label: '3. P700 Excitation & FNR Catalysis', description: 'Plastocyanin reduces P700; secondary photon absorption drives electrons through A₀, A₁, FX, FA/FB iron-sulfur centers to ferredoxin, reducing NADP⁺ via FNR.', badge: 'Linear / Cyclic Photophosphorylation' },
        { label: '4. RuBisCO Enediolate Carboxylation', description: 'Activated RuBisCO (carbamylated with CO₂ and Mg²⁺) catalyzes electrophilic addition of CO₂ to the 2,3-enediolate of RuBP, yielding two molecules of 3-phosphoglycerate.', badge: 'Km(CO₂) = 10-15 µM / Km(O₂) = 400-500 µM' }
      ],
      caption: 'The Z-scheme electron transport chain generates the proton electrochemical gradient (pmf) for ATP synthesis and reducing equivalents (NADPH) for stromal carbon assimilation.'
    },
    stepByStep: [
      { stepNumber: 1, title: 'Resonance exciton migration & primary charge separation', explanation: 'Photons absorbed by LHCII carotenoids and chlorophylls transfer energy via ultra-fast Förster Resonance Energy Transfer (FRET) (<100 fs) with near-unity quantum efficiency to the P680 reaction center dimer. Charge separation forms the radical pair [P680•⁺ Pheo•⁻] within 3 picoseconds, followed by rapid electron transfer to the primary quinone acceptor QA.', tip: 'Near 100% quantum efficiency of initial charge separation contrasts with low downstream thermodynamic conversion efficiency.' },
      { stepNumber: 2, title: 'The Kok S-state clock of the Oxygen-Evolving Complex (OEC)', explanation: 'The distorted chair-like Mn₄CaO₅ cluster advances through five oxidation states (S₀ → S₁ → S₂ → S₃ → [S₄]). Upon reaching the metastable S₄ state following four successive photochemical turnover events, two coordinated water molecules undergo O-O bond formation via nucleophilic attack or radical coupling, releasing triplet O₂ and 4 protons into the thylakoid lumen.', tip: 'Flash-induced oxygen yield exhibits a characteristic damped four-period oscillation peaking on the 3rd flash.' },
      { stepNumber: 3, title: 'The Plastoquinone Q-cycle at Cytochrome b6f', explanation: 'Two molecules of plastoquinol (PQH₂) are oxidized at the Qo site facing the lumen. Four protons are ejected into the lumen while two electrons cycle back across the membrane via hemes bL and bH to reduce another plastoquinone at the Qi site, amplifying the proton-to-electron stoichiometry to 2 H⁺/e⁻.', tip: 'This amplified proton translocation is essential to meet the ATP:NADPH stoichiometric demand of the Calvin cycle (3:2).' },
      { stepNumber: 4, title: 'Chemiosmotic ATP synthesis via CF₀CF₁-ATP Synthase', explanation: 'The proton motive force $\\Delta p = \\Delta\\Psi - (2.303 RT/F)\\Delta\\text{pH}$ (typically ~180-220 mV) drives proton flux through the membrane-embedded c-ring (14 c-subunits in chloroplasts). Rotation of the $\\gamma\\epsilon$ stalk forces conformational changes in the three catalytic $(\\alpha\\beta)$ pairs (Open, Loose, Tight states), synthesizing ATP from ADP + Pi at a ratio of ~4.67 H⁺ per ATP.', tip: 'Chloroplast c-ring stoichiometry (14 c-subunits) mandates 14 protons per full 360° turn producing 3 ATP.' },
      { stepNumber: 5, title: 'RuBisCO carboxylation kinetics and RuBP regeneration', explanation: 'RuBisCO must undergo carbamylation of active-site Lys201 by a non-substrate CO₂ molecule and bind Mg²⁺. Carboxylation of the 5-carbon ribulose-1,5-bisphosphate proceeds through a 2,3-enediolate intermediate, forming an unstable 6-carbon $\\beta$-keto acid which hydrolyzes stereospecifically into two molecules of (2R)-3-phosphoglycerate. Regeneration of RuBP consumes 5 out of every 6 synthesized G3P molecules through transketolase and sedoheptulose-1,7-bisphosphatase reactions.', tip: 'Photorespiration occurs when O₂ attacks the enediolate intermediate, forming toxic 2-phosphoglycolate requiring energetically expensive peroxisomal/mitochondrial recycling.' }
    ],
    keyTakeaways: [
      'The oxygen-evolving complex (Mn₄CaO₅ cluster) accumulates four positive oxidizing equivalents (Kok S-state cycle) before catalyzing O-O bond formation',
      'The Q-cycle at Cytochrome b6f doubles the proton translocation stoichiometry, establishing the required $\\Delta p$ for $\\text{CF}_0\\text{CF}_1$ rotational ATP synthesis',
      'RuBisCO is kinetically compromised: low catalytic turnover ($k_{\\text{cat}} \\approx 3-5\\,\\text{s}^{-1}$) and competitive oxygenase activity ($S_{\\text{rel}} \\approx 80-100$ in C3 plants)',
      'Theoretical thermodynamic maximum solar energy conversion efficiency is bounded at ~4.6% for C3 and ~6.0% for C4 plants under normal atmospheric conditions'
    ],
    checkUnderstanding: {
      question: 'Under high light intensity when stromal [NADP⁺] becomes severely depleted, how does the chloroplast maintain the trans-thylakoid proton gradient without accumulating destructive reactive oxygen species (ROS)?',
      options: [
        { text: 'It switches from linear to Cyclic Electron Flow (CEF) around PSI, cycling electrons from ferredoxin back to Cytochrome b6f via PGR5/PGRL1 to pump protons without reducing NADP⁺', isCorrect: true, explanation: 'Correct! When NADP⁺ is unavailable, ferredoxin shuttles electrons back to plastoquinone/Cytochrome b6f (via PGR5/PGRL1 or NDH complex). This maintains proton pumping and ATP generation while preventing electron leakage to molecular oxygen (Mehler reaction) that forms superoxide radicals.' },
        { text: 'It reverses the ATP synthase motor to hydrolyze ATP and pump electrons backward into water', isCorrect: false, explanation: 'Incorrect. Chloroplast ATP synthase possesses regulatory redox disulfide bridges that prevent futile reverse ATP hydrolysis in the dark or stress.' },
        { text: 'It permanently disassembles all thylakoid membranes within milliseconds', isCorrect: false, explanation: 'Incorrect. Membrane disassembly is a pathological senescent process, not an immediate physiological photoprotective response.' },
        { text: 'It stops absorbing photons by physically turning leaves completely black', isCorrect: false, explanation: 'Incorrect. Excess energy is dissipated non-photochemically as heat (NPQ via zeaxanthin), not by changing pigment reflectance to black.' }
      ],
      hint: 'Consider the alternate pathway of electron circulation around Photosystem I that generates ATP without generating net NADPH.'
    },
    goDeeper: {
      concept: 'Synthetic Carbon Fixation Pathways & Direct Photo-electrochemical Hybrid Systems',
      whyItMatters: 'Naturally evolved RuBisCO is bounded by evolutionary constraints. Synthetic biology teams have designed fully in vitro artificial carbon fixation cascades—such as the CETCH (crotonyl-CoA/ethylmalonyl-CoA/hydroxybutyryl-CoA) cycle—that utilize highly efficient bacterial carboxylases (enoyl-CoA carboxylases/reductases) operating at 2-3x the kinetic speed of RuBisCO with zero oxygen sensitivity.',
      curiousQuestion: 'How can bio-hybrid solar cells integrating hydrogenase enzymes with semiconductor photocathodes exceed natural photosynthetic solar-to-chemical conversion efficiency by a factor of 10?'
    },
    suggestedNext: [
      'What are the crystallographic structural dynamics of the Kok S3-to-S0 transition in Mn4CaO5?',
      'How does the ferredoxin-thioredoxin system light-activate stromal Calvin-Benson enzymes?',
      'What are the biophysical mechanisms of PsbS-dependent energy quenching (qE)?'
    ],
    timestamp: Date.now()
  },

  'what is an api?': {
    id: 'api-deep-dive',
    topic: 'Application Programming Interface (API)',
    level: 'deep_dive',
    simpleExplanation: 'An API is a formal interface contract specifying communication boundaries, wire protocols, schema invariants, and distributed state coordination mechanisms between isolated software runtimes. In modern distributed systems, API architecture encompasses transport serialization (Protobuf binary vs JSON), idempotency guarantees, distributed transaction coordination (Saga pattern vs 2PC), zero-trust mTLS encryption, edge reverse-proxying, and resilience policies (adaptive concurrency limits, circuit breakers, and rate-limiting algorithms).',
    inSimpleWords: 'Rather than treating an API as a simple URL endpoint returning JSON, senior systems architects view APIs as formal state-machine boundaries in asynchronous distributed networks subject to the Fallacies of Distributed Computing: network latency is non-zero, packet partitions occur, clock drift exists, and failures are inevitable. A robust API contract codifies exact wire serializations, backpressure mechanisms, and deterministic retry semantics under failure.',
    realWorldExample: {
      title: 'High-Throughput Financial Ledger Settlement & Distributed Idempotency',
      scenario: 'In Stripe or modern core banking ledgers, payments use an `Idempotency-Key` header with distributed Redis/CockroachDB locking. If an HTTP request terminates unexpectedly due to a TCP connection reset during database commit, a client retrying with the same idempotency key acquires an atomic distributed lease, detects the previously finalized transaction state, and replays the cached cryptographic response without executing duplicate ledger debits.',
      takeaway: 'Deterministic API idempotency guarantees are mandatory to preserve exact-once processing semantics across inherently unreliable network transports.'
    },
    visualExplanation: {
      title: 'Distributed Enterprise API Gateway & Service Mesh Wire Architecture',
      type: 'flow',
      stages: [
        { label: '1. Ingress & TLS Termination', description: 'Edge Envoy proxy terminates TLS 1.3, verifies HTTP/2 or HTTP/3 frames, and performs GeoIP WAF packet inspection.', badge: 'Edge Gateway (Envoy)' },
        { label: '2. Token Authentication & Policy', description: 'JWT signature verified via JWKS caching; rate-limiting evaluated against distributed Redis token-bucket cluster.', badge: 'OAuth2 / mTLS / OPA' },
        { label: '3. gRPC Transcoding & Service Mesh', description: 'HTTP/JSON transcoded to gRPC binary Protocol Buffers over persistent HTTP/2 multiplexed streams across Kubernetes pods.', badge: 'gRPC / Istio Service Mesh' },
        { label: '4. Resilient Backend Execution', description: 'Downstream call bounded by deadline propagation, distributed trace spans (OpenTelemetry), and Hystrix circuit breaking.', badge: 'Saga Coordinator / DB' }
      ],
      caption: 'The enterprise API boundary orchestrates zero-trust identity, schema enforcement, multiplexed wire transport, and fault-tolerant distributed transactions.'
    },
    stepByStep: [
      { stepNumber: 1, title: 'Formal Interface Definition (IDL) & Contract Compilation', explanation: 'Engineers define schemas via OpenAPI 3.1 specifications or Protocol Buffer proto3 files. Static compilers generate strongly-typed client SDKs, server stubs, and validation ASTs, guaranteeing compile-time type safety across heterogeneous languages.', tip: 'Codegen eliminates serialization mismatch bugs between polyglot microservice boundaries.' },
      { stepNumber: 2, title: 'Wire serialization and protocol selection', explanation: 'Architects select serialization formats based on performance envelopes: human-readable REST/JSON over HTTP/1.1 for public integrations vs binary compact serialization (Protobuf/FlatBuffers) over HTTP/2 or gRPC for internal inter-service communication (reducing CPU serialization overhead by up to 80%).', tip: 'Binary formats eliminate field key repetition and string parsing latency.' },
      { stepNumber: 3, title: 'Distributed rate limiting via Token Bucket & Sliding Window', explanation: 'High-volume gateways implement rate limiting using Redis Lua scripts running sliding-window log or token-bucket algorithms with burst capacities, preventing noisy neighbors from overwhelming backend threadpools.', tip: 'Returning `429 Too Many Requests` with `Retry-After` headers protects database connection pools.' },
      { stepNumber: 4, title: 'Deadline propagation and context cancellation', explanation: 'Incoming requests inject standard deadline headers (e.g. `grpc-timeout` or `Request-Timeout`). Downstream microservices propagate context cancellation: if an edge timeout fires at 500ms, all deep database queries and downstream RPC calls abort immediately to conserve compute.', tip: 'Deadline propagation prevents cascaded threadpool starvation across microservice graphs.' },
      { stepNumber: 5, title: 'Fault tolerance: Circuit Breaking & Exponential Backoff with Jitter', explanation: 'Clients implement exponential backoff ($t = \\min(t_{\\max}, t_{\\text{base}} \\cdot 2^{\\text{attempt}}) + \\text{random\\_jitter}$) to prevent thundering herd problems, while server gateways trip circuit breakers (opening when error rates exceed threshold) to allow failing backends to recover.', tip: 'Adding decorrelated jitter is mathematically critical to break synchronized retry lockstep.' }
    ],
    keyTakeaways: [
      'An API is an invariant contractual boundary separating distributed runtimes, not merely an HTTP URL handler',
      'Binary serialization (Protobuf over HTTP/2) outperforms REST/JSON in throughput, latency, and CPU cycles',
      'Idempotency keys and distributed locking mechanisms are required to guarantee safe retries across network drops',
      'Distributed systems demand holistic resilience policies: distributed timeouts, deadline propagation, circuit breakers, and jittered retries'
    ],
    checkUnderstanding: {
      question: 'When implementing automatic client retries for transient HTTP 503/504 network errors, why is adding randomized "jitter" mathematically necessary in addition to standard exponential backoff?',
      options: [
        { text: 'Without jitter, thousands of failed clients retry at identical synchronized time intervals, producing repeated thundering-herd traffic spikes that keep the server crashed', isCorrect: true, explanation: 'Correct! Pure exponential backoff multiplies wait times deterministically. If 10,000 requests fail simultaneously at time 0, they will all retry simultaneously at time 2s, 4s, 8s, repeatedly re-crashing the recovering service. Random jitter spreads retries uniformly across time.' },
        { text: 'Jitter encrypts the HTTP payload so malicious attackers cannot sniff retry attempts', isCorrect: false, explanation: 'Incorrect. Jitter is a random mathematical time delay, not a cryptographic encryption cipher.' },
        { text: 'Jitter forces the server to permanently upgrade its RAM memory modules', isCorrect: false, explanation: 'Incorrect. Software delay algorithms cannot physically modify hardware modules.' },
        { text: 'Jitter converts HTTP POST verbs into safe GET methods automatically', isCorrect: false, explanation: 'Incorrect. Retries must preserve the original HTTP method and idempotency key.' }
      ],
      hint: 'Think about what happens when an entire fleet of disconnected mobile devices all reconnect and try sending requests at the exact same second.'
    },
    goDeeper: {
      concept: 'Event-Driven CQRS Architecture & Dual-Write Mitigation (Transactional Outbox Pattern)',
      whyItMatters: 'In distributed architectures, modifying a database and publishing an API event to Kafka/RabbitMQ concurrently produces dangerous dual-write partial failures if the broker drops offline after the database commits. The Transactional Outbox pattern writes the outgoing event into an internal database outbox table within the same ACID transaction, where an asynchronous Debezium CDC (Change Data Capture) process tails the write-ahead log (WAL) to guarantee at-least-once delivery.',
      curiousQuestion: 'How does CockroachDB implement serializable multi-region distributed transactions across global APIs without relying on atomic GPS clocks like Google Spanner?'
    },
    suggestedNext: [
      'How does HTTP/3 QUIC eliminate Head-of-Line blocking compared to HTTP/2 TCP?',
      'How do Zero-Knowledge Proofs enable privacy-preserving cryptographic APIs?',
      'What are the performance tradeoffs between gRPC, Apache Arrow Flight, and GraphQL?'
    ],
    timestamp: Date.now()
  },

  'explain recursion': {
    id: 'recursion-deep-dive',
    topic: 'Recursion in Computer Science',
    level: 'deep_dive',
    simpleExplanation: 'Recursion is a computational paradigm rooted in Peano axioms and the Church-Turing thesis, wherein a function computes state by evaluating self-referential mathematical formulations over inductively defined data types. At the assembly and hardware architecture tier, recursion allocates sequential activation records (stack frames) onto the thread call stack, tracking saved base pointers ($EBP/RBP$), local variables, argument registers, and return instruction pointers ($RIP$). Space complexity is strictly bounded by maximum induction depth $\\mathcal{O}(d)$. Optimization techniques include Tail Call Optimization (TCO) via compiler register reuse, Continuation-Passing Style (CPS) transformation, and dynamic memoization over overlapping sub-problems.',
    inSimpleWords: 'Beyond textbook analogies, recursion is the execution of a self-similar state-reduction machine over an explicit or implicit stack. Every un-optimized recursive call consumes a discrete block of hardware memory bounded by OS virtual memory limits (e.g. 8MB on Linux). At the theoretical level, recursion, $\\mu$-recursive functions, and while-loop iteration possess identical computational universality, but recursion provides formal structural induction that directly models inductive algebraic data types (trees, DAGs, monads).',
    realWorldExample: {
      title: 'Deterministic Abstract Syntax Tree (AST) Parsing & Type Inference (V8 / Rustc)',
      scenario: 'When the Rust or TypeScript compiler parses complex nested expressions (e.g. `(a + b) * (c - (d / e))`), it runs a recursive descent parser. Each non-terminal grammar rule in the EBNF specification invokes a corresponding recursive parsing function. If malicious code crafts deeply nested parentheses 100,000 levels deep, naive recursion blows the compiler call stack with a `SIGSEGV` segmentation fault, requiring compilers to implement manual heap-allocated recursion trampolines.',
      takeaway: 'Production language runtimes and parsers must enforce explicit recursion depth limits or convert recursion to heap-allocated trampolines to survive hostile inputs.'
    },
    visualExplanation: {
      title: 'Hardware x86-64 Stack Frame Allocation vs Tail Call Optimization Assembly',
      type: 'flow',
      stages: [
        { label: '1. Standard Call: Frame Push', description: '`call` instruction pushes return RIP onto stack, decrements RSP by 8, pushes RBP, and subtracts RSP for local variables.', badge: 'Stack Growth: -128 Bytes/Frame' },
        { label: '2. Deep Nesting & Frame Overhead', description: 'Accumulating n active stack frames risks hitting OS guard page memory barrier, triggering OS `SIGSEGV` Stack Overflow.', badge: 'Space Complexity: O(n)' },
        { label: '3. TCO / Tail Call Elimination', description: 'Compiler detects tail position: reuses current frame, overwrites argument registers, and emits direct `jmp` instead of `call`.', badge: 'TCO Space: O(1) Constant' },
        { label: '4. Trampolining (Heap Iteration)', description: 'Functions return a thunk (closure) to a while-loop trampoline running on heap memory, bypassing hardware stack limits entirely.', badge: 'Heap-allocated Trampoline' }
      ],
      caption: 'Standard recursion consumes physical stack memory; tail-call optimization converts recursion into an iterative assembly jump instruction.'
    },
    stepByStep: [
      { stepNumber: 1, title: 'Mathematical formulation via structural induction', explanation: 'Recursive functions define a base case representing the minimal element of a well-founded partially ordered set (poset), and an inductive step that maps elements strictly downward under the ordering relation, proving termination via Turing’s well-foundedness theorem.', tip: 'A recursive function without a provably well-founded relation cannot guarantee termination.' },
      { stepNumber: 2, title: 'Hardware activation record anatomy (x86-64 ABI)', explanation: 'Upon `call`, the CPU pushes the 64-bit return RIP. The function prologue executes `push rbp; mov rbp, rsp; sub rsp, N`. All local parameters and spilled registers reside within this address space bounded by the base pointer (RBP) and stack pointer (RSP).', tip: 'Red zones (128 bytes below RSP in System V AMD64 ABI) permit leaf optimization without adjusting RSP.' },
      { stepNumber: 3, title: 'Master Theorem runtime complexity analysis', explanation: 'Divide-and-conquer recurrences of the form $T(n) = aT(n/b) + f(n)$ are formally evaluated using the Master Theorem by comparing $f(n)$ with $n^{\\log_b a}$, determining whether runtime is dominated by leaf node evaluation, root division, or balanced tree traversal.', tip: 'Example: Merge sort $T(n) = 2T(n/2) + O(n) \\implies \\Theta(n \\log n)$.' },
      { stepNumber: 4, title: 'Tail Call Optimization (TCO) mechanics', explanation: 'If the return value of the recursive invocation is returned immediately without further computation, modern optimizing compilers (LLVM, GCC) recognize that the caller’s stack frame is obsolete. The compiler reuses the existing frame, loads new arguments into registers, and executes an assembly `jmp` instruction instead of `call`.', tip: 'Tail-recursive functions achieve the memory efficiency of a while-loop while preserving declarative purity.' },
      { stepNumber: 5, title: 'Continuation-Passing Style (CPS) & Trampolining', explanation: 'In environments without native TCO (like JavaScript V8 or Python), functions are refactored into Continuation-Passing Style where each function takes an explicit continuation callback `k`. A lightweight trampoline loop iteratively invokes returned closures, enabling unbounded recursion without stack overflow.', tip: 'Trampolines trade minimal heap allocation overhead for infinite recursion depth.' }
    ],
    keyTakeaways: [
      'Stack frames in x86-64 assembly carry non-trivial memory overhead (return addresses, frame pointers, register spills, alignment padding)',
      'Unbounded recursion risks physical stack overflow when stack pointer RSP crosses into unmapped OS guard pages',
      'Tail Call Optimization transforms recursive function calls into zero-overhead assembly jumps (`jmp`), achieving $\\mathcal{O}(1)$ space complexity',
      'Continuation-Passing Style (CPS) and trampolining decouple recursive algorithms from hardware call-stack constraints by executing on heap memory'
    ],
    checkUnderstanding: {
      question: 'Which of the following implementations of the factorial function is mathematically in strict "tail position" and eligible for Tail Call Optimization (TCO)?',
      options: [
        { text: '`function fact(n, acc = 1) { if (n <= 1) return acc; return fact(n - 1, n * acc); }`', isCorrect: true, explanation: 'Correct! The recursive call `fact(n - 1, n * acc)` is the absolute last operation evaluated in the function. The return value requires no further multiplication in the current frame, allowing the compiler to overwrite the existing stack frame and execute a simple jump.' },
        { text: '`function fact(n) { if (n <= 1) return 1; return n * fact(n - 1); }`', isCorrect: false, explanation: 'Incorrect! The multiplication `n * ...` occurs AFTER `fact(n - 1)` returns. The current stack frame MUST remain preserved in memory to store the value of `n` while waiting for the child call to complete.' },
        { text: '`function fact(n) { if (n <= 1) return 1; return fact(n - 1) + fact(n - 2); }`', isCorrect: false, explanation: 'Incorrect! That is Fibonacci-style tree recursion where the addition requires both results before completing.' },
        { text: '`function fact(n) { return (n > 1) ? [fact(n - 1)] : [1]; }`', isCorrect: false, explanation: 'Incorrect! Wrapping the result in an array literal is a post-return allocation.' }
      ],
      hint: 'Look for the function where the recursive call is returned directly without any pending arithmetic operations waiting on it.'
    },
    goDeeper: {
      concept: 'The Y-Combinator & Lambda Calculus Fixed-Point Theorems',
      whyItMatters: 'In pure untyped Lambda Calculus, functions have no names, meaning a function cannot explicitly call itself by identifier. The Curry Y-Combinator $Y = \\lambda f.(\\lambda x.f (x\\, x))(\\lambda x.f (x\\, x))$ computes the fixed point of any functional, proving that recursion is an intrinsic mathematical property of function application itself, independent of named identifiers.',
      curiousQuestion: 'How does Haskell evaluate infinite lazy recursive data structures (like the infinite list of primes) in constant memory using graph reduction?'
    },
    suggestedNext: [
      'How does the Master Theorem handle recurrences where f(n) falls into gap zones?',
      'How does the Y Combinator achieve self-reference in pure Lambda Calculus?',
      'How do compiler intermediate representations (LLVM IR) represent SSA phi nodes for loops vs recursion?'
    ],
    timestamp: Date.now()
  },

  'how does ai work?': {
    id: 'how-ai-works-deep-dive',
    topic: 'How Artificial Intelligence & Neural Networks Work',
    level: 'deep_dive',
    simpleExplanation: 'Modern Deep Learning architectures (predominantly the Transformer and modern diffusion/energy-based models) function as high-dimensional statistical manifold approximators. They map discrete or continuous inputs into learned latent vector spaces $\\mathbb{R}^d$, processing contextual interactions through multi-head self-attention $\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$ and multilayer perceptrons (MLPs) interleaved with residual connections and RMSNorm layers. Optimization is governed by stochastic gradient descent variants (e.g. AdamW) minimizing empirical risk over cross-entropy loss, bounded by compute-optimal scaling laws ($N \\propto D$) and constrained by vanishing/exploding gradient dynamics.',
    inSimpleWords: 'Rather than a vague "brain metaphor", artificial intelligence is high-dimensional geometric tensor transformation. An LLM is an autoregressive parameter matrix of billions of float16 weights that computes next-token probability vectors over a vocabulary simplex $\\Delta^{|V|-1}$. Every inference token generation step executes a deterministic series of matrix dot products, non-linear activations, and softmax normalizations across dozens of transformer layers.',
    realWorldExample: {
      title: 'Distributed Pre-training Pipeline & GPU Tensor Parallelism (Megatron-LM / DeepSpeed)',
      scenario: 'Training a 70-billion parameter model requires over 140GB of FP16 memory just to store weights, plus 280GB for AdamW optimizer states and hundreds of gigabytes for activation tensors. Engineering teams combine 3D parallelism: Tensor Parallelism (splitting individual linear projection matrices across GPUs via Megatron-LM), Pipeline Parallelism (partitioning transformer layers across nodes), and ZeRO-3 data sharding to maintain 50%+ Model Flops Utilization (MFU) across thousands of NVIDIA H100 GPUs.',
      takeaway: 'Modern AI capability is deeply governed by distributed hardware constraints, GPU high-bandwidth memory (HBM3) throughput, and inter-node all-reduce collective communications.'
    },
    visualExplanation: {
      title: 'Transformer Architecture: Multi-Head Attention & Residual Stream Dynamics',
      type: 'flow',
      stages: [
        { label: '1. Rotary Position Embedding (RoPE)', description: 'Tokens are embedded into d_model dimensional space; complex rotation matrices encode relative token distances directly in attention queries and keys.', badge: 'Embedding + RoPE' },
        { label: '2. Multi-Head Self-Attention (FlashAttention)', description: 'Linear projections yield Q, K, V matrices. Scaled dot-product attention computes pairwise token relevance matrices with causal masking.', badge: 'O(N^2) Softmax Attention' },
        { label: '3. Residual Connection & RMSNorm', description: 'Input activations are added directly back to layer outputs (residual stream $x_{l+1} = x_l + f(x_l)$) preventing vanishing gradients.', badge: 'Residual Stream Highway' },
        { label: '4. SwiGLU Feedforward & De-quantization', description: 'Gated Linear Units (Swish-Gated MLP) project representations to $4\\times d_{\\text{model}}$ intermediate states, followed by unembedding onto vocabulary logits.', badge: 'Logits $\\in \\mathbb{R}^{|V|}$' }
      ],
      caption: 'The residual stream acts as an invariant communication highway while attention heads read and write localized contextual updates.'
    },
    stepByStep: [
      { stepNumber: 1, title: 'Tokenization & Rotary Positional Embeddings (RoPE)', explanation: 'Byte-Pair Encoding (BPE) converts raw text into token IDs. Tokens project into dense embeddings $X \\in \\mathbb{R}^{B \\times T \\times d}$. Modern architectures inject relative positional information by rotating query and key vectors in complex 2D planes using Rotary Position Embeddings (RoPE), maintaining relative distance decay.', tip: 'RoPE allows length generalization beyond initial pre-training context windows.' },
      { stepNumber: 2, title: 'Multi-Head Attention & FlashAttention execution', explanation: 'Queries, Keys, and Values are computed via linear transformations $Q = XW_Q, K = XW_K, V = XW_V$. FlashAttention reorganizes the attention computation into tiled SRAM kernel blocks, computing softmax normalization incrementally without writing intermediate $N \\times N$ attention matrices to slow GPU HBM.', tip: 'FlashAttention reduces memory access from quadratic to linear with respect to context length.' },
      { stepNumber: 3, title: 'The Residual Stream as a representation bus', explanation: 'Each sub-layer output is added directly to the residual stream: $x_{l+1} = x_l + \\text{SubLayer}(\\text{Norm}(x_l))$. In backpropagation, the gradient of the loss $\\frac{\\partial L}{\\partial x_l} = \\frac{\\partial L}{\\partial x_{l+1}} + \\frac{\\partial L}{\\partial x_{l+1}} \\frac{\\partial \\text{SubLayer}}{\\partial x_l}$ contains an additive identity path, completely solving the vanishing gradient problem for models hundreds of layers deep.', tip: 'The residual connection preserves unimpeded gradient flow directly from the loss back to the earliest layers.' },
      { stepNumber: 4, title: 'Backpropagation via Automatic Differentiation & AdamW', explanation: 'PyTorch/JAX builds a dynamic Directed Acyclic Graph (DAG) of tensor operations. The AdamW optimizer computes running first moments (momentum) and second raw moments (uncentered variance) of the gradients, updating parameters with decoupled weight decay ($W \\leftarrow W(1 - \\eta\\lambda) - \\eta \\frac{m}{\\sqrt{v} + \\epsilon}$).', tip: 'Decoupled weight decay in AdamW prevents exponential regularization distortion under adaptive gradient scaling.' },
      { stepNumber: 5, title: 'Autoregressive inference sampling & decoding strategies', explanation: 'At inference, the final layer produces raw logits over vocabulary $|V|$ (typically 32k-128k tokens). Temperature scaling divides logits ($z_i / T$), followed by top-p (nucleus) filtering to prune low-probability tails before multinomial sampling.', tip: 'Temperature T → 0 produces deterministic greedy decoding; higher temperatures introduce diversity by flattening the probability simplex.' }
    ],
    keyTakeaways: [
      'Transformers process entire sequences in parallel via multi-head self-attention $\\text{Softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$',
      'The residual stream functions as an additive communication bus, ensuring gradient signal propagation across 100+ transformer layers',
      'Chinchilla scaling laws dictate compute-optimal training: token volume must scale linearly with parameter count ($D \\approx 20N$)',
      'Hardware execution constraints (GPU memory bandwidth, KV-cache capacity, and SRAM tiling) dictate real-world LLM inference latency'
    ],
    checkUnderstanding: {
      question: 'During Transformer inference with long contexts, why does the KV-Cache consume significant GPU VRAM memory even when batch size is small?',
      options: [
        { text: 'To avoid recomputing Key and Value projection vectors for all historical tokens at every single generated token step, requiring persistent VRAM storage of shape $2 \\times \\text{Layers} \\times \\text{Heads} \\times \\text{SeqLen} \\times d_k$', isCorrect: true, explanation: 'Correct! Autoregressive generation produces one token at a time. Without caching, generating token 1,000 would require recomputing attention projections for all 999 previous tokens ($O(N^2)$ recomputation). Storing K and V tensors in VRAM trades memory for linear generation speed.' },
        { text: 'Because each token downloads a copy of the entire training dataset from the cloud', isCorrect: false, explanation: 'Incorrect. The model weights are fixed; no training data is retrieved at inference.' },
        { text: 'Because the neural network multiplies the context length by the speed of light', isCorrect: false, explanation: 'Incorrect. GPU VRAM allocation is governed by tensor dimensions and floating-point precision bytes.' },
        { text: 'Because FlashAttention disables matrix multiplication during inference', isCorrect: false, explanation: 'Incorrect. Matrix multiplications are the primary compute payload during inference.' }
      ],
      hint: 'Think about what tensors from past tokens must be preserved so that the next generated token can attend back to them.'
    },
    goDeeper: {
      concept: 'Mechanistic Interpretability & Induction Heads',
      whyItMatters: 'Researchers (e.g. Anthropic, Redwood Research) reverse-engineer transformer weights down to individual circuits. A fundamental discovery is "Induction Heads"—two-layer attention circuits that recognize pattern repetitions like `[A][B] ... [A] -> [B]` across arbitrary contexts, serving as the core sub-component underlying in-context learning in large language models.',
      curiousQuestion: 'How does Monosemantic Dictionary Learning use Sparse Autoencoders (SAEs) to disentangle millions of superposed features in language model representations?'
    },
    suggestedNext: [
      'What are the mathematical differences between RoPE, ALiBi, and standard Learned Positional Embeddings?',
      'How does Grouped Query Attention (GQA) reduce KV-Cache memory bandwidth in Llama 3?',
      'How does Direct Preference Optimization (DPO) derive implicit reward functions without a separate reward model?'
    ],
    timestamp: Date.now()
  },

  'why does inflation happen?': {
    id: 'inflation-deep-dive',
    topic: 'Why Inflation Happens',
    level: 'deep_dive',
    simpleExplanation: 'Inflation is a dynamic general equilibrium phenomenon characterized by continuous upward shifts in the aggregate price index, formalized through New Keynesian Dynamic Stochastic General Equilibrium (DSGE) frameworks, the Fiscal Theory of the Price Level (FTPL), and Fisherian quantity equations. It reflects the divergence between aggregate nominal spending commitments and the economy’s structural potential output constraint ($Y^*$). Drivers include exogenous productivity shocks, cost-push supply elasticity collapses (oil/commodity embargoes), unanchored household inflation expectations $\\mathbb{E}_t[\\pi_{t+1}]$, central bank policy errors relative to the natural rate of interest ($r^*$), and fiscal deficit monetization.',
    inSimpleWords: 'Rather than a simplistic "money printing" soundbite, inflation is the mathematical market clearance mechanism when nominal claims on real economic production exceed physical productive capacity. If aggregate claims exceed output, prices must rise until real purchasing power contracts to match available physical supply. In modern central banking, the true anchor of currency value is institutional credibility: trust that the central bank will raise real interest rates above the natural rate when inflation threatens, and that the fiscal authority will service sovereign debt through future primary budget surpluses rather than runaway seigniorage.',
    realWorldExample: {
      title: 'The Great Inflation (1970s) vs the Post-COVID-19 Inflation Shock (2021-2023)',
      scenario: 'In 2020-2021, the US Federal Reserve expanded its balance sheet from $4.1T to $8.9T while the federal government injected $5T in direct fiscal transfers (CARES Act, ARP). Simultanously, global supply chains, Chinese manufacturing lockdowns, and the Russian invasion of Ukraine inflicted massive cost-push shocks on energy and fertilizer markets. Because real interest rates remained deeply negative (Fed funds at 0% with headline CPI reaching 9.1%), the Fed had to enact the most aggressive rate-hiking cycle in 40 years (525 bps in 16 months) to avert a self-fulfilling 1970s-style wage-price spiral.',
      takeaway: 'When fiscal stimulus and supply bottlenecks combine while real interest rates are held below $r^*$, inflation accelerates non-linearly.'
    },
    visualExplanation: {
      title: 'New Keynesian Phillips Curve & Fiscal Theory of the Price Level (FTPL)',
      type: 'flow',
      stages: [
        { label: '1. Nominal Shock / Fiscal Transfer', description: 'Monetary base expansion or unbacked fiscal transfers increase household nominal net worth without increasing real productive capacity.', badge: 'Nominal Aggregate Demand' },
        { label: '2. Output Gap & Price Setting', description: 'Firms with Calvo price-setting frictions observe demand exceeding natural output $Y^*$; those with reset opportunities raise nominal prices.', badge: 'Calvo Pricing Frictions' },
        { label: '3. Expectations Feedback: $\\mathbb{E}_t[\\pi_{t+1}]$', description: 'New Keynesian Phillips curve: $\\pi_t = \\beta \\mathbb{E}_t[\\pi_{t+1}] + \\kappa (y_t - y_t^*)$. Expected future inflation feeds directly into immediate current pricing contracts.', badge: 'NK Phillips Curve' },
        { label: '4. Monetary Policy Transmission: Taylor Principle', description: 'Central bank raises nominal rate $i_t$ by more than 1:1 with inflation ($\\phi_\\pi > 1$) to increase real rates ($r_t = i_t - \\mathbb{E}[\\pi]$), depressing interest-sensitive demand.', badge: 'Taylor Principle: $\\phi_\\pi > 1$' }
      ],
      caption: 'The Taylor Principle mandates that nominal interest rates must increase by more than point-for-point with inflation to raise real borrowing costs and suppress aggregate demand.'
    },
    stepByStep: [
      { stepNumber: 1, title: 'The New Keynesian Phillips Curve (NKPC) formulation', explanation: 'Under Calvo staggered pricing where a fraction $(1 - \\theta)$ of firms adjust prices per period, aggregate inflation follows $\\pi_t = \\beta \\mathbb{E}_t[\\pi_{t+1}] + \\kappa \\tilde{y}_t$, where $\\tilde{y}_t = (y_t - y_t^*)$ is the output gap. Crucially, inflation today is mathematically dominated by rational expectations of future inflation $\\mathbb{E}_t[\\pi_{t+1}]$.', tip: 'Anchoring inflation expectations is mathematically more potent in curbing inflation than suppressing current output.' },
      { stepNumber: 2, title: 'The Natural Rate of Interest ($r^*$) and Wicksellian equilibrium', explanation: 'If the central bank sets the real policy rate below the Wicksellian natural rate of interest ($r < r^*$), credit creation accelerates, investment exceeds savings, and cumulative inflationary pressure builds up continuously.', tip: 'When $r < r^*$, monetary policy is structurally accommodative regardless of the nominal rate level.' },
      { stepNumber: 3, title: 'The Fiscal Theory of the Price Level (FTPL)', explanation: 'Pioneered by John Cochrane and Eric Leeper, the FTPL states that the price level $P_t$ equates the nominal value of sovereign government debt $B_t$ with the expected present discounted value of all future real primary government budget surpluses: $\\frac{B_t}{P_t} = \\mathbb{E}_t \\sum_{j=0}^{\\infty} M_{t,t+j} s_{t+j}$. If markets perceive fiscal deficits will never be backed by future taxes, $P_t$ rises directly to devalue debt in real terms.', tip: 'Fiscal dominance renders monetary rate hikes ineffective if debt service spirals uncontrollably.' },
      { stepNumber: 4, title: 'The Taylor Principle & determinacy conditions', explanation: 'In interest rate reaction functions $i_t = r^* + \\pi^* + \\phi_\\pi(\\pi_t - \\pi^*) + \\phi_y \\tilde{y}_t$, determinacy requires the Taylor Principle: $\\phi_\\pi > 1$. The nominal rate must rise faster than inflation, so that the real borrowing rate $r_t = i_t - \\pi_t$ rises, dampening consumption and business investment.', tip: 'If $\\phi_\\pi \\le 1$, the economic system enters indeterminacy, spawning self-fulfilling inflationary spirals.' },
      { stepNumber: 5, title: 'Supply-side structural shocks and Cost-Push dynamics', explanation: 'When critical inelastic inputs (crude oil, semiconductors, maritime freight) suffer severe volume declines, the marginal cost of production rises vertically. Central banks face a brutal policy tradeoff: raise rates to crush inflation at the expense of exacerbating output loss, or accommodate supply shocks at the risk of de-anchoring expectations.', tip: 'The 1970s stagflation was caused by trying to offset structural oil supply shocks with persistent monetary stimulus.' }
    ],
    keyTakeaways: [
      'The New Keynesian Phillips Curve demonstrates that current inflation is governed primarily by expectations of future inflation $\\mathbb{E}_t[\\pi_{t+1}]$',
      'The Taylor Principle ($\phi_\\pi > 1$) is a mathematical prerequisite for dynamic equilibrium stability in monetary policy models',
      'The Fiscal Theory of the Price Level (FTPL) proves that inflation can arise from unbacked fiscal debt growth even under independent central banking',
      'Supply shocks shift marginal cost curves upward, forcing central banks to choose between demand contraction (recession) or stagflationary accommodation'
    ],
    checkUnderstanding: {
      question: 'Under New Keynesian monetary theory, why does a central bank violating the Taylor Principle (i.e. Setting $\\phi_\\pi < 1$ in its interest rate rule) lead to explosive or indeterminate inflation spirals?',
      options: [
        { text: 'Because when inflation rises, the nominal interest rate increases by less than the inflation rate, causing the real interest rate ($r = i - \\pi$) to FALL, which further stimulates borrowing and accelerates inflation faster', isCorrect: true, explanation: 'Correct! The Taylor Principle mandates $\\phi_\\pi > 1$. If inflation rises by 2% and the bank only raises nominal rates by 1%, the real interest rate declines by 1%. This perversely makes borrowing cheaper, stimulating investment and consumer demand, driving inflation even higher in a self-reinforcing vicious cycle.' },
        { text: 'Because foreign countries refuse to accept bank wires during the weekend', isCorrect: false, explanation: 'Incorrect. Interbank clearing schedules do not cause macroeconomic model indeterminacy.' },
        { text: 'Because gold mines immediately cease all physical mineral extraction', isCorrect: false, explanation: 'Incorrect. Modern economies use fiat currency regimes governed by central bank interest rates, not physical gold mining operations.' },
        { text: 'Because commercial banks are forced to convert all savings into treasury bills', isCorrect: false, explanation: 'Incorrect. Asset liability management does not violate the Fisher equation.' }
      ],
      hint: 'Recall the Fisher equation for real interest rates: Real Rate = Nominal Rate - Inflation Rate.'
    },
    goDeeper: {
      concept: 'The Liquidity Trap, Zero Lower Bound (ZLB) & Forward Guidance',
      whyItMatters: 'When the nominal policy rate reaches 0% (the Zero Lower Bound), central banks cannot cut interest rates further. If inflation expectations turn negative (deflation), real interest rates $r = i - \\pi$ rise automatically, paralyzing economic activity. To escape this trap, central banks deploy Quantitative Easing (QE) and Forward Guidance, intentionally committing to keep future interest rates lower for longer to elevate inflation expectations $\\mathbb{E}_t[\\pi_{t+1}]$.',
      curiousQuestion: 'How does the Bank of Japan’s multi-decade experiment with Yield Curve Control (YCC) demonstrate the boundary limits between monetary policy and government debt monetization?'
    },
    suggestedNext: [
      'How does the Cochrane Fiscal Theory of the Price Level (FTPL) model sovereign default risk?',
      'What are the mathematical equations of the Clarida, Galí, and Gertler (1999) monetary framework?',
      'How does the Neutral Rate of Interest (r*) shift dynamically with demographic aging and productivity trends?'
    ],
    timestamp: Date.now()
  }
};

export function getCuratedPreset(query: string, level: ExplanationLevel = 'beginner'): ExplanationData | null {
  const norm = query.toLowerCase().trim().replace(/[?!.,;]/g, '');
  const pool = level === 'deep_dive' 
    ? PRESET_EXPLANATIONS_DEEP_DIVE 
    : level === 'intermediate' 
    ? PRESET_EXPLANATIONS_INTERMEDIATE 
    : PRESET_EXPLANATIONS;

  for (const [key, preset] of Object.entries(pool)) {
    const normKey = key.toLowerCase().trim().replace(/[?!.,;]/g, '');
    if (norm === normKey || norm.includes(normKey) || normKey.includes(norm)) {
      return {
        ...preset,
        level,
        id: `${preset.id}-${level}-${Date.now()}`,
        timestamp: Date.now()
      };
    }
  }
  return null;
}

export const SAMPLE_CODE_TUTOR_CASES = [
  {
    title: 'Python: Mutable Default Argument Trap',
    language: 'python',
    code: `def add_item(item, shopping_list=[]):\n    shopping_list.append(item)\n    return shopping_list\n\nprint(add_item('apple'))\nprint(add_item('banana'))  # Expect: ['banana']\n# Actual output: ['apple', 'banana']!`,
    errorDescription: "Second call retains items from the first call even though I passed no list.",
    response: {
      whatsWrong: "In Python, default function arguments are evaluated once when the function is defined, NOT each time the function is executed. Because a list is mutable, every call that omits the second parameter modifies the exact same list instance in memory.",
      why: "Python binds the default object `[]` to the function object at definition time. Subsequent calls reference this same persistent list in memory.",
      correctedCode: `def add_item(item, shopping_list=None):\n    if shopping_list is None:\n        shopping_list = []  # Creates a fresh new list every invocation\n    shopping_list.append(item)\n    return shopping_list\n\nprint(add_item('apple'))   # ['apple']\nprint(add_item('banana'))  # ['banana'] - FIXED!`,
      whatChanged: [
        "Changed default parameter from mutable `[]` to immutable `None`.",
        "Added `if shopping_list is None:` guard inside the function body.",
        "Instantiated a brand new empty list `[]` dynamically inside the call scope."
      ],
      learnThisConcept: {
        concept: "Python Mutable vs Immutable Defaults",
        explanation: "Never use mutable data types (lists, dictionaries, sets) as default arguments in Python function signatures. Always use `None` as sentinel value and instantiate inside.",
        ruleOfThumb: "Rule of thumb: In Python, `def func(x=None):` is always safer than `def func(x=[]):`"
      },
      tryItYourself: {
        prompt: "Fix this function so that the user's score record doesn't leak into subsequent players:",
        starterCode: `def register_player(name, scores={}):\n    scores[name] = 0\n    return scores`,
        solutionCode: `def register_player(name, scores=None):\n    if scores is None:\n        scores = {}\n    scores[name] = 0\n    return scores`
      }
    }
  },
  {
    title: 'JavaScript: Loop Closure & Async Timing',
    language: 'javascript',
    code: `for (var i = 0; i < 3; i++) {\n  setTimeout(function() {\n    console.log("Count:", i);\n  }, 1000);\n}\n// Prints: Count: 3, Count: 3, Count: 3!`,
    errorDescription: "Expected to print 0, 1, 2, but it prints 3 three times.",
    response: {
      whatsWrong: "The `var` keyword creates a function-scoped or globally-scoped variable, not a block-scoped variable. By the time the 1000ms timer completes, the loop has already finished and `i` equals 3 for all three callbacks.",
      why: "JavaScript's event loop executes `setTimeout` callbacks after the synchronous loop finishes. All callbacks reference the exact same memory reference of `i`.",
      correctedCode: `for (let i = 0; i < 3; i++) {\n  setTimeout(() => {\n    console.log("Count:", i);\n  }, 1000);\n}\n// Prints: Count: 0, Count: 1, Count: 2`,
      whatChanged: [
        "Replaced `var i = 0` with `let i = 0`.",
        "`let` creates a new lexical binding for each loop iteration.",
        "Each setTimeout closure captures its own distinct copy of `i`."
      ],
      learnThisConcept: {
        concept: "Block Scope vs Function Scope in JS Closures",
        explanation: "`var` is hoisted to the nearest function boundary, while `let` and `const` have block scope (contained within `{}`). In a loop, `let` re-binds the variable per iteration.",
        ruleOfThumb: "Rule of thumb: Always use `let` or `const` in modern JavaScript; avoid `var`."
      },
      tryItYourself: {
        prompt: "Convert this array of button click handlers to correctly alert each button index using modern block scoping:",
        starterCode: `for (var idx = 0; idx < buttons.length; idx++) {\n  buttons[idx].onclick = function() { alert(idx); };\n}`,
        solutionCode: `for (let idx = 0; idx < buttons.length; idx++) {\n  buttons[idx].onclick = () => alert(idx);\n}`
      }
    }
  },
  {
    title: 'Python: Infinite Recursion (Missing Base Case)',
    language: 'python',
    code: `def countdown(n):\n    print(n)\n    return countdown(n - 1)\n\ncountdown(5)\n# RecursionError: maximum recursion depth exceeded!`,
    errorDescription: "Crashes with RecursionError: maximum recursion depth exceeded while calling a Python object.",
    response: {
      whatsWrong: "The `countdown` function has no stopping condition (base case). It counts down past 0 to -1, -2, -3... forever until the Python interpreter call stack runs out of memory.",
      why: "Every recursive call consumes stack space. Without a base case to halt recursion and return, Python aborts at 1000 calls to prevent system crash.",
      correctedCode: `def countdown(n):\n    if n <= 0:  # Base Case: Stop condition!\n        print("Blast off!")\n        return\n    \n    print(n)\n    countdown(n - 1)  # Recursive step\n\ncountdown(5)  # 5, 4, 3, 2, 1, Blast off!`,
      whatChanged: [
        "Added base case `if n <= 0: return` at the very beginning of the function.",
        "Included optional celebratory message 'Blast off!' upon reaching zero.",
        "Function now gracefully halts when countdown terminates."
      ],
      learnThisConcept: {
        concept: "The Fundamental Anatomy of Recursion",
        explanation: "Every valid recursive function must have two components: 1) A Base Case that returns a value without further calls, and 2) A Recursive Step that progresses inputs strictly closer to the base case.",
        ruleOfThumb: "Rule of thumb: Always write and test your Base Case condition first before writing the recursive call."
      },
      tryItYourself: {
        prompt: "Add the missing base case to calculate the sum of numbers from 1 to n recursively:",
        starterCode: `def sum_to_n(n):\n    # Add base case here\n    return n + sum_to_n(n - 1)`,
        solutionCode: `def sum_to_n(n):\n    if n <= 1:\n        return 1\n    return n + sum_to_n(n - 1)`
      }
    }
  }
];

export const SAMPLE_STUDY_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-1',
    title: 'Biology 101 - Cellular Respiration & ATP Synthesis.pdf',
    type: 'pdf',
    size: '1.4 MB',
    date: '2 hours ago',
    summary: 'Comprehensive lecture slides covering glycolysis in the cytoplasm, Krebs cycle in the mitochondrial matrix, and oxidative phosphorylation driven by ATP synthase.',
    keyConcepts: [
      'Glycolysis (Anaerobic glucose splitting → 2 Pyruvate)',
      'Citric Acid Cycle / Krebs Cycle (NADH & FADH₂ production)',
      'Electron Transport Chain & Chemiosmosis (Proton gradient)',
      'Yield: Net ~30-32 ATP per glucose molecule'
    ],
    content: `Cellular respiration is the biochemical process by which eukaryotic cells harvest chemical energy from glucose bonds to phosphorylate ADP into adenosine triphosphate (ATP). The overall equation is C6H12O6 + 6O2 -> 6CO2 + 6H2O + ~32 ATP. It occurs in three sequential stages: 1) Glycolysis: converts 1 glucose into 2 pyruvate with a net gain of 2 ATP and 2 NADH. 2) The Citric Acid Cycle: oxidizes acetyl-CoA to release CO2 while reducing NAD+ and FAD into high-energy electron carriers. 3) Oxidative Phosphorylation: electron carriers drop electrons down a cytochrome chain, pumping H+ protons into the intermembrane space. The resulting electrochemical gradient spins the molecular turbine ATP synthase to generate the bulk of cellular energy.`,
    recommendedQuestions: [
      'Explain how ATP Synthase works like a hydroelectric dam',
      'What happens when oxygen runs out during intense exercise?',
      'Why is Glycolysis considered the most ancient metabolic pathway?'
    ]
  },
  {
    id: 'mat-2',
    title: 'CS 201 - Recursion, Call Stacks & Binary Trees.txt',
    type: 'notes',
    size: '84 KB',
    date: 'Yesterday',
    summary: 'Class notes on algorithmic recursion, memory stack layout, activation records, and Depth-First Search traversals (Pre-order, In-order, Post-order).',
    keyConcepts: [
      'Activation records & stack frame allocation',
      'Base cases vs recursive divide-and-conquer',
      'Tree traversal algorithms (DFS vs BFS)',
      'Space complexity O(d) recursion stack depth'
    ],
    content: `When a recursive function executes, the CPU allocates a new stack frame containing local variables, parameters, and the return address. If recursion proceeds too deeply without reaching a base case, stack memory is exhausted (StackOverflowException). In binary search trees, an in-order traversal (Left, Root, Right) yields elements in strictly sorted order. Post-order traversal (Left, Right, Root) is ideal for deleting nodes or calculating subtree file sizes because children are evaluated before the parent.`,
    recommendedQuestions: [
      'How does In-Order traversal sort a Binary Search Tree?',
      'Explain the difference between Call Stack and Heap memory',
      'What is the difference between recursion and iteration in space complexity?'
    ]
  },
  {
    id: 'mat-3',
    title: 'Macroeconomics - Money Supply, Fed Rates & Inflation.md',
    type: 'article',
    size: '320 KB',
    date: '3 days ago',
    summary: 'Policy overview examining M2 money supply, federal funds rate adjustments, quantitative easing vs quantitative tightening, and cost-push supply chain shocks.',
    keyConcepts: [
      'M1 vs M2 Money Supply expansion',
      'Federal Open Market Committee (FOMC) interest rate policy',
      'The Consumer Price Index (CPI) basket of goods',
      'Supply chain bottlenecks vs monetary stimulus'
    ],
    content: `Inflation measures the annual percentage change in the Consumer Price Index (CPI). When central banks lower the benchmark interest rate to near zero and engage in quantitative easing (purchasing long-term treasury bonds), borrowing costs drop and money supply surges. If industrial production capacity remains static, excessive money chases fixed output, leading to demand-pull inflation. Conversely, geopolitical energy embargos or tariff wars lead to cost-push inflation, where the cost of raw goods compels manufacturers to raise retail prices regardless of demand.`,
    recommendedQuestions: [
      'How does raising interest rates cool down inflation?',
      'What is the difference between CPI and Core CPI?',
      'Can printing money ever happen without causing inflation?'
    ]
  }
];

export const SAMPLE_LEARNING_PATHS: LearningPath[] = [
  {
    id: 'path-python',
    title: 'Python & Computational Thinking',
    description: 'Master programming fundamentals from basic logic to structured data manipulation and functions.',
    category: 'Computer Science',
    totalTopics: 6,
    completedTopics: 3,
    nodes: [
      { id: 'p1', title: 'Variables & Data Types', description: 'Numbers, Strings, Booleans, and Memory Pointers', status: 'completed', estimatedTime: '15 mins', prompt: 'Explain Python variables and data types' },
      { id: 'p2', title: 'Conditional Logic', description: 'If-elif-else branching and boolean operators', status: 'completed', estimatedTime: '20 mins', prompt: 'Explain conditional logic in Python' },
      { id: 'p3', title: 'Loops & Iteration', description: 'For loops, while loops, and range generators', status: 'completed', estimatedTime: '25 mins', prompt: 'Explain for loops and while loops in Python' },
      { id: 'p4', title: 'Functions & Scope', description: 'Parameters, return values, and global vs local scope', status: 'current', estimatedTime: '30 mins', prompt: 'Explain Python functions and variable scope' },
      { id: 'p5', title: 'Data Structures', description: 'Lists, Tuples, Dictionaries, and Sets in depth', status: 'locked', estimatedTime: '35 mins', prompt: 'Explain Python Lists and Dictionaries' },
      { id: 'p6', title: 'Mini Project: Text Analyzer', description: 'Putting everything together into a real script', status: 'locked', estimatedTime: '45 mins', prompt: 'How to build a Python word frequency analyzer' }
    ]
  },
  {
    id: 'path-ai',
    title: 'AI & Machine Learning Foundations',
    description: 'Understand the mathematical intuition and structural breakthroughs powering modern AI.',
    category: 'Artificial Intelligence',
    totalTopics: 5,
    completedTopics: 1,
    nodes: [
      { id: 'a1', title: 'What is AI & Machine Learning?', description: 'How algorithms learn patterns from empirical data', status: 'completed', estimatedTime: '15 mins', prompt: 'How does AI work?' },
      { id: 'a2', title: 'Vectors & Embeddings', description: 'Turning words and concepts into multi-dimensional coordinates', status: 'current', estimatedTime: '25 mins', prompt: 'Explain vector embeddings in AI' },
      { id: 'a3', title: 'Neural Networks & Gradient Descent', description: 'How artificial neurons tune weights using calculus', status: 'locked', estimatedTime: '35 mins', prompt: 'Explain Neural Networks and Gradient Descent' },
      { id: 'a4', title: 'Transformers & Self-Attention', description: 'The revolutionary architecture behind modern LLMs', status: 'locked', estimatedTime: '40 mins', prompt: 'Explain the Transformer architecture and Attention mechanism' },
      { id: 'a5', title: 'Prompt Engineering & Fine-Tuning', description: 'Directing models effectively and tailoring behaviors', status: 'locked', estimatedTime: '30 mins', prompt: 'Explain prompt engineering and model fine tuning' }
    ]
  },
  {
    id: 'path-web',
    title: 'How the Internet Really Works',
    description: 'Deconstruct the invisible global infrastructure moving bytes from servers to screens.',
    category: 'Networking & Web',
    totalTopics: 5,
    completedTopics: 0,
    nodes: [
      { id: 'w1', title: 'DNS & IP Addresses', description: 'The phonebook of the internet and packet routing', status: 'current', estimatedTime: '15 mins', prompt: 'How does DNS look up a website address?' },
      { id: 'w2', title: 'HTTP, HTTPS & TLS Handshake', description: 'Secure communication and cryptographic encryption', status: 'locked', estimatedTime: '20 mins', prompt: 'What happens during an HTTPS TLS handshake?' },
      { id: 'w3', title: 'Client-Server & REST APIs', description: 'How browsers request and receive JSON data payloads', status: 'locked', estimatedTime: '25 mins', prompt: 'What is an API?' },
      { id: 'w4', title: 'Browsers, DOM & Rendering', description: 'How HTML, CSS, and JS become interactive pixels', status: 'locked', estimatedTime: '30 mins', prompt: 'How do web browsers render HTML and CSS?' },
      { id: 'w5', title: 'Cloud, CDN & Edge Computing', description: 'Distributed servers delivering latency-free content worldwide', status: 'locked', estimatedTime: '25 mins', prompt: 'What is a CDN and how does cloud edge computing work?' }
    ]
  }
];
