import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AgendamentoDocument = HydratedDocument<Agendamento>;

@Schema({ timestamps: true })
export class Agendamento {
  @Prop({ type: Types.ObjectId, ref: 'Clinica', required: true })
  clinicaId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Medico', required: true })
  medicoId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Paciente', required: true })
  pacienteId: Types.ObjectId;

  @Prop({ required: true })
  dataHora: Date;

  @Prop({ required: true, min: 1 })
  duracaoMinutos: number;

  @Prop({ required: true, min: 0 })
  valor: number;

  @Prop({ required: true, default: false })
  pagou: boolean;
}

export const AgendamentoSchema = SchemaFactory.createForClass(Agendamento);
