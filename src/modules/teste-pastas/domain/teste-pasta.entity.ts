import { Entity, EntityProps } from '@core/domain/entity';

interface TestePastaProps extends EntityProps {
  ...
}

interface NewTestePastaProps extends Omit<
  TestePastaProps,
  'id' | 'createdAt' | 'updatedAt'
> {
  ...
}

export class TestePasta extends Entity<TestePastaProps> {
  private constructor(params: TestePastaProps) {
    super(params);
  }

  // --------------- Factory Methods ---------------
  static create(params: NewTestePastaProps): TestePasta {
    
    return ...
  }

  static rehydratate(params: TestePastaProps): TestePasta {
    const testePasta = new TestePasta(params);
    return testePasta
  }

  // --------------- Getters ---------------


  // --------------- Behaviours ---------------


  // --------------- Internal Methods ---------------

}