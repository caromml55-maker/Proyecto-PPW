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

  selectedUid: string | null = null;
  selectedUser: any = null;
  selectedProgramador: any = null;

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
    private cdref: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.loading = true;
    
    try {
      // Ejecutar en paralelo (más rápido si no dependen entre sí)
      await Promise.all([
        this.loadProgramadores(),
        this.loadAdmins(),
        this.loadUsers()
      ]);
      
      this.loading = false;
      this.cdref.detectChanges();
      
    } catch (error) {
      console.error('Error en ngOnInit:', error);
      this.loading = false;
      this.cdref.detectChanges();
    }
  }

  async loadProgramadores() {
    try {
      this.programadores = await this.programadorService.getProgramadores();
      this.errorMsg = null;
    } catch (e) {
      console.error(e);
      this.errorMsg = 'No se pudieron cargar los programadores.';
      this.programadores = [];
    }
  }

  async onProgramadorSelected(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const uid = selectElement.value;
    if (!uid) return;
    
    this.selectedUser = this.selectedProgramador
    this.selectedAdmin = null;
    this.selectedUsuario = null;
    this.loading = true;
    this.isCreating = false;
    this.isEditing = false;

    const prog = await this.programadorService.getProgramador(uid);

    if (prog) {
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
    this.cdref.detectChanges();
  }

  async onAdminSelected(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const uid = selectElement.value;
    if (!uid) return;
    
    this.selectedUser = this.selectedAdmin;
    this.selectedProgramador = null;
    this.selectedUsuario = null;
    this.loading = true;
    this.isCreating = false;
    this.isEditing = false;

    const prog = await this.programadorService.getProgramador(uid);

    if (prog) {
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
    this.cdref.detectChanges();
  }

  async onUsuarioSelected(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const uid = selectElement.value;
    if (!uid) return;
    
    this.selectedUser = this.selectedUsuario;
    this.selectedAdmin = null;
    this.selectedProgramador = null;
    this.loading = true;
    this.isCreating = false;
    this.isEditing = false;

    const prog = await this.programadorService.getProgramador(uid);

    if (prog) {
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
    this.cdref.detectChanges();
  }

  initCreateMode() {
    this.isCreating = true;  // ESTO OCULTA EL COMBOBOX
    this.isEditing = true;   // Habilita los inputs
    this.selectedUser = null;
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

    if (this.selectedUser) {
      this.formData = JSON.parse(JSON.stringify(this.selectedUser));
    } else {
      this.selectedUid = '';
    }
  }

  async saveUser() {
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
        console.log(this.selectedUser)
        await this.programadorService.actualizarProgramador(
          this.selectedUser,
          this.formData
        );
        alert('Datos actualizados correctamente');
      }

      this.isCreating = false;
      this.isEditing = false;
      this.selectedUid = '';

      await this.loadProgramadores();
    } catch (e) {
      console.error(e);
      alert('Error al guardar');
    }
    this.loading = false;
    this.cdref.detectChanges()
  }

  async deleteProgramador() {
    if (!confirm('¿Estás seguro de eliminar a este programador?')) return;

    try {
      await this.programadorService.eliminarProgramador(this.selectedUser.uid);
      this.selectedUser = null;
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

