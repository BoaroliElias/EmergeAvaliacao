import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateClinicaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  endereco: string;

  @IsString()
  @IsNotEmpty()
  telefone: string;

  @IsEmail()
  email: string;
}
