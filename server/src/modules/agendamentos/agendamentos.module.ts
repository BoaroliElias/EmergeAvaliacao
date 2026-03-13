import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AgendamentosController } from './agendamentos.controller';
import { AgendamentosService } from './agendamentos.service';
import { Agendamento, AgendamentoSchema } from './schemas/agendamento.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Agendamento.name, schema: AgendamentoSchema }])],
  controllers: [AgendamentosController],
  providers: [AgendamentosService],
})
export class AgendamentosModule {}
