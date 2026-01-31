import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ProgramadorService } from '../../../services/programador.service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';

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
  filteredProgramadores: any[] = [];
  searchTextProg: string = '';
  isOpenProg: boolean = false;
  loadingProg: boolean = false;

  selectedAdmin: string | null = null;
  filteredAdmins: any[] = [];
  searchTextAdmin: string = '';
  isOpenAdmin: boolean = false;
  loadingAdmin: boolean = false;

  selectedUsuario: string | null = null;
  filteredUsuarios: any[] = [];
  searchText: string = '';
  isOpenUser: boolean = false;
  loadingUser: boolean = false;

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

      this.filteredUsuarios = [...this.usuarios];
      this.filteredProgramadores = [...this.programadores];
      this.filteredAdmins = [...this.admins];
      
      this.loading = false;
      this.cdref.detectChanges();
      
    } catch (error) {
      console.error('Error en ngOnInit:', error);
      this.loading = false;
      this.cdref.detectChanges();
    }
  }

  // Texto a mostrar en el combobox
  getDisplayTextProg(): string {
    if (!this.selectedProgramador) return '';
    const programador = this.programadores.find(p => p.uid === this.selectedProgramador);
    if (!programador) return '';
    return `${programador.displayName || programador.name} (${programador.email})`;
  }

  // Texto a mostrar en el combobox
  getDisplayTextAdmin(): string {
    if (!this.selectedAdmin) return '';
    const admin = this.admins.find(a => a.uid === this.selectedAdmin);
    if (!admin) return '';
    return `${admin.displayName || admin.name} (${admin.email})`;
  }

  // Texto a mostrar en el combobox
  getDisplayText(): string {
    if (!this.selectedUsuario) return '';
    const usuario = this.usuarios.find(u => u.uid === this.selectedUsuario);
    if (!usuario) return '';
    return `${usuario.displayName || usuario.name} (${usuario.email})`;
  }

  // Abrir/cerrar dropdown
  toggleDropdownProg() {
    if (this.loadingProg) return;
    this.isOpenProg = !this.isOpenProg;
    if (this.isOpenProg) {
      this.searchTextProg = '';
      this.filteredProgramadores = [...this.programadores];
      this.isOpenAdmin = false;
      this.isOpenUser = false;
    }
  }

  // Abrir/cerrar dropdown
  toggleDropdownAdmin() {
    if (this.loadingAdmin) return;
    this.isOpenAdmin = !this.isOpenAdmin;
    if (this.isOpenAdmin) {
      this.searchTextAdmin = '';
      this.filteredAdmins = [...this.admins];
      this.isOpenProg = false;
      this.isOpenUser = false;
    }
  }
  
  // Abrir/cerrar dropdown
  toggleDropdown() {
    if (this.loadingUser) return;
    this.isOpenUser = !this.isOpenUser;
    if (this.isOpenUser) {
      this.searchText = '';
      this.filteredUsuarios = [...this.usuarios];
      this.isOpenAdmin = false;
      this.isOpenProg = false;
    }
  }

  // Filtrar opciones
  filterOptionsProg() {
    if (!this.searchTextProg.trim()) {
      this.filteredProgramadores = [...this.programadores];
      return;
    }
    
    const term = this.searchTextProg.toLowerCase().trim();
    this.filteredProgramadores = this.programadores.filter(p => {
      const name = (p.displayName || p.name || '').toLowerCase();
      const email = (p.email || '').toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }

  // Filtrar opciones
  filterOptionsAdmin() {
    if (!this.searchTextAdmin.trim()) {
      this.filteredAdmins = [...this.admins];
      return;
    }
    
    const term = this.searchTextAdmin.toLowerCase().trim();
    this.filteredAdmins = this.admins.filter(a => {
      const name = (a.displayName || a.name || '').toLowerCase();
      const email = (a.email || '').toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }
  
  // Filtrar opciones
  filterOptions() {
    if (!this.searchText.trim()) {
      this.filteredUsuarios = [...this.usuarios];
      return;
    }
    
    const term = this.searchText.toLowerCase().trim();
    this.filteredUsuarios = this.usuarios.filter(u => {
      const name = (u.displayName || u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }

  // Seleccionar programador
  selectProgramador(programador: any) {
    this.selectedProgramador = programador.uid;
    this.isOpenProg = false;
    this.searchTextProg = '';
    
    console.log('Programador seleccionado:', programador.uid);
    this.onProgramadorSelected(programador.uid);
  }

  // Seleccionar programador
  selectAdmin(admin: any) {
    this.selectedAdmin = admin.uid;
    this.isOpenAdmin = false;
    this.searchTextAdmin = '';
    
    console.log('Administrador seleccionado:', admin.uid);
    this.onAdminSelected(admin.uid);
  }
  
  // Seleccionar usuario
  selectUsuario(usuario: any) {
    this.selectedUsuario = usuario.uid;
    this.isOpenUser = false;
    this.searchText = '';
    
    console.log('Usuario seleccionado:', usuario.uid);
    this.onUsuarioSelected(usuario.uid);
  }
  
  // Cerrar al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-combobox')) {
      this.isOpenUser = false;
      this.isOpenProg = false;
      this.isOpenAdmin = false;
    }
  }

  async loadProgramadores() {
    try {
      const programadores = await firstValueFrom(this.programadorService.getProgramadores());
      this.programadores = programadores;
      this.errorMsg = null;
    } catch (e) {
      console.error(e);
      this.errorMsg = 'No se pudieron cargar los programadores.';
      this.programadores = [];
    }
  }

  async onProgramadorSelected(selectElement: string) {
    const uid = selectElement;
    if (!uid) return;
    
    this.selectedUser = this.selectedProgramador
    this.selectedAdmin = null;
    this.selectedUsuario = null;
    this.loading = true;
    this.isCreating = false;
    this.isEditing = false;

    try {
      const prog = await firstValueFrom(this.programadorService.getProgramador(uid));

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
    } catch (error) {
      console.error('Error obteniendo programador:', error);
    }

    this.loading = false;
    this.cdref.detectChanges();
  }

  async onAdminSelected(selectElement: string) {
    const uid = selectElement;
    if (!uid) return;
    
    this.selectedUser = this.selectedAdmin;
    this.selectedProgramador = null;
    this.selectedUsuario = null;
    this.loading = true;
    this.isCreating = false;
    this.isEditing = false;

    try {
      const prog = await firstValueFrom(this.programadorService.getProgramador(uid));

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
    } catch (error) {
      console.error('Error obteniendo admin:', error);
    }

    this.loading = false;
    this.cdref.detectChanges();
  }
  soloLetras(field: string) {
  this.formData[field] = this.formData[field].replace(/[^a-zA-Z áéíóúÁÉÍÓÚñÑ]/g, '');
}

soloNumeros(field: string) {
  this.formData[field] = this.formData[field].replace(/[^0-9]/g, '');
}

soloEmail(field: string) {
  this.formData[field] = this.formData[field].replace(/[^a-zA-Z0-9@._-]/g, '');
}


  async onUsuarioSelected(selectElement: string) {
    const uid = selectElement;
    if (!uid) return;

    this.selectedUser = this.selectedUsuario;
    this.selectedAdmin = null;
    this.selectedProgramador = null;
    this.loading = true;
    this.isCreating = false;
    this.isEditing = false;

    try {
      const prog = await firstValueFrom(this.programadorService.getProgramador(uid));

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
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
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

  async cancelAction() {
    this.isCreating = false;
    this.isEditing = false;

    if (this.selectedUser) {
      try {
        const prog = await firstValueFrom(this.programadorService.getProgramador(this.selectedUser));

        if (prog) {
          this.formData = JSON.parse(JSON.stringify(prog));

          if (!this.formData.redesSociales) {
            this.formData.redesSociales = {
              github: '',
              linkedin: '',
              portfolio: ''
            };
          }
        }
      } catch (error) {
        console.error('Error obteniendo datos para cancelar:', error);
      }
      this.cdref.detectChanges();
    } else {
      this.selectedUid = '';
    }
  }

  async saveUser(form?: any) {
    if (form && form.invalid) {
    this.errorMsg = 'Corrige los campos marcados antes de guardar.';
    return;
  }
    this.loading = true;
    try {
      if (this.isCreating) {
        // CREAR
        if (!this.formData.photoURL) {
          this.formData.photoURL =
            `https://ui-avatars.com/api/?name=${this.formData.displayName}&background=random`;
        }
        this.formData.role = 'programador'; // Asegurar que sea programador
        await firstValueFrom(this.programadorService.crearUsuario(this.formData));
        alert('Programador creado correctamente');
      } else {
        // EDITAR
        console.log(this.selectedUser)
        await firstValueFrom(this.programadorService.actualizarProgramador(
          this.selectedUser,
          this.formData
        ));
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
      await firstValueFrom(this.programadorService.eliminarUsuario(this.selectedUser));
      this.selectedUser = null;
      this.selectedUid = '';
      await this.loadProgramadores();
      await this.loadAdmins();
      await this.loadUsers();

      this.filteredProgramadores = [...this.programadores];
      this.filteredAdmins = [...this.admins];
      this.filteredUsuarios = [...this.usuarios];

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
    try {
      this.admins = await firstValueFrom(this.programadorService.getAdmins());
      this.errorMsg = null;
    } catch (e) {
      console.error(e);
      this.errorMsg = 'No se pudieron cargar los administradores.';
      this.admins = [];
    }
  }


  async loadUsers() {
    try {
      const allUsers = await firstValueFrom(this.programadorService.getAllUsers());
      this.usuarios = allUsers.filter(user => user.role === 'user');
      this.errorMsg = null;
    } catch (e) {
      console.error(e);
      this.errorMsg = 'No se pudieron cargar los usuarios.';
      this.usuarios = [];
    }
  }
  
}

