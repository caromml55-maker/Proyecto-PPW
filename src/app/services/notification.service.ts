import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'http://localhost:8080/gproyectoFinal/api';

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notification`);
  }

  getNotification(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/notification/${id}`);
  }

  crearNotification(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/notification`, data);
  }

  actualizarNotification(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/notification/${id}`, data);
  }
}