import ms, { StringValue } from 'ms'

import { InvalidEnvValueError } from '@shared/errors/value-object.errors'

/**
 * Parses an env value into milliseconds (number).
 *
 * Supported inputs:
 * - number (e.g., 900000)
 * - numeric string (e.g., "900000")
 * - ms string (e.g., "15m", "7d")
 *
 * Throws if value is invalid and no fallback is provided.
 */
export function parseMsEnv(
  value: unknown,
  fallback?: number | StringValue
): number {
  // 1) Try direct number
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  // 2) Try numeric string (e.g., "900000")
  if (typeof value === 'string') {
    const asNumber = Number(value)
    if (!Number.isNaN(asNumber)) {
      return asNumber
    }

    // 3) Try ms string (e.g., "7d", "15m")
    const parsed = ms(value as StringValue)
    if (typeof parsed === 'number') {
      return parsed
    }
  }

  // 4) Fallback (same logic recursively, but guaranteed valid or throws)
  if (fallback !== undefined) {
    return parseMsEnv(fallback)
  }

  // 5) Fail fast
  throw new InvalidEnvValueError(String(value))
}
