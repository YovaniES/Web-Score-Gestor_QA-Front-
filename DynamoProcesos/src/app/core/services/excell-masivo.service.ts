import { Injectable } from '@angular/core';
import { Workbook, Worksheet } from 'exceljs';
import * as fs from 'file-saver';

@Injectable({ providedIn: 'root' })
export class ExcellMasivoService {
  private wb!: Workbook;

   dowloadExcel(dataExcel: any[]): any{
    this.wb = new Workbook();

     this.createListaTXmasivo(dataExcel);
     this.createForExcepGeneral(dataExcel);
     this.createTablas(dataExcel);
     this.createCasosEspeciales(dataExcel);
     this.createForExcepEscen(dataExcel);
     this.createWL(dataExcel);

    this.wb.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data]);
      fs.saveAs(blob, 'F-EXCEP-'+ dataExcel[0].fechaIniPrueba +  " AL "+dataExcel[0].fechaFinPrueba+'-MASIVA-QA.xlsx')
    });
  };

  buscarPorCasoScore(dataExcel: any[], tipo: string){
    return dataExcel.filter(registro => registro.tipoScore.toUpperCase() == tipo)
  }

  generarExcell(dataExcel: any[], listadoWL:any[], listaTablas:any[], listTX: any[], listCasosEsp: any[]): Promise<any>{
    const tipoGeneral   = this.buscarPorCasoScore(dataExcel, 'GENERAL')
    const tipoExcepcion = this.buscarPorCasoScore(dataExcel, 'EXCEPCION')

    console.log('MASIVO(G-E)', tipoGeneral, tipoExcepcion, listadoWL, listaTablas);

    this.wb = new Workbook();

    this.createListaTXmasivo(listTX);

     if (dataExcel.find(x => x.tipoScore.toUpperCase() == 'GENERAL')) {
      this.createForExcepGeneral(tipoGeneral);
     }
     this.createTablas(listaTablas);
     this.createCasosEspeciales(listCasosEsp);

     if (dataExcel.find(x => x.tipoScore.toUpperCase() == 'EXCEPCION')) {
      this.createForExcepEscen(tipoGeneral);
     }
     this.createWL(listadoWL);

     return this.wb.xlsx.writeBuffer()
  };


  private createListaTXmasivo(scoreTable: any): void {
    // console.log('F-EXCEP-MASIVA*',scoreTable, scoreTable[0].gama, scoreTable[0].fecha_score);

    const sheet = this.wb.addWorksheet('LISTA-TX'); //Nombre de la Hoja

    // Establecemos el ancho y estilo de las columnas de la Tabla
    sheet.getColumn('A').width = 110;
    sheet.getColumn('B').width = 20;
    sheet.getColumn('C').width = 18;
    sheet.getColumn('D').width = 15;
    sheet.getColumn('E').width = 35;
    sheet.getColumn('F').width = 15;
    sheet.getColumn('G').width = 16;
    sheet.getColumn('H').width = 27;
    sheet.getColumn('I').width = 24;

    sheet.getColumn('J').width = 13;
    sheet.getColumn('K').width = 22;
    sheet.getColumn('L').width = 20;
    sheet.getColumn('M').width = 20;


    // DATA SCORE - TABLA DINAMICA
    sheet.columns.forEach((name_col) => {
      name_col.alignment = {vertical: 'middle', wrapText: true };
      name_col.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' },}; //Pintamos toda la hoja

      // CABECERA DE LA TABLA CON ESTILOS
      const headerFila = sheet.getRow(1);
      headerFila.values = [
        'LLAVE',            //A
        'REVISION WL',      //B
        'NEGOCIO',          //C
        'TIPO DE TRAN',     //D
        'TIPO DE VENTA',    //E
        'GAMA',             //F
        'CUOTA INICIAL',    //G
        'CUOTAS',           //H
        'LIMITE DE CREDITO',//I
        'CAP FINAN',        //J
        'SCORE (4DIG)',     //K
        'NRO DE LINEAS',    //L
        'CODIGO FINAN'      //M
      ];

      headerFila.font = { bold: true, size: 12 };
      headerFila.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerFila.height = 30;

      // Insertamos la data en las respectivas Columnas.
      const insertarFila = sheet.getRows(2, scoreTable.length)!;
      for (let i = 0; i < insertarFila.length; i++) {
        const fila = insertarFila[i];

        fila.values = [
          scoreTable[i].llaveTexto,     //A
          scoreTable[i].revisionWL,     //B
          scoreTable[i].negocio,        //C
          scoreTable[i].tipoTran,       //D
          scoreTable[i].tipoVenta,      //E
          scoreTable[i].gama,           //F
          scoreTable[i].cuotaInicial,   //G
          scoreTable[i].cuotas,         //H
          scoreTable[i].limiteCredito,  //I
          scoreTable[i].capFinan,       //J
          scoreTable[i].score,          //K
          scoreTable[i].nroLineas,      //L
          scoreTable[i].codigoFinan,    //M
        ];
        fila.font = { size: 11}
        fila.alignment = { horizontal: 'center', vertical: 'middle'}
      }

      // Bauground fila 1 - Tabla
      sheet.getCell('A1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FFADFF2F'}}
      sheet.getCell('B1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FFADFF2F'}}
      sheet.getCell('C1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FFADFF2F'}}
      sheet.getCell('D1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FFADFF2F'}}
      sheet.getCell('E1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FFADFF2F'}}
      sheet.getCell('F1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FFADFF2F'}}
      sheet.getCell('G1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FFADFF2F'}}
      sheet.getCell('H1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('I1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('J1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('K1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('L1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('M1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
    //  this.borderTable(sheet, scoreTable);
    });
  }

  private createForExcepGeneral(scoreTable: any): void {
      console.log('GENERAL-MASIVO =>', scoreTable, scoreTable[0].gama, scoreTable[0].fecha_score);

    const sheet = this.wb.addWorksheet('FOR EXCEP V1-GENERAL'); //Nombre de la Hoja

    // Establecemos el ancho y estilo de las columnas de la Tabla
    sheet.getColumn('A').width = 75;
    sheet.getColumn('B').width = 45;
    sheet.getColumn('C').width = 18;
    sheet.getColumn('D').width = 15;
    sheet.getColumn('E').width = 20;
    sheet.getColumn('F').width = 25;
    sheet.getColumn('G').width = 30;
    sheet.getColumn('H').width = 50;
    sheet.getColumn('I').width = 15;
    sheet.getColumn('J').width = 18;
    sheet.getColumn('K').width = 22;
    sheet.getColumn('L').width = 20;
    sheet.getColumn('M').width = 85;
    sheet.getColumn('N').width = 18;
    sheet.getColumn('O').width = 18;
    sheet.getColumn('P').width = 90;
    sheet.getColumn('Q').width = 20;
    sheet.getColumn('R').width = 20;
    sheet.getColumn('S').width = 25;
    sheet.getColumn('T').width = 20;
    sheet.getColumn('U').width = 20;
    sheet.getColumn('V').width = 20;
    sheet.getColumn('W').width = 20;


    // DATA SCORE - TABLA DINAMICA
    sheet.columns.forEach((name_col) => {
      name_col.alignment = {vertical: 'middle', wrapText: true };
      name_col.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' },}; //Pintamos toda la hoja

      // CABECERA DE LA TABLA CON ESTILOS
      const headerFila = sheet.getRow(1);
      headerFila.values = [
        'Solicitante',                    //A
        'Rq-NombreProyecto',              //B
        'Fecha_APP',                      //C
        'TipoDoc',                        //D
        'NumDoc',                         //E
        'Segmento',                       //F
        'TipoTransaccion',                //G
        'TipoVenta',                      //H
        'Gama',                           //I
        'CuotaInicial',                   //J
        'Cuotas',                         //K
        'Cap_Finan_2',                    //L
        'LLAVE',                          //M
        'CASO FINAN',                     //N
        'VALID. WL',                      //O
        'LLAVE_2',                        //P
        'VALID. LLAVE',                   //Q
        'Usuario',                        //R
        'CargoFijoMaximo',                //S
        'Capacidad_Financiamiento_Prev',  //T
        'Score',                          //U
        'Num_Lin_Disp',                   //V
        'Codigo_Financiamiento',          //W
      ];


      headerFila.font = { bold: true, size: 12 };
      headerFila.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerFila.height = 35;

      // Insertamos la data en las respectivas Columnas.
      const insertarFila = sheet.getRows(2, scoreTable.length)!;
      for (let i = 0; i < insertarFila.length; i++) {
        const fila = insertarFila[i];

        fila.values = [
          scoreTable[i].solicitante,                 //A
          scoreTable[i].nombre_proyecto,             //B
          scoreTable[i].fecha_score,                 //C
          scoreTable[i].tipo_documento,              //D
          scoreTable[i].numero_documento,            //E
          scoreTable[i].segmento,                    //F
          scoreTable[i].tipoTransaccion,             //G
          scoreTable[i].tipoVenta,                   //H
          scoreTable[i].gama,                        //I
          scoreTable[i].cuota_inicial,               //J
          scoreTable[i].cuotas,                      //K
          scoreTable[i].cap_finan_2,                 //L
          scoreTable[i].segmento+'-'+scoreTable[i].tipoTransaccion+'-'+scoreTable[i].tipoVenta+'-'+scoreTable[i].gama+'-'+scoreTable[i].cuota_inicial+'-'+scoreTable[i].cuotas, //M
          'SI',                   //N corregir Y validar valor (SI o NO)
          scoreTable[i].validWL,               //O validar valor (VALIDO o INVALIDO)
          scoreTable[i].segmento+'-'+scoreTable[i].tipoTransaccion+'-'+scoreTable[i].tipoVenta+'-'+scoreTable[i].gama+'-'+scoreTable[i].cuota_inicial+'-'+scoreTable[i].cuotas, //P
          'PROCEDE',                                 //Q
          scoreTable[i].usuario,                     //R
          scoreTable[i].cargo_fijo_max,              //S
          scoreTable[i].cap_financ_prev,             //T
          scoreTable[i].score,                       //U
          scoreTable[i].num_lin_disp,                //V
          scoreTable[i].cod_finan,                   //W

        ];
        fila.font = { size: 11}
        fila.alignment = { horizontal: 'center', vertical: 'middle'}
      }

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

      sheet.getCell('M1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FFADFF2F'}}
      sheet.getCell('N1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FFADFF2F'}}
      sheet.getCell('O1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FFADFF2F'}}

      sheet.getCell('P1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FFFFFF00'}}

      sheet.getCell('Q1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('R1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('S1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('T1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('U1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('V1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('W1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
     this.borderTableForExcepGeneral(sheet, scoreTable);
    //  this.fontUsuarioMasivo(sheet, scoreTable)
    });
  }

  private createTablas(scoreTable: any): void {
    const sheet = this.wb.addWorksheet('TABLAS'); //Nombre de la Hoja

    // Establecemos el ancho y estilo de las columnas de la Tabla
    sheet.getColumn('B').width = 17;
    sheet.getColumn('C').width = 24;
    sheet.getColumn('D').width = 20;
    sheet.getColumn('E').width = 22;
    sheet.getColumn('F').width = 40;
    sheet.getColumn('G').width = 16;
    sheet.getColumn('H').width = 25;
    sheet.getColumn('I').width = 20;

    sheet.getColumn('L').width = 25;
    sheet.getColumn('M').width = 24;
    sheet.getColumn('N').width = 35;
    sheet.getColumn('O').width = 18;

    sheet.getColumn('S').width = 25;
    sheet.getColumn('T').width = 20;
    sheet.getColumn('U').width = 45;

    sheet.getColumn('W').width = 45;


    // DATA SCORE - TABLA DINAMICA
    sheet.columns.forEach((name_col) => {
      name_col.alignment = {vertical: 'middle', wrapText: true };
      // name_col.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' },}; //Pintamos toda la hoja

      // CABECERA DE LA TABLA CON ESTILOS
      const headerFila = sheet.getRow(2);
      headerFila.values = [
        '',
        'TIPO DOC',       //B
        'SOLICITANTE',    //C
        'SEGMENTO',       //D
        'TIPO DE TRAN',   //E
        'TIPO DE VENTA',  //F
        'GAMA',           //G
        'CUOTA INICIAL',  //H
        'CUOTAS',         //I

        '',
        '',

        'PROYECTO',       //L
        'CASOS',          //M
        'CUOTA INICIAL',  //N
        'RQ',             //O

        '',
        '',
        '',

        'MOVISTAR TOTAL', //Cambiamos a Col S
        'FIJA',           //T
        'MOVIL B2C',      //U

        '',

        'TOTALIZACION MT',//W
      ];


      headerFila.font = { bold: true, size: 11 };
      headerFila.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerFila.height = 20;


      // Insertamos la data en las respectivas Columnas.
      const insertarFila = sheet.getRows(3, scoreTable.length)!;
      for (let i = 0; i < insertarFila.length; i++) {
        const fila = insertarFila[i];

        fila.values = [
          '',
          scoreTable[i].tipo_doc,         //B
          scoreTable[i].solicitante,      //C
          scoreTable[i].segmento,         //D
          scoreTable[i].tipo_transaccion, //E
          scoreTable[i].tipo_venta,       //F
          scoreTable[i].gama,             //G
          scoreTable[i].cuota_inicial,    //H
          scoreTable[i].cuotas,           //I
          '',                             //J
          '',                             //K
          scoreTable[i].proyecto,         //L
          scoreTable[i].casos,            //M
          scoreTable[i].cuota_inicial,    //N
          scoreTable[i].rq,               //O
          '',                             //P
          '',                             //Q
          '',                             //R
          scoreTable[i].movistar_total,   //S
          scoreTable[i].fija,             //T
          'CAEQ/ALTA CONTADO - FIJA UPFRONT',//U
          '',                             //V
          scoreTable[i].totalizacion_mt,  //W
        ];
        fila.font = { size: 11}
        fila.alignment = { horizontal: 'center', vertical: 'middle'}
      }

    //  this.fontUsuarioMasivo(sheet, scoreTable)
    });
  };

  private createCasosEspeciales(scoreTable: any): void {
    // console.log('CASOS-ESP',scoreTable, scoreTable[0].GAMADEEQUIPO, scoreTable[0].Fecha_APP);

    const sheet = this.wb.addWorksheet('CASOS ESPECIALES'); //Nombre de la Hoja

    // Establecemos el ancho y estilo de las columnas de la Tabla
    sheet.getColumn('A').width = 15;
    sheet.getColumn('B').width = 15;
    sheet.getColumn('C').width = 18;
    sheet.getColumn('D').width = 25;
    sheet.getColumn('E').width = 20;
    sheet.getColumn('F').width = 25;
    sheet.getColumn('G').width = 20;
    sheet.getColumn('H').width = 20;
    sheet.getColumn('I').width = 18;
    sheet.getColumn('J').width = 18;
    sheet.getColumn('K').width = 22;
    sheet.getColumn('L').width = 60;
    sheet.getColumn('M').width = 15;

    // DATA SCORE - TABLA DINAMICA
    sheet.columns.forEach((name_col) => {
      name_col.alignment = {vertical: 'middle', wrapText: true };
      name_col.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' },}; //Pintamos toda la hoja

      // CABECERA DE LA TABLA CON ESTILOS
      const headerFila = sheet.getRow(1);
      headerFila.values = [
        'RQ',               //A
        'ESC',              //B
        'PROYECTO',         //C
        'CASOS',            //D
        'CUOTA INICIAL',    //E
        'GAMA',             //F
        'SCORE',            //G
        'CFM',              //H
        'CANT LINEAS',      //I
        'CAP FIN',          //J
        'COD FIN',          //K
        'LLAVE',            //L
        'REVISION WL',      //M
      ];

      headerFila.font = { bold: true, size: 12, color: {argb: 'FF4169E1'} };
      headerFila.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerFila.height = 25;

      // Insertamos la data en las respectivas Columnas.
      const insertarFila = sheet.getRows(2, scoreTable.length)!;
      for (let i = 0; i < insertarFila.length; i++) {
        const fila = insertarFila[i];

        fila.values = [
          scoreTable[i].rq,           //A
          scoreTable[i].esc,          //B
          scoreTable[i].proyecto,     //C
          scoreTable[i].casos,        //D
          scoreTable[i].cuotaInicial, //E
          scoreTable[i].gama,         //F
          scoreTable[i].score,        //G
          scoreTable[i].cfm,          //H
          scoreTable[i].cantLineas,   //I
          scoreTable[i].capFin,       //J
          scoreTable[i].codFin,       //K
          scoreTable[i].llave,        //L
          scoreTable[i].revisionWL    //M
        ];
        fila.font = { size: 11}
        fila.alignment = { horizontal: 'center', vertical: 'middle'}
      }
    });
  }

  private createForExcepEscen(scoreTable: any): void {
    console.log('EXPORT - GENERAL-EXCEPCIONES', scoreTable, scoreTable[0].gama, scoreTable[0].cuota_inicial);

    const sheet = this.wb.addWorksheet('FOR EXCEP V1-ESCEN');

    // Establecemos el ancho y estilo de las columnas de la Tabla
    sheet.getColumn('A').width = 35;
    sheet.getColumn('B').width = 15;
    sheet.getColumn('C').width = 15;
    sheet.getColumn('D').width = 20;
    sheet.getColumn('E').width = 20;
    sheet.getColumn('F').width = 15;
    sheet.getColumn('G').width = 12;
    sheet.getColumn('H').width = 18;
    sheet.getColumn('I').width = 18;
    sheet.getColumn('J').width = 15;
    sheet.getColumn('K').width = 22;
    sheet.getColumn('L').width = 20;
    sheet.getColumn('M').width = 20;
    sheet.getColumn('N').width = 20;
    sheet.getColumn('O').width = 18;
    sheet.getColumn('P').width = 18;
    sheet.getColumn('Q').width = 55;
    sheet.getColumn('R').width = 20;
    sheet.getColumn('S').width = 20;
    sheet.getColumn('T').width = 60;
    sheet.getColumn('U').width = 20;


    // DATA SCORE - TABLA DINAMICA
    sheet.columns.forEach((name_col) => {
      name_col.alignment = {vertical: 'middle', wrapText: true };
      name_col.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' },}; //Pintamos toda la hoja

      // CABECERA DE LA TABLA CON ESTILOS
      const headerFila = sheet.getRow(1);
      headerFila.values = [
        'Solicitante',                  //A
        'Rq',                           //B
        'Proyecto',                     //C
        'Casos',                        //D
        'Cuota_Inicial',                //E
        'Gama',                         //F
        'TipDoc',                       //G
        'NumDoc',                       //H
        'Fecha_APP',                    //I
        'Score',                        //J
        'CargoFijoMaximo',              //K
        'Num_Lin_Disp',                 //L
        'Capacidad_Financiamiento_Prev',//M
        'Codigo_Financiamiento',        //N
        'Cap_Finan_2',                  //O
        'Usuario',                      //P
        'LLAVE',                        //Q
        'CASO FINAN',                   //R
        'VALID. WL',                    //S
        'LLAVE_2',                      //T
        'VALID. LLAVE'                  //U
      ];

      // Insertamos la data en las respectivas Columnas.
      const insertarFila = sheet.getRows(2, scoreTable.length)!;
      for (let i = 0; i < insertarFila.length; i++) {
        const fila = insertarFila[i];

        fila.values = [
          scoreTable[i].solicitante,       //A
          scoreTable[i].rq,                //B
          scoreTable[i].proyecto,          //C
          scoreTable[i].casos,             //D
          scoreTable[i].cuota_inicial,     //E
          scoreTable[i].gama,              //F
          scoreTable[i].tipo_documento,    //G
          scoreTable[i].numero_documento,  //H
          scoreTable[i].fecha_score,       //I
          scoreTable[i].cargo_fijo_max,    //J
          scoreTable[i].num_lin_disp,      //K
          scoreTable[i].score,             //L
          scoreTable[i].cap_financ_prev,   //M
          scoreTable[i].cod_finan,         //N
          scoreTable[i].cap_finan_2,       //O
          scoreTable[i].usuario,           //P
          // '8242-DITO-STD ALONE-FINANCIADO-1608-90-1-250-1',//Q
          scoreTable[i].rq+'-'+scoreTable[i].proyecto+'-'+ scoreTable[i].casos+'-'+ scoreTable[i].cuota_inicial+'-'+ scoreTable[i].score+'-'+ scoreTable[i].cargo_fijo_max+'-'+ scoreTable[i].num_lin_disp+'-'+ scoreTable[i].cap_financ_prev+'-'+ scoreTable[i].cod_finan+'-',
          'SI',                            //R
          scoreTable[i].validWL,           //S
          scoreTable[i].rq+'-'+scoreTable[i].proyecto+'-'+ scoreTable[i].casos+'-'+ scoreTable[i].cuota_inicial+'-'+ scoreTable[i].score+'-'+ scoreTable[i].cargo_fijo_max+'-'+ scoreTable[i].num_lin_disp+'-'+ scoreTable[i].cap_financ_prev+'-'+ scoreTable[i].cod_finan+'-',//T
          'PROCEDE'                              //U
        ];
        fila.font = { size: 11}
        fila.alignment = { horizontal: 'center', vertical: 'middle'}
      }

      headerFila.font = { bold: true, size: 12 };
      headerFila.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerFila.height = 35;

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

      sheet.getCell('P1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}

      sheet.getCell('Q1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF32CD32'}}
      sheet.getCell('R1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF32CD32'}}
      sheet.getCell('S1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF32CD32'}}

      sheet.getCell('T1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FFFFFF00'}}
      sheet.getCell('U1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FFFFFF00'}}

     this.borderTableForExcepEscen(sheet, scoreTable);
    });
  }

  private createWL(scoreTable: any): void {
    const sheet = this.wb.addWorksheet('WL');

    // Establecemos el ancho y estilo de las columnas de la Tabla
    sheet.getColumn('A').width = 26;
    sheet.getColumn('B').width = 15;
    sheet.getColumn('C').width = 22;
    sheet.getColumn('D').width = 20;

    // DATA SCORE - TABLA DINAMICA
    sheet.columns.forEach((name_col) => {
      name_col.alignment = {vertical: 'middle', wrapText: true };
      name_col.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' },};

      // CABECERA DE LA TABLA CON ESTILOS
      const headerFila = sheet.getRow(1);
      headerFila.values = [
        'TIPO_DOC',        //A
        'NUM_DOC',         //B
        'TX',              //C
        'NUM_DOC-TEXTO',   //D
      ];

      // Insertamos la data en las respectivas Columnas.
      const insertarFila = sheet.getRows(2, scoreTable.length)!;
      for (let i = 0; i < insertarFila.length; i++) {
        const fila = insertarFila[i];

        fila.values = [
          scoreTable[i].tipo_doc,                            //A
          scoreTable[i].cod_doc,                      //B
          'MOVISTAR TOTAL',                //C
          scoreTable[i].cod_doc,      //D
        ];
        fila.font = { size: 11}
        fila.alignment = { horizontal: 'center', vertical: 'middle'}
      }

      headerFila.font = { bold: true, size: 12, color:{argb: 'FFFFFFFF'} };
      headerFila.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerFila.height = 35;


      // Bauground fila 1 - Tabla
      sheet.getCell('A1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}} // Color Azul
      sheet.getCell('B1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('C1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('D1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}


     this.borderTableWL(sheet, scoreTable);
    });
  }

  private borderTableForExcepGeneral(sheet: Worksheet, scoreTable: any) {
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
       `S${i + 1}`,
       `T${i + 1}`,
       `U${i + 1}`,
       `V${i + 1}`,
       `W${i + 1}`,

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
  };

  private borderTableForExcepEscen(sheet: Worksheet, scoreTable: any) {
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
       `S${i + 1}`,
       `T${i + 1}`,
       `U${i + 1}`,
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
  };

  private borderTableWL(sheet: Worksheet, scoreTable: any) {
    for (let i = 0; i < 1 + scoreTable.length; i++) {
      [`A${i + 1}`,
       `B${i + 1}`,
       `C${i + 1}`,
       `D${i + 1}`,
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

