import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { EntityType } from './crud.types';

@Injectable({ providedIn: 'root' })
export class CrudApiService {
  constructor(private readonly http: HttpClient) {}

  list(entity: EntityType, params?: Record<string, any>): Observable<any[]> {
    let httpParams = new HttpParams();

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      }
    }
  
    return this.http.get<any[]>(`${environment.apiUrl}/${entity}`, {
      params: httpParams,
    });
  }

  create(entity: EntityType, payload: Record<string, unknown>): Observable<any> {
    return this.http.post(`${environment.apiUrl}/${entity}`, payload);
  }

  update(entity: EntityType, id: string, payload: Record<string, unknown>): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/${entity}/${id}`, payload);
  }

  remove(entity: EntityType, id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/${entity}/${id}`);
  }
  
  getAgendamentosDashboard(params?: Record<string, any>): Observable<any> {
    let httpParams = new HttpParams();
  
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      }
    }
  
    return this.http.get<any>(`${environment.apiUrl}/agendamentos/dashboard`, {
      params: httpParams,
    });
  }
}
