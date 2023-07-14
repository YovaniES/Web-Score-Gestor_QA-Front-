import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { AuthService } from 'src/app/core/services/auth.service';

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
  totalDuplicados: number = 0;

  constructor(
    public authService: AuthService,
    public datePipe: DatePipe,
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
}
