import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,  } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/core/services/auth.service';
import { ScoreService } from 'src/app/core/services/score.service';
import Swal from 'sweetalert2';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { AsignarObservacionComponent } from './asignar-observacion/asignar-observacion.component';
import * as XLSX from 'xlsx';
import { ScoreDetalleService } from 'src/app/core/services/score-detalle.service';
import { ScoreDetalle } from 'src/app/core/models/scored.models';
import { mapearListadoDetalleScore } from 'src/app/core/mapper/detalle-score.mapper';
import { concatMap, of } from 'rxjs';
import { SendMailService } from 'src/app/core/services/send-mail.service';
import { ExcellDiurnoService } from 'src/app/core/services/excell-diurno.service';
import { ExcellMasivoService } from 'src/app/core/services/excell-masivo.service';
import { ExcellB2BService } from 'src/app/core/services/excell-b2b.service';
import { ImportarSolicitudComponent } from './Importar-archivo/importar-solicitud.component';

@Component({
  selector: 'app-modal-evento',
  templateUrl: './modal-score.component.html',
  styleUrls: ['./modal-score.component.scss']
})
export class ModalStoreComponent implements OnInit {
  @BlockUI() blockUI!: NgBlockUI;
  minDate = new Date()
  activeTab:string = 'General'


  scoreForm!: FormGroup;
  score_Id!: number;
  page = 1;
  totalScore: number = 0;
  pageSize = 10;

  usuario: any;
  loadingItem: boolean = false;
  userID: number = 0;
  userName: string = '';

  totalGeneral: number = 0;
  totalExcep: number = 0;

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
  ) { }

  ngOnInit(): void {
    this.newFilfroForm();
    this.isGestorTDP();
    this.getUsername();
    this.getUserID();
    this.getListEstado();
    // this.getListEstadoDetalle();
    if (this.DATA_SCORE && this.DATA_SCORE.idScoreM){
        this.score_Id = this.DATA_SCORE.idScore_M
        this.cargarOBuscarScoreDetalle();
        this.ListaHistoricoCambios(this.DATA_SCORE);
        this.cargarSCoreByID();
    }
    console.log('DATA_SCORE', this.DATA_SCORE);
    console.log('DATA_SCORE_ID', this.DATA_SCORE.idScoreM);
    }

    newFilfroForm(){
      this.scoreForm = this.fb.group({
        solicitante            : [''],
        id_estado_m            : [{value: '', disabled: true}],
        id_score               : [''],
        fecha_envio            : ['', Validators.required],
        fecha_solicitud        : [''],
        formato_envio          : ['', Validators.required],
        item_horario_envio     : ['', Validators.required],
        observacion            : [''],
        fecha_proceso          : [''],
        num_doc                : [''],
        id_estado_d            : [''],
        version                : [''],
        importar               : [''],
        actualiza              : [''],
        fecha_ini_prueba       : ['', Validators.required],
        fecha_fin_prueba       : ['', Validators.required],
        hora_ini_prueba        : ['', Validators.required],
        hora_fin_prueba        : ['', Validators.required],
        motivo_solicitud       : [''],
        nombre_proy            : [''],
        casoScore              : [''],
        tipoScore              : [''],
        req_validacion         : [''],
        fechaIniPrueba         : [null],
        fechaFinPrueba         : [null],
        fechaEnvioPrueba       : [null]
      })
    }

    onTabClick(tab: string){
      this.activeTab = tab
    }


    validarImportacionExcell(): boolean{
      let importacionCorrecta: boolean = true;

      this.scoreDataImport.map((data, indice)=> {
        console.log('FORMATO_ENVIO', this.scoreForm.controls['formato_envio'].value);

        console.log('==>',data, indice, data.TIPODOCUMENTO, data.NUMDOCUMENTO.length, data.TIPODEVENTA, data.Segmento, data.FECHAPROCESO.length)

        if (data.TIPODOCUMENTO != 'DNI'  && data.TIPODOCUMENTO != 'CEX') {
          importacionCorrecta = false;
          Swal.fire({
            icon: 'error',
            title: 'ERROR sólo se permiten "DNI" o "CEX", corregir en',
            text: `La columna: 'TIPODOCUMENTO' vs fila: ${(indice+2)}`
          }
          );
        }

        if (data.Segmento != 'MOVIL'  && data.Segmento != 'FIJA' && data.Segmento != 'MOVISTAR TOTAL') { // SOLO EN MAYUSCULA
          importacionCorrecta = false;

          Swal.fire({
            icon:'error',
            title:'ERROR, sólo se permiten MOVIL, FIJA o MOVISTAR TOTAL. Corregir en',
            text:`La columna: 'Segmento' vs fila: ${(indice+2)}`
            });
        }

        // if (data.TIPOTRANSACCION != 'CAEQ' && data.TIPOTRANSACCION != 'ALTA' && data.TIPOTRANSACCION != 'CAEQ MOVIL'&& data.TIPOTRANSACCION != 'CAPL'&& data.TIPOTRANSACCION != 'CASI + CAEQ') {
        //   importacionCorrecta = false;

        //   Swal.fire({
        //     icon:'error',
        //     title:'ERROR, sólo se permiten "CAEQ", "ALTA" O "CAEQ MOVIL" corregir en',
        //     text:`La columna: 'TIPOTRANSACCION' vs fila: ${(indice + 2)}`
        //     });
        // }

        if (data.NEGOCIOYSEGMENTO != 'MOVIL B2C' && data.NEGOCIOYSEGMENTO != 'FIJA B2C'&& data.NEGOCIOYSEGMENTO != 'MOVISTAR TOTAL B2C') {
          importacionCorrecta = false;

          Swal.fire({
            icon:'error',
            title:'ERROR, sólo se permiten "MOVIL B2C", "FIJA B2C" O "MOVISTAR TOTAL B2C" corregir en',
            text:`La columna: 'NEGOCIOYSEGMENTO' vs fila: ${(indice+2)}`
            });
        }

        // if (data.TIPODEVENTA != 'FINANCIADO' && data.TIPODEVENTA != 'CONTADO'&& data.TIPODEVENTA != 'FIJA FINANCIADO + MOVIL FINANCIADO'&& data.TIPODEVENTA != 'FIJA FINANCIADO + MOVIL CONTADO' && data.TIPODEVENTA != 'FINANCIADO MOVIL Y FINANCIADO FIJA') {
        //   importacionCorrecta = false;

        //   Swal.fire({
        //     icon:'error',
        //     title:'ERROR, sólo se permiten "FINANCIADO", "CONTADO", "FIJA FINANCIADO + MOVIL FINANCIADO", "FINANCIADO MOVIL Y FINANCIADO FIJA" o "FIJA FINANCIADO + MOVIL CONTADO" corregir en',
        //     text:`La columna: 'TIPODEVENTA' vs fila: ${(indice+2)}`
        //     });
        // }

        if (data.GAMADEEQUIPO != 'NO APLICA' && data.GAMADEEQUIPO != 'APLICA' && data.GAMADEEQUIPO != 'TODAS'&& data.GAMADEEQUIPO != 'MEDIA'&& data.GAMADEEQUIPO != 'PREMIUM'&& data.GAMADEEQUIPO != 'BAJA') {
          importacionCorrecta = false;

          Swal.fire({
            icon:'error',
            title:'ERROR, sólo se permiten "APLICA", "NO APLICA", "MEDIA", "PREMIUM", "BAJA" O "TODAS" corregir en',
            text:`La columna: 'GAMADEEQUIPO' vs fila: ${(indice+2)}`
            });
        }

        //     // if (data.FECHAPROCESO.length == 8) {
        //   importacionCorrecta = false;

        //   Swal.fire({
        //     icon:'error',
        //     title:'ERROR, La fecha de proceso solo acepta un total de 8 dígitos y en formato YYYYMMDD',
        //     text:`La columna: 'FECHAPROCESO' vs fila: ${(indice + 2)}`
        //     });
        // }

        // if ((data.NUMDOCUMENTO.length >= 8 ||  data.NUMDOCUMENTO.length < 9) && data.TIPODOCUMENTO == 'DNI') {

        //   Swal.fire({
        //     icon:'error',
        //     title:'Algo salio mal, Corregir en',
        //     text:`La columna: 'NUMDOCUMENTO' y fila: ${(indice+2)}`
        //   });
        // }

        // if ((data.NUMDOCUMENTO.length < 8 || data.NUMDOCUMENTO.length > 10  ) && data.TIPODOCUMENTO == 'CEX') {
        //   importacionCorrecta = false;

        //   Swal.fire({
        //     icon:'error',
        //     title:'Algo salio mal, Corregir en',
        //     text:`La columna: 'NUMDOCUMENTO' vs fila: ${(indice+2)}`
        //   });
        // }
      })
      return importacionCorrecta;
    }

    importacion = 0;
    scoreDataImport: any[] = [];
    readExcell(e: any){
      console.log('==>',e, this.scoreForm);
      this.importacion ++
      this.blockUI.start("Espere por favor, estamos Importando la Data a la Base de Datos, importación N°: " + this.importacion) ;

      let file = e.target.files[0];
      let fileReader = new FileReader();

      fileReader.readAsBinaryString(file)

      fileReader.onload = e => {
        var wb = XLSX.read(fileReader.result, { type: 'binary', cellDates: true})
        // console.log('****', wb);

        var sheetNames = wb.SheetNames;

        this.scoreDataImport = XLSX.utils.sheet_to_json(wb.Sheets[sheetNames[0]])

        console.log('DATA_EXCELL-IMPORTADO', this.scoreDataImport);

        this.scoreForm.controls['importar'].reset()
        this.scoreForm.controls['importar'].setValue(null)

        this.validarImportacionExcell();
        this.insertarListadoDetalleScore();

        this.blockUI.stop();
      }
    }

    insertarListadoDetalleScore(){
      this.spinner.show();
      let parametro: any[] = this.mapearScore();

      const listScoreDetalle: ScoreDetalle[] = mapearListadoDetalleScore(this.scoreDataImport, this.DATA_SCORE.idScoreM, this.scoreForm.controls['version'].value )

      this.scoreDetalleService.insertarListadoDetalleScore(listScoreDetalle)
          .pipe(concatMap((resp: any) => {
               return resp && resp.message == 'ok'? this.scoreService.actualizarScore(parametro[0]): of({})
        })
      ).subscribe((resp: any) => {
          console.log('ABC', resp);

        if(resp && resp.exitoMessage == 'Actualización exitosa'){
          this.scoreForm.controls['version'].setValue(this.DATA_SCORE.version + 1); //Seteamos la version del Score_m,

          Swal.fire({
            title: 'Importar Score!',
            text : `Se importó con éxito la data`,
            icon : 'success',
            confirmButtonText: 'Ok'
            });

            this.spinner.hide();
            this.actualizarScoreD();
            this.cargarOBuscarScoreDetalle();
        }
        console.log('DATA_SCORE_DETALLE', resp);
        }
      )}

    // listScoreDetalle: any[] = [];
    // cargarOBuscarScoreDetalle(){
    //   this.listScoreDetalle = [];

    //   this.blockUI.start("Cargando Score detalle...");
    //   let parametro: any[] = [{
    //     "queryId": 30,
    //     // "queryId": 1,
    //     "mapValue": {
    //         p_idScore   : this.DATA_SCORE.idScoreM,
    //         p_num_doc   : this.scoreForm.value.num_doc,
    //         p_id_estado : this.scoreForm.value.id_estado_d,
    //         p_fecha_proc: this.scoreForm.value.fecha_proceso,
    //         inicio      : this.datePipe.transform(this.scoreForm.value.fecha_solicitud_ini,"yyyy/MM/dd"),
    //         fin         : this.datePipe.transform(this.scoreForm.value.fecha_solicitud_fin,"yyyy/MM/dd"),
    //     }
    //   }];
    //   this.scoreService.cargarOBuscarScoreDetalle(parametro[0]).subscribe((resp: any) => {
    //   this.blockUI.stop();

    //    console.log('D A T A - score_D', resp, resp.list.length);

    //    if (this.authService.esUsuarioLider()) {
    //      this.listScoreDetalle = resp.list;
    //    }


    //    if(this.authService.esUsuarioGestor() && (this.DATA_SCORE.estado == 'En Validación' || this.DATA_SCORE.estado == 'Observado')) {
    //     this.listScoreDetalle = resp.list.filter((score: any) => (score.id_estado == 1 || score.id_estado == 5));
    //     console.log('IDX', this.listScoreDetalle);
    //    }

    //    if(this.authService.esUsuarioGestor() && this.DATA_SCORE.estado == 'Enviado') {
    //     this.listScoreDetalle = resp.list.filter((score: any) => (score.id_estado == 6));
    //     console.log('ENVIADOS_DATA', this.listScoreDetalle);
    //    }

    //    if(this.authService.esUsuarioGestor() && this.DATA_SCORE.estado == 'Subsanado') {
    //     this.listScoreDetalle = resp.list.filter((score: any) => (score.id_estado == 5 || score.id_estado == 6));
    //     console.log('ENVIADOS_DATA', this.listScoreDetalle);
    //    }

    //    if(this.authService.esUsuarioGestor() && this.DATA_SCORE.estado == 'Finalizado') {
    //     this.listScoreDetalle = resp.list.filter((score: any) => (score.id_estado == 7));
    //     console.log('FINALIZADOS-DATA', this.listScoreDetalle);
    //    }

    //    if(this.authService.esUsuarioGestor() && this.DATA_SCORE.estado == 'Aprobado') {
    //     this.listScoreDetalle = resp.list.filter((score: any) => (score.id_estado == 10 || score.id_estado == 1));
    //     console.log('APROBADOS-DATA', this.listScoreDetalle);
    //    }

    //    if (this.authService.esUsuarioGestor() && this.DATA_SCORE.estado == 'Solicitado') {
    //     this.listScoreDetalle = resp.list.filter((score: any) => score.id_estado == 1);
    //   }

    //     this.spinner.hide();
    //   });
    // }


    listScoreDetalle: any[] = [];
    listScoreDetalleExcep: any[] = [];
    listScoreDetalleGen: any[] = [];
    listScoreDetalleCorp: any[] = [];
    cargarOBuscarScoreDetalle(){
      this.listScoreDetalle = [];

      this.blockUI.start("Cargando Score detalle...");
      let parametro: any[] = [{
        "queryId": 33,
        "mapValue": {
            p_idScore   : this.DATA_SCORE.idScoreM,
            p_num_doc   : this.scoreForm.value.num_doc,
            p_id_estado : this.scoreForm.value.id_estado_d,
            p_req_validacion : this.scoreForm.value.req_validacion,
        }
      }];
      this.scoreService.cargarOBuscarScoreDetalle(parametro[0]).subscribe((resp: any) => {
      this.blockUI.stop();

       console.log('D A T A - score_D', resp, resp.list.length,);

       if((this.authService.esUsuarioLider() || this.authService.esUsuarioGestor()) && (this.DATA_SCORE.estado == 'En Validación' || this.DATA_SCORE.estado == 'Observado' || this.DATA_SCORE.estado == 'Solicitado' || this.DATA_SCORE.estado == 'Aprobado')) {
        this.listScoreDetalleGen   = resp.list.filter((score: any) => (score.id_estado == 2 || score.id_estado == 5) && score.caso_score.toUpperCase() == 'GENERAL');
        this.listScoreDetalleExcep = resp.list.filter((score: any) => (score.id_estado == 2 || score.id_estado == 5) && score.caso_score.toUpperCase() == 'EXCEPCION')
        this.listScoreDetalleCorp  = resp.list;
       }


      //  if (resp.list[2].req_validacion == '1') {
      //   if(this.authService.esUsuarioGestor() && this.DATA_SCORE.estado == 'Solicitado') {
      //   //  this.listScoreDetalleGen   = resp.list.filter((score: any) => (score.req_validacion == 1) && score.caso_score == 'General');
      //    this.listScoreDetalleGen   = resp.list.filter((score: any) => score.caso_score == 'General');
      //    this.listScoreDetalleExcep = resp.list.filter((score: any) => score.caso_score == 'Excepcion')
      //    this.listScoreDetalleCorp  = resp.list;
      //   }
      //  }

       if((this.authService.esUsuarioGestor() || this.authService.esUsuarioLider()) && this.DATA_SCORE.estado == 'Enviado') {
        this.listScoreDetalleGen   = resp.list.filter((score: any) => (score.id_estado == 6 ) && score.caso_score == 'General');
        this.listScoreDetalleExcep = resp.list.filter((score: any) => (score.id_estado == 6 ) && score.caso_score == 'Excepcion')
        this.listScoreDetalleCorp  = resp.list;
       }

       if(this.authService.esUsuarioGestor() && this.DATA_SCORE.estado == 'Subsanado') {
        this.listScoreDetalle = resp.list.filter((score: any) => (score.id_estado == 5 || score.id_estado == 6));
        console.log('ENVIADOS_DATA', this.listScoreDetalle);
       }

       if((this.authService.esUsuarioGestor() || this.authService.esUsuarioLider()) && this.DATA_SCORE.estado == 'Finalizado') {
        this.listScoreDetalleGen   = resp.list.filter((score: any) => (score.id_estado == 7 ) && score.caso_score == 'General');
        this.listScoreDetalleExcep = resp.list.filter((score: any) => (score.id_estado == 7 ) && score.caso_score == 'Excepcion')
        this.listScoreDetalleCorp  = resp.list.filter((score: any) => (score.id_estado == 7 ));
       }

      this.totalGeneral = this.listScoreDetalleGen.length;
      this.totalExcep = this.listScoreDetalleExcep.length;


        this.spinner.hide();
      });
    }


  get existeRegistros():boolean{
    return this.listScoreDetalle.length == 0;
  }

  buscarEstadoPorNombre(nombreEstado:string): any{
    return this.listEstado.find(estado => estado.cNombre.toUpperCase() == nombreEstado);
  }

  validarSiExiteRegistroObservado(): any{
    return this.listScoreDetalle.find( scoreDetalle => scoreDetalle.estado.toUpperCase() == 'OBSERVADO');
  }

  cambiarEstadoScoreM(nombreEstado: string){
    console.log('DATA_M',this.DATA_SCORE,  this.DATA_SCORE.estado );

    console.log('Estados_M',this.listEstado)
    const estado = this.buscarEstadoPorNombre(nombreEstado);

    this.actualizarScore(estado.idEstado);
  }

  solicitarScore(){
    if (this.DATA_SCORE.estado == 'Registrado' || this.DATA_SCORE.estado == 'Observado') {
      Swal.fire({
        title: '¿Solicitar Score?',
        text: '¿Estas seguro que deseas Solicitar el Score, tenga en cuenta que sólo se enviarán los registros que se encuentran en estado SOLICITADO',
        icon: 'question',
        confirmButtonColor: '#ec4756',
        cancelButtonColor : '#3cd8aa',
        confirmButtonText : 'Si, Solicitar!',
        showCancelButton  : true,
        cancelButtonText  : 'Cancelar',
      }).then((resp) => {
        if (resp.value) {
          this.cambiarEstadoScoreM('SOLICITADO')
        }
      });
    }
  }

  observarScoreRegistro(){
    if ((this.DATA_SCORE.estado == 'Solicitado' || this.DATA_SCORE.estado == 'Aprobado' || this.DATA_SCORE.estado == 'En Validación')  ) {
      Swal.fire({
        title: 'Observar estado?',
        text: `¿Estas seguro que desea cambiar de estado a Observado?`,
        icon: 'question',
        confirmButtonColor: '#20c997',
        cancelButtonColor : '#9da7b1',
        confirmButtonText : 'Si, Cambiar!',
        showCancelButton  : true,
        cancelButtonText  : 'Cancelar',
      }).then((resp) => {
        if (resp.value) {
          this.cambiarEstadoScoreM('OBSERVADO');
          this.cambiarEstadoDetalleAobservado();
        }
      });
    }
  }

  aprobarScoreRegistro(){
    if ((this.DATA_SCORE.estado == 'Solicitado')  ) {
      Swal.fire({
        title: 'Aprobar y adjuntar detalle?',
        text: `¿Estas seguro que desea Aprobar los registros?`,
        icon: 'question',
        confirmButtonColor: '#20c997',
        cancelButtonColor : '#9da7b1',
        confirmButtonText : 'Si, Aprobar!',
        showCancelButton  : true,
        cancelButtonText  : 'Cancelar',
      }).then((resp) => {
        if (resp.value) {
          this.cambiarEstadoScoreM('APROBADO');
          this.cambiarEstadoDetalleAaprobado();
        }
      });
    }
  }

  // enviarRegistroTDPPRUEBAMASIVA(){
  //   let parametro: any[] = [{
  //     "queryId": 23,
  //     "mapValue": {
  //         p_idScore : this.DATA_SCORE.idScoreM,
  //     }
  //   }];
  //   this.scoreService.exportScoreDetalleMasivo(parametro[0]).subscribe((resp: any) => {

  //     this.excellIndividualService.dowloadExcel(resp.list);
  //     // this.listadoCorreosTDP(file);
  //   });
  // }

  // enviarRegistroTDPZ(){
  //   let parametro: any[] = [{
  //     "queryId": 34,
  //     "mapValue": {
  //         p_idScore : this.DATA_SCORE.idScoreM,
  //     }
  //   }];
  //   this.scoreService.exportScoreDetalleDiurno(parametro[0]).subscribe((resp: any) => {
  //     this.excellIndividualService.dowloadExcel(resp.list);
  //   });
  // };

  enviarRegistroTDPY(){
    let parametro: any[] = [{
      "queryId": 27,
      "mapValue": {
          p_idScore : this.DATA_SCORE.idScoreM,
      }
    }];
    this.scoreService.exportScoreDetalleDiurno(parametro[0]).subscribe((resp: any) => {
      this.excellDiurnoService.dowloadExcel(resp.list);
    });
  }


  enviarRegistroTDPX(casoScore? : string){
    let parametro: any[] = [{
      "queryId": 35,
      "mapValue": {
          p_idScore  : this.DATA_SCORE.idScoreM,
          // p_casoScore: this.DATA_SCORE.caso_score
      }
    }];
    this.scoreService.exportScoreDetalleMasivo(parametro[0]).subscribe((resp: any) => {

      // const casoGeneral   = resp.list.filter((x: any) => x.caso_score == 'General')
      // const casoExcepcion = resp.list.filter((x: any) => x.caso_score == 'Excepcion')
      // console.log('C-GEN', casoGeneral, casoExcepcion);
      // console.log('=>', resp.list);

      // this.excellMasivaService.dowloadExcel(resp.list.filter((x:any) => x.caso_score == 'General'));
      // this.excellMasivoService.dowloadExcel(resp.list);
      this.excellB2BService.dowloadExcel(resp.list);


      // if (casoScore == 'General') {
      //   const DataGeneral = resp.list.filter((x:any) => x.caso_score == 'General')
      //   console.log('DATA-MASIVO-GEN', DataGeneral);

      //   this.excellMasivaService.dowloadExcel(DataGeneral);
      // }

      // if (casoScore == 'Excepcion') {
      //   const DataExcepcion = resp.list.filter((x:any) => x.caso_score == 'Excepcion')
      //   console.log('DATA-MASIVO-EXC', DataExcepcion);

      //   this.excellMasivaService.dowloadExcel(DataExcepcion);
      // }

      // this.excellMasivaService.dowloadExcel(resp.list);
    });
  }


  enviarRegistroTDP(){
    if (this.DATA_SCORE.estado == 'Solicitado' || this.DATA_SCORE.estado == 'Aprobado' ) {
      Swal.fire({
        title: 'Enviar Registro score?',
        text: `¿Estas seguro que desea enviar el registro y cambiar el estado a enviado? `,
        icon: 'question',
        confirmButtonColor: '#20c997',
        cancelButtonColor : '#9da7b1',
        confirmButtonText : 'Si, Enviar!',
        showCancelButton  : true,
        cancelButtonText  : 'Cancelar',
      }).then((resp) => {
        console.log('123', resp);

        if (resp.value ) {
          if (this.scoreForm.controls['tipoScore'].value == 'Masivo') {
            this.exportScoreDetalleMasivo(this.DATA_SCORE.idScoreM);
          } if (this.scoreForm.controls['tipoScore'].value == 'Diurno') {
            this.exportScoreDetalleDiurno(this.DATA_SCORE.idScoreM);
          }else{
            console.log('EXCEP-I', resp);
            this.exportScoreDetalleB2B(this.DATA_SCORE.idScoreM);
          }
        }
      });
    }
  };

  exportScoreDetalleMasivo(id_score: number){
    let parametro: any[] = [{
      "queryId": 34,
      "mapValue": {
          p_idScore : id_score,
      }
    }];
    this.scoreService.exportScoreDetalleMasivo(parametro[0]).subscribe((resp: any) => {

      this.excellMasivoService.generarExcell(resp.list,).then( (file: any) => {
        const blob = new Blob([file]);
        this.listadoCorreosTDP(blob);
      });
    });
  }

  exportScoreDetalleDiurno(id_score: number){
    let parametro: any[] = [{
      "queryId": 34,
      "mapValue": {
          p_idScore : id_score,
      }
    }];
    this.scoreService.exportScoreDetalleDiurno(parametro[0]).subscribe((resp: any) => {

      this.excellDiurnoService.generarExcell(resp.list, ).then((file: any) => {
        const blob = new Blob([file]);
        this.listadoCorreosTDP(blob);
      })
    });
  };

  exportScoreDetalleB2B(id_score: number){
    let parametro: any[] = [{
      "queryId": 35,
      "mapValue": {
          p_idScore : id_score,
      }
    }];
    this.scoreService.exportScoreDetalleB2B(parametro[0]).subscribe((resp: any) => {

      this.excellB2BService.generarExcell(resp.list,).then( file => {
        const blob = new Blob([file]);
        this.listadoCorreosTDP(blob);
      });
    });
  };

  listCorreoTdp: string = '';
  listCC: string = '';
  listadoCorreosTDP(file:Blob){
    let parametro: any[] = [{ queryId: 25 }];
      this.scoreDetalleService.listadoCorreosTDP(parametro[0]).subscribe((resp: any) => {

            if (resp && resp.list) {
              console.log('CORREO-TDP', resp.list, resp.list.map((x: any)=>x.valor_texto_1), resp.list.map((cc: any)=>cc.valor_texto_2));
              this.enviarCorreo(file, resp.list.map((x: any)=>x.valor_texto_1), resp.list.map((cc: any)=>cc.valor_texto_2));
            }
    });
  }

  fechaIniPrueba: any = ''
  fechaFinPrueba: any = ''
  enviarCorreo(file: Blob, listaCorreo: string[], correoCopia: string[]){
    console.log('|==>', file);
    this.blockUI.start("Enviando Data al correo del TDP") ;
    const data = new FormData();

    if (this.scoreForm.controls['tipoScore'].value == 'Masivo') {
      data.append("From","procesosqa@indratools.net");
      data.append("ToEmail", listaCorreo.join(';'));
      data.append("Cc", correoCopia.join(';'));
      data.append("Subject","F-EXCEP- "+this.fechaIniPrueba +  " AL "+this.fechaFinPrueba+" -MASIVA-QA v2");
      data.append("Body","Buen día, Se realizaron las modificaciones solicitadas. Las modificaciones se visualizan en el archivo adjunto.");
      data.append("Attachments", file, "F-EXCEP- "+this.fechaIniPrueba +  " AL "+this.fechaFinPrueba+" -MASIVA-QA v2" + '.xlsx');
    } if (this.scoreForm.controls['tipoScore'].value == 'Diurno') {
      data.append("From","procesosqa@indratools.net");
      data.append("ToEmail", listaCorreo.join(';'));
      data.append("Cc", correoCopia.join(';'));
      data.append("Subject","F-EXCEP- "+this.fechaIniPrueba +  " AL "+this.fechaFinPrueba+" -DIURNA-QA");
      data.append("Body","Buen día, Se realizaron las modificaciones solicitadas. Las modificaciones se visualizan en el archivo adjunto.");
      data.append("Attachments", file, "F-EXCEP- "+this.fechaIniPrueba +  " AL "+this.fechaFinPrueba+" -DIURNA-QA" + '.xlsx');
    }
    else {
      data.append("From","procesosqa@indratools.net");
      data.append("ToEmail", listaCorreo.join(';'));
      data.append("Cc", correoCopia.join(';'));
      data.append("Subject","F-EXCEP- "+this.fechaIniPrueba +  " AL "+this.fechaFinPrueba+"-B2B");
      data.append("Body","Buen día, Se realizaron las modificaciones solicitadas. Las modificaciones se visualizan en el archivo adjunto.");
      data.append("Attachments", file, "F-EXCEP- "+this.fechaIniPrueba +  " AL "+this.fechaFinPrueba+"-B2B-QA" + '.xlsx');
    }

    this.sendMailService.SendDataByEmail(data).then((response) => {
      if (response && response.ok) {
        Swal.fire({
          title: 'Enviar formato!',
          text : `El formato fue enviado con éxito`,
          icon : 'success',
          confirmButtonText: 'Ok',
        });
        this.cambiarEstadoScoreM('ENVIADO');
        this.cambiarEstadoDetalleAenviado();
        this.close(true);
      }
      console.log(response);
      this.blockUI.stop();
        }).catch((error) => console.log('error', error));;
  }

  crearOactualizarScore() {
    this.spinner.show();

    if (!this.DATA_SCORE) {
      if (this.scoreForm.valid) {
        // this.crearScoreM()
      }
    } else {
      this.actualizarScore();
    }
    this.spinner.hide();
  }

  cambiarEstadoDetalleAaprobado(){
    let parametro: any[] = [{ queryId: 28,
      mapValue: {
        p_idScore: this.DATA_SCORE.idScoreM,
      },
    }];

   this.scoreService.actualizarScoreD(parametro[0]).subscribe( {next: (resp: any) => {
     }});
   };

  cambiarEstadoDetalleAenviado(){
    let parametro: any[] = [{ queryId: 22,
      mapValue: {
        p_idScore: this.DATA_SCORE.idScoreM,
      },
    }];

   this.scoreService.actualizarScoreD(parametro[0]).subscribe( {next: (resp: any) => {
     }});
   };

   cambiarEstadoDetalleAobservado(){
    let parametro: any[] = [{ queryId: 31,
      mapValue: {
        p_idScore: this.DATA_SCORE.idScoreM,
      },
    }];

   this.scoreService.actualizarScoreD(parametro[0]).subscribe( {next: (resp: any) => {
     }});
   };

  actualizarScoreD(){
    const formValues = this.scoreForm.getRawValue();
    let parametro: any =  {
        queryId: 24,
        mapValue: {
          v_idscore  : this.DATA_SCORE.idScoreM,
          v_idversion: this.DATA_SCORE.version + 1,
        },
      };

     this.scoreService.actualizarScoreD(parametro).subscribe((resp: any) => {
        console.log('UPDATE_SCORE_D', resp);
     this.cargarOBuscarScoreDetalle();
      });
    }

  mapearScore(idEstado?:number): any[]{
    const formValues = this.scoreForm.getRawValue();

    return  [{
      queryId: 4,
      mapValue: {
        p_idScoreM          : this.DATA_SCORE.idScoreM,
        p_idEstado          : idEstado? idEstado: formValues.id_estado_m,
        p_actualiza         : this.userName,
        p_f_actualiza       : '',

        CONFIG_USER_NAME    : this.userName ,
        CONFIG_OUT_MSG_ERROR: '' ,
        CONFIG_OUT_MSG_EXITO: ''
      },
    }];
  }

  actualizarScore(estadoScore?: number){
    this.spinner.show();
    let parametro: any[] = this.mapearScore(estadoScore);

    this.scoreService.actualizarScore(parametro[0]).subscribe( {next: (resp: any) => {
      this.spinner.hide();

      console.log('DATA_ACTUALIZADO', resp);
      // this.cargarSCoreByID();
      if (!estadoScore) {
        this.dialogRef.close('Actualizar')
      }else{
        // this.actualizarScoreD();
        this.listScoreM_ByID();
      }

        Swal.fire({
          title: 'Actualizar Score!',
          text : `Score:  ${this.DATA_SCORE.idScoreM }, actualizado con éxito`,
          icon : 'success',
          confirmButtonText: 'Ok'
          })
      }, error: () => {
        Swal.fire(
          'ERROR',
          'No se pudo actualizar el Score',
          'warning'
        );
      }});
  };

  listScoreM_ByID(){
    let parametro: any =  {
        queryId: 20,
        mapValue: {
          p_idScoreM: this.DATA_SCORE.idScoreM
        },
      };

      this.scoreService.listScoreM_ByID(parametro).subscribe( {next: (resp: any) => {
      this.scoreForm.controls['id_estado_m'].setValue(resp.list[0].idEstado);
      }});
    }

//  crearScoreM(){
//     const formValues = this.scoreForm.getRawValue();
//     let parametro: any =  {
//         queryId: 6,
//         mapValue: {
//           p_solicitante             : this.userName, //Username: usuario logueado a la web
//           p_fecha_solicitud         : formValues.fecha_solicitud,
//           p_fecha_envio             : formValues.fecha_envio,
//           p_idEstado                : 1, //ESTADO REGISTRADO,
//           p_crea_solic              : this.userName,
//           p_f_crea                  : formValues.f_crea,
//           p_formato_envio           : formValues.formato_envio,
//           p_item_version            : '',
//           p_item_hora_envio         : formValues.item_horario_envio,
//           p_nombre_proy             : formValues.nombre_proy ,
//           p_fecha_ini_prueba        : formValues.fecha_ini_prueba,
//           p_fecha_fin_prueba        : formValues.fecha_fin_prueba,
//           p_hora_ini_prueba         : formValues.hora_ini_prueba,
//           p_hora_fin_prueba         : formValues.hora_fin_prueba,
//           p_motivo_solicitud        : formValues.motivo_solicitud,
//           CONFIG_USER_NAME          : this.userName,
//           CONFIG_OUT_MSG_ERROR      : '',
//           CONFIG_OUT_MSG_EXITO      : ''
//         },
//       };

//       console.log('VAOR', this.scoreForm.value , parametro);
//       this.scoreService.crearScore(parametro).subscribe((resp: any) => {
//         console.log('INSERT_SCORE_M', resp);

//         Swal.fire({
//           title: 'Crear Score!',
//           text: `Score, creado con éxito`,
//           icon: 'success',
//           confirmButtonText: 'Ok',
//         });
//         this.close(true);
//       });
//     }

  actionBtn: string = 'Agregar';
  cargarSCoreByID(){
    this.actionBtn = 'Actualizar'
      this.scoreForm.controls['id_score'          ].setValue(this.DATA_SCORE.idScoreM );
      this.scoreForm.controls['solicitante'       ].setValue(this.DATA_SCORE.solicitante);
      this.scoreForm.controls['id_estado_m'       ].setValue(this.DATA_SCORE.idEstado);
      this.scoreForm.controls['observacion'       ].setValue(this.DATA_SCORE.observacion);
      this.scoreForm.controls['item_horario_envio'].setValue(this.DATA_SCORE.item_hora_envio)
      this.scoreForm.controls['actualiza'         ].setValue(this.DATA_SCORE.actualiza);
      this.scoreForm.controls['formato_envio'     ].setValue(this.DATA_SCORE.formato_envio); //individual:1 | masivo:2
      this.scoreForm.controls['version'           ].setValue(this.DATA_SCORE.version);
      this.scoreForm.controls['motivo_solicitud'  ].setValue(this.DATA_SCORE.motivo_solicitud);
      this.scoreForm.controls['hora_ini_prueba'   ].setValue(this.DATA_SCORE.hora_ini_prueba);
      this.scoreForm.controls['hora_fin_prueba'   ].setValue(this.DATA_SCORE.hora_fin_prueba);
      this.scoreForm.controls['nombre_proy'       ].setValue(this.DATA_SCORE.nombre_proy);
      this.scoreForm.controls['casoScore'         ].setValue(this.DATA_SCORE.casoScore);
      this.scoreForm.controls['tipoScore'         ].setValue(this.DATA_SCORE.tipoScore);
      this.scoreForm.controls['fecha_ini_prueba'  ].setValue(this.DATA_SCORE.fecha_ini_prueba);
      this.scoreForm.controls['fecha_fin_prueba'  ].setValue(this.DATA_SCORE.fecha_fin_prueba);


      if (this.DATA_SCORE.fecha_ini_prueba) {
        let fecha_x = this.DATA_SCORE.fecha_ini_prueba
        const str   = fecha_x.split('/');
        const year  = Number(str[2]);
        const month = Number(str[1]);
        const date  = Number(str[0]);
        this.scoreForm.controls['fecha_ini_prueba'].setValue(this.datePipe.transform(new Date(year, month-1, date), 'yyyy-MM-dd'))
        this.scoreForm.controls['fechaIniPrueba'  ].setValue(this.datePipe.transform(new Date(year, month-1, date), 'dd/MM/yyyy'))

        this.fechaIniPrueba = this.datePipe.transform(new Date(year, month-1, date), 'ddMMyyyy');
      }

      if (this.DATA_SCORE.fecha_fin_prueba) {
        console.log('Fecha', this.scoreForm);

        let fecha_x = this.DATA_SCORE.fecha_fin_prueba
        const str   = fecha_x.split('/');
        const year  = Number(str[2]);
        const month = Number(str[1]);
        const date  = Number(str[0]);
        this.scoreForm.controls['fecha_fin_prueba'].setValue(this.datePipe.transform(new Date(year, month-1, date), 'yyyy-MM-dd'))
        this.scoreForm.controls['fechaFinPrueba'  ].setValue(this.datePipe.transform(new Date(year, month-1, date), 'dd/MM/yyyy'))

        this.fechaFinPrueba = this.datePipe.transform(new Date(year, month-1, date), 'ddMMyyyy');
      }

      if (this.DATA_SCORE.fecha_solicitud) {
        let fecha_x = this.DATA_SCORE.fecha_solicitud
        const str   = fecha_x.split('/');
        const year  = Number(str[2]);
        const month = Number(str[1]);
        const date  = Number(str[0]);
        this.scoreForm.controls['fecha_solicitud'].setValue(this.datePipe.transform(new Date(year, month-1, date), 'yyyy-MM-dd'))
      }

      if (this.DATA_SCORE.fecha_envio) {
        let fecha_x = this.DATA_SCORE.fecha_envio
        const str   = fecha_x.split('/');
        const year  = Number(str[2]);
        const month = Number(str[1]);
        const date  = Number(str[0]);
        this.scoreForm.controls['fecha_envio'     ].setValue(this.datePipe.transform(new Date(year, month-1, date), 'yyyy-MM-dd'))
        this.scoreForm.controls['fechaEnvioPrueba'].setValue(this.datePipe.transform(new Date(year, month-1, date), 'dd/MM/yyyy'))
      }

      this.validateIfIsLider();

      if (this.scoreForm.controls['id_estado_m'].value != 1) {
        this.validarIfIsGestor();
      }
  }

  rolGestorTdp: number = 0;
  isGestorTDP(){
    this.rolGestorTdp = this.authService.getRolID();
      console.log('ID_ROL_TDP', this.rolGestorTdp);
  };


  disabledControls(){
      this.scoreForm.controls['item_horario_envio'].disable()
      this.scoreForm.controls['formato_envio'     ].disable()
      this.scoreForm.controls['fecha_envio'       ].disable()

      this.scoreForm.controls['fecha_ini_prueba'  ].disable()
      this.scoreForm.controls['fecha_fin_prueba'  ].disable()
      this.scoreForm.controls['hora_ini_prueba'   ].disable()
      this.scoreForm.controls['hora_fin_prueba'   ].disable()
      this.scoreForm.controls['motivo_solicitud'  ].disable()
      this.scoreForm.controls['nombre_proy'       ].disable()
  }

  validarIfIsGestor(){
    if (!this.authService.esUsuarioGestor()) {
      this.disabledControls();
    }
  }

  validateIfIsLider(){
    if (!this.authService.esUsuarioLider()) {
      this.disabledControls();
      this.scoreForm.controls['importar'].disable()
    }
  }

  listHistoricoCambios: any[] = [];
  ListaHistoricoCambios(idRegistro: number){
    this.spinner.show();

    let parametro:any[] = [{
      "queryId": 5,
      "MapValue": {
        "p_idhistorico": this.DATA_SCORE.idScoreM
      }
    }];
    this.scoreService.ListaHistoricoCambios(parametro[0]).subscribe((resp: any) => {
      this.listHistoricoCambios = resp.list;
     console.log("listHistorico", resp.list);
      this.spinner.hide();
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

  getUserID(){
    this.authService.getCurrentUser().subscribe( resp => {
      this.userID   = resp.user.userId;
      console.log('ID-USER', this.userID);
    })
   }

   getUsername(){
    this.authService.getCurrentUser().subscribe( resp => {
      this.userName = resp.userName
      this.scoreForm.controls['solicitante'].setValue(this.userName);
      console.log('USER_NAME', this.userName);
    })
   }

   limpiarFiltro() {
    this.scoreForm.reset('', {emitEvent: false})
    this.newFilfroForm();

    this.cargarOBuscarScoreDetalle();
    this.cargarSCoreByID();
   };

   totalfiltro = 0;
   cambiarPagina(event: number) {
     let offset = event*10;
     this.spinner.show();

     if (this.totalfiltro != this.totalScore) {
       this.scoreService.cargarOBuscarScoreDetalle(offset.toString()).subscribe( (resp: any) => {
             this.listScoreDetalle = resp.list;
             this.spinner.hide();
           });
     } else {
       this.spinner.hide();
     }
       this.page = event;
   }

   validarCambioScoreM(resp: any ){
    if (resp.exitoMessage == "Actualización exitosa") {
        this.cambiarEstadoScoreM('EN VALIDACIÓN');
    }
   }

   asignarObservacion(DATA: any){
    const dialogRef = this.dialog.open(AsignarObservacionComponent, { width:'35%', data: DATA });

    dialogRef.afterClosed().subscribe(resp => {
      console.log('CLOSE', resp);

      if (resp) {
        this.validarCambioScoreM(resp)
        this.cargarOBuscarScoreDetalle()
      }
    })
  };

  finalizarSolicitud() {
    const dialogRef = this.dialog.open(ImportarSolicitudComponent, { width: '30%', data: {scoreMailForm: this.scoreForm.getRawValue(), isCreation: true}});
    dialogRef.afterClosed().subscribe((resp) => {
      if (resp) {
        // this.cargarOBuscarEvento();
      }
    });
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


