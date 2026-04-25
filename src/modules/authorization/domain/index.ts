/**
 * Authorization Domain Layer - index
 */
export { Ability, AbilityFactory, ABILITY_FACTORY, DefaultAbilityFactory } from './ability.factory';

export type { Ability as IAbility, AbilityFactory as IAbilityFactory } from './ability.factory';

export { Policy, PolicyRegistry, POLICY_REGISTRY, InMemoryPolicyRegistry } from './policy.registry';

export type { Policy as IPolicy, PolicyRegistry as IPolicyRegistry } from './policy.registry';

export {
  AuthorizationMetadata,
  AuthorizationMetadataService,
  AUTHORIZATION_METADATA,
  ReflectorAuthorizationMetadata,
} from './authorization-metadata';

export type {
  AuthorizationMetadata as IAuthorizationMetadata,
  AuthorizationMetadataService as IAuthorizationMetadataService,
} from './authorization-metadata';