import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ScoreService } from 'src/app/core/services/score.service';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { ModalStoreComponent } from './modal-score/modal-score.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { ExcellB2BService } from 'src/app/core/services/excell-b2b.service';

@Component({
  selector: 'app-registro-score',
  templateUrl: './registro-score.component.html',
  styleUrls: ['./registro-score.component.scss']
})
export class RegistroScoreComponent implements OnInit {
  @BlockUI() blockUI!: NgBlockUI;
  hidden = false;

  toggleBadgeVisibility() {
    this.hidden = !this.hidden;
  }

  loadingItem: boolean = false;
  userId!: number;
  filtroForm!: FormGroup;

  page = 1;
  totalScore: number = 0;
  pageSize = 10;

  constructor(
    public authService: AuthService,
    private scoreService: ScoreService,
    private excellB2BService: ExcellB2BService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public datepipe: DatePipe,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.newFilfroForm();
    this.validarSiEsUsuarioLider()
    this.cargarOBuscarScoreM();
    this.getListEstado();
    // this.getListFormatoEnvio();
  }

  newFilfroForm(){
    this.filtroForm = this.fb.group({
      actualiza_por   : [''],
      lider           : [''],
      id_estado       : [''],
      fecha_solic_ini : [''],
      fecha_solic_fin : [''],
      tipo_formato    : ['']
    })
  };


  validarSiEsUsuarioLider(){
    if (this.authService.esUsuarioLider()) {
      this.filtroForm.controls['lider'].disable();
      this.filtroForm.controls['lider'].setValue(this.authService.getUsername());
    }
  }

  listScore: any[] = [];
  cargarOBuscarScoreM(){
    this.blockUI.start("Cargando Score...");
    let parametro: any[] = [{
      queryId: 17,
      mapValue: {
          // p_solicitante  : this.authService.getUserNameByRol(this.filtroForm.value.lider),
          p_actualiza_por: this.filtroForm.value.actualiza_por,
          p_id_estado    : this.filtroForm.controls['id_estado'].value,
          // p_id_estado    : this.filtroForm.value.id_estado,
          p_tipoFormato  : this.filtroForm.value.tipo_formato,

          inicio         : this.datepipe.transform(this.filtroForm.value.fecha_solic_ini,'yyyy/MM/dd'),
          fin            : this.datepipe.transform(this.filtroForm.value.fecha_solic_fin,'yyyy/MM/dd'),
      }
    }];
    this.scoreService.cargarOBuscarScoreM(parametro[0]).subscribe((resp: any) => {
    this.blockUI.stop();
     console.log('DATA_SCORE_M**', resp.list );
    //  console.log('FORMATO_ENVIO', resp.list.find((f: any) => f.formato_envio == 1) );
      this.listScore = resp.list;

      this.spinner.hide();
    });
  };

  // OJO FALTA REPARAR EL DESCARGAR SEGUN FORMATO- 14-06
  exportarRegistro(id: number, tipo_formato?: number) {
    const tpoFormato = this.listScore.find(f => f.formatoScore == tipo_formato)
    console.log('tipo_formato', tpoFormato.formatoScore);


    if (tpoFormato.formatoScore.toUpperCase() == 'B2B') {
      this.exportScoreDetalleB2B(id);
    }else{
      this.exportScoreDetalleMasivoOdiurno(id)
    }
  }

  exportScoreDetalleMasivoOdiurno(id_score: number) {
    let parametro: any[] = [
      {
        queryId: 20,
        mapValue: {
          p_idScore: id_score,
        },
      },
    ];
    this.scoreService.exportScoreDetalleMasivoOdiurno(parametro[0]).subscribe((resp: any) => {
        this.excellB2BService.dowloadExcel(resp.list);
      });
  }

  exportScoreDetalleB2B(id_score: number) {
    let parametro: any[] = [
      {
        queryId: 21,
        mapValue: {
          p_idScore: id_score,
        },
      },
    ];
    this.scoreService.exportScoreDetalleB2B(parametro[0]).subscribe((resp: any) => {
        console.log('TIPO-SCORE-B2B', resp.list);

        this.excellB2BService.dowloadExcel(resp.list);
      });
  }


  listEstado: any[] = [];
  getListEstado(){
    let parametro: any[] = [{ queryId: 5 }];

    this.scoreService.getListEstado(parametro[0]).subscribe((resp: any) => {
      this.listEstado = resp.list;
      // console.log('ESTADOS', resp.list);
    });
  }

  limpiarFiltro() {
    this.filtroForm.reset('', { emitEvent: false });
    this.newFilfroForm();

    this.cargarOBuscarScoreM();
  }

  totalfiltro = 0;
  cambiarPagina(event: number) {
    let offset = event * 10;
    this.spinner.show();

    if (this.totalfiltro != this.totalScore) {
      this.scoreService.cargarOBuscarScoreM(offset.toString()).subscribe((resp: any) => {
          this.listScore = resp.list;
          this.spinner.hide();
        });
    } else {
      this.spinner.hide();
    }
    this.page = event;
  }

  CrearScore_M() {
    const dialogRef = this.dialog.open(ModalStoreComponent, { width: '75%', height: '52%',});

    dialogRef.afterClosed().subscribe((resp) => {
        if (resp) {
          this.cargarOBuscarScoreM();
        }
      });
  }

  actualizarScore(DATA: any) {
    console.log('DATA_SCORE_MAESTRA', DATA);

    const dialogRef = this.dialog.open(ModalStoreComponent, { width: '75%', height: '90%', data: DATA});
    dialogRef.afterClosed().subscribe((resp) => {
          this.cargarOBuscarScoreM();
      });
  }
}


