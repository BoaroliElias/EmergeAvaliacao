import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MedicosController } from './medicos.controller';
import { MedicosService } from './medicos.service';
import { Medico, MedicoSchema } from './schemas/medico.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Medico.name, schema: MedicoSchema }])],
  controllers: [MedicosController],
  providers: [MedicosService],
})
export class MedicosModule {}
