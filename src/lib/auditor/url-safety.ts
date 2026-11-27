import { lookup } from "node:dns/promises";
import net from "node:net";

export interface UrlValidationResult {
  valid: boolean;
  normalizedUrl?: string;
  hostname?: string;
  error?: string;
}

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "ip6-loopback",
  "metadata.google.internal",
]);

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map((n) => Number(n));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return true;
  }
  const a = parts[0]!;
  const b = parts[1]!;

  if (a === 0) return true; // 0.0.0.0/8 "this network"
  if (a === 10) return true; // 10.0.0.0/8 RFC1918
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  if (a === 127) return true; // 127.0.0.0/8 loopback
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local & cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 RFC1918
  if (a === 192 && b === 168) return true; // 192.168.0.0/16 RFC1918
  if (a === 192 && b === 0 && (parts[2] === 0 || parts[2] === 2)) return true; // IETF / TEST-NET-1
  if (a >= 224) return true; // Multicast & reserved
  return false;
}

export function isPrivateOrReservedIp(rawIp: string): boolean {
  const cleaned = rawIp.replace(/^\[|\]$/g, "").split("%")[0] ?? rawIp;
  const version = net.isIP(cleaned);
  if (version === 4) {
    return isPrivateIpv4(cleaned);
  }
  if (version === 6) {
    const lower = cleaned.toLowerCase();
    if (lower === "::" || lower === "::1") return true;
    if (lower.startsWith("::ffff:")) {
      const mapped = lower.slice("::ffff:".length);
      if (net.isIPv4(mapped)) {
        return isPrivateIpv4(mapped);
      }
      const hexMatch = /^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(mapped);
      if (hexMatch) {
        const hi = parseInt(hexMatch[1]!, 16);
        const lo = parseInt(hexMatch[2]!, 16);
        const ipv4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
        return isPrivateIpv4(ipv4);
      }
      return true;
    }
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // fc00::/7 ULA
    if (
      lower.startsWith("fe8") ||
      lower.startsWith("fe9") ||
      lower.startsWith("fea") ||
      lower.startsWith("feb")
    ) {
      return true; // fe80::/10 link-local
    }
    if (lower.startsWith("ff")) return true; // multicast
    return false;
  }
  return false;
}

/**
 * Validates and normalizes an external landing page URL against SSRF vectors.
 */
export function validateAuditUrl(input: string): UrlValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: "URL is required." };
  }

  const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed);
  const candidate =
    hasScheme || trimmed.includes(":") ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return { valid: false, error: "Invalid URL syntax." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      valid: false,
      error: "Only http:// and https:// URLs are allowed.",
    };
  }

  if (parsed.username || parsed.password) {
    return {
      valid: false,
      error: "URLs with embedded credentials are not allowed.",
    };
  }

  const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
  if (!host) {
    return { valid: false, error: "URL hostname is missing." };
  }

  if (
    BLOCKED_HOSTNAMES.has(host) ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".localhost")
  ) {
    return {
      valid: false,
      error: "Local or internal hostnames are blocked.",
    };
  }

  const unbracketed = host.replace(/^\[|\]$/g, "");
  if (net.isIP(unbracketed) !== 0) {
    if (isPrivateOrReservedIp(unbracketed)) {
      return {
        valid: false,
        error: "Private, loopback, or metadata IP addresses are blocked.",
      };
    }
  } else if (!host.includes(".")) {
    return {
      valid: false,
      error: "Hostname must be a public domain.",
    };
  }

  return {
    valid: true,
    normalizedUrl: parsed.toString(),
    hostname: host,
  };
}

/**
 * Resolves DNS on the server to ensure a domain does not point to a private IP.
 */
export async function assertPublicHostname(hostname: string): Promise<void> {
  const clean = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (net.isIP(clean) !== 0) {
    if (isPrivateOrReservedIp(clean)) {
      throw new Error("Blocked private/reserved IP address.");
    }
    return;
  }

  const records = await lookup(clean, { all: true });
  if (records.length === 0) {
    throw new Error("Could not resolve target hostname.");
  }

  for (const record of records) {
    if (isPrivateOrReservedIp(record.address)) {
      throw new Error(`Resolved address "${record.address}" is not public.`);
    }
  }
}
