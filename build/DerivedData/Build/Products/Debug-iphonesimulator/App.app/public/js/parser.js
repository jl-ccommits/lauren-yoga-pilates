import { COLOR_CYCLE, EQUIPMENT } from './templates.js?v=20260523-schedule';

export function detectEquipment(text) {
  const lower = (text || '').toLowerCase();
  return Object.keys(EQUIPMENT).filter(key => {
    if (key === 'weights') return /\b(weight|weights|dumbbell|dumbbells)\b/.test(lower);
    return new RegExp(`\\b${key}\\b`).test(lower);
  });
}

export function guessEmoji(text, fallback = '✨') {
  const lower = (text || '').toLowerCase();
  if (/warm|breath|savasana|stretch|child|rest/.test(lower)) return '🧘‍♀️';
  if (/pulse|burn|fire/.test(lower)) return '🔥';
  if (/bridge|glute|booty|hip/.test(lower)) return '🍑';
  if (/plank|pushup|tricep|arm|curl|press|weight/.test(lower)) return '💪';
  if (/lunge|leg|kick|squat|chair|warrior/.test(lower)) return '🦵';
  if (/twist|circle|flow|mandala/.test(lower)) return '🌀';
  if (/ball/.test(lower)) return '🏐';
  if (/balance|tree|half moon/.test(lower)) return '⚖️';
  return fallback;
}

function unescapeStepName(value) {
  return value.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

function quoteStepName(value) {
  const text = String(value || 'Exercise');
  if (!/["|]| :: | — | – | - /.test(text)) return text;
  return `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

export function parseStepLine(line) {
  let raw = line.replace(/^[-*•]\s*/, '').trim();
  raw = raw.replace(/^(?:\d+[.)]|[a-z][.)]|☐|☑|✓)\s+/i, '').trim();
  const tags = [];
  if (/\[(pulse|pulses)\]/i.test(raw) || /\bpuls(e|es|ing)\b/i.test(raw)) tags.push('pulse');
  raw = raw.replace(/\[(pulse|pulses)\]/ig, '').trim();

  const separators = [' :: ', ' | ', ' — ', ' – ', ' - ', ': '];
  let name = '';
  let detail = '';

  if (raw.startsWith('"')) {
    let escaped = false;
    let end = -1;
    for (let i = 1; i < raw.length; i++) {
      if (escaped) {
        escaped = false;
      } else if (raw[i] === '\\') {
        escaped = true;
      } else if (raw[i] === '"') {
        end = i;
        break;
      }
    }
    if (end > 0) {
      name = unescapeStepName(raw.slice(1, end)).trim();
      let rest = raw.slice(end + 1).trim();
      const sep = separators.find(candidate => rest.startsWith(candidate.trim()));
      if (sep) rest = rest.slice(sep.trim().length).trim();
      detail = rest;
    }
  }

  if (!name) {
    const sep = separators.find(candidate => raw.includes(candidate));
    const parts = sep ? raw.split(sep) : [raw];
    name = (parts.shift() || 'Exercise').trim();
    detail = parts.join(sep || '').trim();
  }

  return { name, detail, emoji: guessEmoji(`${name} ${detail}`), tags };
}

function normalizeNoteLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('---')) return trimmed;
  return trimmed
    .replace(/^[-*•◦▪▫‣]\s*/, '')
    .replace(/^(?:\d+[.)]|[a-z][.)]|☐|☑|✓)\s+/i, '')
    .trim();
}

function words(value) {
  return String(value || '').split(/\s+/).filter(Boolean);
}

function cleanHeading(value) {
  return String(value || '').replace(/:$/, '').trim();
}

function inferDiscipline(text, fallback) {
  if (/pilates/i.test(text)) return 'pilates';
  if (/yoga|sculpt|vinyasa|sun sal/i.test(text)) return 'yoga';
  return fallback || 'custom';
}

function isTitleCandidate(value) {
  const text = cleanHeading(value);
  return /\b(yoga|pilates|sculpt|class|flow|barre|mat)\b/i.test(text)
    || /^(mon|tues|wed|thurs|fri|sat|sun)(day)?\b/i.test(text)
    || /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(text)
    || /^\d{1,2}[/-]\d{1,2}/.test(text);
}

function isTransitionLine(value) {
  const text = cleanHeading(value);
  const lower = text.toLowerCase();
  if (/^transition\b/.test(lower)) return true;
  if (words(text).length > 8) return false;
  return /^(grab|get|switch|remove|put away|drop|change|flip|turn over|move to|come to|set up|reset)\b/.test(lower);
}

function isAllCapsHeading(value) {
  const letters = value.replace(/[^a-z]/gi, '');
  return letters.length >= 3 && letters === letters.toUpperCase();
}

function isCommonHeading(value) {
  const text = cleanHeading(value);
  if (!text) return false;
  if (/[|]/.test(text)) return false;
  if (words(text).length > 7) return false;
  if (/:$/.test(value.trim())) return true;
  if (isAllCapsHeading(text)) return true;
  return /\b(warm|warmup|warm-up|opening|breath|core|abs|bridge|glute|booty|standing|side|sideline|tabletop|arms?|weights?|ball|band|flow|sun|balance|cool|cooldown|stretch|final|block|round|series|legs?|floor|mat|chair|warrior|plank)\b/i.test(text);
}

function isBlankSectionHeading(entry, currentBlock, nextEntry) {
  if (!entry.blankBefore || !nextEntry) return false;
  if (!currentBlock) return words(entry.text).length <= 7;
  if ((currentBlock.steps || []).length < 2) return false;
  return words(entry.text).length <= 6 && !/[|]/.test(entry.text);
}

function noteEntries(text) {
  const entries = [];
  let blankBefore = true;
  text.split('\n').forEach(line => {
    const normalized = normalizeNoteLine(line);
    if (!normalized) {
      blankBefore = true;
      return;
    }
    entries.push({ text: normalized, blankBefore });
    blankBefore = false;
  });
  return entries;
}

export function parseQuickBuild(text, startingDiscipline = 'custom') {
  const entries = noteEntries(text);
  const blocks = [];
  let currentBlock = null;
  let colorIdx = 0;
  let name = '';
  let discipline = startingDiscipline || 'custom';

  const startBlock = title => {
    const equipment = detectEquipment(title);
    currentBlock = {
      type: 'block',
      id: `block${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      title: title || 'Section',
      emoji: guessEmoji(title),
      equipment,
      color: COLOR_CYCLE[colorIdx % COLOR_CYCLE.length],
      steps: [],
    };
    colorIdx++;
    blocks.push(currentBlock);
  };

  entries.forEach((entry, index) => {
    const trimmed = entry.text.trim();
    const nextEntry = entries[index + 1];
    if (!trimmed) return;

    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      name = trimmed.slice(2).trim();
      discipline = inferDiscipline(name, discipline);
      return;
    }

    if (!name && blocks.length === 0 && !currentBlock && isTitleCandidate(trimmed) && !trimmed.startsWith('## ')) {
      name = cleanHeading(trimmed);
      discipline = inferDiscipline(name, discipline);
      return;
    }

    if (trimmed === '---' || trimmed.startsWith('--- ') || isTransitionLine(trimmed)) {
      blocks.push({
        type: 'transition',
        id: `t${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
        title: cleanHeading(trimmed.replace(/^---\s*/, '').replace(/^transition:?\s*/i, '')) || 'Transition',
        emoji: '🔀',
        equipment: [],
        color: 'var(--surface2)',
        steps: [],
      });
      currentBlock = null;
      return;
    }

    const explicitHeading = trimmed.startsWith('## ') || /:$/.test(trimmed) || isAllCapsHeading(cleanHeading(trimmed));
    const inferredHeading = (!currentBlock || entry.blankBefore) && isCommonHeading(trimmed);
    if (explicitHeading || inferredHeading || isBlankSectionHeading(entry, currentBlock, nextEntry)) {
      startBlock(cleanHeading(trimmed.replace(/^##\s*/, '')));
      return;
    }

    if (/^@(equipment|gear):?/i.test(trimmed)) {
      if (!currentBlock) startBlock('Section');
      currentBlock.equipment = [
        ...new Set([...(currentBlock.equipment || []), ...detectEquipment(trimmed)]),
      ];
      return;
    }

    if (!currentBlock) startBlock('Section');
    const step = parseStepLine(trimmed);
    currentBlock.steps.push(step);
    currentBlock.equipment = [
      ...new Set([
        ...(currentBlock.equipment || []),
        ...detectEquipment(`${step.name} ${step.detail}`),
      ]),
    ];
  });

  return { name, discipline, blocks };
}

export function formatQuickBuildText(text, startingDiscipline = 'custom', fallbackName = 'Class Plan') {
  const parsed = parseQuickBuild(text, startingDiscipline);
  if (!parsed.blocks.length) return '';
  return routineToText({
    routineName: parsed.name || fallbackName || 'Class Plan',
    blocks: parsed.blocks,
  });
}

export function routineToText(state) {
  const lines = [`# ${state.routineName}`, ''];
  state.blocks.forEach(block => {
    if (block.type === 'transition') {
      lines.push(`--- ${block.title.replace(/^Transition:\s*/i, '')}`, '');
      return;
    }

    lines.push(`## ${block.title || 'Section'}`);
    if ((block.equipment || []).length) {
      lines.push(`@equipment: ${block.equipment.join(', ')}`);
    }
    (block.steps || []).forEach(step => {
      const tag = (step.tags || []).includes('pulse') ? ' [pulse]' : '';
      lines.push(`- ${quoteStepName(step.name)}${step.detail ? ` | ${step.detail}` : ''}${tag}`);
    });
    lines.push('');
  });
  return lines.join('\n').trim();
}
