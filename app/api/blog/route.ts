import { NextResponse } from "next/server";

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  tags: string[];
  emoji: string;
}

const POSTS: BlogPost[] = [
  // AI (4)
  {
    id: "neural-network-interpretability",
    title: "What Are Neurons Actually Learning?",
    excerpt: "Researchers just discovered individual neurons in massive language models that activate specifically for human concepts like deception and uncertainty — without being explicitly trained to recognize them.",
    content: "For years, neural networks have been black boxes. We've known they work remarkably well at tasks like language understanding and image recognition, but the internal mechanisms remained opaque. That's changing. In groundbreaking research published in 2024, Anthropic's team used mechanistic interpretability techniques to identify individual neurons in large language models that respond to specific, human-understandable concepts.\n\nThe findings are striking: certain neurons in GPT-2 and larger models activate strongly when encountering text about mathematical concepts, while others respond to social dynamics or deception. The neurons weren't explicitly programmed or fine-tuned to detect these patterns — they emerged naturally from the model's training process. This suggests neural networks develop internal representations that align more closely with human reasoning than previously understood.\n\nWhat makes this research powerful is the reproducibility. Using sparse autoencoders and activation maximization techniques, researchers can now probe a model's internal representations, visualize what individual features have learned, and even identify problematic neurons before deployment. For the AI safety community, this is huge. If we can understand what language models are actually learning at the neuron level, we can build safer, more interpretable systems. We're moving from treating AI as pure black box magic to something we can actually dissect and understand.",
    category: "ai",
    readTime: "4 min read",
    date: "2026-04-10",
    tags: ["AI", "Neural Networks", "Interpretability", "Research"],
    emoji: "🧠"
  },
  {
    id: "ai-hallucinations-root-cause",
    title: "The Real Reason AI Models Hallucinate",
    excerpt: "It's not a bug — it's a fundamental trade-off in how neural networks compress knowledge. New research reveals why language models confidently make up facts.",
    content: "When ChatGPT confidently tells you that Abraham Lincoln invented the light bulb, it's not lying maliciously. It's hallucinating — and researchers are finally understanding why. A fascinating study from Stanford and Princeton analyzed the internal representations of language models and discovered something important: hallucinations stem from the fundamental way these models compress information.\n\nNeural networks learn by finding patterns in data and creating compressed representations. When a model generates text, it's essentially performing a form of controlled prediction based on statistical patterns it learned during training. But here's the crucial insight: models sometimes activate features that seem semantically related even when factually disconnected. A neuron that activates for 'famous inventor' might fire for both Edison and Lincoln, leading the model to conflate them. The model isn't reasoning; it's interpolating between learned patterns.\n\nWhat's particularly interesting is that hallucinations increase when models are asked to generate content outside their training distribution or when they're forced to be more concise (like in constrained token budgets). It's as if the compression becomes lossy. Researchers are now exploring whether we can detect these failure modes during generation by monitoring internal activation patterns, potentially allowing models to abstain from answering when they detect high hallucination risk. The solution isn't just better training data — it's understanding that hallucinations reveal something fundamental about how these systems work.",
    category: "ai",
    readTime: "4 min read",
    date: "2026-04-08",
    tags: ["AI", "Hallucinations", "Language Models", "Safety"],
    emoji: "👻"
  },
  {
    id: "quantum-advantage-practical",
    title: "We Finally Have Quantum Computers That Do Useful Work",
    excerpt: "Google and IBM's latest quantum processors aren't just academic curiosities anymore — they're solving real optimization problems faster than classical computers.",
    content: "For two decades, quantum computing was 'always thirty years away.' That's finally changing. In early 2026, both Google and IBM demonstrated quantum processors that solve practical optimization problems — molecule simulation, battery chemistry, and financial modeling — measurably faster than the best classical computers available.\n\nGoogle's Willow chip, featuring over 100 qubits with dramatically improved error correction, achieved quantum advantage on a specific class of problems where errors scale better on quantum hardware than classical approaches. But more importantly, IBM's latest roadmap focuses on NISQ (Noisy Intermediate-Scale Quantum) algorithms that actually work on imperfect hardware. These aren't theoretical speedups anymore. Real pharmaceutical companies are running molecular simulations on quantum hardware to discover new drugs. Energy companies are optimizing grid allocation with quantum algorithms. The gap between quantum hype and quantum reality is narrowing.\n\nThe breakthrough hinges on error correction. Quantum states are fragile — environmental noise and hardware imperfections cause qubits to lose their quantum properties. Previous generations of quantum computers lost coherence so quickly they couldn't complete meaningful calculations. New topological error correction schemes and surface codes are changing this, allowing quantum computers to maintain quantum advantage long enough to solve real problems. We're entering the era where quantum is a practical tool, not a curiosity.",
    category: "ai",
    readTime: "3 min read",
    date: "2026-04-05",
    tags: ["Quantum Computing", "Technology", "Innovation", "Breakthrough"],
    emoji: "⚛️"
  },
  {
    id: "ai-generated-content-detection",
    title: "Can We Spot AI-Generated Content? New Tools Say Yes",
    excerpt: "Researchers developed a suite of detection methods that identify AI-generated text with 95%+ accuracy — and it could transform how we verify online information.",
    content: "The flood of AI-generated content has created an urgent need: how do you know if what you're reading was written by a human or an algorithm? A consortium of researchers led by MIT and OpenAI just released a comprehensive toolkit that detects AI-generated content with startling accuracy. The approach doesn't rely on watermarks or metadata — it analyzes the statistical properties of text itself.\n\nAI language models have distinctive signatures. They tend to use certain word choices and phrases more predictably than humans do. They maintain more consistent grammar and structure. When analyzing large samples of text, AI-generated content shows different perplexity curves and entropy distributions than human writing. By training classifiers on these statistical properties, researchers achieved 95% detection accuracy across multiple AI systems including Claude, GPT-4, and open-source models.\n\nBut there's a catch: detection becomes harder on shorter texts. A single sentence is nearly impossible to classify reliably, but a paragraph becomes increasingly identifiable. More concerning, adversarial techniques can make AI-generated text evade detection by intentionally introducing variability. The arms race is just beginning. However, for verifying long-form content — research papers, news articles, educational materials — these tools represent a genuine breakthrough. Detection isn't foolproof, but combined with other verification methods, it's becoming a useful part of the information verification toolkit.",
    category: "ai",
    readTime: "3 min read",
    date: "2026-04-02",
    tags: ["AI Detection", "Content Verification", "Research", "Security"],
    emoji: "🔍"
  },

  // Dev (4)
  {
    id: "risc-v-adoption-accelerating",
    title: "RISC-V Is Finally Taking Over From ARM",
    excerpt: "After years of slow adoption, RISC-V processors are now shipping in production systems — and they're genuinely better for certain workloads.",
    content: "For decades, the microprocessor world was dominated by two architectures: x86 (Intel, AMD) and ARM (mobile, embedded systems). RISC-V was the open-source upstart nobody quite took seriously. That's changing dramatically in 2026. Major chip manufacturers are shipping RISC-V processors, and crucially, they're winning real market share in specific domains.\n\nWhy the sudden shift? RISC-V's open specification is genuinely revolutionary for semiconductor design. Unlike ARM, which licenses a proprietary architecture, RISC-V lets chip makers extend and customize the instruction set for their specific needs. This means less licensing complexity, cheaper design costs, and freedom to optimize. Chinese manufacturers like Alibaba and RISC-V International members are deploying RISC-V in everything from IoT devices to edge AI accelerators. Even more importantly, open-source communities have matured around RISC-V, with full software stacks, compilers, and debuggers now rival their ARM/x86 counterparts.\n\nThe real inflection point came when hyperscalers like Google and Meta started designing custom RISC-V chips for specific ML workloads. When the companies running the internet find RISC-V more efficient for their infrastructure, the architecture gains critical momentum. By 2030, expect RISC-V to own significant segments of the edge computing, IoT, and specialized accelerator markets. It won't replace ARM in smartphones anytime soon, but it's now a genuine threat to ARM's dominance in infrastructure.",
    category: "dev",
    readTime: "4 min read",
    date: "2026-04-09",
    tags: ["RISC-V", "Processor Architecture", "Open Source", "Hardware"],
    emoji: "⚙️"
  },
  {
    id: "dns-internet-backbone",
    title: "Why DNS Is Actually the Internet's Backbone",
    excerpt: "Most people forget DNS exists until it breaks — but it's arguably the most critical infrastructure on the internet. One misconfiguration can break entire regions.",
    content: "DNS — Domain Name System — is the infrastructure most engineers take for granted until something catastrophic happens. It doesn't move data; it just translates domain names to IP addresses. That sounds simple, but DNS is the nervous system of the internet. Every request you make, every API call, every website load starts with a DNS query. One single DNS misconfiguration can break service availability for millions of people.\n\nConsider what happens behind the scenes: Your browser asks your ISP's resolver 'What's the IP for google.com?' That query fans out through a hierarchical network of authoritative nameservers — root servers, TLD servers, and finally the authoritative nameserver for google.com's domain. The response gets cached at multiple layers. If any of these servers goes down or misconfigures, entire regions lose connectivity. Cloudflare's infrastructure team has published postmortems where a single DNS zone configuration error cascaded across their entire network, affecting millions of users.\n\nModern DNS architecture is simultaneously ancient (built in the 1980s) and critical. We've bolted on DNSSEC for cryptographic verification, DoH (DNS over HTTPS) for privacy, and anycast networks to distribute load. But the fundamental vulnerability remains: DNS is a single point of failure for the entire internet. Which is why the DNS community invests heavily in redundancy, monitoring, and careful change management. The next time the internet hiccups, DNS misconfiguration is probably somewhere in the incident chain.",
    category: "dev",
    readTime: "3 min read",
    date: "2026-03-31",
    tags: ["DNS", "Infrastructure", "Internet", "DevOps"],
    emoji: "🔗"
  },
  {
    id: "webassembly-beyond-browser",
    title: "WebAssembly Escaped the Browser and Nobody Noticed",
    excerpt: "WASM isn't just for web games anymore — it's becoming the universal runtime for everything from databases to serverless functions.",
    content: "WebAssembly started as a way to run performant code in web browsers without downloading bloated native binaries. But something strange happened: developers realized WASM's properties — sandboxing, portability, determinism — made it useful everywhere. Now companies are using WebAssembly for backend services, database extensions, and edge computing.\n\nDatabases like PostgreSQL and SQLite now support WASM plugins. Fastly's edge computing platform uses WASM modules instead of traditional containers. Cloudflare Workers run WASM functions on their global network. The common thread: WASM provides better isolation than traditional server-side scripting, better portability than native binaries, and surprisingly good performance. A WASM module compiled once runs identically everywhere — no dependency hell, no 'works on my machine,' no container sprawl.\n\nThe ecosystem has matured dramatically. Component Model, a new standard, lets WASM modules communicate with other components in type-safe ways. Bytecode Alliance, backed by companies like Fastly, Shopify, and Cosmonic, is standardizing WASM runtimes (wasmtime, wasmer) that let developers deploy WASM outside browsers at scale. We're witnessing the emergence of WASM as a general-purpose computing platform, not just a web technology. Expect to see more backend infrastructure running on WASM within two years.",
    category: "dev",
    readTime: "3 min read",
    date: "2026-03-28",
    tags: ["WebAssembly", "Backend", "Infrastructure", "Technology"],
    emoji: "📦"
  },
  {
    id: "the-mass-of-all-code",
    title: "How Much Does All Code Weigh? Estimate: Several Grams",
    excerpt: "A physicist calculated the physical mass of every line of code ever written on Earth — the answer is smaller than you'd expect.",
    content: "Here's an absurdly fun physics question: if you took every line of code ever written and stored it as stable matter, how much would it weigh? A researcher at CERN did the calculation, and the answer is weirdly profound. They estimated approximately 10^17 lines of code exist globally (including all the code in GitHub, corporate systems, legacy enterprise software, research codebases). If you encoded this in DNA (the densest known data storage medium), the entire history of human software would weigh roughly 200 grams.\n\nThis isn't just a thought experiment — it reveals something humbling about human achievement. Despite decades of development, millions of programmers, and trillions of lines of code, the physical substrate of humanity's collective programming effort weighs as much as a heavy book. It highlights how immaterial software actually is. That weight calculation assumes biological DNA as storage. Using more exotic methods like topological qubits or engineered nucleotides, you could fit it in even less mass. The implication: software is pure abstraction and information, unburdened by physical constraints. Which makes you realize how strange it is that we still think about server storage in terms of physical hardware — a philosophical artifact from the 1990s.\n\nOf course, the energy cost of storing and executing that code is enormous. Every gigabyte of data requires power to run. Every computation burns electricity. So while software is weightless, its infrastructure isn't.",
    category: "dev",
    readTime: "2 min read",
    date: "2026-03-25",
    tags: ["Programming", "Physics", "Philosophy", "Software"],
    emoji: "⚖️"
  },

  // Space (3)
  {
    id: "mars-dust-storms-prediction",
    title: "We Can Now Predict Mars Dust Storms Weeks in Advance",
    excerpt: "Machine learning models trained on years of satellite data are forecasting Martian weather with unprecedented accuracy — crucial for future rover missions.",
    content: "Planning missions to Mars requires predicting one of the planet's most dangerous phenomena: dust storms. These aren't like Earth dust storms — they can cover the entire planet and block out sunlight for weeks, devastating solar-powered rovers. For decades, we predicted them poorly, mostly by luck. Now machine learning is changing that. NASA's Jet Propulsion Laboratory and the University of Arizona trained neural networks on 20 years of thermal imaging data from Mars orbiters, teaching them to recognize the precursor conditions that lead to planet-wide storms.\n\nThe models are accurate enough to predict major dust storm activity 3-4 weeks in advance, giving mission planners time to adjust rover operations or power down non-critical systems. The neural networks learned to recognize subtle patterns in atmospheric temperature, pressure, and dust optical depth that human meteorologists might miss. They identify seasonal timing, regional triggers, and storm scaling patterns. The breakthrough has real consequences: the model successfully predicted the 2023 regional dust event that didn't expand to global scale, validating the approach.\n\nWhat's fascinating is how this mirrors Earth weather prediction — both planets have chaotic atmospheric dynamics, limited observational coverage, and complex physics. But Mars is simpler: no oceans, less diverse weather patterns, and stable greenhouse conditions. As we prepare for sustained human presence on Mars, accurate weather prediction becomes essential. The same techniques being developed here will eventually power a Mars Weather Service, just like Earth's NOAA.",
    category: "space",
    readTime: "3 min read",
    date: "2026-04-07",
    tags: ["Mars", "Machine Learning", "Weather", "Space"],
    emoji: "🔴"
  },
  {
    id: "starlink-latency-breakthrough",
    excerpt: "Elon Musk's satellite internet is hitting sub-20ms latency — competitive with fiber for the first time.",
    title: "Starlink Just Became Competitive With Fiber on Latency",
    content: "Satellite internet has a fundamental physics problem: radio signals travel at the speed of light, and geosynchronous satellites are 36,000 kilometers up. Even at light-speed, the round-trip takes about 250 milliseconds — terrible for real-time applications. That's why satellite internet has always been 'best effort' for rural areas, not a competitive technology.\n\nBut Starlink's mega-constellation at low Earth orbit (550 km altitude) changes the math entirely. Signals only travel ~3,500 km round-trip, yielding latencies around 30-50ms. That's better, but still not competitive with fiber's sub-5ms. Until now. Recent measurements from independent testers show Starlink's latest generation satellites, optimized routing, and inter-satellite handoffs have pushed latency down to 15-20ms — essentially identical to cable internet for most uses. Competitive ISP-grade latency, delivered from space.\n\nThe engineering required is staggering. Starlink had to build a routing mesh in space, where satellites talk to each other using laser links, computing optimal paths for each packet. Network engineers call this 'space internet' and it required rethinking fundamental routing assumptions. The implications are enormous: rural areas now have access to internet quality comparable to urban fiber installations. More importantly, satellite internet is finally viable for applications previously requiring terrestrial connectivity — remote offices, field operations, even casual online gaming.\n\nThe next frontier is reducing jitter (variance in latency), where satellite still lags. But we're witnessing a genuine phase transition for global connectivity.",
    category: "space",
    readTime: "3 min read",
    date: "2026-04-01",
    tags: ["Starlink", "Satellite Internet", "Space", "Technology"],
    emoji: "🛰️"
  },
  {
    id: "europa-mission-launch",
    title: "NASA's Europa Clipper Is About to Revolutionize Our Search for Life",
    excerpt: "The upcoming mission to Jupiter's moon Europa represents humanity's first serious attempt to detect extraterrestrial life in our solar system.",
    content: "Jupiter's moon Europa is probably the most promising place in our solar system to find life beyond Earth. Beneath its icy crust lies a global ocean — more water than all of Earth's oceans combined — potentially containing the chemical complexity needed for biology. For years, Europa was a distant dream. Now, NASA's Europa Clipper mission, launching soon, is our first serious scientific attempt to answer the question: Is there life out there?\n\nThe Clipper won't land (ice is too thick, ocean too deep), but it will conduct 44 close flybys of Europa, using sophisticated instruments to characterize the moon's geology, chemistry, and habitability. The spacecraft carries ice-penetrating radar that can map subsurface structure, spectrometers to analyze chemical composition, and cameras to search for signs of active plumes — places where the ocean bubbles to the surface. If Europa's ocean is venting, it might carry biological signatures to the surface where we can detect them.\n\nWhat makes this mission culturally significant: Europa Clipper is humanity's first intentional search for life in space. We're not looking for microbial fossils in ancient rocks or chemical signatures of ancient life. We're looking for living biospheres elsewhere in our solar system, right now. The implications of finding life — even extremophile microbes — would be enormous. It would answer whether life is rare and precious or a natural consequence of chemistry itself. Launch is happening soon, and the scientific community is cautiously optimistic about what we'll learn.",
    category: "space",
    readTime: "3 min read",
    date: "2026-03-22",
    tags: ["Space Exploration", "NASA", "Astrobiology", "Europa"],
    emoji: "🚀"
  },

  // Gaming (3)
  {
    id: "why-physics-breaks-high-fps",
    title: "Why Game Physics Catastrophically Fails at Ultra-High Framerates",
    excerpt: "Running a game at 360fps doesn't just look smooth — it fundamentally changes how physics engines behave, sometimes causing objects to literally vanish.",
    content: "Modern gaming PCs can hit 360+ fps at 1440p, but physics engines weren't designed for this. Most game engines assume framerate stays relatively constant — typically 60, 144, or 240 fps. What happens when you push to 360, 480, or even unlimited? Physics completely breaks in subtle and hilarious ways. Objects pass through walls. Ragdoll bodies explode. Gravity becomes unpredictable.\n\nThe issue is fundamental to how physics simulation works. Most engines use fixed timestep integration: each frame, they advance the physics state by a fixed delta-time (say, 1/60th of a second). At 360 fps, the per-frame delta becomes 1/360th of a second. This seems fine, but it interacts badly with collision detection. Faster-moving objects can tunnel through obstacles in a single frame without triggering collision events. Spring forces become overcompensated. Forces that should be damped oscillate instead. Professional physics engines (PhysX, Havok) have parameters tuned for specific framerates — go too high and you're in undefined behavior territory.\n\nSmarter physics engines now use continuous collision detection and adaptive timesteps, but most games still use legacy approaches. Developers respond by frame-capping their games, artificially limiting fps to stay within the tuned range. It's a hack, but it works. As monitors push beyond 240hz, this becomes increasingly important. The future probably involves physics engines that scale more intelligently with framerate, or automatic parameter adjustment. For now, running your favorite game at the monitor's maximum refresh rate might actually break the game's physics in subtle, hard-to-diagnose ways.",
    category: "gaming",
    readTime: "3 min read",
    date: "2026-04-03",
    tags: ["Game Development", "Physics", "Performance", "Graphics"],
    emoji: "🎮"
  },
  {
    id: "rtx-neural-rendering",
    title: "Neural Rendering Just Changed Everything About Game Graphics",
    excerpt: "NVIDIA's latest neural rendering tech replaces traditional rasterization with AI-generated images — at higher quality and lower cost.",
    content: "For 30 years, game graphics have relied on rasterization: breaking scenes into triangles, processing them through a GPU pipeline, and rendering pixels. It's gotten incredibly sophisticated, but it's fundamentally a 1970s algorithm. NVIDIA just demonstrated something that might replace it entirely: neural rendering, where AI models generate images from sparse scene data.\n\nHere's how it works: traditional game engines render a low-quality preview of the scene, capturing geometry, depth, and lighting information. A neural network trained on millions of high-quality rendered images learns to 'upscale' this preview into a photorealistic final image in real-time. The network doesn't just do simple interpolation — it understands scene content, reconstructs hidden geometry, and applies sophisticated lighting and material effects. Running on RTX AI hardware, this happens fast enough for 60+ fps games.\n\nThe implications are staggering. You can render scenes at 1/4 native resolution, let the neural network reconstruct it to full resolution, and save massive compute. This means weaker hardware can run graphically demanding games. Or, keep hardware the same and redirect compute to improved physics, AI, and frame generation. NVIDIA's prototype showed a 4x performance improvement while maintaining visual quality.\n\nThe catch: these models need massive training data and GPU resources to develop. It's not yet available in consumer game engines. But expect integration into Unreal and Unity within 2-3 years. This could be the most significant shift in game rendering technology since shaders replaced fixed-function pipelines.",
    category: "gaming",
    readTime: "3 min read",
    date: "2026-03-30",
    tags: ["Game Graphics", "Ray Tracing", "Neural Networks", "Technology"],
    emoji: "✨"
  },
  {
    id: "esports-ai-coaches",
    title: "AI Coaches Are Better Than Humans at Teaching Esports Strategies",
    excerpt: "Machine learning models trained on millions of professional matches can now coach players better than experienced human coaches.",
    content: "Competitive esports relies on split-second decisions and deep strategic understanding. For years, human coaches analyzed VODs, gave feedback, and drilled strategies. Now, AI coaching systems trained on millions of professional League of Legends, CS2, and Valorant matches are outperforming human coaches at player improvement. The difference is scale and pattern recognition.\n\nA human coach can analyze maybe 100-200 hours of competitive matches per year. An AI system can analyze millions of matches, learning decision trees for situations that human minds never consciously recognize. When a professional player positions themselves on the map, an AI coach can instantly recognize thousands of similar historical situations and show which decisions led to winning outcomes. It's like learning from thousands of coaches simultaneously.\n\nThe most effective AI coaching systems don't just show statistics — they use temporal analysis and counterfactual reasoning. They show players what would have happened if they'd made different rotations, different item builds, different ult timing. This kind of analysis takes humans hours; AI computes it in seconds. Professional teams are now hiring AI coaching systems as supplements to human coaches, with measurable improvements in player performance and strategic depth.\n\nThis represents a broader trend: AI is becoming a force multiplier for human expertise. The best esports teams won't be those with the best single coach, but those who best integrate human intuition with AI analysis at scale. It's professionalization through data, and it's spreading from esports to traditional sports.",
    category: "gaming",
    readTime: "3 min read",
    date: "2026-03-26",
    tags: ["Esports", "AI", "Coaching", "Gaming"],
    emoji: "🏆"
  },

  // Science (2)
  {
    id: "mRNA-vaccines-expansion",
    title: "mRNA Vaccines Are About to Transform Medicine Forever",
    excerpt: "After COVID's success, researchers are applying mRNA technology to cancer, malaria, and RSV — with dramatic results.",
    content: "mRNA vaccines seemed like a promising but unproven technology until COVID-19 forced a global experiment. Moderna and Pfizer's vaccines proved the approach worked at massive scale. Now the biotech industry is applying the same principles to diseases that have resisted vaccine development for decades. The results are extraordinary.\n\nModerna's mRNA cancer vaccines, designed to teach immune systems to recognize specific tumor mutations, are in late-stage trials and showing survival improvements against some melanomas and colorectal cancers. Rather than generic cancer treatments, these vaccines are personalized — sequenced from each patient's tumor, teaching their own immune system to attack cancer cells. The customization previously seemed impractical; now, it's becoming routine manufacturing.\n\nMalaria, RSV, and influenza vaccines using mRNA technology are in trials and showing efficacy rates that rival or exceed traditional vaccine approaches. What's revolutionary: mRNA vaccines can be rapidly redesigned if pathogens evolve. Instead of 6-12 months to develop new flu shots, you could theoretically design new mRNA vaccines in weeks. Manufacturing scales elegantly — the same facilities can produce different vaccines.\n\nThe challenges are real: stability (mRNA degrades), cost (still expensive in developing countries), and skepticism from vaccine hesitancy. But the potential impact is enormous. Within a decade, mRNA could be a standard tool for treating personalized medicine at scale. We're witnessing the transition from mRNA as experimental to mRNA as foundational medical technology.",
    category: "science",
    readTime: "3 min read",
    date: "2026-03-29",
    tags: ["Medicine", "Vaccines", "Biotechnology", "Health"],
    emoji: "💉"
  },
  {
    id: "crispr-off-target-problem",
    title: "Scientists Finally Solved CRISPR's Biggest Problem",
    excerpt: "New CRISPR variants can edit DNA with 99.9% accuracy, virtually eliminating off-target mutations that have limited clinical applications.",
    content: "CRISPR gene editing promised to revolutionize medicine by precisely cutting and pasting DNA. But it had a critical flaw: off-target cutting. CRISPR's enzyme would sometimes cut DNA at unintended locations, potentially causing harmful mutations. This limited clinical applications — you can't use a therapy on humans if it might cause cancer or other diseases elsewhere in the genome. That limitation is finally disappearing.\n\nResearchers at UC Berkeley and the Broad Institute engineered new CRISPR variants with dramatically improved specificity. Using high-throughput screening against libraries of potential off-target sites, they identified protein mutations that reduced off-target cutting by 50-100 fold compared to standard CRISPR. The new variants are still efficient at on-target cutting but extraordinarily selective. In clinical trials, off-target effects are virtually undetectable.\n\nThis changes the risk-benefit calculation for CRISPR therapy. Previous versions required accepting small risks of unintended mutations as the cost of treatment. These new variants approach the precision level needed for widespread clinical use. Companies like CRISPR Therapeutics are now advancing therapies for sickle cell disease, beta-thalassemia, and potentially inherited blindness. In 5-10 years, CRISPR gene therapy could transition from experimental to standard medical practice for specific genetic diseases.\n\nThe broader implication: as CRISPR tools become safer, more diseases become treatable targets. Genetic medicine is moving from science fiction to clinical reality.",
    category: "science",
    readTime: "3 min read",
    date: "2026-03-23",
    tags: ["CRISPR", "Gene Editing", "Medicine", "Biotechnology"],
    emoji: "🧬"
  },

  // Security (2)
  {
    id: "zero-day-economics",
    title: "The Underground Economy of Zero-Days Is Getting Out of Control",
    excerpt: "Governments and private buyers are bidding up zero-day exploit prices to levels that fund sophisticated hacker operations.",
    content: "A zero-day vulnerability — an unpatched security flaw that vendors don't know about — is worth serious money. In 2026, the prices are eye-watering. Major intelligence agencies will pay $2-5 million for high-quality zero-days affecting widely-used software. Private companies are competing in the same markets. This economic dynamic is reshaping cybersecurity.\n\nThe Zerodium platform acts as a middleman, collecting zero-days from independent researchers and hackers, then reselling them to government and corporate buyers. A working Chrome zero-day might fetch $1 million. A Windows kernel exploit could be worth $2-3 million. For researchers with the skills to find these vulnerabilities, it's an attractive alternative to responsible disclosure (reporting vulnerabilities to vendors).\n\nThis creates perverse incentives. Why responsibly disclose a vulnerability if you can sell it for millions? The security community worries this incentivizes hoarding: hackers find exploits and sell them rather than disclosing them, meaning vulnerabilities persist in software longer. The NSA and other intelligence agencies justify zero-day purchases as necessary for national security, but the practice keeps important security patches from being released.\n\nSome researchers argue that higher bug bounties from companies like Google and Microsoft (now offering $1-3 million for some exploits) can compete with underground markets. But the fundamental economics remain: sophisticated hacker operations are well-funded by zero-day sales. Understanding this market is key to understanding modern cybersecurity threats.",
    category: "security",
    readTime: "3 min read",
    date: "2026-04-04",
    tags: ["Cybersecurity", "Zero-Day", "Exploits", "Economics"],
    emoji: "🔓"
  },
  {
    id: "passkey-adoption-tipping-point",
    title: "Passwords Are Finally Dying — And It's Actually Happening",
    excerpt: "Major platforms have crossed the threshold where passkeys (passwordless login) are the default, and passwords are becoming obsolete.",
    content: "For 30 years, security experts have said 'passwords are dying.' In 2026, it's actually true. Apple, Google, and Microsoft all made passkeys the default authentication method across their platforms. GitHub, Slack, and major banks now accept passkeys for primary account access. When the biggest platforms stop requiring passwords, password-based attacks stop working.\n\nPasskeys replace passwords with cryptographic key pairs stored on your device (phone, computer, security key). Instead of typing a password, you authenticate using your device's biometric (fingerprint, face recognition) or PIN. From a security perspective, it's vastly superior: no phishing (the server never knows your credential), no password reuse attacks, no dictionary brute-forcing. The credentials are cryptographically secure and practically impossible to steal remotely.\n\nThe transition hasn't been painless. Legacy systems, international users, and people with older devices still struggle. But the shift is clearly underway. Web standards (WebAuthn) are mature. Mobile platforms support it natively. IT departments are retraining on managing passkeys instead of passwords. In five years, password authentication will be relegated to legacy systems and niche use cases.\n\nThis represents a genuine security improvement in practice, not just theory. Phishing, credential stuffing, and brute-force attacks all become substantially harder when the entire internet moves to passkey-based authentication. It's one of the rare cases where the secure option is also more convenient.",
    category: "security",
    readTime: "3 min read",
    date: "2026-03-20",
    tags: ["Cybersecurity", "Authentication", "Passwords", "Technology"],
    emoji: "🔐"
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const id = searchParams.get("id");

  if (id) {
    const post = POSTS.find(p => p.id === id);
    return post
      ? NextResponse.json(post)
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filtered =
    category && category !== "all"
      ? POSTS.filter(p => p.category === category)
      : POSTS;

  return NextResponse.json(filtered);
}
