import { Injectable } from '@nestjs/common'
import { PhoneRepository, PhoneFilter } from '@phones/phone.repository'
import { Phone, CreatePhoneProps } from '@phones/phone.entity'
import { PhoneNotFoundError } from '@phones/phone.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class PhoneService {
  constructor(private readonly repository: PhoneRepository) {}

  async create(props: CreatePhoneProps, context: RequestContext): Promise<Phone> {
    const phone = Phone.create(props)
    return this.repository.save(phone)
  }

  async findAll(filter?: PhoneFilter, context?: RequestContext): Promise<Phone[]> {
    return this.repository.findAll(filter)
  }

  async findById(id: string, context: RequestContext): Promise<Phone> {
    const phone = await this.repository.findById(id)
    if (!phone) {
      throw new PhoneNotFoundError(id)
    }
    return phone
  }

  async save(phone: Phone, context: RequestContext): Promise<Phone> {
    return this.repository.save(phone)
  }

  async delete(id: string, context: RequestContext): Promise<void> {
    const phone = await this.findById(id, context)
    phone.delete()
    await this.repository.save(phone)
  }

  async activate(id: string, context: RequestContext): Promise<Phone> {
    const phone = await this.findById(id, context)
    phone.activate()
    return this.repository.save(phone)
  }

  async lock(id: string, context: RequestContext): Promise<Phone> {
    const phone = await this.findById(id, context)
    phone.lock()
    return this.repository.save(phone)
  }
}