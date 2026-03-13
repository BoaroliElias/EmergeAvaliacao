import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { FilterAgendamentoDto } from './dto/filter-agendamento.dto';
import { Agendamento, AgendamentoDocument } from './schemas/agendamento.schema';
import { DashboardAgendamentoDto } from './dto/dashboard-agendamento.dto';

@Injectable()
export class AgendamentosService {
  constructor(
    @InjectModel(Agendamento.name)
    private readonly agendamentoModel: Model<AgendamentoDocument>,
  ) {}

  create(createAgendamentoDto: CreateAgendamentoDto) {
    this.validateBusinessRules(createAgendamentoDto);
    return this.agendamentoModel.create(createAgendamentoDto);
  }

  findAll(filters: FilterAgendamentoDto) {
    const query: Record<string, any> = {};

    if (filters.clinicaId) query.clinicaId = filters.clinicaId;
    if (filters.medicoId) query.medicoId = filters.medicoId;
    if (filters.pacienteId) query.pacienteId = filters.pacienteId;

    if (filters.dataInicio || filters.dataFim) {
      query.dataHora = {};
      if (filters.dataInicio) query.dataHora.$gte = new Date(filters.dataInicio);
      if (filters.dataFim) query.dataHora.$lte = new Date(filters.dataFim);
    }

    if (filters.pagou !== undefined && filters.pagou !== null && filters.pagou !== '') {
      query.pagou = filters.pagou === 'true';
    }
    return this.agendamentoModel
      .find(query)
      .populate('clinicaId')
      .populate('medicoId')
      .populate('pacienteId')
      .sort({ dataHora: 1 })
      .exec();
  }

  async getDashboard(filtro: DashboardAgendamentoDto) {
    const match: Record<string, any> = {};
  
    if (filtro.dataInicio || filtro.dataFim) {
      match.dataHora = {};
      if (filtro.dataInicio) {
        match.dataHora.$gte = new Date(filtro.dataInicio);
      }
      if (filtro.dataFim) {
        match.dataHora.$lte = new Date(filtro.dataFim);
      }
    }
  
    const baseMatchStage = Object.keys(match).length > 0 ? [{ $match: match }] : [];
  
    const [totais] =
      (await this.agendamentoModel.aggregate([
        ...baseMatchStage,
        {
          $group: {
            _id: null,
            totalAgendamentos: { $sum: 1 },
            valorTotalRecebido: {
              $sum: {
                $cond: [{ $eq: ['$pagou', true] }, '$valor', 0],
              },
            },
            valorPendente: {
              $sum: {
                $cond: [{ $eq: ['$pagou', false] }, '$valor', 0],
              },
            },
          },
        },
      ])) || [];
  
      const totalPorClinica = await this.agendamentoModel.aggregate([
        ...baseMatchStage,
        {
          $group: {
            _id: '$clinicaId',
            total: { $sum: 1 },
            valor: { $sum: '$valor' },
          },
        },
        // converte _id (string) para ObjectId em um novo campo
        {
          $addFields: {
            clinicaIdObj: { $toObjectId: '$_id' },
          },
        },
        {
          $lookup: {
            from: 'clinicas',
            localField: 'clinicaIdObj',
            foreignField: '_id',
            as: 'clinica',
          },
        },
        {
          $addFields: {
            nomeClinica: { $first: '$clinica.nome' },
          },
        },
        {
          $project: {
            _id: 1,
            total: 1,
            valor: 1,
            nomeClinica: 1,
          },
        },
        { $sort: { total: -1 } },
      ]);
      
      const totalPorMedico = await this.agendamentoModel.aggregate([
        ...baseMatchStage,
        {
          $group: {
            _id: '$medicoId',
            total: { $sum: 1 },
            valor: { $sum: '$valor' },
          },
        },
        {
          $addFields: {
            medicoIdObj: { $toObjectId: '$_id' },
          },
        },
        {
          $lookup: {
            from: 'medicos',
            localField: 'medicoIdObj',
            foreignField: '_id',
            as: 'medico',
          },
        },
        {
          $addFields: {
            nomeMedico: { $first: '$medico.nome' },
          },
        },
        {
          $project: {
            _id: 1,
            total: 1,
            valor: 1,
            nomeMedico: 1,
          },
        },
        { $sort: { total: -1 } },
      ]);
  
    return {
      totalAgendamentos: totais?.totalAgendamentos ?? 0,
      valorTotalRecebido: totais?.valorTotalRecebido ?? 0,
      valorPendente: totais?.valorPendente ?? 0,
      totalPorClinica: totalPorClinica.map((x) => ({
        clinicaId: x._id,
        nomeClinica: x.nomeClinica,
        total: x.total,
        valor: x.valor,
      })),
      totalPorMedico: totalPorMedico.map((x) => ({
        medicoId: x._id,
        nomeMedico: x.nomeMedico,
        total: x.total,
        valor: x.valor,
      })),
    };
  }

  async findOne(id: string) {
    const agendamento = await this.agendamentoModel
      .findById(id)
      .populate('clinicaId')
      .populate('medicoId')
      .populate('pacienteId')
      .exec();
    if (!agendamento) {
      throw new NotFoundException('Agendamento nao encontrado');
    }
    return agendamento;
  }

  async update(id: string, updateAgendamentoDto: UpdateAgendamentoDto) {
    this.validateBusinessRules(updateAgendamentoDto);
    const agendamento = await this.agendamentoModel
      .findByIdAndUpdate(id, updateAgendamentoDto, { new: true })
      .populate('clinicaId')
      .populate('medicoId')
      .populate('pacienteId')
      .exec();

    if (!agendamento) {
      throw new NotFoundException('Agendamento nao encontrado');
    }

    return agendamento;
  }

  async remove(id: string) {
    const agendamento = await this.agendamentoModel.findByIdAndDelete(id).exec();
    if (!agendamento) {
      throw new NotFoundException('Agendamento nao encontrado');
    }
    return { deleted: true };
  }

  private validateBusinessRules(dto: CreateAgendamentoDto | UpdateAgendamentoDto): void {
    // Data no passado
    if (dto.dataHora) {
      const dataHora = new Date(dto.dataHora as any);
      const agora = new Date();
  
      if (dataHora.getTime() < agora.getTime()) {
        throw new BadRequestException('Nao é permitido agendar no passado.');
      }
    }
  
    // Valor com no máximo 2 casas decimais
    if (dto.valor !== undefined && dto.valor !== null) {
      const raw = Number(dto.valor);
      const cents = Math.round(raw * 100);
  
      if (Math.abs(raw * 100 - cents) > 0.000001) {
        throw new BadRequestException('Valor deve ter no maximo 2 casas decimais.');
      }
    }
  }
}
