import { IsDateString, IsOptional } from 'class-validator';

export class DashboardAgendamentoDto {
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;
}