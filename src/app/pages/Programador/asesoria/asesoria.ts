import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getDocs, getFirestore, updateDoc } from 'firebase/firestore';
import { RouterLink, RouterOutlet } from "@angular/router";
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-asesoria',
  imports: [CommonModule, RouterLink, RouterOutlet],
  standalone: true,
  templateUrl: './asesoria.html',
  styleUrl: './asesoria.scss',
})
export class Asesoria implements OnInit {

  pendientes: any[] = [];
  uidProgramador = "";
  loading = false;

  private apiUrl = 'http://localhost:8080/gproyectoFinal/api/asesoria';
  private apiNotificaciones = 'http://localhost:8080/gproyectoFinal/api/notifications';

  constructor(private http: HttpClient, private cdRef: ChangeDetectorRef) {}

  async ngOnInit() {
    this.loading = true;
    const auth = getAuth();
    this.uidProgramador = auth.currentUser?.uid || "";

    if (!this.uidProgramador) {
      console.error("No hay un programador autenticado.");
      this.loading = false;
      return;
    }

    await this.cargarAsesorias();
  }

async cargarAsesorias() {
    this.loading = true;
    try {
      const url = `${this.apiUrl}/programador/${this.uidProgramador}/pendientes`;
      const data = await firstValueFrom(this.http.get<any[]>(url));

      this.pendientes = data.map((a: any) => ({
        ...a,
        usuarioNombre: a.usuario?.nombre || a.usuario?.displayName || "Usuario desconocido",
        fecha: a.fechaHora ? a.fechaHora.substring(0, 10) : "",
        hora: a.fechaHora ? a.fechaHora.substring(11, 16) : ""
      }));

    } catch (error) {
      console.error("Error al obtener asesorías del backend:", error);
      this.pendientes = [];
    } finally {
      this.loading = false;
      this.cdRef.detectChanges();
    }
  }

  async responder(asesoria: any, nuevaRespuesta: string) {
    this.loading = true;
    
    const bodyUpdate = {
     // ...asesoria,
      estado: nuevaRespuesta,
      //respuesta: nuevaRespuesta === "aceptada"
       //  ? "El programador ha aceptado tu asesoría"
        //: "El programador ha rechazado tu asesoría"
    };

    try {
      //const urlUpdate = `${this.apiUrl}/${asesoria.id}`;
      const urlUpdate = `${this.apiUrl}/${asesoria.id}/responder`;
      await firstValueFrom(this.http.put(urlUpdate, bodyUpdate));

      //await this.enviarNotificacionAlBackend(asesoria, nuevaRespuesta);

      alert(`Asesoría ${nuevaRespuesta} con éxito`);
      
      // 3. Recargamos la lista para limpiar la vista
      await this.cargarAsesorias();

    } catch (error: any) {
      console.error("❌ Error en la operación:", error);
      alert("No se pudo procesar la respuesta. Verifica la consola.");
    } finally {
      this.loading = false;
      this.cdRef.detectChanges();
    }
  }

  private async enviarNotificacionAlBackend(asesoria: any, estado: string) {
    const payload = {
      usuarioId: asesoria.usuario?.uid || asesoria.usuarioId,
      mensaje: estado === "aceptada"
        ? `✔️ Tu asesoría fue aceptada por ${this.getProgramadorNombre()}`
        : `❌ Tu asesoría fue rechazada por ${this.getProgramadorNombre()}`,
      fechaHora: new Date().toISOString(),
      leido: false
    };

    try {
      await firstValueFrom(this.http.post(this.apiNotificaciones, payload));
    } catch (e) {
      console.warn("⚠️ Notificación no enviada (revisa si el endpoint existe):", e);
    }
  }

  getProgramadorNombre():string {
  const auth = getAuth();
  return auth.currentUser?.displayName || "Programador";
}
}
