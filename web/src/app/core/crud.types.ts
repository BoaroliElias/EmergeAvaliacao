export type EntityType = 'clinicas' | 'medicos' | 'pacientes' | 'agendamentos';

export type FieldType = 'text' | 'email' | 'date' | 'select';

export interface CrudField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  optionsSource?: 'clinicas' | 'medicos';
}

export interface CrudConfig {
  entity: EntityType;
  title: string;
  subtitle: string;
  fields: CrudField[];
}

export const CRUD_CONFIG: Record<EntityType, CrudConfig> = {
  clinicas: {
    entity: 'clinicas',
    title: 'Clinicas',
    subtitle: 'Gerencie clinicas cadastradas',
    fields: [
      { key: 'nome', label: 'Nome', type: 'text', required: true },
      { key: 'endereco', label: 'Endereco', type: 'text', required: true },
      { key: 'telefone', label: 'Telefone', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
    ],
  },
  medicos: {
    entity: 'medicos',
    title: 'Medicos',
    subtitle: 'Gerencie medicos e vinculacao com clinicas',
    fields: [
      { key: 'nome', label: 'Nome', type: 'text', required: true },
      { key: 'especialidade', label: 'Especialidade', type: 'text', required: true },
      { key: 'crm', label: 'CRM', type: 'text', required: true },
      {
        key: 'clinicaId',
        label: 'Clinica',
        type: 'select',
        required: true,
        optionsSource: 'clinicas',
      },
    ],
  },
  pacientes: {
    entity: 'pacientes',
    title: 'Pacientes',
    subtitle: 'Gerencie pacientes e seus vinculos',
    fields: [
      { key: 'nome', label: 'Nome', type: 'text', required: true },
      { key: 'cpf', label: 'CPF', type: 'text', required: true },
      { key: 'dataNascimento', label: 'Data de nascimento', type: 'date', required: true },
      { key: 'telefone', label: 'Telefone', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      {
        key: 'clinicaId',
        label: 'Clinica',
        type: 'select',
        required: true,
        optionsSource: 'clinicas',
      },
      {
        key: 'medicoId',
        label: 'Medico (opcional)',
        type: 'select',
        optionsSource: 'medicos',
      },
    ],
  },
  agendamentos: {
    entity: 'agendamentos',
    title: 'Agendamentos',
    subtitle: 'Gerencie agendamentos',
    fields: [],
  },
};
