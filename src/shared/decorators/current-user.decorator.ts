import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { AuthTokenPayload } from '@authentication/authentication.types'

export const CurrentUser = createParamDecorator(
  (data: keyof AuthTokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return data ? request.user?.[data] : request.user
  }
)
