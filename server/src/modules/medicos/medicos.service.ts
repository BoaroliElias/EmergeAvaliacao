import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';
import { Medico, MedicoDocument } from './schemas/medico.schema';

@Injectable()
export class MedicosService {
  constructor(
    @InjectModel(Medico.name)
    private readonly medicoModel: Model<MedicoDocument>,
  ) {}

  create(createMedicoDto: CreateMedicoDto) {
    return this.medicoModel.create(createMedicoDto);
  }

  findAll() {
    return this.medicoModel.find().populate('clinicaId').sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const medico = await this.medicoModel.findById(id).populate('clinicaId').exec();
    if (!medico) {
      throw new NotFoundException('Medico nao encontrado');
    }
    return medico;
  }

  async update(id: string, updateMedicoDto: UpdateMedicoDto) {
    const medico = await this.medicoModel
      .findByIdAndUpdate(id, updateMedicoDto, { new: true })
      .populate('clinicaId')
      .exec();

    if (!medico) {
      throw new NotFoundException('Medico nao encontrado');
    }

    return medico;
  }

  async remove(id: string) {
    const medico = await this.medicoModel.findByIdAndDelete(id).exec();
    if (!medico) {
      throw new NotFoundException('Medico nao encontrado');
    }
    return { deleted: true };
  }
}
