import { Entity, EntityProps } from '@core/domain/entities/entity';

interface TestProps extends EntityProps {
  ...
}

interface NewTestProps extends Omit<
  TestProps,
  'id' | 'createdAt' | 'updatedAt'
> {
  ...
}

export class Test extends Entity<TestProps> {
  private constructor(props: TestProps) {
    super(props);
  }

  // --------------- Factory Methods ---------------
  static create(params: NewTestProps): Test {
    
    return ...
  }

  static rehydratate(params: TestProps): Test {
    const test = new Test(params);
    return test
  }

  // --------------- Getters ---------------


  // --------------- Behaviours ---------------


  // --------------- Internal Methods ---------------

}