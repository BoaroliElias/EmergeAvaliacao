import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { DashboardAgendamentoDto } from './dto/dashboard-agendamento.dto';

import { AgendamentosService } from './agendamentos.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { FilterAgendamentoDto } from './dto/filter-agendamento.dto';

@Controller('agendamentos')
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  @Post()
  create(@Body() createAgendamentoDto: CreateAgendamentoDto) {
    return this.agendamentosService.create(createAgendamentoDto);
  }

  @Get()
  findAll(@Query() filters: FilterAgendamentoDto) {
    return this.agendamentosService.findAll(filters);
  }

  @Get('dashboard')
  dashboard(@Query() filters: DashboardAgendamentoDto) {
    return this.agendamentosService.getDashboard(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agendamentosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgendamentoDto: UpdateAgendamentoDto) {
    return this.agendamentosService.update(id, updateAgendamentoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agendamentosService.remove(id);
  }
}
