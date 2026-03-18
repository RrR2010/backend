import { Module } from '@nestjs/common';
import TestePastaService from './teste-pasta.service';

@Module({
  providers: [TestePastaService],
  exports: [TestePastaService],
})
export class TestePastaModule {}
  