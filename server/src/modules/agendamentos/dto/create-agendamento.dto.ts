import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsMongoId, IsNumber, IsPositive, Min, Max } from 'class-validator';



export class CreateAgendamentoDto {
  @IsMongoId()
  clinicaId: string;

  @IsMongoId()
  medicoId: string;

  @IsMongoId()
  pacienteId: string;

  @Type(() => Date)
  @IsDate()
  dataHora: Date;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Min(15, { message: 'Duracao (minutos) deve ser no minimo 15.' })
  @Max(240, { message: 'Duracao (minutos) deve ser no maximo 240.' })
  duracaoMinutos: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Valor não deve ser menor que 0.' })
  @Max(999999.99)
  valor: number;

  @Type(() => Boolean)
  @IsBoolean()
  pagou: boolean;
}
