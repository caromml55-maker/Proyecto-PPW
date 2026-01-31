import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  template: `
    <div class="unauthorized-container">
      <h1>Acceso Denegado</h1>
      <p>No tienes permisos para acceder a esta página.</p>
      <button (click)="goBack()">Volver al Login</button>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
    }
    button {
      padding: 10px 20px;
      margin-top: 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
  `]
})
export class Unauthorized {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/login']);
  }
}