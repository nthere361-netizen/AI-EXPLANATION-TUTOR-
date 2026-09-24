import { ExplanationData, StudyMaterial, LearningPath } from '../types';

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
