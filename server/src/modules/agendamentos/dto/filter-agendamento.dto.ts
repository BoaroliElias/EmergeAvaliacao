import { Type } from 'class-transformer';
import { IsMongoId, IsOptional, IsBooleanString, IsDateString } from 'class-validator';

export class FilterAgendamentoDto {
    @IsOptional()
    @IsMongoId()
    clinicaId?: string;
  
    @IsOptional()
    @IsMongoId()
    medicoId?: string;
  
    @IsOptional()
    @IsMongoId()
    pacienteId?: string;
  
    @IsOptional()
    @IsDateString()
    dataInicio?: string;
  
    @IsOptional()
    @IsDateString()
    dataFim?: string;
  
    @IsOptional()
    @IsBooleanString()
    pagou?: string;
  }
