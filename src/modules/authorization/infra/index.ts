/**
 * Authorization Infrastructure Layer
 *
 * This layer contains CASL-specific implementations.
 */
export { CaslAbilityFactory } from './casl-ability.factory';
export type { CaslAbilityFactory } from './casl-ability.factory';

export { CaslDefinitionsLoader } from './casl-definitions.loader';

export type {
  CaslDefinitions,
  CaslSubjectDefinition,
  CaslActionDefinition,
  CaslRuleDefinition,
} from './casl-definitions.loader';