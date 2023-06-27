import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA,} from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/core/services/auth.service';
import { ScoreService } from 'src/app/core/services/score.service';
import Swal from 'sweetalert2';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ScoreDetalleService } from 'src/app/core/services/score-detalle.service';
import { concatMap, of, tap } from 'rxjs';
import { SendMailService } from 'src/app/core/services/send-mail.service';
import { ExcellDiurnoService } from 'src/app/core/services/excell-diurno.service';
import { ExcellMasivoService } from 'src/app/core/services/excell-masivo.service';
import { ExcellB2BService } from 'src/app/core/services/excell-b2b.service';
import { ObservarMasivamenteComponent } from './observar-masivamente/observar-masivamente.component';
import { AprobarImportarComponent } from './Aprobar-importar/aprobar-importar.component';
import { AsignarComentarioComponent } from './asignar-comentario-score_d/asignar-comentario.component';
import { Enums } from 'src/app/core/enums/enums';

@Component({
  selector: 'app-modal-evento',
  templateUrl: './modal-score.component.html',
  styleUrls: ['./modal-score.component.scss'],
})
export class ModalStoreComponent implements OnInit {
  @BlockUI() blockUI!: NgBlockUI;
  minDate = new Date();
  activeTab: string = 'General';

  scoreForm!: FormGroup;
  score_Id!: number;
  page = 1;
  pageSize = 10;

  usuario: any;
  loadingItem: boolean = false;
  userID: number = 0;
  userName: string = '';

  totalGeneral: number = 0;
  totalExcep  : number = 0;

  constructor(
    private scoreService: ScoreService,
    public authService: AuthService,
    private scoreDetalleService: ScoreDetalleService,
    private excellDiurnoService: ExcellDiurnoService,
    private excellMasivoService: ExcellMasivoService,
    private excellB2BService: ExcellB2BService,

    private sendMailService: SendMailService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public datePipe: DatePipe,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ModalStoreComponent>,
    @Inject(MAT_DIALOG_DATA) public DATA_SCORE: any
  ) {}

  ngOnInit(): void {
    this.newFilfroForm();
    this.isGestorTDP();
    this.getUsername();
    this.getUserID();
    this.getListEstado();
    if (this.DATA_SCORE && this.DATA_SCORE.idScoreM) {
      this.score_Id = this.DATA_SCORE.idScore_M;
      this.ListaHistoricoCambios(this.DATA_SCORE,);
      this.cargarSCoreByID();
    }
    console.log('DATA_SCORE_M', this.DATA_SCORE);
    console.log('SCOREFORM', this.scoreForm.value);
  }

  newFilfroForm() {
    this.scoreForm = this.fb.group({
      solicitante     : [''],
      id_estado_m     : [{ value: '', disabled: true }],
      id_score        : [''],
      num_doc         : [''],
      id_estado_d     : [''],
      fecha_ini_prueba: ['', Validators.required],
      fecha_fin_prueba: ['', Validators.required],
      motivo_solicitud: [''],
      casoScore       : [''],
      formatoScore    : [''],
      req_validacion  : [''],
      obs_score       : [''],
      fechaIniPrueba  : [null],
      fechaFinPrueba  : [null],
      fechaEnvioPrueba: [null],
    });
  }

  onTabClick(tab: string) {
    this.activeTab = tab;
  }

  listScoreDetalle     : any[] = [];
  listScoreDetalleExcep: any[] = [];
  listScoreDetalleGen  : any[] = [];
  listScoreDetalleCorp : any[] = [];
  cargarOBuscarScoreDetalle() {
    console.log('DATA_DETALLE_*', this.scoreForm.getRawValue(), this.DATA_SCORE);

    this.listScoreDetalle = [];
    this.blockUI.start('Cargando Score detalle...');
    let parametro: any[] = [
      {
        queryId: 19,
        mapValue: {
          p_idScore       : this.DATA_SCORE.idScoreM,
          p_num_doc       : this.scoreForm.value.num_doc,
          p_id_estado     : this.scoreForm.value.id_estado_d,
          p_req_validacion: this.scoreForm.value.req_validacion,
        },
      },
    ];
    this.scoreService.cargarOBuscarScoreDetalle(parametro[0]).subscribe((resp: any) => {
        this.blockUI.stop();

        console.log('D A T A - score_D', resp, resp.list.length);
        //ESTADO SCORE_M SOLICITADO
        if ((this.authService.esUsuarioLider() || this.authService.esUsuarioGestor()) && (this.scoreForm.controls['id_estado_m'].value == Enums.SCORE_M_ESTADOS.SOLICITADO)) {
          this.listScoreDetalleGen   = resp.list.filter((detalle: any) =>(detalle.id_estado == Enums.ESTADOS_SCORE_D.SOLICITADO || detalle.id_estado == Enums.ESTADOS_SCORE_D.APROBADO) && detalle.tipo_score.toUpperCase() == 'GENERAL');
          this.listScoreDetalleExcep = resp.list.filter((detalle: any) =>(detalle.id_estado == Enums.ESTADOS_SCORE_D.SOLICITADO || detalle.id_estado == Enums.ESTADOS_SCORE_D.APROBADO) && detalle.tipo_score.toUpperCase() == 'EXCEPCION');
          this.listScoreDetalleCorp  = resp.list;
        }

        // ESTADO SCORE_M EN APROBADO
        if (this.scoreForm.controls['id_estado_m'].value == Enums.SCORE_M_ESTADOS.APROBADO) {
          if (this.authService.esUsuarioLider()) {
            this.listScoreDetalleGen   = resp.list.filter((detalle: any) =>(detalle.id_estado == Enums.ESTADOS_SCORE_D.OBSERVADO || detalle.id_estado == Enums.ESTADOS_SCORE_D.APROBADO) && detalle.tipo_score.toUpperCase() == 'GENERAL');
            this.listScoreDetalleExcep = resp.list.filter((detalle: any) =>(detalle.id_estado == Enums.ESTADOS_SCORE_D.OBSERVADO || detalle.id_estado == Enums.ESTADOS_SCORE_D.APROBADO) && detalle.tipo_score.toUpperCase() == 'EXCEPCION');
          }

          if (this.authService.esUsuarioGestor()) {
            this.listScoreDetalleGen   = resp.list.filter((detalle: any) =>(detalle.id_estado == Enums.ESTADOS_SCORE_D.APROBADO) && detalle.tipo_score.toUpperCase() == 'GENERAL');
            this.listScoreDetalleExcep = resp.list.filter((detalle: any) =>(detalle.id_estado == Enums.ESTADOS_SCORE_D.APROBADO) && detalle.tipo_score.toUpperCase() == 'EXCEPCION');
          }
          this.listScoreDetalleCorp  = resp.list;
        }

        // ESTADO SCORE_M EN VALIDACION
        if ((this.authService.esUsuarioLider() || this.authService.esUsuarioGestor()) && this.scoreForm.controls['id_estado_m'].value == Enums.SCORE_M_ESTADOS.EN_VALIDACION) {
          this.listScoreDetalleGen   = resp.list.filter((detalle: any) =>(detalle.id_estado == 2 || detalle.id_estado == Enums.ESTADOS_SCORE_D.OBSERVADO || detalle.id_estado == Enums.ESTADOS_SCORE_D.APROBADO || detalle.id_estado == Enums.ESTADOS_SCORE_D.ENVIADO || detalle.id_estado == Enums.ESTADOS_SCORE_D.FINALIZADO || detalle.id_estado == Enums.ESTADOS_SCORE_D.SUBSANADO) && detalle.tipo_score.toUpperCase() == 'GENERAL');
          this.listScoreDetalleExcep = resp.list.filter((detalle: any) =>(detalle.id_estado == 2 || detalle.id_estado == Enums.ESTADOS_SCORE_D.OBSERVADO || detalle.id_estado == Enums.ESTADOS_SCORE_D.APROBADO || detalle.id_estado == Enums.ESTADOS_SCORE_D.ENVIADO || detalle.id_estado == Enums.ESTADOS_SCORE_D.FINALIZADO || detalle.id_estado == Enums.ESTADOS_SCORE_D.SUBSANADO) && detalle.tipo_score.toUpperCase() == 'EXCEPCION');
          this.listScoreDetalleCorp  = resp.list;
        }

        // ESTADO SCORE_M EN OBSERVADO
        if ( (this.authService.esUsuarioLider() || this.authService.esUsuarioGestor()) && this.scoreForm.controls['id_estado_m'].value == Enums.SCORE_M_ESTADOS.OBSERVADO) {
          this.listScoreDetalleGen   = resp.list.filter((detalle: any) =>detalle.id_estado == Enums.ESTADOS_SCORE_D.OBSERVADO && detalle.tipo_score.toUpperCase() == 'GENERAL');
          this.listScoreDetalleExcep = resp.list.filter((detalle: any) =>detalle.id_estado == Enums.ESTADOS_SCORE_D.OBSERVADO && detalle.tipo_score.toUpperCase() == 'EXCEPCION');
          this.listScoreDetalleCorp  = resp.list;
        }

        // ESTADO SCORE_M EN ENVIADO, detalle: score_d
        if (this.scoreForm.controls['id_estado_m'].value == Enums.SCORE_M_ESTADOS.ENVIADO) {
          if (this.authService.esUsuarioLider()) {
            this.listScoreDetalleGen   = resp.list.filter((detalle: any) =>(detalle.id_estado == Enums.ESTADOS_SCORE_D.OBSERVADO || detalle.id_estado == Enums.ESTADOS_SCORE_D.ENVIADO)  && detalle.tipo_score.toUpperCase() == 'GENERAL');
            this.listScoreDetalleExcep = resp.list.filter((detalle: any) =>(detalle.id_estado == Enums.ESTADOS_SCORE_D.OBSERVADO || detalle.id_estado == Enums.ESTADOS_SCORE_D.ENVIADO) && detalle.tipo_score.toUpperCase() == 'EXCEPCION');
          }

          if (this.authService.esUsuarioGestor()) {
            this.listScoreDetalleGen   = resp.list.filter((detalle: any) =>detalle.id_estado == Enums.ESTADOS_SCORE_D.ENVIADO && detalle.tipo_score.toUpperCase() == 'GENERAL');
            this.listScoreDetalleExcep = resp.list.filter((detalle: any) =>detalle.id_estado == Enums.ESTADOS_SCORE_D.ENVIADO && detalle.tipo_score.toUpperCase() == 'EXCEPCION');
          }
          this.listScoreDetalleCorp  = resp.list;
        }

        // ESTADO SCORE_M EN FINALIZADO
        if ((this.authService.esUsuarioGestor() || this.authService.esUsuarioLider()) && this.scoreForm.controls['id_estado_m'].value == Enums.SCORE_M_ESTADOS.FINALIZADO) {
          this.listScoreDetalleGen   = resp.list.filter((detalle: any) => detalle.id_estado ==  Enums.ESTADOS_SCORE_D.FINALIZADO && detalle.tipo_score.toUpperCase() == 'GENERAL');
          this.listScoreDetalleExcep = resp.list.filter((detalle: any) => detalle.id_estado ==  Enums.ESTADOS_SCORE_D.FINALIZADO && detalle.tipo_score.toUpperCase() == 'EXCEPCION');
          this.listScoreDetalleCorp  = resp.list.filter((detalle: any) => detalle.id_estado ==  Enums.ESTADOS_SCORE_D.FINALIZADO);
        }

        this.totalGeneral = this.listScoreDetalleGen.length;
        this.totalExcep   = this.listScoreDetalleExcep.length;

        this.spinner.hide();
      });
  }

  get existeRegistros(): boolean {
    return this.listScoreDetalle.length == 0;
  }

  buscarEstadoPorNombre(nombreEstado: string): any {
    return this.listEstado.find((estado) => estado.cNombre.toUpperCase() == nombreEstado);
  }

  validarSiExisteReqValidacion(): any {
    if (this.DATA_SCORE.casoScore.toUpperCase() == 'RESIDENCIAL') {
      const detalleGeneralEncontrado   = this.listScoreDetalleGen.find((score) => score.req_validacion == 1);
      const detalleExcepcionEncontrado = this.listScoreDetalleExcep.find((score) => score.req_validacion == 1);
      return detalleGeneralEncontrado || detalleExcepcionEncontrado;
    } else {
      return this.listScoreDetalleCorp.find((score) => score.req_validacion == 1);
    }
  }

  cambiarEstadoScoreM(nombreEstado: string) {
    console.log('DATA_M', this.DATA_SCORE, this.DATA_SCORE.estado);

    console.log('Estados_M', this.listEstado);
    const estado = this.buscarEstadoPorNombre(nombreEstado);

    this.actualizarScore_m(estado.idEstado);
  }

  observarScoreRegistro() {
    if (this.DATA_SCORE.estado == 'Solicitado' || this.DATA_SCORE.estado == 'Aprobado' || this.DATA_SCORE.estado == 'En Validación') {
      Swal.fire({
        title: 'Observar estado?',
        text: `¿Estas seguro que desea cambiar de estado a Observado?`,
        icon: 'question',
        confirmButtonColor: '#20c997',
        cancelButtonColor: '#9da7b1',
        confirmButtonText: 'Si, Cambiar!',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
      }).then((resp) => {
        if (resp.value) {
          this.cambiarEstadoScoreM('OBSERVADO');
          this.cambiarEstadoDetalleAobservado();
          this.cargarOBuscarScoreDetalle();
        }
      });
    }
  }

  descargarExcelScore_D() { //DESCARGAR EXCELL - PRUEBA
    let parametro: any[] = [
      {
        queryId: 21,
        mapValue: {
          p_idScore: this.DATA_SCORE.idScoreM,
        },
      },
    ];
    this.scoreService.exportScoreDetalleMasivoOdiurno(parametro[0]).subscribe((resp: any) => {
        this.excellB2BService.dowloadExcel(resp.list);
      });
  }

  enviarSolicitudTDP() {
    if (this.DATA_SCORE.estado.toUpperCase() == 'SOLICITADO' || this.DATA_SCORE.estado.toUpperCase() == 'APROBADO' || this.DATA_SCORE.estado.toUpperCase() == 'EN VALIDACIÓN') {
      Swal.fire({
        title: 'Enviar Solicitud score?',
        text: `¿Estas seguro que desea enviar la Solicitud y cambiar el estado a enviado? `,
        icon: 'question',
        confirmButtonColor: '#20c997',
        cancelButtonColor: '#9da7b1',
        confirmButtonText: 'Si, Enviar!',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
      }).then((resp) => {
        console.log('123', resp);

        if (resp.value) {
          if (this.scoreForm.controls['formatoScore'].value == 'Masivo' || this.scoreForm.controls['formatoScore'].value == 'Diurno') {
            this.exportScoreDetalleMasivoOdiurno(this.DATA_SCORE.idScoreM);
          } else {
            this.exportScoreDetalleB2B(this.DATA_SCORE.idScoreM);
          }
        }
      });
    }
  }

  exportScoreDetalleMasivoOdiurno(id_score: number) {
    let parametroWL: any[] = [{queryId: 23, mapValue: {},},];
    let parametro  : any[] = [{queryId: 20, mapValue: {p_idScore: id_score}},];
    let paramTablas: any[] = [{queryId: 25}];

    let listadoWL    :any[]=[];
    let listadoTablas:any[]=[];

    this.scoreService.listExportWL(parametroWL[0]).pipe(
      tap((respWL: any)=> { console.log('LISTA_WL', respWL);  if (respWL && respWL.list ) {listadoWL = respWL.list}}),
        concatMap(() => this.scoreService.listTablasExport(paramTablas[0]),),

      tap((respTablas: any) => {console.log('LISTA_TABLAS', respTablas); if (respTablas && respTablas.list) { listadoTablas = respTablas.list}}),
        concatMap(() => this.scoreService.exportScoreDetalleMasivoOdiurno(parametro[0]) )

      ).subscribe((resp: any) => {
        console.log('Data-PESTAÑAS', resp.list, this.DATA_SCORE.formatoScore, listadoWL, listadoTablas);

        if (resp) {
          if (this.DATA_SCORE.formatoScore == 'Masivo') { console.log('IF-MASIVO');
            this.excellMasivoService.generarExcell(resp.list, listadoWL).then((file: any) => {
                const blob = new Blob([file]);
                // return
                this.listadoCorreosTDP(blob);
              });
          }

          if (this.DATA_SCORE.formatoScore == 'Diurno'){ console.log('ELSE-DIURNO');
            this.excellDiurnoService.generarExcell(resp.list, listadoWL, listadoTablas).then((file: any) => {
                const blob = new Blob([file]);
                // return
                this.listadoCorreosTDP(blob);
              });
            }
         }
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

        this.excellB2BService.generarExcell(resp.list).then((file) => {
          const blob = new Blob([file]);
          this.listadoCorreosTDP(blob);
        });
      });
  }

  listCorreoGestor: string = '';
  listadoCorreosGESTOR() {
    let parametro: any[] = [{ queryId: 15 }];
    this.scoreDetalleService.listadoCorreosTDP(parametro[0]).subscribe((resp: any) => {
        if (resp && resp.list) {
          console.log('CORREOS-GESTOR',resp.list, resp.list.map((x: any) => x.valor_texto_1), resp.list.map((cc: any) => cc.valor_texto_2));
          this.notificarAprobacionPorCorreo(resp.list.map((x: any) => x.valor_texto_1), resp.list.map((cc: any) => cc.valor_texto_2));
        }
      });
  }

  listCorreoTdp: string = '';
  listadoCorreosTDP(file: Blob) {
    let parametro: any[] = [{ queryId: 15 }];
    this.scoreDetalleService.listadoCorreosTDP(parametro[0]).subscribe((resp: any) => {
        if (resp && resp.list) {
          console.log('CORREOS-TDP',resp.list, resp.list.map((x: any) => x.valor_texto_1), resp.list.map((cc: any) => cc.valor_texto_2));
          this.enviarCorreo(file, resp.list.map((x: any) => x.valor_texto_1), resp.list.map((cc: any) => cc.valor_texto_2));
        }
      });
  }

  fechaIniPrueba: any = '';
  fechaFinPrueba: any = '';
  enviarCorreo(file: Blob, listaCorreo: string[], correoCopia: string[]) {
    console.log('|==>', file, this.scoreForm.value);
    this.blockUI.start('Enviando Solicitud al correo del TDP ...');
    const data = new FormData();

    if (this.scoreForm.controls['formatoScore'].value.toUpperCase() == 'MASIVO') {
      data.append('From', 'procesosqa@indratools.net');
      data.append('ToEmail', listaCorreo.join(';'));
      data.append('Cc', correoCopia.join(';'));
      data.append('Subject','Formato_Solicitud_Score_B2C_ ' +this.fechaIniPrueba +' AL ' +this.fechaFinPrueba +'-MASIVO');
      data.append('Body','[C O R R E O   P R U E B A-MASIVO] Estimados, Por favor su apoyo con la programación del score adjunto. De antemano muchas gracias por el apoyo, estaremos a la espera de tu confirmación..');
      data.append('Attachments',file,'Formato_Solicitud_Score_B2C_ ' +this.fechaIniPrueba +' AL ' +this.fechaFinPrueba +'-MASIVO' +'.xlsx');
    }
    if (this.scoreForm.controls['formatoScore'].value == 'Diurno') {
      data.append('From', 'procesosqa@indratools.net');
      data.append('ToEmail', listaCorreo.join(';'));
      data.append('Cc', correoCopia.join(';'));
      data.append('Subject','Formato_Solicitud_Score_B2C_ ' + this.fechaIniPrueba + ' -DIURNA_v2');
      data.append('Body','[C O R R E O   P R U E B A - DIURNO] Estimados, Por favor su apoyo con la programación del score adjunto. De antemano muchas gracias por el apoyo, estaremos a la espera de tu confirmación.');
      data.append('Attachments',file,'Formato_Solicitud_Score_B2C_ ' +this.fechaIniPrueba +' -DIURNA_v2' +'.xlsx');
    }
    if (this.scoreForm.controls['formatoScore'].value == 'B2B') {
      data.append('From', 'procesosqa@indratools.net');
      data.append('ToEmail', listaCorreo.join(';'));
      data.append('Cc', correoCopia.join(';'));
      data.append('Subject', 'Formato_Solicitud_Score_B2B_RQ-[Nro req]');
      data.append('Body','[C O R R E O   P R U E B A - B2B] Estimados, Por favor su apoyo con la programación del score adjunto. De antemano muchas gracias por el apoyo, estaremos a la espera de tu confirmación.');
      data.append('Attachments',file,'Formato_Solicitud_Score_B2B_RQ-[Nro req]' + '.xlsx');
    }

    this.sendMailService.SendDataByEmail(data).then((response) => {
        if (response && response.ok) {
          Swal.fire({
            title: 'Enviar formato!',
            text: `El formato: ${this.DATA_SCORE.idScore_M}, fue enviado con éxito`,
            icon: 'success',
            confirmButtonText: 'Ok',
          });
          this.cambiarEstadoScoreM('ENVIADO');    //-------------------------------------------------------- CAMBIAR DE ESTADO SCORE_M -----------------------------------------------
          this.cambiarEstadoDetalleAenviado();    //-------------------------------------------------------- CAMBIAR DE ESTADO SCORE_D -----------------------------------------------
          this.close(true);
        }
        console.log(response);
        this.blockUI.stop();
      })
      .catch((error) => console.log('error', error));
  }


  notificarAprobacionPorCorreo(listaCorreoGestor: string[], correoCopia: string[]) {
    this.blockUI.start('Notificando la Aprobación de la Solicitud, al correo del Gestor');
    const data = new FormData();
    const listCorreo =

      data.append('From', 'procesosqa@indratools.net');
      data.append('ToEmail', listaCorreoGestor.join(';'));
      data.append('Cc', correoCopia.join(';'));
      data.append('Subject','Aprobación de Solicitud' + this.DATA_SCORE.idScore_M +' Caso ' + this.DATA_SCORE.casoScore + 'en Formato'+ this.DATA_SCORE.formatoScore);
      data.append('Body','Estimado Gestor, Por favor su apoyo con con la aprobación de la Solicitud, se adjuntó la evidencia a la Web Dynamo. De antemano muchas gracias por el apoyo.');
      // data.append('Attachments',file,'Formato_Solicitud_Score_B2C_ ' +this.fechaIniPrueba +' AL ' +this.fechaFinPrueba +'-MASIVO' +'.xlsx');

      this.sendMailService.SendDataByEmail(data).then((response) => {
        if (response && response.ok) {
          Swal.fire({
            title: 'Aprobación de Solicitud!',
            text: `Se notificó al Gestor de la aprobación de la Solicitud`,
            icon: 'success',
            confirmButtonText: 'Ok',
          });
          // this.cambiarEstadoScoreM('APROBADO');//-------------------------------------------------------- CAMBIAR DE ESTADO SCORE_M -----------------------------------------------
          // this.cambiarEstadoDetalleAaprobado();//-------------------------------------------------------- CAMBIAR DE ESTADO SCORE_D -----------------------------------------------
          this.close(true);
        }
        console.log(response);
        this.blockUI.stop();
      })
      .catch((error) => console.log('error', error));
  }

  cambiarEstadoDetalleAaprobado() {
    let parametro: any[] = [
      {
        queryId: 16,
        mapValue: {
          p_idScore: this.DATA_SCORE.idScoreM,
        },
      },
    ];

    this.scoreService.cambiarEstadoDetalleAaprobado(parametro[0]).subscribe({ next: (resp: any) => {} });
  }

  cambiarEstadoDetalleAenviado() {
    let parametro: any[] = [
      {
        queryId: 14,
        mapValue: {
          p_idScore: this.DATA_SCORE.idScoreM,
        },
      },
    ];

    this.scoreService.cambiarEstadoDetalleAenviado(parametro[0]).subscribe({ next: (resp: any) => {} });
  }

  cambiarEstadoDetalleAobservado() {
    let parametro: any[] = [
      {
        queryId: 18,
        mapValue: {
          p_idScore: this.DATA_SCORE.idScoreM,
        },
      },
    ];

    this.scoreService.cambiarEstadoDetalleAobservado(parametro[0]).subscribe({ next: (resp: any) => {} });
  }

  verEvidenciasPDF() {
    // FALTA IMPLEMENTAR¡¡¡¡¡¡¡¡¡¡¡¡¡¡
  }

  mapearScore(idEstado?: number): any[] {
    const formValues = this.scoreForm.getRawValue();

    return [
      {
        queryId: 6,
        mapValue: {
          p_idScoreM          : this.DATA_SCORE.idScoreM,
          p_idEstado          : idEstado ? idEstado : formValues.id_estado_m,
          p_actualiza         : this.userName,
          p_f_actualiza       : '',
          CONFIG_USER_NAME    : this.userName,
          CONFIG_OUT_MSG_ERROR: '',
          CONFIG_OUT_MSG_EXITO: '',
        },
      },
    ];
  }

  actualizarScore_m(estadoScore?: number) {
    this.spinner.show();
    let parametro: any[] = this.mapearScore(estadoScore);

    this.scoreService.actualizarScore_m(parametro[0]).subscribe({
      next: (resp: any) => {
        this.spinner.hide();

        console.log('DATA_ACTUALIZADO', resp);
        if (!estadoScore) {
          this.dialogRef.close('Actualizar');
        } else {
          this.listScoreM_ByID();
        }

        Swal.fire({
          title: 'Actualizar Score!',
          text: `${this.DATA_SCORE.idScore_M}, actualizado con éxito`,
          icon: 'success',
          confirmButtonText: 'Ok',
        });
      },
      error: () => {
        Swal.fire('ERROR', 'No se pudo actualizar el Score', 'warning');
      },
    });
  }

  listScoreM_ByID() {
    let parametro: any = {
      queryId: 13,
      mapValue: {p_idScoreM: this.DATA_SCORE.idScoreM,},
    };

    this.scoreService.listScoreM_ByID(parametro).subscribe({
      next: (resp: any) => {
        this.scoreForm.controls['id_estado_m'].setValue(resp.list[0].idEstado);

        this.cargarOBuscarScoreDetalle();
        this.ListaHistoricoCambios(this.DATA_SCORE.idScoreM);
      },
    });
  }

  actionBtn: string = 'Agregar';
  cargarSCoreByID() {
    this.actionBtn = 'Actualizar';
    this.scoreForm.controls['id_score'        ].setValue(this.DATA_SCORE.idScoreM);
    this.scoreForm.controls['solicitante'     ].setValue(this.DATA_SCORE.solicitante);
    this.scoreForm.controls['id_estado_m'     ].setValue(this.DATA_SCORE.idEstado);
    this.scoreForm.controls['motivo_solicitud'].setValue(this.DATA_SCORE.motivo_solicitud);
    this.scoreForm.controls['casoScore'       ].setValue(this.DATA_SCORE.casoScore);
    this.scoreForm.controls['formatoScore'    ].setValue(this.DATA_SCORE.formatoScore);
    this.scoreForm.controls['fecha_ini_prueba'].setValue(this.DATA_SCORE.fecha_ini_prueba);
    this.scoreForm.controls['fecha_fin_prueba'].setValue(this.DATA_SCORE.fecha_fin_prueba);
    this.scoreForm.controls['obs_score'       ].setValue(this.DATA_SCORE.obs_score);

    if (this.DATA_SCORE.fecha_ini_prueba) {
      let fecha_x = this.DATA_SCORE.fecha_ini_prueba;
      const str = fecha_x.split('/');
      const year = Number(str[2]);
      const month = Number(str[1]);
      const date = Number(str[0]);
      this.scoreForm.controls['fecha_ini_prueba'].setValue(this.datePipe.transform(new Date(year, month - 1, date), 'yyyy-MM-dd'));
      this.scoreForm.controls['fechaIniPrueba'  ].setValue(this.datePipe.transform(new Date(year, month - 1, date), 'dd/MM/yyyy'));

      this.fechaIniPrueba = this.datePipe.transform(new Date(year, month - 1, date),'ddMMyyyy');
    }

    if (this.DATA_SCORE.fecha_fin_prueba) {
      console.log('Fecha', this.scoreForm);

      let fecha_x = this.DATA_SCORE.fecha_fin_prueba;
      const str = fecha_x.split('/');
      const year = Number(str[2]);
      const month = Number(str[1]);
      const date = Number(str[0]);
      this.scoreForm.controls['fecha_fin_prueba'].setValue(this.datePipe.transform(new Date(year, month - 1, date), 'yyyy-MM-dd'));
      this.scoreForm.controls['fechaFinPrueba'  ].setValue(this.datePipe.transform(new Date(year, month - 1, date), 'dd/MM/yyyy'));

      this.fechaFinPrueba = this.datePipe.transform(new Date(year, month - 1, date),'ddMMyyyy');
    }

    this.validateIfIsLider();

    if (this.scoreForm.controls['id_estado_m'].value != 1) {
      this.validarIfIsGestor();
    }

    this.cargarOBuscarScoreDetalle();
  }

  rolGestorTdp: number = 0;
  isGestorTDP() {
    this.rolGestorTdp = this.authService.getRolID();
    console.log('ID_ROL_TDP', this.rolGestorTdp);
  }

  disabledControls() {
    this.scoreForm.controls['fecha_ini_prueba'].disable();
    this.scoreForm.controls['fecha_fin_prueba'].disable();
    this.scoreForm.controls['motivo_solicitud'].disable();
    this.scoreForm.controls['obs_score'       ].disable();
  }

  validarIfIsGestor() {
    if (!this.authService.esUsuarioGestor()) {
      this.disabledControls();
    }
  }

  validateIfIsLider() {
    if (!this.authService.esUsuarioLider()) {
      this.disabledControls();
    }
  }

  listHistoricoCambios: any[] = [];
  ListaHistoricoCambios(idRegistro: number) {
    this.spinner.show();

    let parametro: any[] = [
      {
        queryId: 7,
        MapValue: {
          p_idhistorico: this.DATA_SCORE.idScoreM,
        },
      },
    ];
    this.scoreService.ListaHistoricoCambios(parametro[0]).subscribe((resp: any) => {
        this.listHistoricoCambios = resp.list;
        console.log('listHistorico', resp.list);
        this.spinner.hide();
      });
  }

  listEstado: any[] = [];
  getListEstado() {
    let parametro: any[] = [{ queryId: 5 }];

    this.scoreService.getListEstado(parametro[0]).subscribe((resp: any) => {
      this.listEstado = resp.list;
    });
  }

  getUserID() {
    this.authService.getCurrentUser().subscribe((resp) => {
      this.userID = resp.user.userId;
      console.log('ID-USER', this.userID);
    });
  }

  getUsername() {
    this.authService.getCurrentUser().subscribe((resp) => {
      this.userName = resp.userName;
      this.scoreForm.controls['solicitante'].setValue(this.userName);
      console.log('USER_NAME', this.userName);
    });
  }

  limpiarFiltro() {
    this.scoreForm.reset('', { emitEvent: false });
    this.newFilfroForm();

    this.cargarOBuscarScoreDetalle();
    this.cargarSCoreByID();
  }

  totalfiltro = 0;
  totalScore: number = 0;
  cambiarPagina(event: number) {
    let offset = event * 10;
    this.spinner.show();

    if (this.totalfiltro != this.totalScore) {
      this.scoreService.cargarOBuscarScoreDetalle(offset.toString()).subscribe((resp: any) => {
          //  this.listScoreDetalleGen = resp.list.filter((x: any)=> x.tipo_score == 'General');
          this.listScoreDetalleGen = resp.list;
          this.spinner.hide();
        });
    } else {
      this.spinner.hide();
    }
    this.page = event;
  }

  estadoEnValidacionScoreM(response: any) {
    if (response.resp.exitoMessage == 'Actualización exitosa') {
      this.cambiarEstadoScoreM('EN VALIDACIÓN');
    }
  }

  estadoObservadoScoreM(resp: any) {
    if (resp.exitoMessage == 'Actualización exitosa') {
      this.cambiarEstadoScoreM('OBSERVADO');
    }
  }

  aprobarEstadoScoreM(resp: any) {
    this.cambiarEstadoScoreM('APROBADO');
  }

  estadoFinalizadoScoreM(resp: any) {
    this.cambiarEstadoScoreM('FINALIZADO');
  }

  validarSiExisteRegistroObservado(): any {
    // console.log('SCORE_D_OBSERVADO', this.listScoreDetalle);
    return this.listScoreDetalle.find(s => s.estado.toUpperCase() == 'OBSERVADO');
  }

  existeScoreD_Aprobado(): any {
    return this.listScoreDetalle.find(s => s.estado.toUpperCase() == 'APROBADO');
  }

  asignarComentarioScore_d(DATA: any) {
    const dialogRef = this.dialog.open(AsignarComentarioComponent, {width: '35%', data:{ scoreComentForm: this.scoreForm.getRawValue(), DATA},});

    dialogRef.afterClosed().subscribe((resp) => {
      // console.log('DATA_SCOR_MAESTRA', this.listScoreDetalleCorp.find(x=>x.formato_score == 'B2B'));

      if (resp) {
        if ((this.DATA_SCORE.formatoScore == 'B2B' || this.DATA_SCORE.formatoScore == 'Masivo' || this.DATA_SCORE.formatoScore == 'Diurno') && resp.formValues && resp.formValues.id_estado_d == 4) {
          console.log('IF_COMENTARIO', resp,);
          this.estadoEnValidacionScoreM(resp);
        }else{
          console.log('ELSE-COMENTARIO');
          this.listScoreM_ByID()
          // this.cargarOBuscarScoreDetalle();
          // this.ListaHistoricoCambios(this.DATA_SCORE.idScoreM);
        }
      }
    });
  }

  observarMasivamenteSolicitud() {
    const dialogRef = this.dialog.open(ObservarMasivamenteComponent, { width: '25%', data: { scoreObsForm: this.scoreForm.getRawValue(), isCreation: true },});
    dialogRef.afterClosed().subscribe((resp) => {
      if (resp) {
        console.log('X-Y-Z', resp);

        if (this.DATA_SCORE.formatoScore == 'B2B' || this.DATA_SCORE.formatoScore == 'Masivo' || this.DATA_SCORE.formatoScore == 'Diurno') {
          this.estadoObservadoScoreM(resp);
          this.cambiarEstadoDetalleAobservado();
          this.listScoreM_ByID();
        }
      }
    });
  }

  importarPdf_AprobarSolicitud() {
    const dialogRef = this.dialog.open(AprobarImportarComponent, {width: '35%',data: { scoreObsForm: this.scoreForm.getRawValue(), isCreation: true },});
    dialogRef.afterClosed().subscribe((resp) => {

      console.log('XYZ', resp);
      if (resp) {
        // return
        if ((this.DATA_SCORE.formatoScore == 'B2B' || this.DATA_SCORE.formatoScore == 'Masivo' || this.DATA_SCORE.formatoScore == 'Diurno') && (this.scoreForm.controls['id_estado_m'].value == 2 || this.scoreForm.controls['id_estado_m'].value == 3)) {
          console.log('if');
          // this.cambiarEstadoDetalleAaprobado();
        this.aprobarEstadoScoreM(resp);
        this.cargarOBuscarScoreDetalle();
        this.ListaHistoricoCambios(this.DATA_SCORE.idScoreM);
        }
      }
    });
  }

  finalizarSolicitud() {
    if (this.DATA_SCORE.estado.toUpperCase() == 'ENVIADO') {
      Swal.fire({
        title: 'Finalizar solicitud?',
        text: `¿Estas seguro que desea dar por finalizado la Solicitud, este cambio no se puede revertir? `,
        icon: 'question',
        confirmButtonColor: '#1574ff',
        cancelButtonColor: '#9da7b1',
        confirmButtonText: 'Si, Finalizar!',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
      }).then((resp) => {
        console.log('FINALIZAR_EST', resp);

        if (resp.value) {
          this.spinner.show();
          let parametro: any[] = [
            {
              queryId: 24, mapValue: {p_idScore: this.DATA_SCORE.idScoreM},
            },
          ];
          this.scoreService.finalizarSolicitud(parametro[0]).subscribe({
            next: (resp: any) => {
              this.spinner.hide();
              this.estadoFinalizadoScoreM(resp)
            },
            error: () => {
              Swal.fire('ERROR', 'No se pudo Finalizar la Solicitud', 'warning');
            },
          });
        }
      });
    }
  }

  campoNoValido(campo: string): boolean {
    if (this.scoreForm.get(campo)?.invalid && this.scoreForm.get(campo)?.touched) {
      return true;
    } else {
      return false;
    }
  }

  close(succes?: boolean) {
    this.dialogRef.close(succes);
  }
}

