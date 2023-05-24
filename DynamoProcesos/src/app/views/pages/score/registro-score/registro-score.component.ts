import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ScoreService } from 'src/app/core/services/score.service';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { ExportExcellIndividualService } from 'src/app/core/services/export-excell.service';
import { ModalStoreComponent } from './modal-score/modal-score.component';
import { AuthService } from 'src/app/core/services/auth.service';

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
    private scoreService: ScoreService,
    public authService: AuthService,
    private exportExcellIndividualService: ExportExcellIndividualService,
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
    this.getListFormatoEnvio();
  }

  newFilfroForm(){
    this.filtroForm = this.fb.group({
      actualiza_por   : [''],
      lider           : [''],
      id_estado       : [''],
      fecha_envio_ini : [''],
      fecha_envio_fin : [''],
    })
  };


  validarSiEsUsuarioLider(){
    if (this.authService.esUsuarioLider()) {
      this.filtroForm.controls['lider'].disable();
      this.filtroForm.controls['lider'].setValue(this.authService.getUsername());
    }
  }

  listScore: any[] = [];
  cargarOBuscarScoreMXXX(){
    this.blockUI.start("Cargando Score...");
    let parametro: any[] = [{
      "queryId": 2,
      "mapValue": {
          // p_solicitante  : this.filtroForm.value.solicitante,
          p_solicitante  : this.authService.getUserNameByRol(this.filtroForm.value.lider), // this.filtroForm.value.lider,
          p_actualiza_por: this.filtroForm.value.actualiza_por,
          p_id_estado    : this.filtroForm.value.id_estado,
          inicio         : this.datepipe.transform(this.filtroForm.value.fecha_envio_ini,"yyyy/MM/dd"),
          fin            : this.datepipe.transform(this.filtroForm.value.fecha_envio_fin,"yyyy/MM/dd"),
      }
    }];
    this.scoreService.cargarOBuscarScoreM(parametro[0]).subscribe((resp: any) => {
    this.blockUI.stop();
    //  console.log('DATA_SCORE_M**', resp.list.filter((x: any) => x.idEstado != 1) );
    //  console.log('FORMATO_ENVIO', resp.list.find((f: any) => f.formato_envio == 1) );

     if (this.authService.esUsuarioGestor()) {
       this.listScore = [];
       this.listScore= resp.list.filter((x: any) => x.idEstado != 1)
      //  this.listScore = resp.list;
      }else{
        this.listScore = resp.list;
      }

      this.spinner.hide();
    });
  };

  cargarOBuscarScoreM(){
    this.blockUI.start("Cargando Score...");
    let parametro: any[] = [{
      "queryId": 29,
      "mapValue": {
          // p_solicitante  : this.authService.getUserNameByRol(this.filtroForm.value.lider),
          // p_actualiza_por: this.filtroForm.value.actualiza_por,
          p_id_estado    : this.filtroForm.value.id_estado,
          // inicio         : this.datepipe.transform(this.filtroForm.value.fecha_envio_ini,"yyyy/MM/dd"),
          // fin            : this.datepipe.transform(this.filtroForm.value.fecha_envio_fin,"yyyy/MM/dd"),
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

  exportarRegistro(id: number, formatoenvio?: number) {
    const f_envio = this.listScore.find(f => f.formato_envio == formatoenvio)
    console.log('F_ENVIO', f_envio.formato_envio);


    if (f_envio.formato_envio == 1) {
      this.exportScoreDetalleIndividual(id);
    }else{
      this.exportScoreDetalleMasivo(id)
    }
  }

  exportScoreDetalleMasivo(id_score: number){
    let parametro: any[] = [{
      "queryId": 17,
      "mapValue": {
          p_idScore : id_score,
      }
    }];
    this.scoreService.exportScoreDetalleMasivo(parametro[0]).subscribe((resp: any) => {
    this.exportExcellIndividualService.exportarExcelDetalleMasivo(resp.list, 'Masivo');
    });
  }


  exportScoreDetalleIndividual(id_score: number){
    let parametro: any[] = [{
      "queryId": 26,
      "mapValue": {
          p_idScore : id_score,
      }
    }];
    this.scoreService.exportScoreDetalleIndividual(parametro[0]).subscribe((resp: any) => {
      console.log('EXPORT_INDIVIDUAL', resp.list);

    this.exportExcellIndividualService.exportarExcelDetalleIndividual(resp.list, 'Individual');
    });
  }

  listEstado: any[] = [];
  getListEstado(){
    let parametro: any[] = [{ queryId: 3 }];

    this.scoreService.getListEstado(parametro[0]).subscribe((resp: any) => {
      this.listEstado = resp.list;
      // console.log('ESTADOS', resp.list);
    });
  }

  listFormEnvio: any[] = [];
  getListFormatoEnvio(){
    let parametro: any[] = [{ queryId: 16 }];

    this.scoreService.getListFormatoEnvio(parametro[0]).subscribe((resp: any) => {
      this.listFormEnvio = resp.list;
    });
  };


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


