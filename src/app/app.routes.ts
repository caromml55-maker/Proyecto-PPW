import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { RoleGuard } from './guards/role-guard';
import { Admin } from './pages/admin/admin';
import { Program } from './pages/program/program';
import { Usuario } from './pages/usuario/usuario';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'login', component: Login},
    {path: 'home', component: Home},
    {path: 'dashboard-admin', component: Admin,canActivate: [RoleGuard],data: { role: ['Admin'] } },
    {path: 'dashboard-programador',component: Program,canActivate: [RoleGuard],data: { role: ['Programador'] }},
    {path: 'dashboard-usuario',component: Usuario,canActivate: [RoleGuard], data: { role: ['Usuario'] }}

];


