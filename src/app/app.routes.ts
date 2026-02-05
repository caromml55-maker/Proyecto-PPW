import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { RoleGuard } from './guards/role-guard';
import { Admin } from './pages/admin/admin';
import { Program } from './pages/Programador/program/program';
import { Usuario } from './pages/usuario/usuario';
import { GestionProg } from './pages/admin/gestion-prog/gestion-prog';
import { Horarios } from './pages/admin/horarios/horarios';
import { Notificaciones } from './pages/Programador/notificaciones/notificaciones';
import { Lab } from './pages/Programador/lab/lab';
import { Academic } from './pages/Programador/perfil/academic';
import { Asesoria } from './pages/Programador/asesoria/asesoria';
import { Unauthorized } from './pages/unauthorized/unauthorized';
import { ReporteAdmin } from './pages/admin/reporte-admin/reporte-admin';
import { Historial } from './pages/Programador/historial/historial';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'login', component: Login},
    {path: 'home', component: Home},
    {path: 'unauthorized', component: Unauthorized},
    {path: 'admin', component: Admin,canActivate: [RoleGuard],data: { role: ['admin'] } },
    {path: 'programador',component: Program,canActivate: [RoleGuard],data: { role: ['programador'] }},
    {path: 'usuario',component: Usuario,canActivate: [RoleGuard], data: { role: ['user'] }},
    {path: 'admin1', component: Admin},
    {path: 'programador1',component: Program},
    {path: 'usuario1',component: Usuario},
    {path: 'gestProg',component: GestionProg},
    {path: 'horarios',component: Horarios},
    {path: 'notif',component: Notificaciones},
    {path: 'program/academic',component: Academic},
    {path: 'program/lab', component: Lab},
    {path: 'program/asesoria', component: Asesoria},
    {path: 'programmer1',component: Program},
    {path: 'admin/reportes', component: ReporteAdmin },
    {path: 'historial', component: Historial},
];



