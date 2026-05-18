import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PaymentService } from '@payments/payment.service'
import { FakePaymentProvider } from '@payments/providers/fake-payment.provider'
import { MercadoPagoProvider } from '@payments/providers/mercado-pago.provider'

@Module({
  imports: [ConfigModule],
  providers: [
    FakePaymentProvider,
    MercadoPagoProvider,
    {
      provide: PaymentService,
      useFactory: (
        config: ConfigService,
        fake: FakePaymentProvider,
        mp: MercadoPagoProvider
      ) => {
        const provider = config.get<string>('PAYMENT_PROVIDER', 'fake')
        if (provider === 'mercadopago') return mp
        return fake
      },
      inject: [ConfigService, FakePaymentProvider, MercadoPagoProvider]
    }
  ],
  exports: [PaymentService]
})
export class PaymentModule {}
