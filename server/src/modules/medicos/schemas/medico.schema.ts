import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MedicoDocument = HydratedDocument<Medico>;

@Schema({ timestamps: true })
export class Medico {
  @Prop({ required: true, trim: true })
  nome: string;

  @Prop({ required: true, trim: true })
  especialidade: string;

  @Prop({ required: true, trim: true })
  crm: string;

  @Prop({ type: Types.ObjectId, ref: 'Clinica', required: true })
  clinicaId: Types.ObjectId;
}

export const MedicoSchema = SchemaFactory.createForClass(Medico);
