import { Global, Module } from '@nestjs/common'
import { ClsModule as NestjsClsModule } from 'nestjs-cls'
import { ClsContextService } from './cls-context.service'

@Global()
@Module({
  imports: [
    NestjsClsModule.forRoot({
      global: true,
      middleware: { mount: true }
    })
  ],
  providers: [ClsContextService],
  exports: [ClsContextService]
})
export class ClsModule {}
