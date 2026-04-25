/**
 * AuthorizationModule
 *
 * Central module for authorization concerns.
 * Wires together domain interfaces, application services, and infrastructure implementations.
 */
import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Domain implementations
import { DefaultAbilityFactory } from './domain/ability.factory';
import { InMemoryPolicyRegistry } from './domain/policy.registry';
import { ReflectorAuthorizationMetadata } from './domain/authorization-metadata';

// Infrastructure
import { CaslAbilityFactory } from './infra/casl-ability.factory';
import { CaslDefinitionsLoader } from './infra/casl-definitions.loader';

// Application
import { AuthorizationService } from './application/authorization.service';

// Interface
import { AuthorizationGuard } from './interface/authorization.guard';

// Import injection tokens
import { ABILITY_FACTORY, POLICY_REGISTRY, AUTHORIZATION_METADATA } from './domain';

// Re-export public API for consumers
export { AuthorizationService } from './application/authorization.service';
export type { CreateContextOptions, PermissionCheckResult } from './application/authorization.service';

export { AuthorizationGuard } from './interface/authorization.guard';
export { Authorize, Check, Public, Guest } from './interface/authorization.decorator';
export type { AuthorizeOptions } from './interface/authorization.decorator';

export { CaslAbilityFactory } from './infra/casl-ability.factory';
export { CaslDefinitionsLoader } from './infra/casl-definitions.loader';

export type {
  CaslDefinitions,
  CaslSubjectDefinition,
  CaslActionDefinition,
  CaslRuleDefinition,
} from './infra/index';

/**
 * AuthorizationModule
 *
 * Central module for authorization concerns.
 */
@Module({
  imports: [],
  providers: [
    // Domain - default implementations (can be overridden)
    DefaultAbilityFactory,
    {
      provide: ABILITY_FACTORY,
      useExisting: CaslAbilityFactory,
    },
    InMemoryPolicyRegistry,
    {
      provide: POLICY_REGISTRY,
      useClass: InMemoryPolicyRegistry,
    },
    ReflectorAuthorizationMetadata,
    {
      provide: AUTHORIZATION_METADATA,
      useClass: ReflectorAuthorizationMetadata,
    },

    // Infrastructure - CASL implementations
    CaslAbilityFactory,
    CaslDefinitionsLoader,

    // Application - orchestration
    AuthorizationService,

    // Interface - guards
    AuthorizationGuard,

    // NestJS core dependencies
    Reflector,
  ],
  exports: [
    // Domain exports with tokens
    ABILITY_FACTORY,
    POLICY_REGISTRY,
    AUTHORIZATION_METADATA,

    // Implementation exports
    CaslAbilityFactory,
    CaslDefinitionsLoader,
    AuthorizationService,

    // Guard export (for use in other modules)
    AuthorizationGuard,
  ],
})
export class AuthorizationModule {}