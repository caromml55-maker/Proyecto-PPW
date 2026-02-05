import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BaseChartDirective } from 'ng2-charts';
import * as XLSX from 'xlsx';
import { ReporteService } from '../../../services/reporte-service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, RouterModule], 
  templateUrl: './historial.html',
  styleUrl: './historial.scss',
})
export class Historial implements OnInit {
 @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  // Información del usuario logueado
  usuarioLogueado: any = null;

  dataAsesorias: any[] = [];
  dataProyectos: any[] = [];

  // KPI's
  totalAsesorias = 0;
  totalProyectos = 0;
  tasaAceptacion = 0;

  // --- GRÁFICAS CONFIG ---
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false } }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Cantidad', backgroundColor: [], borderRadius: 5 }]
  };

  public pieChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } },
    cutout: '70%'
  };
  public pieChartType: ChartType = 'doughnut';
  public pieChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }]
  };

  constructor(
    private reporteService: ReporteService,
    private cd: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit() {
    const auth = getAuth();
    // Usamos onAuthStateCha se refresca
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.usuarioLogueado = {
          uid: user.uid,
          displayName: user.displayName || 'Usuario',
          email: user.email
        };
        this.cargarDatosDelProgramador(user.uid);
      }
    });
  }

  // ---------------------------------------------------------
  // PROCESAR DATOS
  // ---------------------------------------------------------
  cargarDatosDelProgramador(uid: string) {
    console.log("🔄 Cargando historial personal para UID:", uid);
    
    // --- A. OBTENER ASESORÍAS ---
    this.reporteService.getDetalleAsesorias(uid).subscribe({
      next: (data) => {
        this.dataAsesorias = data;
        this.totalAsesorias = data.length;

        const aceptadas = data.filter(d => d.estado?.toLowerCase() === 'aceptada').length;
        this.tasaAceptacion = this.totalAsesorias > 0 
            ? Math.round((aceptadas / this.totalAsesorias) * 100) 
            : 0;

        const conteo = this.agruparPorPropiedad(data, 'estado');
        const etiquetas = Object.keys(conteo);
        const valores = Object.values(conteo);

        this.barChartData = {
          labels: etiquetas,
          datasets: [{
            data: valores,
            label: 'Solicitudes',
            backgroundColor: etiquetas.map(e => this.getColorEstado(e)),
            borderRadius: 8,
            barThickness: 40
          }]
        };

        this.chart?.update();
        this.cd.detectChanges();
      },
      error: (e) => console.error("❌ Error en Asesorías:", e)
    });

    // --- B. OBTENER PROYECTOS ---
    this.reporteService.getDetalleProyectos(uid).subscribe({
      next: (data) => {
        this.dataProyectos = data;
        this.totalProyectos = data.length;

        const conteo = this.agruparPorPropiedad(data, 'tipo'); 
        
        this.pieChartData = {
            labels: Object.keys(conteo),
            datasets: [{
              data: Object.values(conteo),
              backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
              hoverOffset: 4
            }]
        };

        this.chart?.update();
        this.cd.detectChanges();
      },
      error: (e) => console.error("❌ Error en Proyectos:", e)
    });
  }

  agruparPorPropiedad(data: any[], propiedad: string): { [key: string]: number } {
    return data.reduce((acc, curr) => {
      const llave = curr[propiedad] || 'Sin Definir'; 
      acc[llave] = (acc[llave] || 0) + 1;
      return acc;
    }, {});
  }

  getColorEstado(estado: string): string {
    if (!estado) return '#858796';
    switch(estado.toLowerCase()) {
      case 'aceptada': return '#1cc88a';
      case 'pendiente': return '#f6c23e';
      case 'rechazada': return '#e74a3b';
      default: return '#858796';
    }
  }

  // --- EXPORTACIÓN ---

  descargarPDF() {
    if (!this.usuarioLogueado) return;

    const doc = new jsPDF();
    const { displayName, email } = this.usuarioLogueado;

    doc.setFillColor(78, 115, 223);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Mi Historial de Actividades", 14, 20);
    doc.setFontSize(10);
    doc.text("Generado el: " + new Date().toLocaleDateString(), 14, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Usuario: ${displayName}`, 14, 55);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Correo: ${email}`, 14, 62);
    doc.text(`Total Asesorías: ${this.totalAsesorias} | Tasa Aceptación: ${this.tasaAceptacion}%`, 14, 69);

    // Tabla Asesorías
    autoTable(doc, {
      startY: 80,
      headStyles: { fillColor: [78, 115, 223] },
      head: [['Fecha', 'Usuario', 'Estado']],
      body: this.dataAsesorias.length > 0 
        ? this.dataAsesorias.map(item => [item.fecha || '---', item.usuarioNombre || 'Anónimo', item.estado || '---'])
        : [['---', 'Sin registros', '---']],
    });

    // Tabla Proyectos
    const finalY = (doc as any).lastAutoTable.finalY || 80;
    doc.text('Mis Proyectos', 14, finalY + 15);
    autoTable(doc, {
      startY: finalY + 20,
      headStyles: { fillColor: [28, 200, 138] },
      head: [['Tipo', 'Nombre del Proyecto', 'Estado']],
      body: this.dataProyectos.length > 0
        ? this.dataProyectos.map(proj => [proj.tipo || '---', proj.nombreProyecto || '---', 'Activo'])
        : [['---', 'Sin proyectos', '---']],
    });

    doc.save(`Historial_${displayName.replace(/\s+/g, '_')}.pdf`);
  }

  descargarExcel() {
    if(!this.usuarioLogueado) return;

    const wb = XLSX.utils.book_new();
    const { displayName, email } = this.usuarioLogueado;

    const datosAsesorias = [
      { A: "MI HISTORIAL PERSONAL" },
      { A: "Usuario:", B: displayName },
      { A: "Correo:", B: email },
      { A: "" },
      { A: "Fecha", B: "Usuario", C: "Estado" },
      ...this.dataAsesorias.map(item => ({
        A: item.fecha || '---',
        B: item.usuarioNombre || 'Anónimo',
        C: item.estado || '---'
      }))
    ];

    const wsAsesorias = XLSX.utils.json_to_sheet(datosAsesorias, { skipHeader: true });
    wsAsesorias['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsAsesorias, "Asesorías");

    const datosProyectos = [
      { A: "MIS PROYECTOS" },
      { A: "" },
      { A: "Tipo", B: "Nombre del Proyecto", C: "Estado" },
      ...this.dataProyectos.map(proj => ({
        A: proj.tipo || '---',
        B: proj.nombreProyecto || '---',
        C: 'Activo'
      }))
    ];

    const wsProyectos = XLSX.utils.json_to_sheet(datosProyectos, { skipHeader: true });
    XLSX.utils.book_append_sheet(wb, wsProyectos, "Proyectos");

    XLSX.writeFile(wb, `Historial_${displayName.replace(/\s+/g, '_')}.xlsx`);
  }

  goToInicio() {
    this.router.navigate(['/programador1']);
  }
}