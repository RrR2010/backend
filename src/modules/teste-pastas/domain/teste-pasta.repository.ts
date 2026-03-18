import TestePasta from '@modules/teste-pastas/domain/teste-pasta.entity';

export abstract class TestePastaRepository {
  abstract findById(id: string): Promise<TestePasta | null>;
  abstract findAll(): Promise<TestePasta[]>;
  abstract save(TestePasta: TestePasta): Promise<TestePasta>;
  abstract delete(id: string): Promise<void>;
}