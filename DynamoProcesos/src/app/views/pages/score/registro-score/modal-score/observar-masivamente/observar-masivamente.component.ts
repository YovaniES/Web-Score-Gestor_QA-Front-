import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/core/services/auth.service';
import { ScoreService } from 'src/app/core/services/score.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-enviar-correo',
  templateUrl: './observar-masivamente.component.html',
  styleUrls: ['./observar-masivamente.component.scss']
})
export class ObservarMasivamenteComponent implements OnInit {

  @BlockUI() blockUI!: NgBlockUI;
  loadingItem: boolean = false;
  importForm!: FormGroup;
  activeTab:string = 'continuar'

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private scoreService: ScoreService,
    public datePipe: DatePipe,
    private spinner: NgxSpinnerService,
    private dialogRef: MatDialogRef<ObservarMasivamenteComponent>,
    @Inject(MAT_DIALOG_DATA) public DATA_SCORE: any
  ) { }

  ngOnInit(): void {
    this.newFilfroForm();
    this.cargarObservacionByID();
  }

  newFilfroForm(){
    this.importForm = this.fb.group({
      importar        : [''],
      obs_solicitud_m : ['', [Validators.required, Validators.minLength(25)]]
    })
  }

  onTabClick(tab: string){
    this.activeTab = tab
  }

  actualizarObservacion(){

  }

    actualizarComentarioScore_materiales() {
      this.spinner.show();
      const formValues = this.importForm.getRawValue();
      console.log('O B S_MAS', this.importForm.value, this.DATA_SCORE.scoreObsForm.id_score);
      console.log('ESTA_M_IMPORT', this.importForm.value, this.DATA_SCORE.scoreObsForm);

      let parametro: any[] = [{ queryId: 36,
          mapValue: {
            p_idscore_materiales        : this.DATA_SCORE.scoreObsForm.id_score,
            p_observacionScore_material : formValues.obs_solicitud_m,
            // CONFIG_USER_ID           : this.userID,
          // CONFIG_OUT_MSG_ERROR     : '',
            CONFIG_OUT_MSG_EXITO     : ''
          },
        }];
       this.scoreService.actualizarObservacion(parametro[0]).subscribe({next: (resp: any) => {
          this.spinner.hide();
          console.log('OBS_NOTA_ACTUALIZADO', resp);

          this.cargarObservacionByID();

          this.close(resp)


          Swal.fire({
            title: 'Observar SOLICITUD!',
            text : `Se Observó con éxito la Solicitud`,
            icon : 'success',
            confirmButtonText: 'Ok'
            });

            // Swal.fire({
            //     title: 'Observar estado?',
            //     text: `¿Estas seguro que desea cambiar de estado a Observado?`,
            //     icon: 'question',
            //     confirmButtonColor: '#20c997',
            //     cancelButtonColor : '#9da7b1',
            //     confirmButtonText : 'Si, Cambiar!',
            //     showCancelButton  : true,
            //     cancelButtonText  : 'Cancelar',
            //   }).then((resp) => {
            //     if (resp.value) {
            //       // this.cambiarEstadoScoreM('OBSERVADO');
            //       // this.cambiarEstadoDetalleAobservado();
            //       // this.cargarOBuscarScoreDetalle();
            //     }
            //   });

          }, error:()=>{
            Swal.fire(
              'ERROR',
              'No se pudo Observar el registro',
              'warning'
            );
          }
       });
    }

    cargarObservacionByID(){
        this.importForm.controls['obs_solicitud_m'].setValue(this.DATA_SCORE.scoreObsForm.obs_score);
         console.log('OBSERV_BY_ID', this.importForm.value);
    }

  campoNoValido(campo: string): boolean {
    if (this.importForm.get(campo)?.invalid && this.importForm.get(campo)?.touched) {
      return true;
    } else {
      return false;
    }
  }

  close(succes?: any) {
    this.dialogRef.close(succes);
  }
}
