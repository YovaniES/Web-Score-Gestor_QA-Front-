import { Injectable } from '@angular/core';
import { Workbook, Worksheet } from 'exceljs';
import * as fs from 'file-saver';

@Injectable({ providedIn: 'root' })
export class ExcellMasivoService {
  private wb!: Workbook;

   dowloadExcel(dataExcel: any[]): any{
    // console.log('export-data_masivo', dataExcel);
    this.wb = new Workbook();

     this.createScoreTable(dataExcel);

    this.wb.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data]);
      fs.saveAs(blob, 'Formato_Solicitud_Score_B2C_'+ dataExcel[0].fechaIniPrueba +  " AL "+dataExcel[0].fechaFinPrueba+'-MASIVA.xlsx')
    });
  };

  generarExcell(dataExcel: any[]): Promise<any>{
    console.log('export-data', dataExcel);
     this.wb = new Workbook();

     this.createScoreTable(dataExcel);

     return this.wb.xlsx.writeBuffer()
  };


  private createScoreTable(scoreTable: any): void {
    console.log('DATA-EXCELL-MAS',scoreTable, scoreTable[0].GAMADEEQUIPO, scoreTable[0].Fecha_APP);

    const sheet = this.wb.addWorksheet('F2-B2C masivo'); //Nombre de la Hoja

    // Establecemos el ancho y estilo de las columnas de la Tabla
    sheet.getColumn('A').width = 12;
    sheet.getColumn('B').width = 13;
    sheet.getColumn('C').width = 18;
    sheet.getColumn('D').width = 15;
    sheet.getColumn('E').width = 20;
    sheet.getColumn('F').width = 15;
    sheet.getColumn('G').width = 16;
    sheet.getColumn('H').width = 27;
    sheet.getColumn('I').width = 24;

    sheet.getColumn('J').width = 13;
    sheet.getColumn('K').width = 22;
    sheet.getColumn('L').width = 25;
    sheet.getColumn('M').width = 24;
    sheet.getColumn('N').width = 35;
    sheet.getColumn('O').width = 18;
    sheet.getColumn('P').width = 25;
    sheet.getColumn('Q').width = 20;
    sheet.getColumn('R').width = 50;


    // this.backgroundCeldas(sheet);

    // this.fontPlomo_x(sheet,)

    // DATA SCORE - TABLA DINAMICA
    sheet.columns.forEach((name_col) => {
      name_col.alignment = {vertical: 'middle', wrapText: true };
      name_col.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' },}; //Pintamos toda la hoja

      // CABECERA DE LA TABLA CON ESTILOS
      const headerFila = sheet.getRow(1);
      headerFila.values = [
        'TipDoc',
        'NumDoc',
        'Segmento',
        'Score',
        'Num_lin_Disp',
        'Usuario',
        'Fecha_APP',
        'Capacidad_Financiamiento',
        'Codigo_Financiamiento',
        'SCORE',
        'CARGOFIJOMAXIMO',
        'NEGOCIO Y SEGMENTO',
        'TIPO DE TRANSACCION',
        'TIPO DE VENTA (CONTADO O FINANCIADO)',
        'GAMA DE EQUIPO',
        'CUOTA INCIAL FINAN MOVIL',
        'TIPO DE PROYECTO',
        'NOMBRE DE PROYECTO',
      ];


      headerFila.font = { bold: true, size: 12 };
      headerFila.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerFila.height = 75;


      // Bauground fila 1 - Tabla
      sheet.getCell('A1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}
      sheet.getCell('B1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}
      sheet.getCell('C1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}
      sheet.getCell('D1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}
      sheet.getCell('E1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}
      sheet.getCell('F1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}
      sheet.getCell('G1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}
      sheet.getCell('H1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}
      sheet.getCell('I1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}
      sheet.getCell('J1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}
      sheet.getCell('K1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}
      sheet.getCell('L1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}
      sheet.getCell('M1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}
      sheet.getCell('N1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}
      sheet.getCell('O1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}
      sheet.getCell('P1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}
      sheet.getCell('Q1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}
      sheet.getCell('R1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}

      // Insertamos la data en las respectivas Columnas.
      const insertarFila = sheet.getRows(2, scoreTable.length)!;
      for (let i = 0; i < insertarFila.length; i++) {
        const fila = insertarFila[i];

        fila.values = [
          scoreTable[i].TipDoc,
          scoreTable[i].NumDoc,
          scoreTable[i].Segmento,
          '', // score: campo vacío
          scoreTable[i].Num_Lin_Disp,
          scoreTable[i].Usuario,
          scoreTable[i].Fecha_APP,
          scoreTable[i].Capacidad_Financiamiento,
          scoreTable[i].Codigo_Financiamiento,
          scoreTable[i].SCORE,
          scoreTable[i].CARGOFIJOMAXIMO,
          scoreTable[i].NEGOCIOYSEGMENTO,
          scoreTable[i].TIPOTRANSACCION,
          scoreTable[i].TIPOVENTA,
          scoreTable[i].GAMADEEQUIPO,
          scoreTable[i].cuota_inicial,
          scoreTable[i].TIPODEPROYECTO,
          scoreTable[i].NOMBREDEPROYECTO,
        ];
        fila.font = { size: 11}
        fila.alignment = { horizontal: 'center', vertical: 'middle'}
      }

     this.borderTable(sheet, scoreTable);
     this.fontUsuarioMasivo(sheet, scoreTable)
    });
  }

  private fontUsuarioMasivo(sheet: Worksheet, scoreTable: any){
    for (let i = 1; i < 1 + scoreTable.length; i++) {
      [`F${i + 1}`,
      ].forEach((key) => {
        sheet.getCell(key).style = {font: { bold: true, size: 11, color: {argb: 'FF3CB371'}}, alignment: { horizontal: 'center'}};
        sheet.getCell(key).border = {
          top   : {style:'thin'},
          left  : {style:'thin'},
          bottom: {style:'thin'},
          right : {style:'thin'},
        }
      });
    }
  }

  private fontPlomo(sheet: Worksheet, scoreTable: any) {
    for (let i = 11; i < 11 + scoreTable.length; i++) {
      [`C${i + 1}`,
       `D${i + 1}`,
       `E${i + 1}`,
       `F${i + 1}`,
       `G${i + 1}`,
      ].forEach((key) => {
        sheet.getCell(key).style = { alignment: { horizontal: 'center', vertical: 'middle'} ,fill: {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB0C4DE' },}};
        sheet.getCell(key).border = {
          top   : {style:'thin'},
          left  : {style:'thin'},
          bottom: {style:'thin'},
          right : {style:'thin'},
        }
      });
    }
  }

  private borderTable(sheet: Worksheet, scoreTable: any) {
    for (let i = 0; i < 1 + scoreTable.length; i++) {
      [`A${i + 1}`,
       `B${i + 1}`,
       `C${i + 1}`,
       `D${i + 1}`,
       `E${i + 1}`,
       `F${i + 1}`,
       `G${i + 1}`,

       `H${i + 1}`,
       `I${i + 1}`,
       `J${i + 1}`,
       `K${i + 1}`,
       `L${i + 1}`,
       `M${i + 1}`,
       `N${i + 1}`,
       `O${i + 1}`,
       `P${i + 1}`,
       `Q${i + 1}`,
       `R${i + 1}`,

      ].forEach((key) => {
        // sheet.getCell(key).style = { alignment: { horizontal: 'center', vertical: 'middle'} ,fill: {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB0C4DE' },}};
        sheet.getCell(key).border = {
          top   : {style:'thin'},
          left  : {style:'thin'},
          bottom: {style:'thin'},
          right : {style:'thin'},
        }
      });
    }
  }
}

