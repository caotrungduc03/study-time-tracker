/**
 * Parse time string with flexible formats:
 * - 1h20'00'' or 1h20'00
 * - 1h30' or 1h30
 * - 45' or 45
 * - 2h or 2
 */
export function parseTimeString(timeStr: string): number | null {
  let totalSeconds = 0;

  // Remove all spaces
  const cleaned = timeStr.trim().replace(/\s/g, "");

  // Match hours: 1h, 2h, etc.
  const hoursMatch = cleaned.match(/(\d+)h/i);
  if (hoursMatch) {
    totalSeconds += parseInt(hoursMatch[1]) * 3600;
  }

  // Match minutes: 30' or 30
  const minutesMatch = cleaned.match(/(\d+)'/);
  if (minutesMatch) {
    totalSeconds += parseInt(minutesMatch[1]) * 60;
  } else if (!hoursMatch) {
    // If no hour marker and no minute marker, treat the number as minutes
    const numberMatch = cleaned.match(/^(\d+)$/);
    if (numberMatch) {
      totalSeconds += parseInt(numberMatch[1]) * 60;
    }
  }

  // Match seconds: 45'' or 45" (after a minute marker)
  const secondsMatch = cleaned.match(/'(\d+)['"]/);
  if (secondsMatch) {
    totalSeconds += parseInt(secondsMatch[1]);
  }

  return totalSeconds > 0 ? totalSeconds : null;
}

/**
 * Parse date string with flexible formats:
 * - DD/MM/YYYY
 * - D/M/YYYY
 * - DD-MM-YYYY
 */
export function parseDate(dateStr: string): string | null {
  const cleaned = dateStr.trim();

  // Try DD/MM/YYYY or D/M/YYYY format
  const slashMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, "0");
    const month = slashMatch[2].padStart(2, "0");
    const year = slashMatch[3];

    // Validate date
    const date = new Date(`${year}-${month}-${day}`);
    if (!isNaN(date.getTime())) {
      return `${year}-${month}-${day}`;
    }
  }

  // Try DD-MM-YYYY format
  const dashMatch = cleaned.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dashMatch) {
    const day = dashMatch[1].padStart(2, "0");
    const month = dashMatch[2].padStart(2, "0");
    const year = dashMatch[3];

    // Validate date
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
  if (!trimmed || trimmed.startsWith("#")) {
    return null; // Skip empty lines and comments
  }

  const parts = trimmed.split(",");
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
} {
  const lines = text.split("\n");
  const entries: ParsedEntry[] = [];
  const errors: string[] = [];

  lines.forEach((line, index) => {
    if (!line.trim() || line.trim().startsWith("#")) {
      return; // Skip empty lines and comments
    }

    const entry = parseLine(line);
    if (entry) {
      entries.push(entry);
    } else {
      errors.push(`Dòng ${index + 1}: Không thể phân tích "${line}"`);
    }
  });

  return { entries, errors };
}
