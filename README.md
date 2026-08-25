# luxueliu-agent-discipline-skills

> 🛡️ **AI 不缺聪明，缺纪律——5 个让 agent 少闯祸、不虚报、能接力的硬核 SKILL**

一套经过数百小时真实多 agent 协作打磨的 **agent 纪律 skills**（DeepSeek Harness / Claude Code / Codex 通用）。不是 prompt 小技巧，是给 AI 装的**工程刹车与交接规程**：交付前自检、跑偏纠偏、根因调试、多 agent 接力、创作边界。

由 [luxueliu](https://github.com/luxueliu) 制作并开源。每个 skill 都是单文件 `SKILL.md`，零依赖，装上即用。

## 这是什么

| Skill | 治什么病 | 一句话原理 |
|---|---|---|
| [`deepcode-review`](skills/deepcode-review/SKILL.md) | AI 声称"完成"但文件没写、乱码、假命令 | **没有从磁盘回读，就没有完成**：强制磁盘回读 + 变更清单 + 编码/转义扫描 + dry-run 冒充真跑拦截 |
| [`agent-course-correction`](skills/agent-course-correction/SKILL.md) | Agent 跑偏、答非所问、解决相邻任务还自我感觉良好 | 停下动量 → 复述最新目标 → 分类漂移类型 → 最小安全纠正 |
| [`systematic-debugging`](skills/systematic-debugging/SKILL.md) | 同一个修复假设试三次还不收敛 | 证据驱动：最小失败样本 → 单假设 → 回归证明；只授权诊断就停在根因 |
| [`deepcode-collab`](skills/deepcode-collab/SKILL.md) | 多 agent 并行时"单干很稳、一协作就崩" | 临写前重读防陈旧态、继承半截上下文先标缺口防脑补、区分"已执行"≠"已达成" |
| [`co-creation`](skills/co-creation/SKILL.md) | AI 创作搭档喧宾夺主，替作者拍板 | 三态纪律（正典/候选/冲突）+ 跨作品隔离 + 绝不代笔，只当书记员 |

## 为什么值得装

- **它们来自真实事故**：每条规则背后都是一次真实的翻车——字面量 Unicode 转义写进生产文件、把"我打算跑"汇报成"已经跑完"、协作时拿着五分钟前的旧状态覆盖别人的新写入。
- **可组合不重叠**：纠偏管目标漂移，调试管技术故障，自检管出门质量，接力管边界交接——职责边界在文档里显式划清。
- **人也能用**：这套纪律同样适用于人类团队 code review 和交接，毕竟 AI 犯的错人类一个不少。

## 安装

要求：任何支持 Agent Skills 规范（`SKILL.md` + YAML frontmatter）的环境。DeepSeek Harness / Claude Code / Codex CLI 均可直接用。

```powershell
# 方式一：整仓克隆后按 skill 复制
git clone https://github.com/luxueliu/luxueliu-agent-discipline-skills
# 把需要的 skill 目录拷进你的技能目录：
Copy-Item -Recurse luxueliu-agent-discipline-skills\skills\deepcode-review ~/.dsh/skills/

# 方式二：DSH Web 用户（用户级技能目录）
# %USERPROFILE%\.dsh\skills\<skill-name>\SKILL.md
```

重启会话后，skill 会按各自 description 里的触发条件自动加载，也可以点名调用。

## 触发方式（节选）

- 「你偏了」「停一下」「是不是降智了」→ `agent-course-correction`
- 写完任何文件准备声称完成 → `deepcode-review` 自动闸门
- 「帮我查为什么挂了」「同一修复第二次失败」→ `systematic-debugging`
- 多 agent 领取/交接任务卡 → `deepcode-collab`
- 讨论世界观/角色/剧情 → `co-creation`

## 已知边界

- `deepcode-review` 的部分检查项（Windows 输出编码、路径验真）以 Windows 环境为例，其他平台需自行等价替换。
- `co-creation` 为创作域专用，默认只在创作项目目录生效，不碰代码任务。
- 各 skill 间引用（如"先纠偏再调试"）在本仓库内自洽；单独抽走某个 skill 时相关交叉引用会失效但不影响主体功能。

## License

MIT © luxueliu
