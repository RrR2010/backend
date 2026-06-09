import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PaymentService } from '@payments/payment.service'
import { FakePaymentProvider } from '@payments/providers/fake-payment.provider'

@Module({
  imports: [ConfigModule],
  providers: [
    FakePaymentProvider,
    {
      provide: PaymentService,
      useFactory: (fake: FakePaymentProvider) => {
        return fake
      },
      inject: [FakePaymentProvider]
    }
  ],
  exports: [PaymentService]
})
export class PaymentModule {}
