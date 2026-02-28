/**
 * Parse time string with strictly supported formats:
 * - HH:mm:ss (example: 01:20:00)
 * - XhY'Z'' (example: 1h20'00'')
 */
export function parseTimeString(timeStr: string): number | null {
  const cleaned = timeStr.trim().replace(/\s/g, '');

  const colonMatch = cleaned.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
  if (colonMatch) {
    const h = parseInt(colonMatch[1]);
    const m = parseInt(colonMatch[2]);
    const s = parseInt(colonMatch[3]);
    return h * 3600 + m * 60 + s;
  }

  const complexMatch = cleaned.match(/^(\d+)h(\d+)'(\d+)''$/);
  if (complexMatch) {
    const h = parseInt(complexMatch[1]);
    const m = parseInt(complexMatch[2]);
    const s = parseInt(complexMatch[3]);
    return h * 3600 + m * 60 + s;
  }

  return null;
}

/**
 * Parse date string with strictly supported formats:
 * - DD/MM/YYYY
 * - YYYY-MM-DD (ISO)
 */
export function parseDate(dateStr: string): string | null {
  const cleaned = dateStr.trim();

  const isoMatch = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = isoMatch[2].padStart(2, '0');
    const day = isoMatch[3].padStart(2, '0');

    const date = new Date(`${year}-${month}-${day}`);
    if (!isNaN(date.getTime())) {
      return `${year}-${month}-${day}`;
    }
  }

  const slashMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    const year = slashMatch[3];

    const date = new Date(`${year}-${month}-${day}`);
    if (!isNaN(date.getTime())) {
      return `${year}-${month}-${day}`;
    }
  }

  return null;
}

export interface ParsedEntry {
  date: string;
  durationSeconds: number;
  raw: string;
}

/**
 * Parse a single line: date,duration
 */
export function parseLine(line: string): ParsedEntry | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    return null; // Skip empty lines and comments
  }

  const parts = trimmed.split(',');
  if (parts.length !== 2) {
    return null;
  }

  const dateStr = parts[0].trim();
  const timeStr = parts[1].trim();

  const date = parseDate(dateStr);
  if (!date) {
    return null;
  }

  const durationSeconds = parseTimeString(timeStr);
  if (!durationSeconds) {
    return null;
  }

  return {
    date,
    durationSeconds,
    raw: trimmed,
  };
}

/**
 * Parse multiple lines of import data
 */
export function parseImportData(text: string): {
  entries: ParsedEntry[];
  errors: string[];
  duplicatesCount: number;
} {
  const lines = text.split('\n');
  const entriesMap = new Map<string, ParsedEntry>();
  const errors: string[] = [];
  let duplicatesCount = 0;

  lines.forEach((line, index) => {
    if (!line.trim() || line.trim().startsWith('#')) {
      return; // Skip empty lines and comments
    }

    const entry = parseLine(line);
    if (entry) {
      if (entriesMap.has(entry.date)) {
        duplicatesCount++;
      }
      entriesMap.set(entry.date, entry);
    } else {
      errors.push(`Dòng ${index + 1}: Không thể phân tích "${line}"`);
    }
  });

  return {
    entries: Array.from(entriesMap.values()),
    errors,
    duplicatesCount,
  };
}
