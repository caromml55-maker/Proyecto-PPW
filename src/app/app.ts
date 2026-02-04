import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { getAuth, signOut } from 'firebase/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  title = "Proyecto de Platafotmas Web - Portafolio";
  router: any;

  logout() {
      const auth = getAuth();
      signOut(auth).then(() => {
        this.router.navigate(['/']);
      });
    }
}
