import { ApiPropertyOptional } from '@nestjs/swagger'

export class PaginationDto {
  @ApiPropertyOptional({ default: 100, description: 'Maximum number of records to return (max 500)' })
  limit?: number = 100

  @ApiPropertyOptional({ default: 0, description: 'Number of records to skip' })
  offset?: number = 0

  get skip(): number {
    return this.offset ?? 0
  }

  get take(): number {
    return Math.min(this.limit ?? 100, 500)
  }
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  limit: number
  offset: number
}
