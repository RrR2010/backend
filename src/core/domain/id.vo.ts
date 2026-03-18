import { randomUUID } from 'crypto';

export class Id {
  private constructor(private readonly _value: string) {}

  static generate(): Id {
    return new Id(randomUUID());
  }

  static from(value: string): Id {
    if (!value || value.trim().length === 0) {
      throw new Error('Id cannot be empty');
    }
    return new Id(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Id): boolean {
    return this._value === other.value;
  }
}
