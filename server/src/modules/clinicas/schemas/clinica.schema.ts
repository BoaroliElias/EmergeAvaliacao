import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClinicaDocument = HydratedDocument<Clinica>;

@Schema({ timestamps: true })
export class Clinica {
  @Prop({ required: true, trim: true })
  nome: string;

  @Prop({ required: true, trim: true })
  endereco: string;

  @Prop({ required: true, trim: true })
  telefone: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;
}

export const ClinicaSchema = SchemaFactory.createForClass(Clinica);
