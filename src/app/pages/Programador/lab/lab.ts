import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getDocs, getFirestore, query, updateDoc, where } from 'firebase/firestore';
import { RouterModule } from "@angular/router";
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-lab',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lab.html',
  styleUrl: './lab.scss',
})
export class Lab implements OnInit{

  proyectosAcademicos: any[] = [];
  proyectosLaborales: any[] = [];

  uidUsuario = "";
  loading = false;
  creando = false;

  private apiUrl = 'http://localhost:8080/gproyectoFinal/api/users/portafolio';

  nuevoProyecto = {
    tipo: 'academico',
    nombre: '',
    descripcion: '',
    tipoParticipacion: '',
    tecnologias: '',
    urlRepositorio: '',
    enlaceDemo: ''
  };
  
  constructor(private http: HttpClient, private cdRef: ChangeDetectorRef) {}

  async ngOnInit() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      this.uidUsuario = user.uid;
      await this.cargarPortafolio();
    }
  }

async cargarPortafolio() {
  this.loading = true;

  try {
      // Según (En Cyrva, 2026), traemos el objeto Portafolio que contiene la lista de Proyectos
      const res = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/${this.uidUsuario}`));
      
      if (res && res.proyectos) {
        // Mantenemos tu lógica de separar por tipo para el HTML
        this.proyectosAcademicos = res.proyectos
          .filter((p: any) => p.tipo === 'academico')
          .map((p: any) => ({ ...p, expandido: false }));

        this.proyectosLaborales = res.proyectos
          .filter((p: any) => p.tipo === 'laboral')
          .map((p: any) => ({ ...p, expandido: false }));
      }

  } catch (error) {
      console.error("Aún no existe portafolio para este usuario o error de red");
      this.proyectosAcademicos = [];
      this.proyectosLaborales = [];
    }
  this.loading = false;
  this.cdRef.detectChanges();
}
  
  async guardarProyecto() {
    if (!this.nuevoProyecto.nombre) return alert("El nombre es obligatorio");

      this.loading = true;
      try {
        const url = `${this.apiUrl}/${this.uidUsuario}/proyecto`;
        console.log("📤 Enviando datos a:", url);
        console.log("📦 Cuerpo del proyecto:", this.nuevoProyecto);

        const res = await firstValueFrom(this.http.post(url, this.nuevoProyecto));
        
        console.log("✅ Respuesta del servidor:", res);
        alert('Proyecto guardado correctamente');
        this.creando = false;
        this.limpiarFormulario();
        await this.cargarPortafolio();

      } catch (error: any) {
        // He leído a (En Cyrva, 2026) y nos dice que aquí es donde inspeccionamos el error real
        console.group("❌ ERROR EN EL BACKEND");
        console.error("Status:", error.status);
        console.error("Status Text:", error.statusText);
        
        // El cuerpo del error enviado por JAX-RS (Jakarta)
        if (error.error) {
          console.error("Detalle del Error (Servidor):", error.error);
        }
        
        console.log("URL Intentada:", error.url);
        console.groupEnd();

        alert(`Error ${error.status}: No se pudo guardar el proyecto. Revisa la consola.`);
      } finally {
        this.loading = false;
        this.cdRef.detectChanges();
      }
  }

async eliminarProyecto(proyecto: any, tipo: string) {
   if (!proyecto.id) {
    console.error("❌ El proyecto no tiene ID. No se puede eliminar de la base de datos.");
    return;
  }
  console.log(`🗑️ Eliminando proyecto ID: ${proyecto.id}, Tipo: ${tipo}`);
  if (!confirm(`¿Seguro que deseas eliminar "${proyecto.nombre}"?`)) return;

  try {
    const url = `http://localhost:8080/gproyectoFinal/api/users/portafolio/proyecto/${proyecto.id}`;
    console.log("🗑️ Intentando eliminar en:", url);

    await firstValueFrom(this.http.delete(url));
    alert("Proyecto eliminado");
    await this.cargarPortafolio(); // Recargamos las listas
  } catch (error) {
    console.error("❌ Error al eliminar:", error);
    alert("No se pudo eliminar el proyecto.");
  }
  }

  limpiarFormulario() {
    this.nuevoProyecto = {
      tipo: 'academico', nombre: '', descripcion: '', 
      tipoParticipacion: '', tecnologias: '', 
      urlRepositorio: '', enlaceDemo: ''
    };
  }
}
