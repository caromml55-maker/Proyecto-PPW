import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  constructor(private router: Router) {}

  async login() {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Usuario autenticado', result.user);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error de autenticación', error);
      const msg = (error as any)?.message || String(error);
      alert('Error en el inicio de sesión: ' + msg);
    }
  }
}
