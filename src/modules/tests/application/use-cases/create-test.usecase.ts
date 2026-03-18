import { Test } from '@modules/tests/domain/entities/test.entity'
import { Injectable } from "@nestjs/common";

@Injectable()
export class CreateTestUseCase{
  constructor(private readonly testRepository: Test) {}

  async execute(input: {
    param1: type1;
  }): Promise<Test> {
    const test = await this.testRepository.save(
      Test.create({
        param1: type1;
      })
    )
    return Test
  }
}