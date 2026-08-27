// Host plugin: copy the four SKILL.md packs into ~/.dsh/skills/ on boot.
// cordis: never read undeclared ctx properties; never throw from apply.

import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const name = 'agent-discipline-skills';
export const inject = [];

const SKILLS = [
  'deepcode-review',
  'agent-course-correction',
  'systematic-debugging',
  'deepcode-collab',
];

export function pluginRoot() {
  return join(dirname(fileURLToPath(import.meta.url)), '..');
}

export function installSkills(destRoot = join(homedir(), '.dsh', 'skills')) {
  const srcRoot = join(pluginRoot(), 'skills');
  mkdirSync(destRoot, { recursive: true });
  const installed = [];
  for (const skill of SKILLS) {
    const from = join(srcRoot, skill);
    if (!existsSync(join(from, 'SKILL.md'))) continue;
    cpSync(from, join(destRoot, skill), { recursive: true });
    installed.push(skill);
  }
  return { destRoot, installed, available: readdirSync(srcRoot) };
}

export function apply(_ctx) {
  try {
    const result = installSkills();
    console.log(
      `[agent-discipline-skills] copied ${result.installed.join(', ')} → ${result.destRoot}`,
    );
  } catch (err) {
    try {
      console.error(
        `[agent-discipline-skills] apply failed (ignored): ${(err && err.message) || err}`,
      );
    } catch {
      /* last resort */
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = installSkills();
  console.log(`copied ${result.installed.join(', ')} → ${result.destRoot}`);
}
