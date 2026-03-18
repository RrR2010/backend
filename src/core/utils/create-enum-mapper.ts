/**
 * Creates a bidirectional map between two string enums.
 *
 * Example:
 * const map = createEnumMapper({
 *   ACTIVE: UserStatus.ACTIVE,
 *   INACTIVE: UserStatus.INACTIVE,
 * });
 *
 * map.toDomain('ACTIVE') -> UserStatus.ACTIVE
 * map.toPersistence(UserStatus.ACTIVE) -> 'ACTIVE'
 */
export function createEnumMapper<
  TPrisma extends string,
  TDomain extends string,
>(mapping: Record<TPrisma, TDomain>) {
  const reverseMapping: Record<TDomain, TPrisma> = {} as Record<
    TDomain,
    TPrisma
  >;

  for (const key in mapping) {
    const value = mapping[key];
    reverseMapping[value] = key;
  }

  return {
    toDomain(prismaValue: TPrisma): TDomain {
      return mapping[prismaValue];
    },

    toPersistence(domainValue: TDomain): TPrisma {
      return reverseMapping[domainValue];
    },
  };
}
