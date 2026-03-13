# 🤖 Agent Skills Library

**Program Director:** Groot 🌳

---

## 📚 Available Agents

### 🎮 Betty - Game Developer
**Location:** `/skills/game-development/SKILL.md`

**Role:** Create fun, kid-friendly HTML5 games for Telegram

**Capabilities:**
- Single-file HTML5 games
- Mobile-optimized touch controls
- Bright, colorful UI design
- Sound effects & animations
- GitHub Pages deployment
- LocalStorage high scores

**When to Use:**
- Building Telegram mini-games
- Creating kid entertainment
- Mobile game prototypes
- Quick game jam projects

**Activation:**
```
"Betty, create a memory game"
"@Betty build a bubble pop game"
"Game developer mode"
```

---

### 📊 Fin - Financial Analyst
**Location:** `/skills/financial-research/SKILL.md`

**Role:** Deep research on stocks, crypto, and markets

**Capabilities:**
- Live price tracking (Yahoo Finance)
- Fundamental analysis (P/E, market cap, etc.)
- Analyst ratings & price targets
- News sentiment analysis
- Portfolio tracking
- Crypto market data

**When to Use:**
- Stock research (TSLA, AMZN, etc.)
- Crypto analysis
- Portfolio updates
- Market research reports

**Activation:**
```
"Fin, check TSLA"
"@Fin analyze crypto"
"Financial analyst mode"
```

---

### 🌳 Groot - Program Director (Me)
**Role:** Main assistant, team coordinator

**Capabilities:**
- All tools and skills
- Cross-domain coordination
- Quality control
- Task routing
- Team management

**When to Use:**
- Any request (I route to specialists)
- Complex projects
- New agent creation
- General questions

---

## 🎯 How to Use Agents

### Option 1: Direct Request (Recommended)
Just ask for what you need - Groot will route to the right agent:

```
"Check TSLA price" → Fin handles it
"Build a game" → Betty handles it
"Research markets" → Fin handles it
```

### Option 2: Mention Specific Agent
Call out the agent by name:

```
"@Fin analyze NVDA"
"Betty, make a puzzle game"
"Fin, what's the crypto market doing?"
```

### Option 3: Activate Mode
Switch to an agent's mode:

```
"Fin mode" - All responses use Fin protocol
"Betty mode" - All responses use Betty protocol
```

### Option 4: Spawn Subagent
For complex tasks, spawn a dedicated agent:

```
sessions_spawn(label="Fin", runtime="subagent", mode="run", task="...")
```

---

## 📋 Agent Comparison

| Task | Best Agent | Why |
|------|-----------|-----|
| Stock research | **Fin** | Specialist protocols, data sources |
| Crypto analysis | **Fin** | Market expertise, tracking tools |
| Game building | **Betty** | Kid-optimized, mobile-first design |
| Multi-step projects | **Groot** | Coordination, quality control |
| New agent creation | **Groot** | SKILL.md authoring, setup |
| General help | **Groot** | Broad capabilities, routing |

---

## 🔧 Creating New Agents

To add a new agent to the team:

### Step 1: Create SKILL.md
```
/skills/[agent-name]/SKILL.md
```

Include:
- Purpose and role
- When to use
- How to execute (step-by-step)
- Templates and examples
- Quality guidelines

### Step 2: Update TEAM.md
Add agent to `/Users/nickhil/.openclaw/workspace/TEAM.md`

### Step 3: Test
- Spawn agent or use protocol
- Verify output quality
- Adjust SKILL.md as needed

### Step 4: Document
Update this README with new agent

---

## 📁 Skill File Structure

Each skill should follow this structure:

```markdown
# [Agent Name] - [Role]

## Purpose
[What this agent does]

## When to Use
[Use cases]

## How to [Execute Task]

### Step 1: [Action]
[Instructions]

### Step 2: [Action]
[Instructions]

## Templates

### [Output Format]
```
[Template]
```

## Rules
1. [Rule 1]
2. [Rule 2]

## References
- [Links, examples, etc.]
```

---

## 🎨 Skill Categories

### Finance
- **Fin** - Stock/crypto research
- **Performance Marketer** - Marketing analytics
- **Ads Analyst** - Meta ads analysis

### Creative
- **Betty** - Game development
- **Scriptwriter** - Video scripts
- **Ad Designer** - Creative assets
- **Page Designer** - Landing pages

### Technical
- **Frontend Design** - Web development
- **Meta Ads Publisher** - Campaign deployment
- **Meta Ads Extractor** - Data extraction

### Strategy
- **Campaign Planner** - Marketing strategy
- **Creative Director** - Asset coordination
- **Head of Marketing** - Brand strategy

---

## 📝 Memory Integration

All agents share memory files:
- **Daily logs:** `memory/YYYY-MM-DD.md`
- **Portfolio:** `memory/portfolio-tracking.md`
- **Research:** `memory/[topic].md`

When an agent completes work:
1. Results delivered to user
2. Key findings saved to memory
3. Available to all other agents

---

## 🚀 Quick Reference

| I Need... | Ask... | Example |
|-----------|--------|---------|
| Stock research | Fin | "Fin, check TSLA" |
| Crypto analysis | Fin | "@Fin analyze Bitcoin" |
| Telegram game | Betty | "Betty, build a tap game" |
| Kid-friendly game | Betty | "@Betty create a puzzle" |
| Complex project | Groot | "Groot, coordinate this" |
| New agent | Groot | "Create a research agent" |

---

## ✅ Quality Standards

All agents must:
- [ ] Be mobile-friendly (if applicable)
- [ ] Cite sources (Fin)
- [ ] Save to memory
- [ ] Use clear formatting
- [ ] Be kid-safe (Betty)
- [ ] Deploy successfully (Betty)
- [ ] Be accurate (Fin)
- [ ] Follow brand voice (Groot)

---

## 📞 Support

**Issues?**
- Check agent's SKILL.md for detailed instructions
- Ask Groot to review/debug
- Update SKILL.md if protocols need improvement

---

*Team managed by Groot 🌳*
*Last updated: 2026-03-13*
