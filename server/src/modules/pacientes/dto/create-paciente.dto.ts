import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePacienteDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @Type(() => Date)
  @IsDate()
  dataNascimento: Date;

  @IsString()
  @IsNotEmpty()
  telefone: string;

  @IsEmail()
  email: string;

  @IsMongoId()
  clinicaId: string;

  @IsOptional()
  @IsMongoId()
  medicoId?: string;
}
