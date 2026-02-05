import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc,updateDoc } from "firebase/firestore";
import { RouterModule } from "@angular/router";
import { ChangeDetectorRef } from '@angular/core';
import { ProgramadorService } from '../../../services/programador.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-academic',
  imports: [CommonModule, FormsModule, RouterModule],
  standalone: true,
  templateUrl: './academic.html',
  styleUrl: './academic.scss',
})
export class Academic implements OnInit{

  data: any = {
    displayName: '',
    especialidad: '',
    descripcion: '',
    telefono: '',
    email: '',
    photoURL: '',
    redesSociales: {
      github: '',
      linkedin: '',
      portfolio: ''
    }
  };

  isEditing = false;
  loading = false;
  userUid: string | null = null;

  constructor(private programadorService: ProgramadorService, private cdRef: ChangeDetectorRef) {}

  async ngOnInit() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    this.userUid = user.uid;
    await this.cargarPerfil();
  }

  async cargarPerfil() {
    this.loading = true;
    try {
      // Según (En Cyrva, 2026) usamos firstValueFrom para obtener los datos del backend
      const prog = await firstValueFrom(this.programadorService.getProgramador(this.userUid!));

      if (prog) {
        // Mapeamos lo que viene del backend a la estructura de tu data
        this.data = {
          ...prog,
          displayName: prog.displayName || prog.name || '',
          redesSociales: {
            github: prog.github || '',
            linkedin: prog.linkedin || '',
          }
        };
      }
    } catch (error) {
      console.error('Error cargando perfil desde el backend:', error);
    } finally {
      this.loading = false;
      this.cdRef.detectChanges();
    }
  }

  cancel(){
    this.isEditing = false;
    this.ngOnInit();
  }

  async guardar(form?: any) {
    if (form && form.invalid) {
      console.log("Formulario inválido");
      return;
    }

    this.loading = true;
    try {
      // Preparamos el objeto plano para el backend (sacando redes del objeto anidado)
      const dataToSend = {
        ...this.data,
        github: this.data.redesSociales.github,
        linkedin: this.data.redesSociales.linkedin,
      };
      delete dataToSend.redesSociales;

      // Actualizamos mediante el servicio
      console.log('OBJETO FINAL ENVIADO:', dataToSend);
      console.log('JSON ENVIADO:', JSON.stringify(dataToSend, null, 2));
      await firstValueFrom(this.programadorService.actualizarUsuario(this.userUid!, dataToSend));

      alert('Perfil actualizado correctamente en el servidor');
      this.isEditing = false;
    } catch (error) {
      console.error('Error al guardar en el backend:', error);
      alert('Error al actualizar el perfil');
    } finally {
      this.loading = false;
      this.cdRef.detectChanges();
    }
  }
  soloLetras(field: string) {
    this.data[field] = this.data[field].replace(/[^a-zA-Z áéíóúÁÉÍÓÚñÑ]/g, '');
  }

  soloNumeros(field: string) {
    this.data[field] = this.data[field].replace(/[^0-9]/g, '');
  }


}
