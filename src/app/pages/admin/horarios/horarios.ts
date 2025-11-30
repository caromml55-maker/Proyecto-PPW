import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getFirestore, collection, addDoc,getDocs } from 'firebase/firestore';  
import { FullCalendarModule } from '@fullcalendar/angular';


@Component({
  selector: 'app-horarios',
  imports: [CommonModule,FormsModule,FullCalendarModule],
  standalone: true,
  templateUrl: './horarios.html',
  styleUrl: './horarios.scss',
})

export class Horarios  implements OnInit{

  programadores: any[] = [];     
  selectedProgId: string = "";   

  fecha: string = "";            
  horaInicio: string = "";     
  horaFin: string = "";

  calendarEvents: any[] = [];
  calendarOptions: any = {initialView: 'dayGridMonth',locale: 'es', };
  
  constructor() {}

  ngOnInit(): void {
    this.cargarProgramadores();
  }

  async cargarProgramadores() {
    const db = getFirestore();
    const ref = collection(db, "users");
    const snap = await getDocs(ref);

    this.programadores = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((u: any) => u.role === "programador");
  }

  async guardarHorario() {
  if (!this.selectedProgId || !this.fecha || !this.horaInicio || !this.horaFin) {
    alert("Completa todos los campos");
    return;
  }

  const db = getFirestore();
  const ref = collection(db, "horarios");

  try{
      await addDoc(ref, {
      programadorId: this.selectedProgId,
      fecha: this.fecha,
      inicio: this.horaInicio,
      fin: this.horaFin
    });

    this.calendarEvents.push({
    title: "Disponible",
    date: this.fecha
    });

    alert("Horario guardado correctamente");

    this.fecha = "";
    this.horaInicio = "";
    this.horaFin = "";

  }catch(error){
    console.error("Error guardando horario:", error);
    alert("Error guardando horario. Inténtalo de nuevo.");
  }
   
    
}

}
