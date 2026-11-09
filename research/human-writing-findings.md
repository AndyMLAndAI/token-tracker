# Empirical Research Findings: Distinguishing Authentic Human Prose from Machine-Generated Text

> **Scope & Purpose:** Comprehensive empirical, linguistic, and stylometric research synthesized across five parallel investigations (AI-isms and statistical tells, general human prose stylistics, internet/platform registers, academic discourse, and everyday workplace communications). Designed to serve as the evidence base and foundational specification for a universal "Sound Human, Not AI" writing skill.
>
> **Target Repository:** `token-tracker`  
> **Output Artifact:** `research/human-writing-findings.md`

---

# 1. AI-Tells Master List (Lexicon, Phrasing, Structural Patterns, & Model Dialects)

Large Language Models (LLMs) trained via autoregressive next-token prediction and aligned with Reinforcement Learning from Human Feedback (RLHF) and Direct Preference Optimization (DPO) systematically deviate from natural human prose. These deviations stem from **mode collapse** around high-reward politeness and competence tokens, a regression toward a sanitized stylistic median, and structural optimization for clarity and completeness over organic prosody.

---

### 1.1 The AI Lexicon of Tells (Stock & Overrepresented Vocabulary)

Corpus analyses of millions of post-2022 documents (e.g., Kobak et al., 2025; COLING, 2025) demonstrate that LLMs over-index on a specific set of Latinate adjectives, process verbs, and spatial metaphors. These words are rarely used by humans with such uniform density.

| Grammatical Class | High-Probability AI Marker Tokens | Authentic Human Alternates / Remedies |
| :--- | :--- | :--- |
| **Process & Action Verbs** | *delve, foster, navigate, harness, leverage, elevate, unlock, embrace, showcase, illuminate, unravel, encapsulate, demystify, spearhead, revolutionize, bolster, transcend, underscore, empower, cultivate, orchestrate* | *examine, look at, dig into, use, run, build, cut, show, explain, test, prove, lead, fix, spark* |
| **Metaphorical & Structural Nouns** | *tapestry, testament, beacon, realm, landscape, paradigm, nexus, interplay, labyrinth, synergy, cornerstone, panoply, linchpin, echelon, vanguard, watershed, conduit, bedrock, symphony, microcosm* | *mix, record, history, mess, sign, field, area, system, link, core, base, network, turning point* |
| **Prestige & Praise Adjectives** | *multifaceted, paramount, pivotal, intricate, meticulous, profound, vibrant, robust, quintessential, nuanced, transformative, commendable, indomitable, pervasive, indelible, bespoke, enduring* | *complex, hard, messy, key, careful, deep, strong, typical, subtle, big, solid, lasting, custom* |
| **Connective & Sentential Adverbs** | *furthermore, moreover, additionally, notably, importantly, crucially, fundamentally, seamlessly, inherently, indelibly, undeniably, conversely, tangibly, holistically* | *also, besides, then, but, so, clearly, [or cut transition entirely]* |

---

### 1.2 Formulaic Scaffolds and Rhetorical Idioms

LLMs deploy stereotypical rhetorical idioms that serve as zero-information conversational padding:

1. **Throat-Clearing Temporal & Spatial Openers:**
   * *"In today's fast-paced, rapidly evolving digital world / landscape..."*
   * *"In an increasingly interconnected global society..."*
   * *"When it comes to [Topic], it is important to remember that..."*
   * *"To truly understand the implications of [X], one must first explore..."*
2. **The "Not Only X, but Also Y" / "Not Just X, but Y" Construction:**
   * *"It is not just a tool; it is a testament to human ingenuity."*
   * *"This approach is not only cost-effective, but it also fosters sustainable long-term growth."*
   * *Diagnostic:* AI corpora exhibit 3x to 6x higher density of antithetical parallel correlatives than human corpora.
3. **The Concessive Pivot / Double-Edged Trope:**
   * *"[Topic] is a double-edged sword..."*
   * *"While [X] offers undeniable advantages, it is not without its challenges..."*
   * *"Navigating the complexities of [Topic] requires a multifaceted and nuanced approach..."*
4. **The Exhaustive Spectrum Trope:**
   * *"From [simple entry point] to [advanced enterprise], and everything in between..."*
   * *"Whether you are a novice student or a seasoned veteran..."*
5. **Moralizing, Horizon-Gazing Conclusions:**
   * *"In conclusion, [X] is poised to revolutionize the landscape of [Y]..."*
   * *"As we look to the horizon, one thing remains abundantly clear: only time will tell, but the journey has only just begun."*
   * *"Ultimately, by striking a delicate balance between [A] and [B], we can unlock a more vibrant future."*

---

### 1.3 Structural and Syntactic AI Tells

```
+----------------------------------------------------------------------------------------------------+
|                                    SYNTACTIC & MACRO-STRUCTURAL TELLS                              |
+---+----------------------------+-------------------------------------------------------------------+
| # | Pattern Name               | Structural Mechanics                                              |
+---+----------------------------+-------------------------------------------------------------------+
| 1 | The Rule of Three          | Algorithmic obsession with parallel tricolons:                    |
|   | (Tricolon Fixation)        | - "intuitive, reliable, and secure"                               |
|   |                            | - "streamline workflows, enhance collaboration, and drive growth" |
|   |                            | - "creativity, resilience, and discipline"                        |
+---+----------------------------+-------------------------------------------------------------------+
| 2 | Em-Dash (—) Proliferation  | Claude and GPT-4 use unspaced/spaced em-dashes 5x–15x more often  |
|   |                            | than human writers to tack on qualifications or dramatic codas:   |
|   |                            | "The framework—while undeniably scalable—introduces friction."    |
+---+----------------------------+-------------------------------------------------------------------+
| 3 | Paragraph Geometry &       | Symmetrical paragraph masses: 48–68 words per paragraph across    |
|   | Metronomic Symmetry        | an entire document (3–4 sentences per paragraph, zero variance).  |
+---+----------------------------+-------------------------------------------------------------------+
| 4 | Hedge-Then-Restate         | Claim -> Concessive Clause (However / While) -> Restatement with  |
|   | (Epistemic Timidity)       | qualifier: avoids taking falsifiable, definitive positions.       |
+---+----------------------------+-------------------------------------------------------------------+
| 5 | Summary Restates Everything| The final paragraph systematically regurgitates every point made  |
|   |                            | above with zero new intellectual momentum or provocation.         |
+---+----------------------------+-------------------------------------------------------------------+
| 6 | Bold Lead-In Colon Spam    | Compulsively formatting bullet points as:                         |
|   |                            | - **Key Strategy:** [1 sentence explanation]                      |
|   |                            | - **Action Item:** [1 sentence explanation]                       |
+---+----------------------------+-------------------------------------------------------------------+
```

---

### 1.4 Empirical Detection Metrics & Statistical Markers

| Information-Theoretic Metric | Synthetic Machine Text (Default LLM) | Authentic Human Text | Diagnostic Discriminator |
| :--- | :--- | :--- | :--- |
| **Sentence Length Standard Deviation ($\sigma$)** | **$2.8\text{ – }6.5\text{ words}$** (Compressed variance) | **$9.5\text{ – }18.5\text{ words}$** (Bursty, lognormal) | $\sigma < 6.0$ indicates strong likelihood of machine generation. |
| **Coefficient of Variation ($CV = \sigma / \mu$)** | **$0.20\text{ – }0.40$** (Flat cadence) | **$0.65\text{ – }0.95$** (Dynamic rhythm) | Humans naturally alternate 3-word punches with 45-word clauses. |
| **Perplexity (PPL)** | Monotonically low, smooth across sequence | Jagged; marked by local surprisal spikes | Machine text avoids unusual word combinations; humans generate them. |
| **GLTR Token Distribution (Top-10)** | **$>82\%\text{ – }95\%$** in Top-10 ($k \le 10$) | **$50\%\text{ – }70\%$** in Top-10 ($k \le 10$) | Machine text rarely dips into yellow/red/purple predictive bins. |
| **Uniform Information Density (UID)** | Strictly smooth, near-optimal distribution | Violates UID via deliberate emotional/intellectual spikes | Humans introduce shocks, slang, and non-sequiturs. |

#### Key Published Studies Cited:
* **Kobak et al. (Science Advances, 2025 / arXiv:2406.07016):** Documented 25x–30x spikes in words like *delve* across 14M+ PubMed abstracts post-2022, proving over 13% of all published biomedical abstracts in 2024 bear direct statistical marks of LLM processing.
* **Liang, Zou, et al. (ICML 2024):** Analyzed top-tier AI peer reviews (NeurIPS, ICLR). Proved *meticulous* exploded by **34.7x**, *commendable* by **12x**, with 6.5%–16.9% of peer reviews substantially machine-written.
* **Liang et al. (Patterns / Cell Press, 2023):** Demonstrated that zero-shot perplexity detectors misclassify **61.2% of non-native human essays as AI-generated** because non-native speakers operate with lower lexical entropy.
* **Mitchell et al. (DetectGPT, ICML 2023) & Hans et al. (Binoculars, ICML 2024):** Proved synthetic text sits in local negative log-probability curvature; Binoculars evaluates the ratio between observer perplexity and cross-perplexity to detect LLM generation without individual classifier fragility.

---

### 1.5 Model-Family Stylistic Typology

Different model architectures exhibit distinct "house styles" based on their RLHF guidelines, system prompt guardrails, and fine-tuning datasets:

* **Anthropic Claude (3 / 3.5 / Sonnet / Opus):**
  * *Voice:* Intellectual, polite, literary, cautious.
  * *Tells:* Heavy em-dash (`—`) frequency (the most persistent Claude punctuation mark); high rate of self-reflexive hedges (*"It's worth noting that..."*, *"That said,"*, *"To be fair,"*, *"A useful way to think about this"*); strong aversion to absolute claims.
* **OpenAI GPT-4 / GPT-4o:**
  * *Voice:* Upbeat, conversational, corporate-affirmative, sycophantic.
  * *Tells:* Cheerful opening confirmations (*"Certainly! Here is..."*, *"Great question!"*); heavy use of organizing metaphors (*"landscape," "journey," "tapestry"*); moralizing summary paragraphs that end with exclamation marks or motivational platitudes (*"elevate your workflows to new heights!"*).
* **OpenAI o1 / o3 (Reasoning Series):**
  * *Voice:* Analytical, clinical, dense, declarative.
  * *Tells:* Strips out enthusiastic conversational openers; numbers logical deductions; relies on explicit boundary conditions (*"Under condition X...", "Case 1 / Case 2"*); replaces polite emotional hedging with formal logical disclaimers.
* **Google Gemini (1.5 Pro / Flash):**
  * *Voice:* Journalistic, scannable, executive summary.
  * *Tells:* Compulsive bold lead-in tags on every bullet point (`**Key Factor:** ...`, `**Takeaway:** ...`); very short paragraphs (1–2 sentences); conversational lead-ins (*"Here's the deal:"*, *"Let's break it down:"*).
* **Meta Llama (Llama 3 / 3.1):**
  * *Voice:* Direct, informal, but heavily influenced by synthetic training data.
  * *Tells:* Inherits GPT-4 lexical habits (*crucial, vital, pivotal, delve*); prone to abrupt transitions between technical jargon and conversational casualness.

---

# 2. Human Baseline Traits (General Prose)

Authentic human writing in essays, narrative non-fiction, journalism, and personal commentary is the output of an embodied human consciousness thinking through a problem in real time. It is defined not by statistical equilibrium, but by **intentional irregularity, acoustic rhythm, and cognitive friction**.

---

### 2.1 Acoustic Prosody and the Gary Provost Burstiness Law

Human authors compose for the inner ear. Human prose alternates between rapid-fire monosyllabic assertions and sprawling, multi-clause hypotactic journeys:

> *"This sentence has five words. Here are five more words. Five-word sentences are fine. But several together become monotonous. Listen to what is happening. The writing is getting boring. The sound of it drones. It's like a stuck record. The ear demands some variety. Now listen. I vary the sentence length, and I create music. Music. The writing sings. It has a pleasant rhythm, a lilt, a harmony. I use short sentences. And I use sentences of medium length. And sometimes, when I am certain the reader is rested, I will engage him with a sentence of considerable length, a sentence that burns with energy and builds with all the impetus of a crescendo..."*  
> — **Gary Provost, *100 Ways to Improve Your Writing* (1985)**

* **Lognormal Distribution:** In skilled human writing, sentence lengths follow a right-skewed lognormal distribution with an extended tail (1 to 85+ words), yielding a high coefficient of variation ($CV > 0.65$).
* **Rhetorical Cadence:** 
  1. *The Staccato Strike (1–6 words):* Delivers shock, clears the palate, renders definitive judgment (*"None of it worked."*).
  2. *The Workhorse (12–22 words):* Conveys factual narrative ground.
  3. *The Clausal Sweep (35–70+ words):* Builds emotional crescendo or complex theoretical synthesis.

---

### 2.2 Syntactic Idiosyncrasies of Human Thought

Human writing contains structural features that prescriptive grammar books discourage, but authentic stylists use constantly:

1. **Emphatic Sentence Fragments:**
   * *"Not a chance."*
   * *"Silence. Then the engine coughed once and died."*
   * *Contrast:* AI almost invariably expands fragments into complete grammatical clauses (*"This was entirely out of the question"*), destroying immediacy.
2. **Dynamic Clausal Architecture (Parataxis vs. Hypotaxis):**
   * *Paratactic Rush (Polysyndeton):* Chaining coordinating conjunctions without subordinate hierarchies to mimic breathless panic or raw observation (Hemingway, Didion, McCarthy): *"He walked out onto the tarmac and the heat came up through his shoes and he smelled the kerosene and he knew nobody was coming back."*
   * *Hypotactic Suspension:* Constructing an elaborate grammatical scaffold that withholds the main clause until the end (Baldwin, Woolf): *"Because we were young, and because the city in those postwar summers seemed made of sunlit limestone and exhaust fumes... we believed we were exempt."*
3. **Epanorthosis (Mid-Thought Self-Correction):**
   * Natural thinkers refine their ideas in real time, leaving the scaffolding visible:
   * *"She was angry—or rather, not angry so much as utterly depleted by the predictability of it."*
   * *"We arrived at noon. Well, closer to twelve-thirty, once Frank found his keys."*
4. **Parenthetical Asides & Polyphonic Irony:**
   * Using dashes or parentheses to puncture pomposity or introduce self-doubt:
   * *"The committee’s report—which cost forty thousand dollars and six months of bureaucratic bickering—concluded that people prefer clean water to toxic sludge."*

---

### 2.3 Imperfect but Intentional Macro-Structure

* **Asymmetric Paragraph Weight (The Accordion):** Humans do not write uniform 4-sentence paragraphs. An authentic essay will run a dense 12-sentence historical narrative, slam down an isolated one-line paragraph (*"It failed."*), and follow with a medium 3-sentence personal reflection.
* **Non-Parallel Cataloging (Zeugma & Syllepsis):** Humans break rigid grammatical parallelism in lists to juxtapose the mundane with the profound:
  * *Human:* *"In his briefcase he carried a cracked leather Bible, two stale blueberry muffins, three years of accumulated shame, and an unpaid parking ticket from Newark."*
  * *AI:* *"In his briefcase he carried religious texts, breakfast items, emotional burdens, and municipal citations."*
* **Associative Transitions Over Mechanical Signposts:** Humans link ideas through sonic echoes, concrete objects, or unhedged chronological leaps (*"Three weeks later, the phone rang."*) rather than formulaic discourse markers (*"Moreover"*, *"Furthermore"*).

---

### 2.4 Voice Markers and Diction Friction

* **Diction Friction (Register Clashing):** Master human prose collides high-Latinate intellectual vocabulary with coarse, earthy slang (e.g., Hitchens, Baldwin, Didion):
  * *"The administration’s epistemological certainty was, to put it plainly, complete and utter bullshit."*
* **Contextual Nonchalance (The Unexplained Reference):** Humans assume a shared cultural world. They mention the *1982 Volvo 240*, the *smell of damp basement floorboards in Duluth*, or *Aunt Clara’s brooch* without stopping to write an explanatory relative clause. AI suffers from chronic explanatory anxiety and pauses to explain every allusion.
* **Sensory Granularity:** 
  * *AI Platitude:* *"The local diner had a welcoming atmosphere where patrons enjoyed comforting meals."*
  * *Human Texture:* *"The booths smelled of burnt lard and ancient vinyl patched with silver duct tape. Dot slammed down a chipped mug of coffee that tasted like water boiled in an iron pipe."*

---

# 3. Online-Register Traits by Platform

Digital communication is not degraded formal English; as linguist Gretchen McCulloch (*Because Internet*, 2019) notes, it is an emergent sociolinguistic system governed by **orthographic prosody**—the repurposing of typography, line breaks, casing, and punctuation to represent vocal tone, pacing, facial expression, and social status.

---

### 3.1 The Informal Digital Mechanics

* **Minimalist Lowercase Initiation:** Starting messages or comments in lowercase (`yeah idk about that`) signals conversational ease, casual intimacy, or deadpan delivery. Automated capitalization often feels stiff or corporate.
* **The "Hostile" Terminal Period (Klin et al., 2016, 2020):** In synchronous or semi-synchronous digital communication, sending a message or pressing Enter already establishes terminality. Adding an explicit period to a short message (*"Sure."*, *"Fine."*, *"Thanks."*) is perceived as aggressive, cold, or passive-aggressive.
* **Pragmatic Abbreviations as Epistemic Modals:**
  * `ngl` ("not gonna lie"): Pre-empts pushback; signals personal candor or vulnerability.
  * `tbh` ("to be honest"): Softens critique; marks personal feeling over objective decree.
  * `imo / imho`: Status-leveling hedge; invites dialogue without provoking confrontation.
  * `afaik / iirc`: Epistemic liability waiver; protects reputation against online nitpickers.
* **Typographical Inflection:**
  * ALL CAPS: Prosodic shouting, hysteria, or intense shared joy (`I AM SCREAMING`).
  * `sPoNgEbOb cAsE`: Direct phonological transcription of sing-song, childish mockery.
  * Strikethrough (`~~text~~`): Uttering a socially risky truth while performatively retracting it.
  * Repeated letters (`nooooo`, `yesssss`): Transcribing phonetic elongation for emphasis.

---

### 3.2 Platform-Specific Ethno-Linguistic Profiles

#### 1. Reddit: The Curated Meritocracy
* **Formatting:** Markdown mastery. Blockquotes (`> quote`) used for point-by-point dissection. Italics for spoken stress (`I *told* you that would happen`).
* **Tropes & Caveats:** `TL;DR` at head or foot. `Edit: formatting` or `Edit 2: RIP my inbox` (mandatory epistemic tracking). Sarcasm tag `/s` (though resisted by dry humor purists).
* **Authority Signaling:** `"Source: am a civil engineer and this makes me want to cry."` Reluctant agreement: `"Take my upvote and get out."`

#### 2. Twitter / X: The High-Cadence Arena
* **Line Break Stanzas:** Thoughts broken across double line breaks to establish comedic timing or dramatic pause:
  ```text
  walked into the kitchen for a glass of water.
  ended up reorganizing the pantry for three hours.
  i am not a serious person.
  ```
* **Thread Mechanics:** Explicit numbering (`1/n`, `1/12`, or `🧵`).
* **Meme Templates:** Phrasal templates (`Nobody:`, `it's giving...`, `let him cook`, `tell me X without telling me X`). The "ratio" as communal execution.

#### 3. Hacker News & Technical Forums: The Hyper-Rational Skeptics
* **Discourse Style:** High-density technical shorthand (RFCs, $O(n)$ complexity, POSIX). Extreme skepticism of marketing buzzwords, pitch decks, and corporate enthusiasm.
* **The "Dropbox Critique" Archetype:** Dismissing multi-million dollar products with trivial technical workarounds (*"You could easily build this with FTP and curlftpfs"*).
* **Experience Claims:** Answering arguments with battle scars (*"In my 20 years running Postgres clusters..."*). Faux-polite, dry critique adhering strictly to civility guidelines while eviscerating technical flaws.

#### 4. LinkedIn: The Algorithmic Panopticon ("Broetry" vs. Reality)
* **The AI / "Broetry" Epidemic:** 1-sentence paragraphs designed to trigger the "...see more" click; faux-vulnerability fables; emojis pinned to bullets (🚀, 💡, 📈); closing engagement traps (*"Agree?"*, *"Thoughts?"*); stock corporate openers (*"I am humbled and thrilled to announce..."*).
* **Authentic Technical Counter-Register:** Plain-text diffs, brutal infrastructure post-mortems (*"We dropped our production DB today. Here's why our replication failed."*), cynical humor roasting corporate jargon.

---

### 3.3 Why AI Fails in Online Registers (The Uncanny Valley)

```
Human Online Post:  [Fragment] -> [Slang / Typo] -> [Hyper-specific Anecdote] -> [Deadpan Punchline]
                         (High Perplexity, Irregular Burstiness, Emotional Stakes, Subtext)

AI Impersonation:   "Certainly! Ngl, imo this is a truly fascinating and intricate topic! 🚀..."
                         (Low Perplexity, Metronomic Rhythm, Forced Slang, Over-Explained Irony)
```

1. **Death of Subtext & Over-Explaining the Joke:** Online humor relies on *enthymeme*—leaving the premise or punchline unsaid because the audience shares context. AI cannot bear unresolved ambiguity; it explains *why* the joke is funny, killing it.
2. **Toxic Positivity & Sycophancy:** AI defaults to enthusiastic, polite cheerleading (*"Certainly! That is an awesome point!"*). Real humans online are sarcastic, skeptical, terse, or indifferent.
3. **Rigid Grammatical Prescriptivism:** AI cannot bring itself to omit a terminal period, skip capitalization, or leave a natural typo in place. It looks like a corporate executive wearing a backward cap.

---

# 4. Academic-Register Traits (Human vs. AI)

Authentic human academic prose is characterized by **load-bearing operationalization, epistemological hedging, argumentative tension, and dialectical friction with sources**. AI academic prose simulates scholarship through **decorative Latinate buzzwords, toothless literature summaries, and forced neutrality**.

---

### 4.1 Epistemological Hedging vs. Superficial AI Hedging

In academic writing, **hedging** (Hyland, 1998, 2005) is an epistemological tool to restrict claims to the exact boundaries of the data, methodology, and sample.

* **Authentic Human Hedging:** Specifies exact statistical boundaries, measurement instruments, confounding variables, and sample limitations:
  > *"Although our hazard ratio indicates a 14% risk reduction (HR = 0.86, 95% CI [0.75, 0.98]), this protective association attenuated after adjusting for baseline socioeconomic status. Because exposure was assessed via self-administered questionnaires prone to recall bias, and our cohort was restricted to postmenopausal individuals of Northern European descent, these findings cannot be generalized to broader demographic strata or interpreted as evidence of direct causality."*
* **AI Superficial Hedging:** Generic disclaimers that minimize liability without empirical content:
  > *"It is crucial to consider that while these findings are promising, several limitations must be acknowledged. Dietary factors are multifaceted and influenced by numerous variables. Therefore, caution is warranted when interpreting these results across diverse contexts."*

---

### 4.2 Citation Friction vs. Neutral Literature Surveys

* **Human Literature Engagement (Swales' CARS Model Move 2):** Human scholars cite literature to dispute methodologies, expose omitted variables, identify conceptual flaws, and construct intellectual lineages:
  > *"While Mercer and Klein (2018) assert that institutional deregulation drove capital flight, their fixed-effects panel fails to control for simultaneous currency shocks. By relying on aggregate FDI flows rather than sector-specific disinvestments, their specifications conflate speculative liquidity shifts with physical divestment."*
* **AI Literature Flattening:** Treats opposing theoretical paradigms as harmonious co-contributors to a grand consensus:
  > *"Mercer and Klein (2018) highlight pivotal trends in global markets. On the other hand, Stiglitz (2020) emphasizes macroeconomic stability. Together, these studies underscore the complex tapestry of economic forces governing capital dynamics."*

---

### 4.3 Load-Bearing Jargon vs. Decorative Buzzwords

| Metric | Authentic Human Jargon | AI-Generated Academic Buzzwords |
| :--- | :--- | :--- |
| **Epistemic Function** | Operational, mathematical, diagnostic, falsifiable. | Rhetorical posturing, prestige signaling. |
| **Typical Tokens** | *Heteroskedasticity-consistent standard errors, double-blind block randomization, log2 fold-change > 1.5, FDR < 0.05.* | *Transformative paradigm shift, multifaceted holistic framework, intricate interplay of pivotal factors, fostering synergy.* |
| **Semantic Substitutability**| Cannot be replaced without destroying the methodology or theoretical model. | Can be replaced with generic adjectives (*important*, *complex*) with zero loss of meaning. |

---

### 4.4 Methodological Messiness vs. Frictionless AI Smoothing

Real research is plagued by failed replications, instrument noise, recalcitrant outliers, and awkward contradictory data:
* **Human Friction:** Acknowledges the mess: *"Surprisingly, while compound 4b exhibited nanomolar binding in vitro ($IC_{50} = 12\text{ nM}$), it failed to induce apoptotic arrest in cellular assays up to $10\ \mu\text{M}$. Mass spec was inconclusive due to high background noise. We cannot claim therapeutic viability for this scaffold."*
* **AI Frictionless Smoothing:** Glosses over failures and spins bad data into generic optimism: *"The results demonstrate promising binding affinity. Although cellular assays revealed variable responses, these observations underscore the dynamic nature of cellular pharmacodynamics, offering exciting opportunities for future optimization."*

---

### 4.5 Empirical Studies on AI Academic Contamination

* **Jiang & Hyland (2025, *English for Specific Purposes*):** Proved ChatGPT severely suppresses **interactional metadiscourse** (attitude markers, engagement devices, personal authorial stance) while grossly overusing **interactive metadiscourse** (overt transitions, rigid frame markers) to construct a hollow organizational veneer.
* **Casal & Kessler (2023, *Research Ethics*):** Demonstrated that expert journal editors and applied linguists evaluating abstracts achieved an accuracy of only **38.9%** (worse than a coin flip), routinely falling victim to "formality bias" (assuming polished AI text was written by senior academics and misclassifying human papers with minor second-language quirks as AI).
* **Cabanac et al. (2021, *Tortured Phrases*):** Documented bizarre automated synonym translations circulating in academic literature (*"counterfeit consciousness"* for AI, *"colossal information"* for big data, *"cortical disease"* for brain cancer).

---

# 5. Everyday Practical Writing (Emails, Cover Letters, Messages)

Everyday professional communication is governed by **cognitive economy, relational safety, and communicative efficiency**. AI models violate H. Paul Grice’s **Maxims of Quantity, Manner, and Relation** by producing bloated, hyper-structured prose that shifts the cognitive parsing burden onto the recipient.

---

### 5.1 Workplace Emails: Human Directness vs. AI Prolixity

* **Length & Word Count:** 
  * *Human:* **50–125 words** (the Boomerang empirical sweet spot yielding a ~51% response rate).
  * *AI:* **200–450 words** (multi-paragraph essays for a simple transactional question).
* **Salutations & Openers:**
  * *Human:* *"Hey Sarah,"*, *"Hi team,"*, *"Quick question:"*, or jumping directly to the point.
  * *AI:* *"I hope this email finds you well,"*, *"I hope you are having a productive week,"*, *"I am writing to reach out regarding..."*
* **Valedictions & Sign-offs:**
  * *Human:* *"Thanks,"*, *"Best,"*, *"Cheers,"*, initials (*"-GB"*), or omitting entirely.
  * *AI:* *"Sincerely,"*, *"Warmest regards,"*, *"Please do not hesitate to reach out if you have any questions or concerns."*
* **Bullet Points & Bold Text:**
  * *Human:* Natural prose paragraphs; bullet points reserved strictly for 4+ complex logistical items.
  * *AI:* Compulsive bullet lists with bold category tags (`**Date:**`, `**Next Steps:**`) even for 2 simple thoughts.

#### Side-by-Side Comparison: Meeting Reschedule

```
❌ THE AI EMAIL (188 Words)
Subject: Request to Reschedule Our Upcoming Strategy Review Meeting

Dear Marcus,

I hope this email finds you well and that you are having a productive and rewarding week so far.

I am reaching out to discuss our upcoming Strategy Review meeting, which is currently scheduled on our 
calendars for tomorrow, Thursday, September 12th, at 2:00 PM EST. Regrettably, due to an unforeseen and 
urgent scheduling conflict regarding the Q3 budget reconciliation audit, I will be unable to attend our 
session at the previously agreed-upon time.

I sincerely apologize for any inconvenience this unexpected adjustment may cause to your schedule. Ensuring 
that we have adequate time to delve deeply into the product roadmap remains a high priority for me. 
Therefore, I would like to propose the following alternative time slots:
* Option 1: Friday, September 13th, at 10:00 AM EST
* Option 2: Friday, September 13th, at 2:30 PM EST

Please review these options and let me know if any suit your availability. Thank you very much for your 
understanding, patience, and flexibility.

Warmest regards,
Alex
----------------------------------------------------------------------------------------------------
✅ THE AUTHENTIC HUMAN PROFESSIONAL EMAIL (38 Words)
Subject: Reschedule: Strategy review tomorrow?

Hey Marcus,

Caught in an emergency Q3 budget audit tomorrow afternoon and won't make 2pm. 

Any chance we can push to Friday morning at 10am or afternoon at 2:30? If not, happy to do Monday.

Sorry for the shuffle,
Alex
```

---

### 5.2 Cover Letters & Job Applications: Grit vs. Marketing Cliché

Surveys show ~80% of hiring managers view unedited AI cover letters negatively because they sound like generic marketing brochures.

* **The AI Fingerprint:** The *"multifaceted professional"* archetype; hyperbolic passion (*"I have long admired your trailblazing innovation"*); buzzwords (*spearhead, leverage, holistic, elevate*); frictionless claims without metrics or messy constraints.
* **The Authentic Human Fingerprint:** Specific technical metrics; acknowledgment of grit, legacy messes, and constraints; authentic personal motivation:
  * *Human Example:* *"Over the last three years at CloudTech, our team inherited a messy, self-hosted Kubernetes cluster that failed every other Tuesday. I led the migration to EKS with Terraform: cut AWS spend by $28,000/month by rightsizing instances, reduced deploy rollbacks from 14% to under 2% with canary pipelines in ArgoCD, and onboarded 45 developers. I love the unglamorous work of making distributed systems boring, predictable, and resilient."*

---

### 5.3 Chat & Instant Messaging (Slack / Teams)

* **Cadence:** Sub-15-word utterances; micro-turns broken across line breaks; conversational backchannels (`👀` = looking, `✅` = done).
* **The "No Hello" Norm (`nohello.net`):** Real humans do not send *"Hi"* and wait; they integrate the greeting with the ask.
* **The AI Failure:** LLMs generate 80-word corporate memos for a simple chat ping:
  * *AI:* *"Hello Rachel! 👋 I hope your morning is going smoothly! I just wanted to quickly check in regarding the Meridian slide deck for our 3:00 PM call. Please let me know if you need a second pair of eyes!"*
  * *Human:* *"hey rachel, meridian deck good to go for 3? can help review if you're swamped"*

---

# 6. Actionable Rewrite Rules (Directly Usable in SKILL.md)

*Apply these rules imperatively to eliminate synthetic patterns, restore human prosody, and calibrate output to the target register.*

---

### Rule 1: Purge the AI Marker Lexicon
Delete every instance of the following tokens and their grammatical variants. Replace with direct Saxon verbs or plain concrete nouns:
* Banned verbs: `delve`, `foster`, `navigate`, `leverage`, `elevate`, `unlock`, `embrace`, `showcase`, `illuminate`, `unravel`, `spearhead`, `bolster`, `transcend`, `underscore`, `empower`, `cultivate`, `orchestrate`.
* Banned nouns: `tapestry`, `testament`, `beacon`, `realm`, `landscape`, `paradigm`, `nexus`, `interplay`, `labyrinth`, `synergy`, `cornerstone`, `linchpin`, `conduit`, `bedrock`.
* Banned adjectives: `multifaceted`, `paramount`, `pivotal`, `intricate`, `meticulous`, `profound`, `vibrant`, `robust`, `nuanced`, `transformative`, `commendable`, `bespoke`.
* Banned adverbs: `furthermore`, `moreover`, `additionally`, `fundamentally`, `seamlessly`, `inherently`, `indelibly`, `holistically`.

### Rule 2: Enforce the Burstiness Floor ($CV \ge 0.65$)
* Never write three consecutive sentences of similar word count.
* Break the metronomic 15–22 word rhythm.
* Deliberately pair a 4-to-7 word staccato sentence with a 30-to-50 word compound-complex sentence.
* Calculate the sentence length standard deviation: across any 300-word passage, ensure $\sigma \ge 9.0$ words.

### Rule 3: Strip All Phatic Padding and Throat-Clearing
* Cut opening temporal and spatial clichés: *"In today's fast-paced world"*, *"In an increasingly interconnected landscape"*, *"When it comes to X"*.
* Cut conversational email padding: *"I hope this email finds you well"*, *"I hope you are having a productive week"*, *"I wanted to reach out regarding"*.
* Start immediately with the primary claim, decision, or concrete event.

### Rule 4: Ban Moralizing and Horizon-Gazing Conclusions
* Never conclude with *"As we look to the horizon / future..."*, *"Only time will tell..."*, or *"X is poised to revolutionize Y"*.
* Ban summary paragraphs that merely restate preceding points.
* End on a concrete next step, an unresolved empirical tension, a logistical deadline, or stop immediately after the final argument.

### Rule 5: Destroy the Tricolon Reflex
* Stop grouping items into sets of three.
* If listing features, reasons, or adjectives: give one strong point, two contrasting points, or four specific points.
* Disrupt parallel grammar in lists: mix concrete nouns with abstract realities (e.g., *"two broken monitors, a stale coffee, and three weeks of mounting dread"*).

### Rule 6: Ration Em-Dashes and Colons
* Limit em-dashes (`—`) to a maximum of one per 500 words. Replace parenthetical dashes with commas, periods, or parentheses.
* Eliminate the colon-plus-bold-header format (`**Topic:** explanation`) unless explicitly generating a structured reference manual.
* Do not use em-dashes to tack on dramatic summary thoughts at the end of a sentence.

### Rule 7: Kill Antithetical Parallelism
* Delete all occurrences of the formula: `not only [X], but also [Y]` and `not just [X], but [Y]`.
* State the assertion directly. Replace *"It is not just a tool, but a catalyst"* with *"It accelerates the entire build."*

### Rule 8: Enforce Argumentative Friction and Falsifiability
* Kill forced "both-sidesing" and artificial consensus.
* If two perspectives conflict, take an explicit stance or articulate the precise empirical reason the conflict remains unresolved.
* Acknowledge ugly realities: failed tests, negative results, instrument errors, budget constraints, and trade-offs.

### Rule 9: Operationalize Technical Terminology
* Ban ornamental prestige jargon (*"holistic paradigm shift"*, *"synergistic alignment"*).
* Every technical term must carry procedural, mathematical, or empirical weight. If removing the word does not alter the reproducibility of the methodology, strike it.
* Ground abstract claims in sensory details, dollar amounts, line counts, latencies, or physical artifacts.

### Rule 10: Calibrate Register Strictly by Platform

#### For Email:
* Cap message body at 50–100 words.
* Omit opening pleasantries. Use *"Hey [Name],"* or jump straight into the ask.
* Use natural short paragraphs (1–3 sentences). Reserve bullet points strictly for 4+ items.
* Sign off with *"Thanks,"*, *"Best,"*, or initials. Never use *"Warmest regards,"* or *"Please do not hesitate to reach out."*

#### For Slack / Teams:
* Cap message at 1–2 sentences (under 25 words).
* Integrate greeting with the ask on the same line.
* Use lowercase starts and relaxed punctuation. Never send a multi-paragraph memo in a chat channel.

#### For Online Forums (Reddit / Twitter / Tech Forums):
* Omit the terminal period on short conversational turns.
* Use lowercase starts for casual remarks.
* Deploy epistemic modals (`ngl`, `tbh`, `iirc`) to cushion candor or disclaim authority.
* Never explain the punchline or the subtext of irony.

#### For Academic Prose:
* Replace generic disclaimers (*"caution is warranted"*, *"multifaceted challenges"*) with restrictive empirical qualifiers (exact confidence intervals, confounding variables, sample boundaries, measurement error).
* Use citations dialectically: critique methodologies, expose omitted variables, and carve out distinct argumentative niches rather than offering neutral surveys.
