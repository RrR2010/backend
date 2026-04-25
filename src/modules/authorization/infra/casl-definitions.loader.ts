/**
 * CASL Definitions Loader
 *
 * Loads CASL subject definitions and rules.
 * This provides a way to centralize and load permission definitions.
 */
import { Injectable } from '@nestjs/common';
import { PermissionSubject, PermissionAction } from '@core/domain/authorization';

/**
 * CASL subject definition
 */
export interface CaslSubjectDefinition {
  /** Subject type name */
  type: string;

  /** Human-readable name */
  displayName: string;

  /** Fields that can be queried */
  fields?: string[];

  /** Additional options */
  options?: {
    /** Whether to allow conditions on this subject */
    allowConditions?: boolean;

    /** Whether instances can be loaded */
    loadable?: boolean;
  };
}

/**
 * CASL action definition
 */
export interface CaslActionDefinition {
  /** Action name */
  action: PermissionAction | 'manage';

  /** Human-readable name */
  displayName: string;
}

/**
 * CASL rule definition
 */
export interface CaslRuleDefinition {
  /** Action to allow */
  action: PermissionAction | 'manage';

  /** Subject to allow */
  subject: string | 'all';

  /** Optional conditions */
  conditions?: Record<string, unknown>;

  /** Optional field restrictions */
  fields?: string[];
}

/**
 * CASL definitions container
 */
export interface CaslDefinitions {
  /** Available subjects */
  subjects: CaslSubjectDefinition[];

  /** Available actions */
  actions: CaslActionDefinition[];

  /** Default rules for each role */
  roleRules: Record<string, CaslRuleDefinition[]>;
}

/**
 * Default CASL definitions
 */
const DEFAULT_DEFINITIONS: CaslDefinitions = {
  subjects: [
    {
      type: PermissionSubject.User,
      displayName: 'User',
      fields: ['id', 'email', 'name', 'createdAt'],
    },
    {
      type: PermissionSubject.Tenant,
      displayName: 'Tenant',
      fields: ['id', 'name', 'slug', 'createdAt'],
    },
    {
      type: 'Membership',
      displayName: 'Membership',
      fields: ['id', 'userId', 'tenantId', 'role', 'createdAt'],
    },
  ],
  actions: [
    { action: PermissionAction.Create, displayName: 'Create' },
    { action: PermissionAction.Read, displayName: 'Read' },
    { action: PermissionAction.Update, displayName: 'Update' },
    { action: PermissionAction.Delete, displayName: 'Delete' },
    { action: PermissionAction.Manage, displayName: 'Manage' },
  ],
  roleRules: {
    PLATFORM_ADMIN: [
      { action: 'manage', subject: 'all' },
    ],
    PLATFORM_USER: [
      { action: PermissionAction.Read, subject: 'User' },
      { action: PermissionAction.Read, subject: 'Tenant' },
    ],
    TENANT_OWNER: [
      { action: 'manage', subject: 'all' },
    ],
    TENANT_ADMIN: [
      { action: 'manage', subject: 'all' },
    ],
    TENANT_USER: [
      { action: PermissionAction.Read, subject: 'all' },
      { action: PermissionAction.Create, subject: 'all' },
      { action: PermissionAction.Update, subject: 'all' },
    ],
    TENANT_VIEWER: [
      { action: PermissionAction.Read, subject: 'all' },
    ],
  },
};

/**
 * CaslDefinitionsLoader
 *
 * Loads and manages CASL subject definitions.
 */
@Injectable()
export class CaslDefinitionsLoader {
  private definitions: CaslDefinitions;

  constructor() {
    this.definitions = DEFAULT_DEFINITIONS;
  }

  /**
   * Get all definitions
   */
  getDefinitions(): CaslDefinitions {
    return this.definitions;
  }

  /**
   * Get subject definitions
   */
  getSubjects(): CaslSubjectDefinition[] {
    return this.definitions.subjects;
  }

  /**
   * Get action definitions
   */
  getActions(): CaslActionDefinition[] {
    return this.definitions.actions;
  }

  /**
   * Get rules for a specific role
   */
  getRulesForRole(role: string): CaslRuleDefinition[] {
    const upperRole = role.toUpperCase();
    return this.definitions.roleRules[upperRole] || [];
  }

  /**
   * Get a subject by type
   */
  getSubject(type: string): CaslSubjectDefinition | undefined {
    return this.definitions.subjects.find(s => s.type === type);
  }

  /**
   * Get an action by name
   */
  getAction(action: string): CaslActionDefinition | undefined {
    return this.definitions.actions.find(a => a.action === action);
  }
}