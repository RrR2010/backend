/**
 * Creates a mock repository with standard CRUD methods.
 * Returned object is loosely typed; cast to the specific repository interface in tests.
 *
 * @example
 * const mockRepo = createMockRepository<Ingredient_TE>() as unknown as IngredientRepository
 */
export function createMockRepository<T>() {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
  } as any
}
