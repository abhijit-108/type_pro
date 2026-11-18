/**
 * Typing Boss - Passages & Online Text Fetcher
 * Includes offline curated passages for SSC, Banking, Literature, Tech,
 * and an online dynamic fetcher with automatic offline fallback.
 */

export const PASSAGE_CATEGORIES = {
  ssc: 'SSC CGL / CHSL Exam Passages',
  banking: 'Banking & Financial Editorials',
  general: 'General English & Literature',
  tech: 'Science & Technology',
  custom: 'Custom User Passage',
  online: 'Online Random Passage'
};

export const OFFLINE_PASSAGES = {
  ssc: [
    {
      id: 'ssc_1',
      title: 'SSC CGL Tier-II DEST: Indian Economy & Fiscal Management',
      category: 'ssc',
      targetKeystrokes: 1850,
      text: `The economic progress of a developing nation is closely linked to its fiscal policy and prudent public expenditure. In recent decades, India has undertaken comprehensive financial reforms aimed at enhancing revenue mobilization and rationalizing government spending. A primary instrument in this endeavor has been the introduction of the Goods and Services Tax, which replaced a complex web of cascading indirect taxes with a unified national framework. This structural reform broadened the tax base, curtailed interstate transit delays, and elevated compliance across diverse industrial sectors. Concurrently, the banking infrastructure underwent critical consolidation to resolve non-performing assets and bolster capital adequacy. Public sector banks were recapitalized and encouraged to adopt stringent risk assessment models. The rapid expansion of digital payment ecosystems, backed by the Unified Payments Interface, substantially reduced transactional frictions and fostered unprecedented financial inclusion among rural and semi-urban demographics. In parallel, fiscal deficit targets outlined by the Fiscal Responsibility and Budget Management Act continue to guide sustainable debt trajectories. Transparent public procurement platforms such as the Government e-Marketplace have eradicated discretionary practices and optimized budgetary outlays. Sustained investments in national highways, railways, and renewable power grids generate substantial multiplier effects, generating employment and stimulating industrial productivity. The calibrated harmonization of monetary tools by the central bank alongside proactive fiscal interventions provides a stable foundation for equitable economic expansion and long-term monetary stability.`
    },
    {
      id: 'ssc_2',
      title: 'SSC CHSL Typing Test: Judicial System & Democratic Governance',
      category: 'ssc',
      targetKeystrokes: 1780,
      text: `The Constitution of India guarantees an independent and integrated judicial framework designed to safeguard fundamental rights and enforce the rule of law. The Supreme Court stands at the apex of this constitutional hierarchy, vested with extensive original, appellate, and advisory jurisdictions. High Courts functioning in respective states oversee subordinate courts and exercise supervisory jurisdiction under Article 227. In modern times, the judiciary faces unprecedented caseloads resulting in substantial backlog and procedural delays. To address this persistent challenge, various technological interventions known as e-Courts have been introduced to streamline case management, facilitate virtual hearings, and provide litigants with real-time access to judgments and cause lists. Alternative dispute resolution mechanisms, including Lok Adalats, mediation centers, and institutional arbitration, play an indispensable role in reducing adversarial friction and expediting settlements outside formal courtrooms. Legal aid authorities established under statutory mandates ensure that economic disadvantages do not preclude citizens from seeking justice. The doctrine of basic structure enunciated by landmark constitutional verdicts maintains equilibrium among the legislature, executive, and judiciary. A robust legal order inspires public confidence, guarantees administrative accountability, and protects individual liberties against arbitrary state action.`
    },
    {
      id: 'ssc_3',
      title: 'SSC CGL / Steno: Environmental Sustainability and Urban Planning',
      category: 'ssc',
      targetKeystrokes: 1820,
      text: `Rapid urbanization across developing economies has exerted tremendous pressure on municipal infrastructure, ecological habitats, and natural resources. Unregulated urban sprawl often precipitates severe environmental degradation, manifesting in degraded air quality, depletion of groundwater tables, and inadequate solid waste processing. To mitigate these hazards, urban planners advocate for smart city paradigms rooted in sustainable transit systems, energy-efficient architecture, and decentralized waste segregation. Mass rapid transit networks, particularly metro rails and electric feeder bus fleets, play a pivotal role in decongesting arterial roads and reducing carbon emissions. Furthermore, the revival of municipal water bodies and mandatory rainwater harvesting in commercial establishments are essential interventions to restore urban hydrological equilibrium. Civic governance must prioritize circular economy principles by promoting industrial recycling, biological composting of municipal organic waste, and scientific capping of legacy landfills. Public participation remains the cornerstone of any transformative civic initiative. Enlightened citizens actively engaged in energy conservation and green cover enhancement help build resilient cities capable of withstanding climate fluctuations and ensuring elevated standards of public health for future generations.`
    }
  ],

  banking: [
    {
      id: 'bank_1',
      title: 'Banking Exam: Reserve Bank Monetary Policy & Inflation Control',
      category: 'banking',
      targetKeystrokes: 1650,
      text: `The monetary policy framework adopted by modern central banks revolves around the dual mandate of maintaining price stability while fostering inclusive economic growth. Inflation targeting requires precise adjustments of benchmark policy rates, notably the repo rate and the reverse repo rate, to calibrate liquidity conditions within the financial architecture. When inflationary impulses threaten macroeconomic equilibrium, the central bank initiates rate hikes to suppress excessive credit expansion and temper aggregate demand. Conversely, during periods of cyclical downturns, monetary easing lowers borrowing costs for corporate entities and retail borrowers, thereby incentivizing capital investments and consumer spending. In addition to conventional interest rate adjustments, regulatory authorities utilize cash reserve ratios and statutory liquidity ratios to insulate commercial banks from systemic liquidity crunches. The maintenance of high asset quality remains paramount, necessitating timely provisioning against bad loans and robust compliance with international Basel norms. Prudent oversight of foreign exchange reserves shields domestic currency from volatile speculative swings.`
    },
    {
      id: 'bank_2',
      title: 'IBPS Clerk / PO: Digital Banking Transformations and Cybersecurity',
      category: 'banking',
      targetKeystrokes: 1700,
      text: `The proliferation of digital banking channels has transformed the operational landscape of commercial financial institutions worldwide. Brick-and-mortar branch transactions have steadily given way to mobile applications, automated teller machines, and seamless internet portals that operate round the clock. Customers now execute fund transfers, apply for retail credit, open term deposits, and manage investment portfolios within seconds. However, this profound technological evolution has heightened exposure to sophisticated cyber threats, phishing scams, and unauthorized data breaches. Banking regulators enforce multi-factor authentication, end-to-end cryptographic encryption, and continuous network vulnerability assessments to protect customer assets. Simultaneously, artificial intelligence algorithms analyze millions of daily transactional patterns in real time to detect fraudulent discrepancies and prevent money laundering activities. Cultivating cyber hygiene among account holders through regular awareness advisories is crucial in thwarting unauthorized financial access and preserving digital consumer trust.`
    }
  ],

  general: [
    {
      id: 'gen_1',
      title: 'The Art of Deliberate Practice and Focus',
      category: 'general',
      targetKeystrokes: 1520,
      text: `Mastery over any complex craft demands sustained discipline, deliberate practice, and an unrelenting commitment to precision. When an individual seeks to enhance cognitive or physical speed, mere repetitive motion yields diminishing returns. True progress occurs at the threshold of discomfort, where conscious attention dissects errors, analyzes muscle coordination, and systematically corrects minor deficiencies. In the digital era, cognitive distractions abound, fragmenting our capacity for deep, uninterrupted contemplation. By establishing quiet routines, eliminating visual noise, and measuring performance through objective metrics, one cultivates mental endurance. Whether mastering a musical instrument, composing prose, or training fingers to navigate a keyboard effortlessly, patience remains the ultimate catalyst of human excellence.`
    },
    {
      id: 'gen_2',
      title: 'The Philosophy of Scientific Inquiry and Discovery',
      category: 'general',
      targetKeystrokes: 1610,
      text: `The hallmark of scientific progress is not the unquestioned accumulation of dogma, but the persistent interrogation of established assumptions. Every major breakthrough in the history of science began with a keen observation that contradicted prevailing consensus. From the celestial geometries of astronomy to the subatomic paradoxes of quantum mechanics, empirical evidence serves as the supreme arbiter of truth. Scientists formulate rigorous hypotheses, subject them to verifiable experiments, and embrace peer scrutiny with intellectual humility. When experimental results defy expectations, theories must evolve or be abandoned. It is this systematic, self-correcting quest for understanding that fuels human innovation and illuminates the mysteries of our natural world.`
    }
  ],

  tech: [
    {
      id: 'tech_1',
      title: 'Artificial Intelligence, Neural Networks and Computational Limits',
      category: 'tech',
      targetKeystrokes: 1580,
      text: `Modern artificial intelligence models rely on deep neural networks inspired by biological synaptic architectures. By processing billions of training tokens across high-density computing clusters, these algorithms discern intricate statistical relationships embedded within human language and code. Specialized tensor processing units and graphics accelerators perform billions of matrix multiplications per second, driving breakthroughs in natural language comprehension, autonomous computer vision, and protein folding predictions. However, massive scale introduces formidable challenges related to computational latency, energy consumption, and model interpretability. Engineers continuously investigate quantization techniques, knowledge distillation, and sparse activation paradigms to deliver high-performance inferences on localized hardware.`
    },
    {
      id: 'tech_2',
      title: 'Cloud Distributed Systems and Fault-Tolerant Architectures',
      category: 'tech',
      targetKeystrokes: 1640,
      text: `Distributed computing environments are designed to deliver resilient, highly available services across geographically dispersed data centers. Modern cloud platforms leverage microservices patterns, container orchestration, and asynchronous event streams to handle unpredictable traffic spikes without single points of failure. The fundamental trade-offs articulated by the CAP theorem require software architects to balance data consistency, service availability, and network partition tolerance according to specific application demands. Automated health checks, circuit breakers, and self-healing infrastructure clusters ensure that failing hardware nodes are seamlessly isolated without disrupting the end-user experience.`
    }
  ]
};

/**
 * Fetches a random passage from free, public APIs with offline fallback.
 * Uses Quotable or Bacon Ipsum or DummyJSON text.
 */
export async function fetchOnlinePassage() {
  const sources = [
    async () => {
      // Bacon Ipsum / hipster text generator (returns multiple sentences)
      const res = await fetch('https://baconipsum.com/api/?type=meat-and-filler&paras=3&format=text', {
        headers: { Accept: 'text/plain' }
      });
      if (!res.ok) throw new Error('Bacon API failed');
      const text = await res.text();
      return {
        title: 'Online Random Passage: Culinary & Global Excerpt',
        category: 'online',
        text: cleanFetchedText(text)
      };
    },
    async () => {
      // DummyJSON quotes aggregator
      const res = await fetch('https://dummyjson.com/quotes?limit=10');
      if (!res.ok) throw new Error('DummyJSON quotes failed');
      const data = await res.json();
      const combined = data.quotes.map(q => `${q.quote} (${q.author})`).join(' ');
      return {
        title: 'Online Random Passage: Great Minds & Philosophy',
        category: 'online',
        text: cleanFetchedText(combined)
      };
    },
    async () => {
      // Free quotes API / quotable mirror
      const res = await fetch('https://api.quotable.io/quotes/random?limit=6');
      if (!res.ok) throw new Error('Quotable API failed');
      const data = await res.json();
      const text = data.map(item => item.content).join(' ');
      return {
        title: 'Online Random Passage: Wisdom & Reflections',
        category: 'online',
        text: cleanFetchedText(text)
      };
    }
  ];

  for (const fetcher of sources) {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 4000)
      );
      const result = await Promise.race([fetcher(), timeoutPromise]);
      if (result && result.text && result.text.length > 150) {
        return result;
      }
    } catch (err) {
      console.warn('Online source error, trying next source...', err.message);
    }
  }

  // Fallback to random offline passage
  return getRandomOfflinePassage();
}

/**
 * Clean and normalize text fetched from web sources
 */
function cleanFetchedText(raw) {
  return raw
    .replace(/\r\n/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[^\x20-\x7E]/g, '') // remove weird unicode that breaks standard ASCII typing exams
    .trim();
}

/**
 * Returns a random offline passage from any or specified category
 */
export function getRandomOfflinePassage(category = null) {
  let pool = [];
  if (category && OFFLINE_PASSAGES[category]) {
    pool = OFFLINE_PASSAGES[category];
  } else {
    // combine all categories
    Object.values(OFFLINE_PASSAGES).forEach(list => {
      pool = pool.concat(list);
    });
  }
  const index = Math.floor(Math.random() * pool.length);
  return { ...pool[index] };
}
