/**
 * Fails the build if a published concept cites an unverified source.
 *
 * Al-Mizan guards its documented schema counts with a CI assertion because
 * hand audits kept getting them wrong. Citations deserve the same
 * treatment: a reader cannot tell a verified reference from an invented
 * one, so the check has to be mechanical.
 *
 *   npm run check:citations
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const CONCEPTS_DIR = 'src/content/concepts';

export interface Grounding {
  type: string;
  ref: string;
  status: string;
}

export interface ConceptFile {
  file: string;
  draft: boolean;
  grounding: Grounding[];
}

export interface Violation {
  file: string;
  message: string;
}

export function findViolations(entries: ConceptFile[]): Violation[] {
  const violations: Violation[] = [];
  for (const entry of entries) {
    if (entry.draft) continue;
    if (entry.grounding.length === 0) {
      violations.push({
        file: entry.file,
        message: 'published with no grounding - a mapping must cite something',
      });
      continue;
    }
    for (const g of entry.grounding) {
      if (g.status !== 'verified') {
        violations.push({
          file: entry.file,
          message: `cites "${g.ref}" with status ${g.status} - verify it or mark the concept draft`,
        });
      }
    }
  }
  return violations;
}

/**
 * Minimal frontmatter reader for just the fields this check needs.
 * Defaults to draft when the field is absent, matching the Zod schema -
 * defaulting to published would let an un-flagged file bypass the check.
 */
export function parseConcept(file: string, source: string): ConceptFile {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  const fm = match ? match[1] : '';

  const draftLine = /^draft:\s*(\S+)\s*$/m.exec(fm);
  const draft = draftLine ? draftLine[1] !== 'false' : true;

  const grounding: Grounding[] = [];
  const block = /^grounding:[ \t]*\r?\n([\s\S]*?)(?=^\S|\Z)/m.exec(fm + '\n');
  if (block) {
    for (const item of block[1].split(/^[ \t]*-[ \t]+/m).slice(1)) {
      grounding.push({
        type: /type:\s*"?([^"\n]*)"?/.exec(item)?.[1]?.trim() ?? '',
        ref: /ref:\s*"?([^"\n]*?)"?\s*$/m.exec(item)?.[1]?.trim() ?? '',
        status: /status:\s*"?([^"\n]*)"?/.exec(item)?.[1]?.trim() ?? '',
      });
    }
  }
  return { file, draft, grounding };
}

async function main(): Promise<number> {
  let names: string[];
  try {
    names = (await readdir(CONCEPTS_DIR)).filter(n => n.endsWith('.md'));
  } catch {
    console.log(`No ${CONCEPTS_DIR} directory - nothing to check.`);
    return 0;
  }

  const entries: ConceptFile[] = [];
  for (const name of names) {
    entries.push(parseConcept(name, await readFile(join(CONCEPTS_DIR, name), 'utf8')));
  }

  const violations = findViolations(entries);
  if (violations.length > 0) {
    console.error('Unverified citations on published concepts:\n');
    for (const v of violations) console.error(`  ${v.file}: ${v.message}`);
    console.error(
      '\nA published concept must cite only verified sources. Fetch the ' +
      'citation from canonical data and set status: verified, or set ' +
      'draft: true until you have.',
    );
    return 1;
  }

  console.log(`Citations clean: ${entries.length} concept(s) checked.`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(await main());
}
