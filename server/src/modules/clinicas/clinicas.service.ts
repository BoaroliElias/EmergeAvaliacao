import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateClinicaDto } from './dto/create-clinica.dto';
import { UpdateClinicaDto } from './dto/update-clinica.dto';
import { Clinica, ClinicaDocument } from './schemas/clinica.schema';

@Injectable()
export class ClinicasService {
  constructor(
    @InjectModel(Clinica.name)
    private readonly clinicaModel: Model<ClinicaDocument>,
  ) {}

  create(createClinicaDto: CreateClinicaDto) {
    return this.clinicaModel.create(createClinicaDto);
  }

  findAll() {
    return this.clinicaModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const clinica = await this.clinicaModel.findById(id).exec();
    if (!clinica) {
      throw new NotFoundException('Clinica nao encontrada');
    }
    return clinica;
  }

  async update(id: string, updateClinicaDto: UpdateClinicaDto) {
    const clinica = await this.clinicaModel
      .findByIdAndUpdate(id, updateClinicaDto, { new: true })
      .exec();
    if (!clinica) {
      throw new NotFoundException('Clinica nao encontrada');
    }
    return clinica;
  }

  async remove(id: string) {
    const clinica = await this.clinicaModel.findByIdAndDelete(id).exec();
    if (!clinica) {
      throw new NotFoundException('Clinica nao encontrada');
    }
    return { deleted: true };
  }
}
