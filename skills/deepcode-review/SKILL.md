---
name: deepcode-review
description: DeepCode 交付前自检与低级错误拦截协议。每当 DeepCode 写入或修改 Markdown/SKILL、Python、YAML、JSON/JSONL、PowerShell、配置、状态文件、agent_dialogue 总线，或准备声称任务完成、审计完成、测试通过、已写入总线前使用；强制执行磁盘回读、变更清单、编码与转义扫描、语法/解析验证、路径/命令/外部标识符验真、Windows 输出编码检查和交付回执，专门拦截字面量 Unicode 转义、乱码路径、空文件、假命令、过期状态、dry-run 冒充真跑等 DeepCode 高频低级错误。
---

# DeepCode 自检闸门 v3

你是 DeepCode 每次交付前的最后一道闸门。你的目标不是证明自己做对了，而是主动寻找“写完后再读一遍就能发现”的低级错误。

核心铁律：
- 没有从磁盘回读，就没有完成。
- 没有真实运行，就只能说 dry-run 或未验证。
- 没有验过路径、命令、外部标识符，就不能写“已确认”。
- 当前状态以 `基建_当前状态.md`、最新总线记录和文件实物为准；旧报告只当参考。
- 自检失败后必须修复并从回读步骤重跑，不能只修失败的那一项。
- 资料库任务里，`exact_path` 必须经过 `Test-Path -LiteralPath` 或等价 `Path.exists()`；未通过就只能写 `candidate_path`。
- 没有哈希、页数、目录或正文抽样证据，不得写“内容相同”“完全重复”“100%安全”。
- 生成了方案不等于任务达成；没有完成任务卡要求字段，就只能写“已执行·部分达成”或“已执行·未达成”。

## 0.5 资料库任务三道专项闸

当任务涉及 `G:\书库`、`资料库索引`、`library_index.json`、EPUB 拆书、OCR、查重、分类、写作资料深读时，除通用自检外必须额外执行以下三道闸。

### 0.5.1 exact_path 闸

报告中出现 `exact_path`、`实际路径`、`文件存在` 时：

- 必须逐条用 `Test-Path -LiteralPath`、`Get-Item -LiteralPath` 或 Python `Path.exists()` 验证。
- 命中失败的路径不能叫 `exact_path`，只能叫 `candidate_path` 或 `[path_missing]`。
- 路径字段如果有 10 条以内，必须全量验；超过 10 条，至少抽样 20%，但凡抽样命中缺失，必须回到全量验。

错误写法：

```text
exact_path = 3世界通史\人类历史\人类简史：从动物到上帝.epub
```

正确写法：

```text
candidate_path = 3世界通史\人类历史\人类简史：从动物到上帝.epub
path_status = missing
actual_path = 3世界通史\人类历史\[人类简史：从动物到上帝]尤瓦尔.epub
evidence = path_verified
```

### 0.5.2 证据等级闸

每条分类、去重、深读、清理建议必须标证据来源：

| evidence | 允许写什么 |
|---|---|
| `filename_only` | 只能写“从文件名看可能是” |
| `metadata_only` | 只能写“元数据暗示” |
| `toc` | 可写目录结构判断 |
| `sample_text` | 可写初步摘要/分类 |
| `full_text` | 可写较高置信总结 |
| `path_verified` | 可写文件存在、大小、页数 |
| `hash_match` | 可写精确重复候选 |
| `manual_confirmed` | 可写人工确认事实 |

没有 evidence 字段的表格，不能声称“审计完成”。

### 0.5.3 禁词和替代表达闸

资料库候选报告中默认禁止以下结论词：

```text
删除
移动
重命名
覆盖
写回
清理掉
100%安全
内容相同
完全重复
应当删除
直接执行
```

如果必须讨论不可逆操作，只能写：

```text
疑似重复，待哈希和正文抽样验证。
是否删除：需用户拍板。
本任务未执行删除。
```

如果报告中出现禁词，交付前必须逐条检查：是在描述“禁止/未执行/需拍板”，还是在给执行建议。后者必须改写。

## 触发时机

以下任一情况发生时必须使用本 skill：

| 场景 | 最低检查 |
|---|---|
| 写入或修改 `.md`、`SKILL.md`、`.py`、`.yaml`、`.json`、`.jsonl`、`.ps1`、配置文件 | 全流程 |
| 修改 `基建_当前状态.md`、`agent_dialogue.jsonl`、`CLAUDE.md`、`AGENTS.md`、项目 canon/candidates/conflicts/decisions | 全流程 + 状态/总线专项 |
| 写审计报告、盘点、清理建议、交付回执 | 全流程 + 抽样验真 |
| 声称脚本“通过”“可用”“跑通” | 命令实测 + 输出检查 |
| 连续改多个文件 | 每个文件分别回读；最后再做一次总清单核对 |

## 总流程

### 0. 先列变更清单

在自检前写下临时清单，不必交给用户，自己必须过一遍：

- 本轮改了哪些文件。
- 每个文件本来要解决什么问题。
- 哪些检查是真跑，哪些只是 dry-run。
- 哪些事实来自总线、状态文件、脚本输出、目录实物，哪些只是推断。

如果清单里出现“我好像”“应该”“之前看过”，立刻回源头重读。

### 1. 磁盘回读

对每个刚写完的文件，从磁盘重新读取，不使用编辑器缓存、工具返回片段或记忆。

检查：
- 文件不是 0 字节，末尾没有意外截断。
- 中文、标点、符号是真字符；不要把反斜杠-u 四位十六进制、反斜杠-U 八位十六进制、代理对转义留在面向人读的 Markdown/skill/YAML/PowerShell 中。
- Markdown 表格、列表、代码块、frontmatter 没有断裂。
- 没有把换行、制表符、引号写成字面量转义。
- 没有残留 TODO、PLACEHOLDER、FILE_PATH、old_string、示例路径等占位符，除非那一段明确是在教别人替换。
- `.ps1`、计划任务、Windows 原生命令用 `-LiteralPath` 或 `Join-Path`，不要依赖会吞中文路径的拼接。

### 2. 自动扫描

每个改动文件至少跑一次基础扫描。把 `FILE_PATH` 换成实际路径。

```bash
python -c "import pathlib,re,sys; p=pathlib.Path(sys.argv[1]); b=p.read_bytes(); errors=[]; text=''; 
if not b: errors.append('empty file')
try: text=b.decode('utf-8-sig')
except UnicodeDecodeError as e: errors.append(f'utf8 decode failed: {e}')
if text and not text.endswith(('\n','\r\n')): errors.append('missing final newline')
bad=[(i+1,m.group(0)) for i,line in enumerate(text.splitlines()) for m in re.finditer(r'(?<!\\\\)\\\\[uU][0-9a-fA-F]{4,8}|\\\\ud[0-9a-fA-F]{3}', line)]
if bad: errors.append('literal unicode escapes: '+repr(bad[:10]))
if errors: print('\n'.join(errors)); sys.exit(1)
print('basic-file-check OK')" "FILE_PATH"
```

如果命中转义串，不要在心里解释“这是示例”。面向人读的 skill 自身也不应留下会被扫描器命中的原始 bug 示例；需要说明时写“反斜杠-u-300c”这种文字描述。

### 3. 按文件类型验证

按实际修改的类型追加检查：

| 类型 | 必跑检查 |
|---|---|
| Python | `python -m py_compile FILE_PATH`；如改 CLI，再跑 `python FILE_PATH --help` 或对应子命令 help。 |
| JSON | `python -m json.tool FILE_PATH`。 |
| JSONL | 逐行 `json.loads`；空行、半行、重复 seq、尾行不可解析都算失败。 |
| YAML | 能用解析器就解析；无解析器时至少核对 frontmatter、缩进、冒号、引号配对。不能把“肉眼看着像”写成“解析通过”。 |
| PowerShell | 用 `scriptblock` 解析但不执行；非用户可见文本尽量 ASCII。含中文时确认编码并在 Windows PowerShell 实测。 |
| Markdown/SKILL | frontmatter 只有需要的字段；代码围栏成对；表格列数稳定；触发描述写在 description，不只写在正文。 |
| `.env`/密钥配置 | 不打印密钥值；只验证键名存在、被 `.gitignore`/`.stignore` 忽略、调用方能读取。 |

PowerShell 解析示例：

```powershell
powershell -NoProfile -Command "$p='FILE_PATH'; [void][scriptblock]::Create((Get-Content -Raw -LiteralPath $p)); 'ps1 parse OK'"
```

JSONL 解析示例：

```bash
python -c "import json,pathlib,sys; p=pathlib.Path(sys.argv[1]); lines=p.read_text(encoding='utf-8-sig').splitlines(); [json.loads(x) for x in lines if x.strip()]; print('jsonl OK', len(lines))" "FILE_PATH"
```

### 4. 引用和事实验真

凡是文件里写了这些东西，必须验：

- 路径：用 `Test-Path -LiteralPath`、`Get-Item -LiteralPath`、Python `Path.exists()` 或实际目录读取确认。
- CLI 命令和参数：跑 `--help`、dry-run 或最小真实调用确认。未跑就写“待验证”。
- 外部标识符：模型 slug、VSCode 扩展 ID、包名、URL、API 参数必须来自实际查询、官方文档、命令输出或已记录的总线证据。没联网或没查到时标 `[未联网验证]`。
- 报告中的数量：写“全部”“零风险”“完全重复”“均已完成”前，必须能给出计数或样本；否则改成“抽样看起来”“需确认”。
- 状态结论：写盘点前先读最新 `基建_当前状态.md` 和 `agent_dialogue.jsonl` 尾部，不要让旧状态覆盖新总线。

### 5. 命令输出检查

每次运行命令后都检查：

- 退出码是否为成功；不要只看最后一行像成功。
- stdout/stderr 有没有 Python traceback、PowerShell ParserError、GBK/UTF-8 编码错误、乱码路径。
- 输出里的中文路径没有变成 mojibake；如果生成了乱码目录或文件，立即报告并修复。
- dry-run 只证明“渲染/参数/流程可走”，不能证明真实写入、真实 API、真实备份、真实推送已经发生。
- 网络/API 调用要区分 HTTP 200、业务错误、fallback 成功、缓存结果。

### 6. 差异和范围核对

如果目录是 Git 仓库，交付前看一眼变更范围：

- `git diff --name-only`：没有多改不相关文件。
- `git diff --check`：没有尾随空格、冲突标记、坏缩进。
- 不把密钥、token、个人隐私、SillyTavern 大目录、缓存产物纳入提交/备份。

如果不是 Git 仓库，至少用目录 stat/mtime/文件大小核对本轮改动范围。

## 状态文件和总线专项

### 写 `基建_当前状态.md`

- 写前先读旧文件，保留仍有效的接盘信息。
- 只覆盖这一份活文件，不新建日期副本。
- 新增结论必须能回指到脚本输出、总线 seq、用户拍板或文件实物。
- 写后回读顶部更新时间、当前最优先、剩余任务三处，确认没有互相矛盾。

### 写 `agent_dialogue.jsonl`

- 追加前读尾行，确认最新 seq。
- 只追加一行合法 JSON，不手写半截。
- 追加后回读尾行并 `json.loads`。
- `refs` 里的路径必须实际存在，或明确标 `[待建]`。

## 审计报告专项

写盘点、审计、清理建议时，把“发现”和“判断”分开：

- `实测`：目录/文件/命令确实检查过。
- `总线证据`：引用最新 seq 或状态条目。
- `推断`：从结构判断，但没有逐项验证。
- `待确认`：需要用户拍板或需要真实运行。

高风险词要慎用：

| 词 | 使用条件 |
|---|---|
| 全部 | 已完整遍历或有脚本计数。 |
| 零风险 | 只限缓存、临时锁文件等明确可再生对象；用户原始资料不能写零风险。 |
| 已完成 | 有真实运行、回读、验收或用户拍板。 |
| 未接入 | 确认 skill/脚本/文档都没有调用链；不能只看旧报告。 |
| 未验证 | 没有真实运行或缺少验收，哪怕 dry-run 通过也仍可写未验证。 |

### 资料库报告专项

资料库报告必须额外检查：

- 状态词只能用：`已达成` / `已执行·部分达成` / `已执行·未达成` / `受阻` / `待审` / `需用户拍板`。
- 引用来源必须写完整文件名，不能写“B报告/C报告/F报告”这种简称。
- `exact_path` 必须真实存在；不存在就改字段名。
- “深读”必须有 `toc`、`sample_text` 或 `full_text` 证据；目录盘点不能叫深读。
- 去重建议必须列 `evidence_present` 和 `evidence_missing`；缺哈希/正文抽样时只能写“疑似重复”。
- 删除、移动、重命名、索引写回等动作必须写为“候选/需拍板”，不得写成建议执行。

## Windows 和编码纪律

- 中文路径用 PowerShell `-LiteralPath` 或 Python `pathlib`，不要让 bash 和 PowerShell 接力处理同一批路径。
- 文件操作用一个 shell 从头到尾完成；不要在 bash 里枚举，再交给 PowerShell 删除/移动。
- `.ps1` 默认 ASCII；确需中文输出时，明确 UTF-8 编码并在 Windows PowerShell 实测。
- 不用 bash heredoc 当作修复 Unicode 的常规方案；如果写入工具会转义字符，优先换成安全的文件编辑工具或最小脚本，并回读验证。
- PowerShell 路径展示优先用反斜杠；Python/Markdown 引用可以用正斜杠，但不要把展示格式当成存在性验证。

## 常见失败模式

| 失败模式 | 自检抓法 | 修复 |
|---|---|---|
| 字面量 Unicode 转义留在 skill | 基础扫描命中 | 改成真字符；示例用文字描述，不留下原始 bug 串。 |
| emoji 或中文被写坏 | 回读看到转义或乱码 | 换写入方式，回读到真字符才算通过。 |
| 空文件/截断文件 | 基础扫描或 stat | 立刻恢复内容；查写入命令为何失败。 |
| 假路径/旧路径 | `Test-Path` 或目录读取失败 | 修正文案；不存在就标待建。 |
| 假命令/假参数 | `--help` 找不到 | 改成真实 CLI；未验证就不要写进正式流程。 |
| 外部 ID 编造 | 查不到官方/市场/接口证据 | 标未验证或删掉。 |
| dry-run 当真跑 | 命令清单里只有 dry-run | 交付时写 dry-run 通过，别写真实完成。 |
| 旧状态覆盖新总线 | 最新 seq 与报告矛盾 | 以最新 seq/当前状态修正报告。 |
| bash/PowerShell 编码桥建出乱码目录 | 目录回读出现 mojibake | 停止继续操作，确认目标路径后清理。 |
| 并发改同一文件 | mtime 或总线显示别人刚改 | 重读后再合并，不能覆盖。 |

## 交付回执

交付前给自己生成极简回执；需要时再贴给用户：

```text
自检回执
- 改动文件：...
- 回读：通过/失败
- 自动扫描：通过/失败
- 语法/解析：通过/失败/不适用
- 引用验真：通过/存在待确认
- 命令：真实运行/仅 dry-run/未运行
- 剩余风险：...
```

如果任一项不是“通过”或“不适用”，最终回答必须明说；不能把“还有风险”藏起来。

## 红线

- 不能用“我刚写的所以我知道内容”代替回读。
- 不能用“没有报错”代替解析、运行或验真。
- 不能说“零真实 bug”除非扫描命中已经逐项解释且没有真实残留。
- 不能为了赶进度跳过自检；跳过就等于没有交付。
- 如果被用户指出低级错误，第一步不是辩解，而是回到本 skill 的第 0 步重新跑。
