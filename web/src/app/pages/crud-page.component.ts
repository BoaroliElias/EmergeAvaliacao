import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { CrudApiService } from '../core/crud-api.service';
import { CRUD_CONFIG, CrudConfig, CrudField, EntityType } from '../core/crud.types';

@Component({
  selector: 'app-crud-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crud-page.component.html',
  styleUrl: './crud-page.component.scss',
})
export class CrudPageComponent implements OnInit {
  config!: CrudConfig;
  items = signal<any[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal('');

  modalOpen = signal(false);
  editingId = signal<string | null>(null);

  clinicasOptions = signal<any[]>([]);
  medicosOptions = signal<any[]>([]);

  form = this.formBuilder.group({});

  tableColumns = computed(() => this.config.fields.map((field) => field.key));

  constructor(
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly api: CrudApiService,
  ) {}

  ngOnInit(): void {
    const entity = this.route.snapshot.data['entity'] as EntityType;
    this.config = CRUD_CONFIG[entity];

    const controls: Record<string, any> = {};
    for (const field of this.config.fields) {
      const validators = field.required ? [Validators.required] : [];
      controls[field.key] = ['', validators];
    }
    this.form = this.formBuilder.group(controls);

    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');

    this.loadOptions();
    this.api
      .list(this.config.entity)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.items.set(data),
        error: () => this.error.set('Falha ao carregar dados. Verifique se o server esta rodando.'),
      });
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.form.reset();
    this.modalOpen.set(true);
  }

  openEditModal(item: any): void {
    this.editingId.set(item._id);
    const formValue: Record<string, any> = {};
    for (const field of this.config.fields) {
      const current = item[field.key];
      if (field.type === 'select') {
        formValue[field.key] = current?._id || current || '';
      } else if (field.type === 'date' && current) {
        formValue[field.key] = new Date(current).toISOString().slice(0, 10);
      } else {
        formValue[field.key] = current ?? '';
      }
    }
    this.form.reset(formValue);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.form.reset();
    this.editingId.set(null);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = { ...this.form.value } as Record<string, unknown>;
    if (payload['medicoId'] === '') {
      delete payload['medicoId'];
    }

    this.saving.set(true);
    const editingId = this.editingId();
    const request$ = editingId
      ? this.api.update(this.config.entity, editingId, payload)
      : this.api.create(this.config.entity, payload);

    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.closeModal();
        this.load();
      },
      error: () => this.error.set('Nao foi possivel salvar o registro.'),
    });
  }

  remove(id: string): void {
    if (!confirm('Deseja realmente excluir este registro?')) {
      return;
    }

    this.api.remove(this.config.entity, id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Nao foi possivel excluir o registro.'),
    });
  }

  fieldValue(item: any, field: CrudField): string {
    const value = item[field.key];
    if (value == null || value === '') {
      return '-';
    }

    if (field.type === 'date') {
      return new Date(value).toLocaleDateString('pt-BR');
    }

    if (typeof value === 'object') {
      return value.nome || value._id || '-';
    }

    return String(value);
  }

  optionsFor(field: CrudField): any[] {
    if (field.optionsSource === 'clinicas') {
      return this.clinicasOptions();
    }
    if (field.optionsSource === 'medicos') {
      return this.medicosOptions();
    }
    return [];
  }

  trackById(_: number, item: any): string {
    return item._id;
  }

  private loadOptions(): void {
    if (this.config.fields.some((field) => field.optionsSource === 'clinicas')) {
      this.api.list('clinicas').subscribe((data) => this.clinicasOptions.set(data));
    }

    if (this.config.fields.some((field) => field.optionsSource === 'medicos')) {
      this.api.list('medicos').subscribe((data) => this.medicosOptions.set(data));
    }
  }
}
