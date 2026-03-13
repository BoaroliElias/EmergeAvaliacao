import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ClinicasController } from './clinicas.controller';
import { ClinicasService } from './clinicas.service';
import { Clinica, ClinicaSchema } from './schemas/clinica.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Clinica.name, schema: ClinicaSchema }])],
  controllers: [ClinicasController],
  providers: [ClinicasService],
})
export class ClinicasModule {}
