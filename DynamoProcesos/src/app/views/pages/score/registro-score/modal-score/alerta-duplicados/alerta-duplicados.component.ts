import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/core/services/auth.service';
import { ScoreService } from 'src/app/core/services/score.service';

@Component({
  selector: 'app-alerta-duplicados',
  templateUrl: './alerta-duplicados.component.html',
  styleUrls: ['./alerta-duplicados.component.scss'],
})
export class AlertaDuplicadosComponent implements OnInit {
  @BlockUI() blockUI!: NgBlockUI;
  loadingItem: boolean = false;
  listScoreDetalleExcep: any[]=[];

  page = 1;
  pageSize = 10;
  totalDuplScore: number = 0;

  constructor(
    public authService: AuthService,
    public datePipe: DatePipe,
    private spinner: NgxSpinnerService,
    private scoreService: ScoreService,
    private dialogRef: MatDialogRef<AlertaDuplicadosComponent>,
    @Inject(MAT_DIALOG_DATA) public DATA: any
  ) {}

  ngOnInit(): void {
    this.listaScoreDuplicados();
  }

  listDuplicados: any[] = [];
  listaScoreDuplicados() {
    this.listDuplicados = this.DATA.listaDetalleDuplicados;
  }

  close(succes?: any) {
    this.dialogRef.close(succes);
  }

  totalfiltro = 0;
  cambiarPagina(event: number) {
    let offset = event * 10;
    this.spinner.show();

    if (this.totalfiltro != this.totalDuplScore) {
      this.scoreService.cargarOBuscarScoreM(offset.toString()).subscribe((resp: any) => {
          this.listDuplicados = resp.list;
          this.spinner.hide();
        });
    } else {
      this.spinner.hide();
    }
    this.page = event;
  }
}
