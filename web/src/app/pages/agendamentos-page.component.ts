import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { CrudApiService } from '../core/crud-api.service';

type ViewMode = 'month' | 'day';

interface Agendamento {
  _id: string;
  clinicaId: { _id: string; nome: string } | string;
  medicoId: { _id: string; nome: string } | string;
  pacienteId: { _id: string; nome: string } | string;
  dataHora: string;
  duracaoMinutos: number;
  valor: number;
  pagou: boolean;
}

@Component({
  selector: 'app-agendamentos-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agendamentos-page.component.html',
  styleUrl: './agendamentos-page.component.scss',
})
export class AgendamentosPageComponent implements OnInit {
  viewMode = signal<ViewMode>('month');
  currentDate = signal(new Date());
  selectedDate = signal(this.startOfDay(new Date()));

  loading = signal(false);
  saving = signal(false);
  error = signal('');

  modalOpen = signal(false);
  editingId = signal<string | null>(null);

  clinicas = signal<any[]>([]);
  medicos = signal<any[]>([]);
  pacientes = signal<any[]>([]);
  agendamentos = signal<Agendamento[]>([]);

  form = this.formBuilder.group({
    clinicaId: ['', [Validators.required]],
    medicoId: ['', [Validators.required]],
    pacienteId: ['', [Validators.required]],
    dataHora: ['', [Validators.required]],
    duracaoMinutos: [30, [Validators.required, Validators.min(1)]],
    valor: [0, [Validators.required, Validators.min(0)]],
    pagou: [false, [Validators.required]],
  });

  filtersForm = this.formBuilder.group({
    clinicaId: [''],
    medicoId: [''],
    pacienteId: [''],
    dataInicio: [''],
    dataFim: [''],
    pagou: [''],
  });

  monthLabel = computed(() =>
    this.currentDate().toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    }),
  );

  dayLabel = computed(() =>
    this.selectedDate().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
  );

  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  monthDays = computed(() => {
    const firstDay = new Date(this.currentDate().getFullYear(), this.currentDate().getMonth(), 1);
    const lastDay = new Date(this.currentDate().getFullYear(), this.currentDate().getMonth() + 1, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const cells: Array<{ date: Date; inMonth: boolean }> = [];

    for (let i = 0; i < startWeekday; i++) {
      const prevDate = new Date(firstDay);
      prevDate.setDate(prevDate.getDate() - (startWeekday - i));
      cells.push({ date: this.startOfDay(prevDate), inMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        date: this.startOfDay(new Date(this.currentDate().getFullYear(), this.currentDate().getMonth(), day)),
        inMonth: true,
      });
    }

    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(lastDay);
      nextDate.setDate(lastDay.getDate() + i);
      cells.push({ date: this.startOfDay(nextDate), inMonth: false });
    }

    return cells;
  });

  dayAppointments = computed(() =>
    this.agendamentos()
      .filter((item) => this.isSameDay(new Date(item.dataHora), this.selectedDate()))
      .sort((a, b) => a.dataHora.localeCompare(b.dataHora)),
  );

  constructor(
    private readonly api: CrudApiService,
    private readonly formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.error.set('');
  
    const params = this.buildFilterParams();
  
    this.api.list('clinicas').subscribe((data) => this.clinicas.set(data));
    this.api.list('medicos').subscribe((data) => this.medicos.set(data));
    this.api.list('pacientes').subscribe((data) => this.pacientes.set(data));
  
    this.api
      .list('agendamentos', params)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.agendamentos.set(data as Agendamento[]),
        error: () => this.error.set('Falha ao carregar agendamentos.'),
      });
  }

  private buildFilterParams(): Record<string, any> {
    const { clinicaId, medicoId, pacienteId, dataInicio, dataFim, pagou } =
      this.filtersForm.value;

    const params: Record<string, any> = {};

        if (clinicaId) params['clinicaId'] = clinicaId;
    if (medicoId) params['medicoId'] = medicoId;
    if (pacienteId) params['pacienteId'] = pacienteId;
    if (dataInicio) params['dataInicio'] = dataInicio;
    if (dataFim) params['dataFim'] = dataFim;
    if (pagou !== undefined && pagou !== null && pagou !== '') params['pagou'] = pagou;
        return params;
  }

  applyFilters(): void {
    this.loadAll();
  }

  clearFilters(): void {
    this.filtersForm.reset({
      clinicaId: '',
      medicoId: '',
      pacienteId: '',
      dataInicio: '',
      dataFim: '',
      pagou: '',
    });
    this.loadAll();
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.error.set('');
    this.form.reset({
      clinicaId: '',
      medicoId: '',
      pacienteId: '',
      dataHora: '',
      duracaoMinutos: 30,
      valor: 0,
      pagou: false,
    });
    this.modalOpen.set(true);
  }

  openEditModal(item: Agendamento): void {
    this.editingId.set(item._id);
    this.form.reset({
      clinicaId: this.getId(item.clinicaId),
      medicoId: this.getId(item.medicoId),
      pacienteId: this.getId(item.pacienteId),
      dataHora: this.toDatetimeLocal(item.dataHora),
      duracaoMinutos: item.duracaoMinutos,
      valor: item.valor,
      pagou: item.pagou,
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingId.set(null);
    this.form.reset();
  }
  
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.form.value,
      dataHora: new Date(this.form.value.dataHora as string).toISOString(),
    } as Record<string, unknown>;

    this.saving.set(true);
    this.error.set('');

    const id = this.editingId();
    const request$ = id
     ? this.api.update('agendamentos', id, payload) 
     : this.api.create('agendamentos', payload);

    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.closeModal();
        this.loadAll();
      },
      error: (err) => {
        // Tenta extrair mensagem do backend
        const backendMessage = err?.error?.message;

        let message = 'Nao foi possivel salvar o agendamento.';

        if (Array.isArray(backendMessage) && backendMessage.length > 0) {
          message = backendMessage.join('; ');
        } else if (typeof backendMessage === 'string' && backendMessage.trim().length > 0) {
          message = backendMessage;
        }

        this.error.set(message);
      },
    });
  }

  remove(id: string): void {
    if (!confirm('Deseja excluir este agendamento?')) {
      return;
    }

    this.api.remove('agendamentos', id).subscribe({
      next: () => this.loadAll(),
      error: () => this.error.set('Nao foi possivel excluir o agendamento.'),
    });
  }

  previousPeriod(): void {
    if (this.viewMode() === 'day') {
      const prev = new Date(this.selectedDate());
      prev.setDate(prev.getDate() - 1);
      this.selectedDate.set(this.startOfDay(prev));
      this.currentDate.set(this.startOfDay(prev));
      return;
    }

    const prev = new Date(this.currentDate());
    prev.setMonth(prev.getMonth() - 1);
    this.currentDate.set(prev);
  }

  nextPeriod(): void {
    if (this.viewMode() === 'day') {
      const next = new Date(this.selectedDate());
      next.setDate(next.getDate() + 1);
      this.selectedDate.set(this.startOfDay(next));
      this.currentDate.set(this.startOfDay(next));
      return;
    }

    const next = new Date(this.currentDate());
    next.setMonth(next.getMonth() + 1);
    this.currentDate.set(next);
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    if (mode === 'day') {
      this.currentDate.set(this.startOfDay(this.selectedDate()));
    }
  }

  selectDay(date: Date): void {
    this.selectedDate.set(this.startOfDay(date));
  }

  countAppointments(date: Date): number {
    return this.agendamentos().filter((item) => this.isSameDay(new Date(item.dataHora), date)).length;
  }

  isSelected(date: Date): boolean {
    return this.isSameDay(date, this.selectedDate());
  }

  isToday(date: Date): boolean {
    return this.isSameDay(date, this.startOfDay(new Date()));
  }

  formatTime(datetime: string): string {
    return new Date(datetime).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatCurrency(value: number): string {
    return Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  getName(ref: { _id: string; nome: string } | string): string {
    if (typeof ref === 'string') {
      return ref;
    }
    return ref?.nome || '-';
  }

  private getId(ref: { _id: string; nome: string } | string): string {
    if (typeof ref === 'string') {
      return ref;
    }
    return ref?._id || '';
  }

  private toDatetimeLocal(value: string): string {
    const date = new Date(value);
    const pad = (n: number) => `${n}`.padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}`;
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
