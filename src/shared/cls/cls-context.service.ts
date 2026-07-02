import { Injectable } from '@nestjs/common'
import { ClsService } from 'nestjs-cls'
import { RequestContext } from '@authorization/authorization.types'

export const CLS_REQUEST_CONTEXT_KEY = 'requestContext'

@Injectable()
export class ClsContextService {
  constructor(private readonly cls: ClsService) {}

  setRequestContext(ctx: RequestContext): void {
    this.cls.set(CLS_REQUEST_CONTEXT_KEY, ctx)
  }

  getRequestContext(): RequestContext | undefined {
    return this.cls.get(CLS_REQUEST_CONTEXT_KEY)
  }
}
