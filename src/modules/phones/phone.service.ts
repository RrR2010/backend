import { Injectable } from '@nestjs/common'
import { PhoneRepository, PhoneFilter } from '@phones/phone.repository'
import { Phone, CreatePhoneProps } from '@phones/phone.entity'
import { PhoneNotFoundError } from '@phones/phone.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class PhoneService {
  constructor(private readonly repository: PhoneRepository) {}

  async create(props: CreatePhoneProps, ctx: RequestContext): Promise<Phone> {
    const phone = Phone.create(props)
    return this.repository.save(phone, ctx)
  }

  async findAll(filter: PhoneFilter, ctx: RequestContext): Promise<Phone[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<Phone> {
    const phone = await this.repository.findById(id, ctx)
    if (!phone) {
      throw new PhoneNotFoundError(id)
    }
    return phone
  }

  async save(phone: Phone, ctx: RequestContext): Promise<Phone> {
    return this.repository.save(phone, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const phone = await this.findById(id, ctx)
    phone.delete()
    await this.repository.save(phone, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<Phone> {
    const phone = await this.findById(id, ctx)
    phone.activate()
    return this.repository.save(phone, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<Phone> {
    const phone = await this.findById(id, ctx)
    phone.lock()
    return this.repository.save(phone, ctx)
  }
}