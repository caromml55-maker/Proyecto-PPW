import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgramadorService } from '../../services/programador.service';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { Router} from '@angular/router';
import { getAuth, signOut} from "firebase/auth";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, RouterModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
})
export class Admin implements OnInit {

  section: string = 'programadores';
  programadores: any[] = [];
  userName = "";

  constructor(private router: Router, private programadorService: ProgramadorService) {}

  ngOnInit(): void {
    this.cargarProgramadores();
  }

  cargarProgramadores() {
    const auth = getAuth();
    this.userName = auth.currentUser?.displayName || "";

    this.programadorService.getProgramadores().subscribe({
      next: (programadores) => {
        this.programadores = programadores;
      },
      error: (error) => {
        console.error('Error cargando programadores:', error);
      }
    });
  }

  eliminarProgramador(uid: string) {
    const confirmar = confirm("¿Estás seguro de eliminar este programador?");
    if (!confirmar) return;

    this.programadorService.eliminarUsuario(uid).subscribe({
      next: () => {
        alert("Programador eliminado.");
        this.cargarProgramadores(); // Recargar la lista
      },
      error: (error) => {
        console.error('Error eliminando programador:', error);
        alert("Error eliminando programador.");
      }
    });
  }

  editarProgramador(p: any) {
    alert("Abrir modal de edición (lo hacemos después)");
  }

  crearProgramador() {
    alert("Abrir formulario de nuevo programador (lo hacemos después)");
  }

  logout() {
      const auth = getAuth();
      signOut(auth).then(() => {
        this.router.navigate(['/']);
      });
  }
}
