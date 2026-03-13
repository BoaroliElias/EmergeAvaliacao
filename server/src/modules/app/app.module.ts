import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AgendamentosModule } from '../agendamentos/agendamentos.module';
import { ClinicasModule } from '../clinicas/clinicas.module';
import { DatabaseModule } from '../database/database.module';
import { MedicosModule } from '../medicos/medicos.module';
import { PacientesModule } from '../pacientes/pacientes.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ClinicasModule,
    MedicosModule,
    PacientesModule,
    AgendamentosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
