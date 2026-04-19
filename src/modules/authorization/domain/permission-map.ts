export type PermissionKey = `${string}.${string}`;

export const platformRolePermissions = {
  ADMIN: ['Tenant.manage', 'User.manage', 'Tenant.read'],
  USER: ['Tenant.read'],
} as const;

export const tenantRolePermissions = {
  ADMIN: ['Ingredient.manage', 'Product.manage', 'User.manage'],
  USER: ['Ingredient.read', 'Product.read'],
} as const;
