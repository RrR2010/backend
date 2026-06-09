import { ConfigService } from '@nestjs/config'
import { AsaasApiService, AsaasApiError } from './asaas-api.service'
import axios from 'axios'

// Keep real AxiosError for instanceof checks but mock axios.create
jest.mock('axios', () => {
  const realAxios = jest.requireActual('axios')
  return {
    ...realAxios,
    create: jest.fn()
  }
})

const { AxiosError } = jest.requireActual('axios')

describe('AsaasApiService', () => {
  let service: AsaasApiService
  let configService: jest.Mocked<ConfigService>
  let mockHttp: {
    post: jest.Mock
    get: jest.Mock
    put: jest.Mock
    delete: jest.Mock
  }

  beforeEach(() => {
    configService = {
      get: jest.fn()
    } as unknown as jest.Mocked<ConfigService>
    configService.get.mockImplementation(
      (key: string, defaultValue?: unknown) => {
        if (key === 'ASAAS_API_KEY') return 'test-api-key'
        if (key === 'ASAAS_ENV') return 'sandbox'
        return defaultValue
      }
    )

    mockHttp = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    }
    ;(axios.create as jest.Mock).mockReturnValue(mockHttp)

    service = new AsaasApiService(configService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ===================== createCustomer =====================

  describe('createCustomer', () => {
    it('should create a customer and return the result', async () => {
      const apiResponse = {
        data: { id: 'cus_123', name: 'John Doe', cpfCnpj: '12345678901' }
      }
      mockHttp.post.mockResolvedValue(apiResponse)

      const result = await service.createCustomer('John Doe', '12345678901')

      expect(mockHttp.post).toHaveBeenCalledWith('/v3/customers', {
        name: 'John Doe',
        cpfCnpj: '12345678901'
      })
      expect(result).toEqual({
        id: 'cus_123',
        name: 'John Doe',
        cpfCnpj: '12345678901'
      })
    })

    it('should throw AsaasApiError on validation error (422)', async () => {
      const errorResponse = {
        response: {
          status: 422,
          data: {
            errors: [
              { code: 'invalid_cpfCnpj', description: 'CPF/CNPJ inválido' }
            ]
          }
        },
        config: { url: '/v3/customers', method: 'post' }
      }
      const axiosError = new AxiosError('Request failed', 'ERR_BAD_REQUEST')
      axiosError.response = errorResponse.response as any
      axiosError.config = errorResponse.config as any
      mockHttp.post.mockRejectedValue(axiosError)

      await expect(
        service.createCustomer('John Doe', 'invalid')
      ).rejects.toThrow(AsaasApiError)

      await expect(
        service.createCustomer('John Doe', 'invalid')
      ).rejects.toMatchObject({
        statusCode: 422,
        asaasErrors: [
          { code: 'invalid_cpfCnpj', description: 'CPF/CNPJ inválido' }
        ]
      })
    })

    it('should throw AsaasApiError on network error (no response)', async () => {
      const axiosError = new AxiosError('Network error', 'ERR_NETWORK')
      mockHttp.post.mockRejectedValue(axiosError)

      const promise = service.createCustomer('John Doe', '12345678901')

      await expect(promise).rejects.toThrow(AsaasApiError)
      await expect(promise).rejects.toMatchObject({
        statusCode: 500,
        message: expect.stringContaining('Failed to create Asaas customer')
      })
    })
  })

  // ===================== createSubscription =====================

  describe('createSubscription', () => {
    const validInput = {
      customer: 'cus_123',
      billingType: 'UNDEFINED',
      value: 59.9,
      nextDueDate: '2026-06-10',
      cycle: 'MONTHLY',
      externalReference: 'ref-123',
      callback: {
        successUrl: 'http://localhost:3000/success',
        autoRedirect: true
      }
    }

    it('should create a subscription and return result with checkoutSession', async () => {
      const apiResponse = {
        data: {
          id: 'sub_456',
          status: 'ACTIVE',
          dateCreated: '2026-06-09',
          nextDueDate: '2026-06-10',
          value: 59.9,
          cycle: 'MONTHLY',
          billingType: 'UNDEFINED',
          customer: 'cus_123',
          paymentLink: null,
          checkoutSession: 'sess_abc'
        }
      }
      mockHttp.post.mockResolvedValue(apiResponse)

      const result = await service.createSubscription(validInput)

      expect(mockHttp.post).toHaveBeenCalledWith(
        '/v3/subscriptions',
        validInput
      )
      expect(result).toEqual(apiResponse.data)
    })

    it('should throw AsaasApiError on API error', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: {
            errors: [
              {
                code: 'invalid_value',
                description: 'Valor deve ser maior que zero'
              }
            ]
          }
        },
        config: { url: '/v3/subscriptions', method: 'post' }
      }
      const axiosError = new AxiosError('Request failed', 'ERR_BAD_REQUEST')
      axiosError.response = errorResponse.response as any
      axiosError.config = errorResponse.config as any
      mockHttp.post.mockRejectedValue(axiosError)

      await expect(service.createSubscription(validInput)).rejects.toThrow(
        AsaasApiError
      )

      await expect(
        service.createSubscription(validInput)
      ).rejects.toMatchObject({
        statusCode: 400,
        asaasErrors: [
          {
            code: 'invalid_value',
            description: 'Valor deve ser maior que zero'
          }
        ]
      })
    })
  })

  // ===================== getSubscription =====================

  describe('getSubscription', () => {
    it('should return subscription data', async () => {
      const apiResponse = {
        data: {
          id: 'sub_456',
          customer: 'cus_123',
          status: 'ACTIVE',
          value: 59.9,
          nextDueDate: '2026-07-10',
          cycle: 'MONTHLY',
          billingType: 'UNDEFINED',
          deleted: false
        }
      }
      mockHttp.get.mockResolvedValue(apiResponse)

      const result = await service.getSubscription('sub_456')

      expect(mockHttp.get).toHaveBeenCalledWith('/v3/subscriptions/sub_456')
      expect(result).toEqual(apiResponse.data)
    })

    it('should throw AsaasApiError on not found (404)', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            errors: [
              {
                code: 'subscription_not_found',
                description: 'Assinatura não encontrada'
              }
            ]
          }
        },
        config: { url: '/v3/subscriptions/nonexistent', method: 'get' }
      }
      const axiosError = new AxiosError('Not found', 'ERR_BAD_REQUEST')
      axiosError.response = errorResponse.response as any
      axiosError.config = errorResponse.config as any
      mockHttp.get.mockRejectedValue(axiosError)

      await expect(service.getSubscription('nonexistent')).rejects.toThrow(
        AsaasApiError
      )

      await expect(
        service.getSubscription('nonexistent')
      ).rejects.toMatchObject({
        statusCode: 404
      })
    })
  })

  // ===================== cancelSubscription =====================

  describe('cancelSubscription', () => {
    it('should cancel a subscription successfully', async () => {
      mockHttp.delete.mockResolvedValue({ data: {} })

      await service.cancelSubscription('sub_456')

      expect(mockHttp.delete).toHaveBeenCalledWith('/v3/subscriptions/sub_456')
    })

    it('should throw AsaasApiError on API error', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { errors: [{ code: 'internal_error', description: 'Erro interno' }] }
        },
        config: { url: '/v3/subscriptions/sub_456', method: 'delete' }
      }
      const axiosError = new AxiosError('Server error', 'ERR_BAD_RESPONSE')
      axiosError.response = errorResponse.response as any
      axiosError.config = errorResponse.config as any
      mockHttp.delete.mockRejectedValue(axiosError)

      await expect(service.cancelSubscription('sub_456')).rejects.toThrow(
        AsaasApiError
      )

      await expect(
        service.cancelSubscription('sub_456')
      ).rejects.toMatchObject({
        statusCode: 500
      })
    })
  })

  // ===================== updateSubscription =====================

  describe('updateSubscription', () => {
    it('should update a subscription successfully', async () => {
      mockHttp.put.mockResolvedValue({ data: {} })

      await service.updateSubscription('sub_456', { value: 99.9 })

      expect(mockHttp.put).toHaveBeenCalledWith('/v3/subscriptions/sub_456', {
        value: 99.9
      })
    })

    it('should throw AsaasApiError on API error', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: { errors: [{ code: 'invalid_value', description: 'Valor inválido' }] }
        },
        config: { url: '/v3/subscriptions/sub_456', method: 'put' }
      }
      const axiosError = new AxiosError('Bad request', 'ERR_BAD_REQUEST')
      axiosError.response = errorResponse.response as any
      axiosError.config = errorResponse.config as any
      mockHttp.put.mockRejectedValue(axiosError)

      await expect(
        service.updateSubscription('sub_456', { value: -1 })
      ).rejects.toThrow(AsaasApiError)

      await expect(
        service.updateSubscription('sub_456', { value: -1 })
      ).rejects.toMatchObject({
        statusCode: 400
      })
    })
  })

  // ===================== getPayment =====================

  describe('getPayment', () => {
    it('should return payment data', async () => {
      const apiResponse = {
        data: {
          id: 'pay_789',
          subscription: 'sub_456',
          status: 'CONFIRMED',
          value: 59.9,
          dueDate: '2026-06-10',
          billingType: 'UNDEFINED',
          invoiceUrl: 'https://example.com/invoice'
        }
      }
      mockHttp.get.mockResolvedValue(apiResponse)

      const result = await service.getPayment('pay_789')

      expect(mockHttp.get).toHaveBeenCalledWith('/v3/payments/pay_789')
      expect(result).toEqual(apiResponse.data)
    })

    it('should throw AsaasApiError on API error', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { errors: [{ code: 'payment_not_found', description: 'Pagamento não encontrado' }] }
        },
        config: { url: '/v3/payments/nonexistent', method: 'get' }
      }
      const axiosError = new AxiosError('Not found', 'ERR_BAD_REQUEST')
      axiosError.response = errorResponse.response as any
      axiosError.config = errorResponse.config as any
      mockHttp.get.mockRejectedValue(axiosError)

      await expect(service.getPayment('nonexistent')).rejects.toThrow(
        AsaasApiError
      )

      await expect(
        service.getPayment('nonexistent')
      ).rejects.toMatchObject({
        statusCode: 404
      })
    })
  })

  // ===================== listPaymentsBySubscription =====================

  describe('listPaymentsBySubscription', () => {
    it('should list payments for a subscription', async () => {
      const apiResponse = {
        data: {
          data: [
            {
              id: 'pay_789',
              subscription: 'sub_456',
              status: 'CONFIRMED',
              value: 59.9,
              dueDate: '2026-06-10',
              billingType: 'UNDEFINED',
              invoiceUrl: null
            },
            {
              id: 'pay_790',
              subscription: 'sub_456',
              status: 'PENDING',
              value: 59.9,
              dueDate: '2026-07-10',
              billingType: 'UNDEFINED',
              invoiceUrl: null
            }
          ],
          totalCount: 2,
          offset: 0,
          limit: 10
        }
      }
      mockHttp.get.mockResolvedValue(apiResponse)

      const result = await service.listPaymentsBySubscription('sub_456')

      expect(mockHttp.get).toHaveBeenCalledWith('/v3/payments', {
        params: { subscription: 'sub_456' }
      })
      expect(result).toHaveLength(2)
      expect(result[0]!.id).toBe('pay_789')
      expect(result[1]!.id).toBe('pay_790')
    })

    it('should throw AsaasApiError on API error', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { errors: [{ code: 'internal_error', description: 'Erro interno' }] }
        },
        config: { url: '/v3/payments?subscription=sub_456', method: 'get' }
      }
      const axiosError = new AxiosError('Server error', 'ERR_BAD_RESPONSE')
      axiosError.response = errorResponse.response as any
      axiosError.config = errorResponse.config as any
      mockHttp.get.mockRejectedValue(axiosError)

      await expect(
        service.listPaymentsBySubscription('sub_456')
      ).rejects.toThrow(AsaasApiError)

      await expect(
        service.listPaymentsBySubscription('sub_456')
      ).rejects.toMatchObject({
        statusCode: 500
      })
    })
  })

  // ===================== Error wrapping =====================

  describe('error wrapping', () => {
    it('should wrap Asaas API errors with correct status and message', async () => {
      const errorResponse = {
        response: {
          status: 422,
          data: {
            errors: [
              { code: 'invalid_name', description: 'Nome é obrigatório' }
            ]
          }
        },
        config: { url: '/v3/customers', method: 'post' }
      }
      const axiosError = new AxiosError('Request failed', 'ERR_BAD_REQUEST')
      axiosError.response = errorResponse.response as any
      axiosError.config = errorResponse.config as any
      mockHttp.post.mockRejectedValue(axiosError)

      try {
        await service.createCustomer('', '123')
        fail('Expected AsaasApiError to be thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(AsaasApiError)
        if (error instanceof AsaasApiError) {
          expect(error.statusCode).toBe(422)
          expect(error.asaasErrors).toEqual([
            { code: 'invalid_name', description: 'Nome é obrigatório' }
          ])
          expect(error.message).toContain('invalid_name')
        }
      }
    })

    it('should wrap non-axios errors as 500', async () => {
      mockHttp.post.mockRejectedValue(new Error('Unexpected error'))

      try {
        await service.createCustomer('John', '123')
        fail('Expected AsaasApiError to be thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(AsaasApiError)
        if (error instanceof AsaasApiError) {
          expect(error.statusCode).toBe(500)
          expect(error.asaasErrors).toBeUndefined()
        }
      }
    })
  })
})
