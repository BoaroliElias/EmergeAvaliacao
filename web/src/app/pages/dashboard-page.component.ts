import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { CrudApiService } from '../core/crud-api.service';

interface DashboardIndicadores {
  totalAgendamentos: number;
  valorTotalRecebido: number;
  valorPendente: number;
  totalPorClinica: Array<{ clinicaId: string; nomeClinica?: string; total: number; valor: number }>;
  totalPorMedico: Array<{ medicoId: string; nomeMedico?: string; total: number; valor: number }>;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent implements OnInit {
  loading = signal(false);
  error = signal('');
  indicadores = signal<DashboardIndicadores | null>(null);

  filtroForm = this.formBuilder.group({
    dataInicio: [''],
    dataFim: [''],
  });

  constructor(
    private readonly api: CrudApiService,
    private readonly formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loadIndicadores();
  }

  loadIndicadores(): void {
    this.loading.set(true);
    this.error.set('');

    const { dataInicio, dataFim } = this.filtroForm.value;
    const params: Record<string, any> = {};
    if (dataInicio) params['dataInicio'] = dataInicio;
    if (dataFim) params['dataFim'] = dataFim;

    this.api
      .getAgendamentosDashboard(params)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data: DashboardIndicadores) => this.indicadores.set(data),
        error: () => this.error.set('Falha ao carregar indicadores.'),
      });
  }

  limparFiltro(): void {
    this.filtroForm.reset({
      dataInicio: '',
      dataFim: '',
    });
    this.loadIndicadores();
  }

  formatCurrency(value: number): string {
    return Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}