  import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { getFirestore, collection, addDoc,getDocs } from 'firebase/firestore';  
  import { ChangeDetectorRef } from '@angular/core';
  import { FullCalendarModule } from '@fullcalendar/angular';
  import { CalendarOptions } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import interactionPlugin from '@fullcalendar/interaction';
  import { HorarioService, Horario } from '../../../services/horarios.service';
import { RouterModule } from "@angular/router";


  @Component({
    selector: 'app-horarios',
    imports: [CommonModule, FormsModule, FullCalendarModule, RouterModule],
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

    horarios: Horario[] = [];
    calendarEvents: any[] = [];
    
    // Configuración corregida del calendario
    calendarOptions: CalendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: 'es',
      events: this.calendarEvents,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay'
      },
      editable: false,
      selectable: false,
      weekends: true,
      eventColor: '#3788d8',
      eventClick: this.handleEventClick.bind(this) // ← Esta línea habilita el clic en eventos
    };
    
    constructor(private horarioService: HorarioService, private cdRef: ChangeDetectorRef) {}

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

      this.cdRef.detectChanges();
    }

    // Cuando se selecciona un programador
    async onProgramadorSelected() {
      if (!this.selectedProgId) {
        this.horarios = [];
        this.calendarEvents = [];
        this.actualizarCalendario();
        return;
      }

      await this.cargarHorariosProgramador(this.selectedProgId);
    }

    // Actualizar el calendario
    actualizarCalendario() {
      this.calendarOptions = {
        ...this.calendarOptions,
        events: [...this.calendarEvents]
      };
      this.cdRef.detectChanges();
    }

    // Cargar horarios del programador seleccionado
    async cargarHorariosProgramador(programadorId: string) {
      try {
        this.horarios = await this.horarioService.getHorarioByProgramador(programadorId);
        this.actualizarEventosCalendario();
      } catch (error) {
        console.error('Error cargando horarios:', error);
        alert('Error al cargar los horarios del programador');
      }
    }

    // Actualizar eventos del calendario
    actualizarEventosCalendario() {
      this.calendarEvents = this.horarios.map(horario => ({
        id: horario.id,
        title: `Disponible (${horario.inicio} - ${horario.fin})`,
        date: horario.fecha,
        backgroundColor: '#28a745',
        borderColor: '#28a745',
        extendedProps: {
          title: "Reunion",
          inicio: horario.inicio,
          fin: horario.fin,
          programadorId: horario.programadorId
        }
      }));
      
      this.actualizarCalendario();
    }

    // Manejar clic en evento del calendario
    handleEventClick(info: any) {
      const event = info.event;
      const horarioId = event.id;
      
      if (confirm(`¿Eliminar horario del ${event.startStr}?`)) {
        this.eliminarHorario(horarioId);
      }
    }

    // Eliminar horario
    async eliminarHorario(horarioId: string) {
      try {
        await this.horarioService.eliminarHorario(horarioId);
        
        // Actualizar la lista local
        this.horarios = this.horarios.filter(h => h.id !== horarioId);
        this.actualizarEventosCalendario();
        
        alert('Horario eliminado correctamente');
      } catch (error) {
        console.error('Error eliminando horario:', error);
        alert('Error al eliminar el horario');
      }
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

      this.horarios.push({
        fecha: this.fecha,
        fin: this.horaFin,
        inicio: this.horaInicio,
        programadorId: this.selectedProgId
      })

      this.actualizarEventosCalendario();

      alert("Horario guardado correctamente");

      this.fecha = "";
      this.horaInicio = "";
      this.horaFin = "";

    }catch(error){
      console.error("Error guardando horario:", error);
      alert("Error guardando horario. Inténtalo de nuevo.");
    } 
  }

  // Obtener nombre del programador seleccionado
  getNombreProgramador(): string {
    const programador = this.programadores.find(p => p.id === this.selectedProgId);
    return programador ? (programador.displayName ? programador.displayName : 'Programador') : 'Programador';
  }

}
