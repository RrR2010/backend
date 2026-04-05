/**
 * Base class for all domain errors
 * Keeps domain independent from HTTP
 */
export abstract class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
  }
}
