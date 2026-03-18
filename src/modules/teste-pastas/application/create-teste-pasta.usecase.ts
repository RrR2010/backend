import { TestePasta } from '@modules/testePastas/domain/teste-pasta.entity'
import { Injectable } from "@nestjs/common";

@Injectable()
export class CreateTestePastaUseCase{
  constructor(private readonly testePastaRepository: TestePasta) {}

  async execute(input: {
    ...
  }): Promise<TestePasta> {
    const testePasta = await this.testePastaRepository.save(
      TestePasta.create({
        ...
      })
    )
    return TestePasta
  }
}