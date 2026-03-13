import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { Paciente, PacienteDocument } from './schemas/paciente.schema';

@Injectable()
export class PacientesService {
  constructor(
    @InjectModel(Paciente.name)
    private readonly pacienteModel: Model<PacienteDocument>,
  ) {}

  create(createPacienteDto: CreatePacienteDto) {
    return this.pacienteModel.create(createPacienteDto);
  }

  findAll() {
    return this.pacienteModel
      .find()
      .populate('clinicaId')
      .populate('medicoId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const paciente = await this.pacienteModel
      .findById(id)
      .populate('clinicaId')
      .populate('medicoId')
      .exec();
    if (!paciente) {
      throw new NotFoundException('Paciente nao encontrado');
    }
    return paciente;
  }

  async update(id: string, updatePacienteDto: UpdatePacienteDto) {
    const paciente = await this.pacienteModel
      .findByIdAndUpdate(id, updatePacienteDto, { new: true })
      .populate('clinicaId')
      .populate('medicoId')
      .exec();

    if (!paciente) {
      throw new NotFoundException('Paciente nao encontrado');
    }

    return paciente;
  }

  async remove(id: string) {
    const paciente = await this.pacienteModel.findByIdAndDelete(id).exec();
    if (!paciente) {
      throw new NotFoundException('Paciente nao encontrado');
    }
    return { deleted: true };
  }
}
