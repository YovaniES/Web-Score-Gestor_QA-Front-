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
  styleUrls: ['./observar-masivamente.component.scss'],
})
export class ObservarMasivamenteComponent implements OnInit {
  @BlockUI() blockUI!: NgBlockUI;
  loadingItem: boolean = false;
  obs_mForm!: FormGroup;

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private scoreService: ScoreService,
    public datePipe: DatePipe,
    private spinner: NgxSpinnerService,
    private dialogRef: MatDialogRef<ObservarMasivamenteComponent>,
    @Inject(MAT_DIALOG_DATA) public DATA_SCORE: any
  ) {}

  ngOnInit(): void {
    this.newFilfroForm();
    this.cargarObservacionByID();
  }

  newFilfroForm() {
    this.obs_mForm = this.fb.group({
      obs_solicitud_m: ['', [Validators.required, Validators.minLength(25)]],
    });
  }

  actualizarComentarioScore_m() {
    this.spinner.show();
    const formValues = this.obs_mForm.getRawValue();
    console.log('O B S_MAS', this.obs_mForm.value, this.DATA_SCORE.scoreObsForm.id_score);
    console.log('ESTADO_M_IMPORT', this.obs_mForm.value, this.DATA_SCORE.scoreObsForm);

    let parametro: any[] = [
      {
        queryId: 22,
        mapValue: {
          p_idScoreM          : this.DATA_SCORE.scoreObsForm.id_score,
          p_obs_solicitud     : formValues.obs_solicitud_m,
          CONFIG_OUT_MSG_EXITO: '',
        },
      },
    ];
    this.scoreService.actualizarComentarioScore_m(parametro[0]).subscribe({
      next: (resp: any) => {
        this.spinner.hide();
        console.log('OBS_NOTA_ACTUALIZADO', resp);

        this.cargarObservacionByID();

        this.close(resp);

        Swal.fire({
          title: 'Observar Solicitud!',
          text: `Se Observó con éxito la Solicitud`,
          icon: 'success',
          confirmButtonText: 'Ok',
        });
      },
      error: () => {
        Swal.fire('ERROR', 'No se pudo Observar el registro', 'warning');
      },
    });
  }

  cargarObservacionByID() {
    this.obs_mForm.controls['obs_solicitud_m'].setValue(this.DATA_SCORE.scoreObsForm.obs_score);
    console.log('OBSERV_BY_ID', this.obs_mForm.value);
  }

  campoNoValido(campo: string): boolean {
    if (this.obs_mForm.get(campo)?.invalid && this.obs_mForm.get(campo)?.touched) {
      return true;
    } else {
      return false;
    }
  }

  close(succes?: any) {
    this.dialogRef.close(succes);
  }
}
