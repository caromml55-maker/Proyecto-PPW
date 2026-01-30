import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async canActivate(route: ActivatedRouteSnapshot) {
    const expectedRoles = route.data['role'];

    // El AuthService nuevo ya valida el usuario con el backend y tiene el rol
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    // Verificar rol del usuario (obtenido del backend Jakarta)
    const userRole = currentUser.role?.toLowerCase();
    const expectedRoleArray = Array.isArray(expectedRoles) ? expectedRoles : [expectedRoles];

    if (expectedRoleArray.some(role => userRole === role?.toLowerCase())) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
