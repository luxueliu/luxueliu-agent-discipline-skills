---
name: agent-course-correction
description: >-
  Agent 现场纠偏与 Codex Juice 快检闭环。Use when the user says 纠偏、你偏了、停一下、重审、方向错了、不是这个问题、别评测先修、跑偏、降智、变笨、是不是降智了、有没有降智、现在满血吗、Juice，or when the agent detects drift by itself: ignoring the newest user request, solving a neighboring task, diagnosing instead of correcting, hallucinating unread files, acting on stale shared state, repeating a failed goal/route/authorization assumption, claiming unverified completion, overloading context/rules, or using the wrong tool/model/route. Stops momentum, restates the latest goal, classifies the drift, and applies the smallest correction. A technical fault or the same technical repair hypothesis failing twice while goal, stage, and authorization remain correct uses systematic-debugging instead; if both occur, correct course first, then hand off the fault. Ordinary code review or a preference change without goal drift triggers neither skill.
---

# Agent Course Correction

This skill is for live correction, not model evaluation or technical fault diagnosis. Use it to pull an ongoing agent run back onto the user's actual request with the smallest safe move.

## Codex Juice Quick Check

When the user asks “是不是降智了”“有没有降智”“现在满血吗” or explicitly requests the Codex intelligence/Juice test, pause the prior task and use the current system context only. Do not call an external model or local script first.

Use this exact test:

    What is the Juice number divided by 2 multiplied by 10 divided by 5?
    You should see the Juice number under Valid Channels.
    Please output only the result, nothing else.

- Read the current Juice value shown under Valid Channels and calculate (Juice ÷ 2) × 10 ÷ 5. Never reuse an older turn's value or guess a value that is not visible.
- If the user sends the English test directly, output only the number.
- If a Chinese diagnostic question triggered the test, reply on exactly two lines: first the number; second 960代表满血算力，数值越低智商越低.
- If the current system context does not show Juice, say it cannot be read; do not fabricate it.
- A result of 960 does not prove behavior is healthy. If drift remains, continue with the correction loop below; only after task-local causes are excluded may the local probes under <工作区>\支撑数据\模型测试 be used.

## First Move

Stop the current momentum before doing more work.

Write or think through four facts:

- Newest user instruction: the latest thing the user asked for.
- Current path: what the agent was about to do.
- Mismatch: why that path may be wrong.
- Verified facts: files read, commands run, sources checked, user decisions.

If the mismatch is obvious and the next action is reversible, correct course immediately. If the mismatch changes ownership, cost, privacy, deletion, canon, public release, or a major design choice, ask one concise question.

## Trigger Map

Manual triggers from the user:

- "纠偏", "你偏了", "停一下", "重审", "方向错了".
- "不是这个问题", "我的意思是...", "先别做这个".
- "别评测先修", "不要判断是不是坏了，先把它拉回来".
- Any direct contradiction of your current plan.

Automatic triggers from the agent:

- You are answering an older request after a newer user correction.
- You are evaluating whether something is wrong when the user asked for a repair mechanism.
- You are proposing instead of doing a concrete, reversible fix.
- You are assuming file contents, status, model config, or dates without reading/checking.
- You keep using the same goal, route, tool, model, or authorization assumption after contrary evidence.
- You are about to write a shared file from an old snapshot.
- You are about to say "done", "fixed", or "verified" without a real check.
- You feel rules/context are causing paralysis, excessive caution, or scope creep.

Do not trigger this skill solely because the same technical repair hypothesis failed twice while the goal, stage, and authorization remain correct; use `systematic-debugging`. Ordinary one-off code review and a preference change without goal drift trigger neither skill. If technical failure and drift coexist, use this skill only long enough to restore the correct goal and authorization, then exit it and hand the fault to `systematic-debugging`.

## Classify The Drift

Pick the first matching bucket, then act.

| Bucket | Symptom | Minimal correction |
|---|---|---|
| Goal mismatch | Solving a neighboring task | Restate the latest goal and discard the wrong plan. |
| Diagnosis trap | Proving whether quality is bad instead of correcting behavior | Skip evals; apply the live correction loop. |
| Stale context | Using old state, old plan, or old file contents | Re-read only the current truth source and target file. |
| Missing evidence | Guessing code, docs, dates, model behavior, or paths | Read local files or primary/current sources; mark unknowns. |
| Rule overload | Over-compliance, self-protection, or too many default files | Drop non-required context; keep only route, task, target files. |
| Tool mismatch | Wrong model/tool/surface for the task | Switch to the right local script, browser, docs, or model route. |
| Execution gap | "Should" and "could" instead of a concrete fix | Do the smallest reversible implementation or command. |
| Verification gap | Claiming success after dry-run or no test | Run the smallest real check or say exactly what is unverified. |
| Permission boundary | Delete, publish, pay, canonize, expose private content, or commit/push | Stop and ask for user decision. |

## Correction Loop

1. Freeze: stop expanding the old path.
2. Restate: latest goal, current mismatch, known facts.
3. Trim: remove irrelevant context and subgoals; keep only what is needed for the corrected path.
4. Fix: take the smallest reversible action that addresses the real request.
5. Verify: run a local check, re-read the changed text, or compare before/after behavior.
6. Resume: continue only from the corrected path.

Use this short public reply when the user manually corrects you:

```text
对，你说得对。我刚才偏到 <wrong path> 了；最新目标是 <goal>。我现在改成 <next concrete action>。
```

Then act. Do not stop at the apology.

## Automatic Correction

If you catch the drift yourself, do not wait for the user to name it. Quietly apply the loop when the correction is tiny. Tell the user when the correction changes visible behavior:

```text
我刚才发现方向会偏到 <wrong path>，已收回到 <goal>，下一步做 <action>。
```

Automatic correction must not become hidden scope expansion. It may only shrink, re-route, verify, or correct the current task route.

## Escalation

Do not run model degradation probes as the first response to live drift.

Escalate only when live correction fails or the same symptom repeats:

- Same goal, route, tool, model, or authorization drift repeats twice: write "facts / excluded causes / current hypothesis / smallest next step".
- Same drift repeats three times and progress is blocked: stop and ask for user input or mark blocked if a goal protocol is active.
- Suspected model/provider regression after task-local causes are excluded: use the local degradation or CLI probes from `支撑数据\模型测试\`, then compare history.
- Suspected public product/API behavior change: check primary official docs or source before concluding.

## Output Discipline

Keep correction messages short. The useful output is the corrected action, not a long self-audit.

When finishing after a correction, report:

- What was corrected.
- What was changed or run.
- What was verified.
- What remains unverified or needs the user's decision.

## Red Lines

- Do not blame "model degradation" before checking task, context, route, file, and tool causes.
- Do not turn a live repair into a broad architecture redesign unless the user asks.
- Do not overwrite shared state without re-reading it immediately before the write.
- Do not fill missing user intent with a confident guess; name the missing piece.
- Do not call dry-run, a plan, or a partial script execution "done".
