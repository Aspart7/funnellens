function parseHexColor(hex: string): [number, number, number] {
  const clean = hex.trim().replace(/^#/, "");
  const expanded =
    clean.length === 3
      ? clean
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : clean;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    throw new Error(`Invalid hex color: "${hex}"`);
  }

  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  return [r, g, b];
}

function channelToLinear(channel8Bit: number): number {
  const srgb = channel8Bit / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

/**
 * Computes WCAG 2.1 relative luminance in `[0, 1]`.
 */
export function getRelativeLuminance(hex: string): number {
  const [r, g, b] = parseHexColor(hex);
  return (
    0.2126 * channelToLinear(r) +
    0.7152 * channelToLinear(g) +
    0.0722 * channelToLinear(b)
  );
}

/**
 * Computes WCAG 2.1 contrast ratio between foreground and background hex colors.
 */
export function computeContrastRatio(fgHex: string, bgHex: string): number {
  const l1 = getRelativeLuminance(fgHex);
  const l2 = getRelativeLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * FunnelLens legibility contrast check:
 * - 4.5:1 for normal text
 * - 3.0:1 for large text (>= 24px or >= 19px bold with weight >= 700)
 */
export function meetsLegibilityThreshold(
  ratio: number,
  fontSizePx: number,
  fontWeight: number = 400
): boolean {
  const isLarge = fontSizePx >= 24 || (fontSizePx >= 19 && fontWeight >= 700);
  const minimum = isLarge ? 3.0 : 4.5;
  return ratio >= minimum;
}
