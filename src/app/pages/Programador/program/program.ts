import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getAuth } from 'firebase/auth';
import { RouterModule } from "@angular/router";

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
}
