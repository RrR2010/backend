/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Prisma } from '@prisma/client'
import { ClsContextService } from '@shared/cls/cls-context.service'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { TENANT_SCOPED_MODELS } from './tenant-scoped-models.config'

export function createTenantFilterExtension(
  clsContextService: ClsContextService
) {
  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      name: 'tenant-filter',
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            if (!TENANT_SCOPED_MODELS.has(model)) {
              return query(args)
            }

            const ctx = clsContextService.getRequestContext()
            if (!ctx) return query(args)

            const tid = getEffectiveTenantId(ctx)
            if (!tid) return query(args)

            // LEITURA: findUnique/findUniqueOrThrow → findFirst/findFirstOrThrow
            if (['findUnique', 'findUniqueOrThrow'].includes(operation)) {
              args.where = { ...(args.where ?? {}), tenantId: tid }
              const newOp =
                operation === 'findUnique' ? 'findFirst' : 'findFirstOrThrow'
              // Convert PascalCase model name to camelCase (lowercase first letter)
              const modelKey = model.charAt(0).toLowerCase() + model.slice(1)
              return (prisma as any)[modelKey][newOp](args)
            }

            // findFirst, findFirstOrThrow, findMany, count, aggregate, groupBy
            if (
              [
                'findFirst',
                'findFirstOrThrow',
                'findMany',
                'count',
                'aggregate',
                'groupBy'
              ].includes(operation)
            ) {
              args.where = { ...(args.where ?? {}), tenantId: tid }
            } else if (['create', 'createMany'].includes(operation)) {
              if (operation === 'create') {
                ;(args as any).data = {
                  ...(args as any).data,
                  tenantId: tid
                }
              } else {
                ;(args as any).data = (args as any).data.map(
                  (item: Record<string, unknown>) => ({
                    ...item,
                    tenantId: tid
                  })
                )
              }
            } else if (
              ['update', 'updateMany', 'delete', 'deleteMany'].includes(
                operation
              )
            ) {
              args.where = { ...(args.where ?? {}), tenantId: tid }
            } else if (operation === 'upsert') {
              args.where = { ...(args.where ?? {}), tenantId: tid }
              ;(args as any).create = {
                ...(args as any).create,
                tenantId: tid
              }
              ;(args as any).update = {
                ...(args as any).update,
                tenantId: tid
              }
            }

            return query(args)
          }
        }
      }
    })
  )
}
