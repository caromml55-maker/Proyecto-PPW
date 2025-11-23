import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async canActivate(route: ActivatedRouteSnapshot) {
    const expectedRoles = route.data['roles'];

    const asyncUser = await this.auth.getCurrentUser();
    if (!asyncUser) {
      this.router.navigate(['/login']);
      return false;
    }

    const db = getFirestore();
    const ref = doc(db, `users/${asyncUser.uid}`);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    const data = snap.data() as any;
    if (expectedRoles.includes(data.rol || data.role)) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
