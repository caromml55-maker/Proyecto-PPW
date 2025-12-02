import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ProgramadorService } from '../../../services/programador.service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';

@Component({
  selector: 'app-gestion-prog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './gestion-prog.html',
  styleUrls: ['./gestion-prog.scss'],
})
export class GestionProg implements OnInit {
  programadores: any[] = [];
  admins: any[] = [];
  usuarios: any[] = [];

  selectedProgramador: any= null;
  selectedUid: string | null = null;
  selectedUser: any = null;

  selectedAdmin: string | null = null;
  selectedUsuario: string | null = null; 

  loading = false;
  isCreating = false; 
  isEditing = false;
  errorMsg: string | null = null; 

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
  ) {}

  async ngOnInit() {
    this.loadProgramadores(); 
    this.loadAdmins();        
    this.loadUsers(); 
  }

async loadProgramadores() {
    this.loading = true;
    try {
      this.programadores = await this.programadorService.getProgramadores();
      this.errorMsg = null;
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
    if (!uid) return;

    this.loading = true;
    this.isCreating = false;
    this.isEditing = false;

    const prog = await this.programadorService.getProgramador(uid);

    if (prog) {
      this.selectedProgramador = prog;
      this.selectedUid = uid;
      this.formData = JSON.parse(JSON.stringify(prog));

      if (!this.formData.redesSociales) {
        this.formData.redesSociales = {
          github: '',
          linkedin: '',
          portfolio: ''
        };
      }
    }

    this.loading = false;
  }

  initCreateMode() {
    this.isCreating = true;  // ESTO OCULTA EL COMBOBOX
    this.isEditing = true;   // Habilita los inputs
    this.selectedProgramador = null;
    this.selectedUid = '';   // Resetea el select

    // Limpiamos el formulario
    this.formData = {
      displayName: '',
      email: '',
      especialidad: '',
      descripcion: '',
      telefono: '',
      photoURL: '',
      redesSociales: {
        github: '',
        linkedin: '',
        portfolio: ''
      }
    };
  }

  enableEditMode() {
    this.isEditing = true;
  }

  cancelAction() {
    this.isCreating = false;
    this.isEditing = false;

    if (this.selectedProgramador) {
      this.formData = JSON.parse(JSON.stringify(this.selectedProgramador));
    } else {
      this.selectedUid = '';
    }
  }

  async saveProgramador() {
    this.loading = true;
    try {
      if (this.isCreating) {
        // CREAR
        if (!this.formData.photoURL) {
          this.formData.photoURL =
            `https://ui-avatars.com/api/?name=${this.formData.displayName}&background=random`;
        }
        await this.programadorService.crearProgramador(this.formData);
        alert('Programador creado correctamente');
      } else {
        // EDITAR
        await this.programadorService.actualizarProgramador(
          this.selectedProgramador.uid,
          this.formData
        );
        alert('Datos actualizados correctamente');
      }

      this.isCreating = false;
      this.isEditing = false;
      this.selectedProgramador = null;
      this.selectedUid = '';

      await this.loadProgramadores();
    } catch (e) {
      console.error(e);
      alert('Error al guardar');
    }
    this.loading = false;
  }

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

  async loadAdmins() {
    const db = getFirestore();
    const ref = collection(db, 'users');
    const q = query(ref, where('role', '==', 'admin'));
    const snap = await getDocs(q);

    this.admins = snap.docs.map(d => {
      const data: any = d.data();
      return {
        uid: data.uid || d.id,
        ...data
      };
    });
  }


  async loadUsers() {
    const db = getFirestore();
    const ref = collection(db, 'users');
    const q = query(ref, where('role', '==', 'user'));
    const snap = await getDocs(q);

    this.usuarios = snap.docs.map(d => {
      const data: any = d.data();
      return {
        uid: data.uid || d.id,
        ...data
      };
    });
  }
  
}

