import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Paciente, PacienteSchema } from './schemas/paciente.schema';
import { PacientesController } from './pacientes.controller';
import { PacientesService } from './pacientes.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Paciente.name, schema: PacienteSchema }])],
  controllers: [PacientesController],
  providers: [PacientesService],
})
export class PacientesModule {}
