import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateMedicoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  especialidade: string;

  @IsString()
  @IsNotEmpty()
  crm: string;

  @IsMongoId()
  clinicaId: string;
}
