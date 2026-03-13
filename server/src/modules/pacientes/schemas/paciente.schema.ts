import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PacienteDocument = HydratedDocument<Paciente>;

@Schema({ timestamps: true })
export class Paciente {
  @Prop({ required: true, trim: true })
  nome: string;

  @Prop({ required: true, trim: true })
  cpf: string;

  @Prop({ required: true })
  dataNascimento: Date;

  @Prop({ required: true, trim: true })
  telefone: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ type: Types.ObjectId, ref: 'Clinica', required: true })
  clinicaId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Medico' })
  medicoId?: Types.ObjectId;
}

export const PacienteSchema = SchemaFactory.createForClass(Paciente);
