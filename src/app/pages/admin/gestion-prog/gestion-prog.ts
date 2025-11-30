import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ProgramadorService } from '../../../services/programador.service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-gestion-prog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './gestion-prog.html',
  styleUrls: ['./gestion-prog.scss'],
})
export class GestionProg implements OnInit {
  programadores: any[] = [];
  loading = false;

  isCreating = false; 
  isEditing = false;
  errorMsg: string | null = null; 


  selectedProgramador: any = null;
  selectedUid: string | null = null;

  formData: any = {
    displayName: '',
    email: '',
    especialidad: '',
    descripcion: '',
    photoURL: '',
    redesSociales: {
      github: '',
      linkedin: '',
      portfolio: ''
    }
  };
   constructor(
    private programadorService: ProgramadorService, 
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProgramadores();
  }

  horariosFormData: any[] = [
    { dia: 'lunes', activo: false, horaInicio: '', horaFin: '' },
    { dia: 'martes', activo: false, horaInicio: '', horaFin: '' },
    { dia: 'miércoles', activo: false, horaInicio: '', horaFin: '' },
    { dia: 'jueves', activo: false, horaInicio: '', horaFin: '' },
    { dia: 'viernes', activo: false, horaInicio: '', horaFin: '' },
  ];

  async loadProgramadores() {
    this.loading = true;
   try {
    this.programadores = await this.programadorService.getProgramadores();
    this.errorMsg = null;
    this.cdRef.detectChanges();
    } catch (e) {
    console.error(e);
      this.errorMsg = 'No se pudieron cargar los programadores.';
      this.programadores = [];
    }
    this.loading = false;
  }

  async onProgramadorSelected(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const uid = selectElement.value;

  console.log(uid);
  
  if (!uid) return;

  this.selectedUid = uid; 
  this.selectedProgramador = null; 
  this.isEditing = false; 
    
  const prog = await this.programadorService.getProgramador(uid);
    
  if (prog) {
    this.selectedProgramador = prog;
    this.formData = JSON.parse(JSON.stringify(prog));

    this.formData.name = this.formData.name ? this.formData.name : this.formData.displayName; 
      
    if (!this.formData.redesSociales) {
      this.formData.redesSociales = { github: '', linkedin: '', portfolio: '' };
    }
    this.cdRef.detectChanges();
  }
  this.loading = false;
}



  initCreateMode() {
    this.isCreating = true; // ESTO OCULTA EL COMBOBOX
    this.isEditing = true;  // Habilita los inputs
    this.selectedProgramador = null;
    this.selectedUid = ''; // Resetea el select
    
    // Limpiamos el formulario
    this.formData = {
      name: '',
      email: '',
      especialidad: '',
      descripcion: '',
      telefono: '',
      photoURL: '', 
      redesSociales: { github: '', linkedin: '', portfolio: '' }
    };
  }

  // ACCIÓN: Clic en "Editar" (Habilita escritura)
  enableEditMode() {
    this.isEditing = true;
  }

  // ACCIÓN: Clic en "Cancelar"
  cancelAction() {
    this.isCreating = false;
    this.isEditing = false;
    
    // Si estábamos viendo a alguien, restauramos sus datos originales
    if (this.selectedProgramador) {
       this.formData = JSON.parse(JSON.stringify(this.selectedProgramador));
    } else {
       this.selectedUid = ''; 
    }
  }

  // ACCIÓN: Clic en "Guardar" (Funciona para Crear y Editar)
  async saveProgramador() {
    this.loading = true;
    try {
      if (this.isCreating) {
        if (!this.formData.photoURL) {
           this.formData.photoURL = `https://ui-avatars.com/api/?name=${this.formData.name}&background=random`;
        }
        await this.programadorService.crearProgramador(this.formData);
        alert('Programador creado correctamente');
      } else {
     
        await this.programadorService.actualizarProgramador(this.selectedProgramador.uid, this.formData);
        alert('Datos actualizados correctamente');
      }
      
      await this.loadProgramadores();
      this.isCreating = false;
      this.isEditing = false;
      this.selectedProgramador = null;
      this.selectedUid = '';

     

    } catch (e) {
      console.error(e);
      alert('Error al guardar');
    }
    this.loading = false;
  }

  // ACCIÓN: Eliminar
  async deleteProgramador() {
    if (!confirm('¿Estás seguro de eliminar a este programador?')) return;
    
    try {
      await this.programadorService.eliminarProgramador(this.selectedProgramador.uid);
      this.selectedProgramador = null;
      this.selectedUid = '';
      await this.loadProgramadores();
      alert('Programador eliminado');
    } catch (error) {
      console.error(error);
      alert('Error al eliminar');
    }
  }

  goToInicio() {
    this.router.navigate(['/admin1']);
  }

  logout() {
    this.router.navigate(['/login']);
  }
}

