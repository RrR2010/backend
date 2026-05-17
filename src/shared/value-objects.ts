import { randomUUID } from 'crypto'

import {
  InvalidUuidError,
  EmailEmptyError,
  EmailFormatError
} from '@shared/errors/value-object.errors'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export class Id {
  private constructor(private readonly _value: string) {}

  static generate(): Id {
    return new Id(randomUUID())
  }

  static from(value: string): Id {
    if (!value || !UUID_REGEX.test(value)) {
      throw new InvalidUuidError()
    }
    return new Id(value)
  }

  get value(): string {
    return this._value
  }

  toString(): string {
    return this._value
  }

  toJSON(): string {
    return this._value
  }

  equals(other?: Id): boolean {
    if (!other) return false
    return this._value === other._value
  }
}

export class Email {
  private constructor(private readonly _value: string) {}

  static from(value: string): Email {
    if (!value) {
      throw new EmailEmptyError()
    }

    const normalizedValue = value.trim().toLowerCase()

    if (!Email.isValid(normalizedValue)) {
      throw new EmailFormatError()
    }

    return new Email(normalizedValue)
  }

  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  get value(): string {
    return this._value
  }

  equals(other: Email): boolean {
    return this._value === other._value
  }
}
