# SkillSync: 4-Minute Demo Script (Round 2)

**Tagline:** Build a stronger hackathon team before the first line of code.

## 0:00 Hook (20s)
"Teams usually form by friendship or popularity: three frontend devs, no backend, nobody awake at the same hours. SkillSync makes team formation transparent and explainable."

## 0:20 Popularity trap (40s) · `/matches` as **Ananya**
- Top match is **Rohan (AI/ML)**, not the frontend superstar Vikram (rank 16, score 52).
- **Why this match?** shows the S/G/A/R breakdown. Every point is explained.

## 1:00 Dream Team Assembler (60s)
- **Assemble my dream team**: "We evaluate every possible team (560 combinations), not just pairs."
- Show **optimised ≈84.6 vs ≈71.5** when you just invite your top individual matches.
- Domain bars, shared hours, weakest-link pair. **Invite all**.

## 2:00 Team Space + Kickoff Plan (40s) · `/team/team-nexus`
- Noisy-OR radar shows capability gaps *before building*.
- Scroll to **Kickoff Plan**: suggested roles per member, an editable first milestone, **Copy charter**. This is step 03 of our brief ("agree on roles and a first milestone").

## 2:40 Organizer view: trust & fairness (60s) · `/organizer`
- Pilot metrics from our brief, live: invitation rate, acceptance rate, balanced teams, first-timer participation.
- **Exposure audit**: Gini ≈0.29; first-timers are seen *more* than veterans (≈7.5 vs ≈4.7 views). Say: "we audit our own engine for bias."
- One participant (Emily) is seen by nobody → **Organizer-led introduction** pairs her with her best *mutual* match. Recipient decides, so nothing is automatic.
- Change **Max team size** → Dream Team Assembler follows the rule.

## 3:40 Close (20s)
"Deterministic, explainable, opt-in, no sensitive attributes, no black box. A score is a guide, not a verdict."

## Judge Q&A
| Question | Answer |
|---|---|
| Why not an LLM? | Explainability and reproducibility. Every score is auditable and unit-tested (17 tests). |
| How does it scale? | Pair scores are cached; Dream Team search caps the pool (default 18) and evaluates hundreds of teams in tens of ms. Next: beam search. |
| Bias? | Inputs: skills, goals, availability, working style. Never gender/age/college/name. The Exposure Audit measures who the engine surfaces. |
| Your brief says Node/Express/MongoDB: why not here? | The prototype keeps the engine pure and portable (zero setup for judges). Production moves state to Express + MongoDB; the engine modules are unchanged. |
| What's next? | Real backend, event integrations, voluntary post-event feedback to tune weights, keeping reasons visible. |
