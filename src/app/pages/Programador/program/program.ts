import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { Router } from '@angular/router';
import { getAuth, signOut } from 'firebase/auth';

@Component({
  selector: 'app-program',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './program.html',
  styleUrls: ['./program.scss']
})
export class Program implements OnInit {
  user: any = null;

  ngOnInit(): void {
    const auth = getAuth();
    this.user = auth.currentUser;
  }

  
  constructor(private router: Router) {}

   logout() {
      const auth = getAuth();
      signOut(auth).then(() => {
        this.router.navigate(['/']);
      });
    }


}
