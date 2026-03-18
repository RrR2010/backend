export class Email {
  private constructor(private readonly _value: string) {}

  static from(value: string): Email {
    if (!value) {
      throw new Error('Email cannot be empty');
    }

    const normalizedValue = value.trim().toLowerCase();

    if (!Email.isValid(normalizedValue)) {
      throw new Error('Invalid email format');
    }

    return new Email(normalizedValue);
  }

  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }
}
