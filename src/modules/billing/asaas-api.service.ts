import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance, AxiosError } from 'axios'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface AsaasCustomer {
  id: string
  name: string
  cpfCnpj: string
}

export interface AsaasCreateCustomerInput {
  name: string
  cpfCnpj: string
}

export interface AsaasCreateSubscriptionInput {
  customer: string
  billingType: string
  value: number
  nextDueDate: string
  cycle: string
  externalReference?: string
  callback?: {
    successUrl: string
    autoRedirect?: boolean
    cancelUrl?: string
  }
}

export interface AsaasCreateSubscriptionResult {
  id: string
  status: string
  dateCreated: string
  nextDueDate: string
  value: number
  cycle: string
  billingType: string
  customer: string
  paymentLink: string | null
  checkoutSession: string | null
}

export interface AsaasSubscription {
  id: string
  customer: string
  status: string
  value: number
  nextDueDate: string
  cycle: string
  billingType: string
  deleted: boolean
}

export interface AsaasPayment {
  id: string
  subscription: string
  status: string
  value: number
  dueDate: string
  billingType: string
  invoiceUrl: string | null
}

export interface AsaasListPaymentsResponse {
  data: AsaasPayment[]
  totalCount: number
  offset: number
  limit: number
}

// ─────────────────────────────────────────────
// Error classes
// ─────────────────────────────────────────────

export class AsaasApiError extends Error {
  readonly statusCode: number
  readonly asaasErrors: Array<{ code: string; description: string }> | undefined

  constructor(
    message: string,
    statusCode: number,
    asaasErrors?: Array<{ code: string; description: string }>
  ) {
    super(message)
    this.name = 'AsaasApiError'
    this.statusCode = statusCode
    this.asaasErrors = asaasErrors
  }
}

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────

@Injectable()
export class AsaasApiService {
  private readonly logger = new Logger(AsaasApiService.name)
  private readonly http: AxiosInstance

  constructor(private readonly configService: ConfigService) {
    const env = this.configService.get<string>('ASAAS_ENV', 'sandbox')
    const apiKey = this.configService.get<string>('ASAAS_API_KEY')

    if (!apiKey) {
      throw new Error(
        'ASAAS_API_KEY is not configured. Set it in .env.dev or environment variables.'
      )
    }

    const baseURL =
      env === 'production'
        ? 'https://api.asaas.com'
        : 'https://api-sandbox.asaas.com'

    this.http = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        accept: 'application/json',
        access_token: apiKey
      }
    })
  }

  // ─────────────────────────────────────────────
  // Customers
  // ─────────────────────────────────────────────

  async createCustomer(name: string, cpfCnpj: string): Promise<AsaasCustomer> {
    this.logger.log(`Creating Asaas customer: ${name}`)

    try {
      const response = await this.http.post<AsaasCustomer>('/v3/customers', {
        name,
        cpfCnpj
      })
      return response.data
    } catch (error) {
      throw this.wrapError(error, 'Failed to create Asaas customer')
    }
  }

  // ─────────────────────────────────────────────
  // Subscriptions
  // ─────────────────────────────────────────────

  async createSubscription(
    input: AsaasCreateSubscriptionInput
  ): Promise<AsaasCreateSubscriptionResult> {
    this.logger.log(
      `Creating Asaas subscription for customer: ${input.customer}`
    )

    try {
      const response = await this.http.post<AsaasCreateSubscriptionResult>(
        '/v3/subscriptions',
        input
      )
      return response.data
    } catch (error) {
      throw this.wrapError(error, 'Failed to create Asaas subscription')
    }
  }

  async updateSubscription(
    id: string,
    data: Record<string, unknown>
  ): Promise<void> {
    this.logger.log(`Updating Asaas subscription: ${id}`)

    try {
      await this.http.put(`/v3/subscriptions/${id}`, data)
    } catch (error) {
      throw this.wrapError(error, `Failed to update Asaas subscription: ${id}`)
    }
  }

  async cancelSubscription(id: string): Promise<void> {
    this.logger.log(`Cancelling Asaas subscription: ${id}`)

    try {
      await this.http.delete(`/v3/subscriptions/${id}`)
    } catch (error) {
      throw this.wrapError(error, `Failed to cancel Asaas subscription: ${id}`)
    }
  }

  async getSubscription(id: string): Promise<AsaasSubscription> {
    this.logger.log(`Fetching Asaas subscription: ${id}`)

    try {
      const response = await this.http.get<AsaasSubscription>(
        `/v3/subscriptions/${id}`
      )
      return response.data
    } catch (error) {
      throw this.wrapError(error, `Failed to fetch Asaas subscription: ${id}`)
    }
  }

  // ─────────────────────────────────────────────
  // Payments
  // ─────────────────────────────────────────────

  async getPayment(id: string): Promise<AsaasPayment> {
    this.logger.log(`Fetching Asaas payment: ${id}`)

    try {
      const response = await this.http.get<AsaasPayment>(`/v3/payments/${id}`)
      return response.data
    } catch (error) {
      throw this.wrapError(error, `Failed to fetch Asaas payment: ${id}`)
    }
  }

  async listPaymentsBySubscription(
    subscriptionId: string
  ): Promise<AsaasPayment[]> {
    this.logger.log(
      `Listing Asaas payments for subscription: ${subscriptionId}`
    )

    try {
      const response = await this.http.get<AsaasListPaymentsResponse>(
        '/v3/payments',
        {
          params: { subscription: subscriptionId }
        }
      )
      return response.data.data
    } catch (error) {
      throw this.wrapError(
        error,
        `Failed to list payments for subscription: ${subscriptionId}`
      )
    }
  }

  // ─────────────────────────────────────────────
  // Error handling
  // ─────────────────────────────────────────────

  private wrapError(error: unknown, defaultMessage: string): AsaasApiError {
    if (error instanceof AxiosError && error.response) {
      const statusCode = error.response.status
      const responseData = error.response.data as
        | Record<string, unknown>
        | undefined
      const asaasErrors = responseData?.errors as
        | Array<{ code: string; description: string }>
        | undefined

      const message =
        asaasErrors?.map((e) => `${e.code}: ${e.description}`).join('; ') ??
        defaultMessage

      this.logger.error(`Asaas API error (${statusCode}): ${message}`, {
        statusCode,
        url: error.config?.url,
        method: error.config?.method,
        responseData
      })

      return new AsaasApiError(message, statusCode, asaasErrors)
    }

    this.logger.error(`Asaas API request failed: ${defaultMessage}`, {
      error: error instanceof Error ? error.message : String(error)
    })

    return new AsaasApiError(defaultMessage, 500)
  }
}
