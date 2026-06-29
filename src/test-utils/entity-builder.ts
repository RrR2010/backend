/**
 * Generic builder pattern for creating entities in tests.
 *
 * @example
 * const user = new EntityBuilder<User, CreateUserDto>()
 *   .with({ name: 'Test User' })
 *   .build(createUser, defaultUserProps)
 */
export class EntityBuilder<T, TCreate> {
  private props: Partial<TCreate> = {}

  with(overrides: Partial<TCreate>): this {
    this.props = { ...this.props, ...overrides }
    return this
  }

  build(factory: (props: TCreate) => T, defaults: TCreate): T {
    return factory({ ...defaults, ...this.props })
  }
}
