import { Injectable } from '@angular/core';
import { Workbook, Worksheet } from 'exceljs';
import * as fs from 'file-saver';

@Injectable({ providedIn: 'root' })
export class ExcellDiurnoService {
  private wb!: Workbook;

   dowloadExcel(dataExcel: any[], listadoWL:any[]): any{
    // console.log('export-data_masivo', dataExcel);
    this.wb = new Workbook();

    const tipoGeneral   = this.buscarPorTipoScore(dataExcel, 'GENERAL')
    const tipoExcepcion = this.buscarPorTipoScore(dataExcel, 'EXCEPCION')

     this.createListaTX(dataExcel);
     this.createForExcepGeneral(tipoGeneral);
     this.createTablas(dataExcel);
     this.createCasosEspeciales(dataExcel);
     this.createForExcepEscen(tipoExcepcion);
     this.createWL(listadoWL);

    this.wb.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data]);
      fs.saveAs(blob, 'F-EXCEP-'+ dataExcel[0].fechaIniPrueba +'-DIURNA-QA.xlsx')
    });
  };

  buscarPorTipoScore(dataExcel: any[], tipo: string){
    return dataExcel.filter(registro => registro.tipoScore.toUpperCase() == tipo)
  }

  generarExcell(dataExcel: any[], listadoWL:any[], listaTablas:any[]): Promise<any>{
    const tipoGeneral   = this.buscarPorTipoScore(dataExcel, 'GENERAL')
    const tipoExcepcion = this.buscarPorTipoScore(dataExcel, 'EXCEPCION')

    console.log('DIURNO(G-E)', tipoGeneral, tipoExcepcion, listadoWL, listaTablas);
    console.log('export-data', dataExcel);
    console.log('EXISTE-EXCEP', dataExcel.find(x => x.tipoScore.toUpperCase() == 'EXCEPCION' ));

     this.wb = new Workbook();

     this.createListaTX(dataExcel);
     if (dataExcel.find(x => x.tipoScore.toUpperCase() == 'GENERAL' )) {
       this.createForExcepGeneral(tipoGeneral);
      }

     this.createTablas(listaTablas);
     this.createCasosEspeciales(dataExcel);

     if (dataExcel.find(x => x.tipoScore.toUpperCase() == 'EXCEPCION' )) {
       this.createForExcepEscen(tipoExcepcion);
     }
     this.createWL(listadoWL);

     return this.wb.xlsx.writeBuffer()
  };


  private createListaTX(scoreTable: any): void {
    console.log('F-EXCEP-DIURNA',scoreTable,);

    const sheet = this.wb.addWorksheet('LISTA-TX'); //Nombre de la Hoja

    // Establecemos el ancho y estilo de las columnas de la Tabla
    sheet.getColumn('A').width = 110;
    sheet.getColumn('B').width = 24;
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


    // DATA SCORE - TABLA DINAMICA
    sheet.columns.forEach((name_col) => {
      name_col.alignment = {vertical: 'middle', wrapText: true };
      // name_col.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' },}; //Pintamos toda la hoja

      // CABECERA DE LA TABLA CON ESTILOS
      const headerFila = sheet.getRow(2);
      headerFila.values = [
        'LLAVE',            //A
        'NEGOCIO',          //B
        'TIPO DE TRAN',     //C
        'TIPO DE VENTA',    //D
        'GAMA',             //E
        'CUOTA INICIAL',    //F
        'CUOTAS',           //G
        'LIMITE DE CREDITO',//H
        'CAP FINAN',        //I
        'SCORE (4DIG)',     //J
        'NRO DE LINEAS',    //K
        'CODIGO FINAN',     //L
      ];

      // Insertamos la data en las respectivas Columnas.
      const insertarFila = sheet.getRows(3, scoreTable.length)!;
      for (let i = 0; i < insertarFila.length; i++) {
        const fila = insertarFila[i];

        fila.values = [
          'MOVISTAR TOTAL-TOTALIZACIÓN MT-PORTA FINANCIADO - FIJA UPFRONT-BAJA-CI MINIMA 35%-12', //A
          'MOVISTAR TOTAL',                        //B
          'TOTALIZACIÓN MT',                       //C
          'CAEQ/ALTA FINANCIADO - FIJA FINANCIADO',//D
          'MEDIA',                                 //E
          'CI MINIMA 35%',                         //F
          12,                                      //G
          260,        //H
          100,        //I
          3307,       //J
          1,          //K
          3,          //L
        ];
        fila.font = { size: 11}
        fila.alignment = { horizontal: 'center', vertical: 'middle'}
      }

      headerFila.font = { bold: true, size: 11 };
      headerFila.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerFila.height = 30;

      // Bauground fila 1 - Tabla
      sheet.getCell('A2').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF32CD32'}}
      sheet.getCell('B2').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF32CD32'}}
      sheet.getCell('C2').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF32CD32'}}
      sheet.getCell('D2').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF32CD32'}}
      sheet.getCell('E2').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF32CD32'}}
      sheet.getCell('F2').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF32CD32'}}
      sheet.getCell('G2').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF32CD32'}}

      sheet.getCell('H2').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('I2').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('J2').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('K2').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('L2').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}


     this.borderTable(sheet, scoreTable);
    });
  }

  private createForExcepGeneral(scoreTable: any): void {
    console.log('FOR-EXCEP',scoreTable, scoreTable[0].validGama, scoreTable[0].usuario);

    const sheet = this.wb.addWorksheet('FOR EXCEP V1-GENERAL'); //Nombre de la Hoja

      // Establecemos el ancho y estilo de las columnas de la Tabla
      sheet.getColumn('A').width = 75;
      sheet.getColumn('B').width = 45;
      sheet.getColumn('C').width = 18;
      sheet.getColumn('D').width = 15;
      sheet.getColumn('E').width = 20;
      sheet.getColumn('F').width = 25;
      sheet.getColumn('G').width = 30;
      sheet.getColumn('H').width = 35;
      sheet.getColumn('I').width = 15;
      sheet.getColumn('J').width = 18;
      sheet.getColumn('K').width = 22;
      sheet.getColumn('L').width = 20;
      sheet.getColumn('M').width = 20;
      sheet.getColumn('N').width = 18;
      sheet.getColumn('O').width = 75;
      sheet.getColumn('P').width = 20;
      sheet.getColumn('Q').width = 20;
      sheet.getColumn('R').width = 20;
      sheet.getColumn('S').width = 25;
      sheet.getColumn('T').width = 20;
      sheet.getColumn('U').width = 20;
      sheet.getColumn('V').width = 20;


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
        'VALID. WL',                      //M
        'VALID. GAMA',                    //N
        'LLAVE',                          //O
        'VALID. LLAVE',                   //P
        'Usuario',                        //Q
        'CargoFijoMaximo',                //R
        'Capacidad_Financiamiento_Prev',  //S
        'Score',                          //T
        'Num_Lin_Disp',                   //U
        'Codigo_Financiamiento',          //V
      ];

      // Insertamos la data en las respectivas Columnas.
      const insertarFila = sheet.getRows(2, scoreTable.length)!;
      for (let i = 0; i < insertarFila.length; i++) {
        const fila = insertarFila[i];

        fila.values = [
          scoreTable[i].solicitante,               //A
          scoreTable[i].nombre_proyecto,           //B
          scoreTable[i].fecha_score,               //C
          scoreTable[i].tipo_documento,            //D
          scoreTable[i].numero_documento,          //E
          scoreTable[i].segmento,                  //F
          scoreTable[i].tipoTransaccion,           //G
          scoreTable[i].tipoVenta,                 //H
          scoreTable[i].gama,                      //I
          scoreTable[i].cuota_inicial,             //J
          scoreTable[i].cuotas,                    //K
          scoreTable[i].cap_finan_2,               //L
          scoreTable[i].validWL,                   //M  VERIFICAR Y AGREGA COL validWL
          scoreTable[i].validGama,                 //N
          scoreTable[i].segmento+'-'+scoreTable[i].tipoTransaccion+'-'+scoreTable[i].tipoVenta+'-'+scoreTable[i].gama+'-'+scoreTable[i].cuota_inicial+'-'+scoreTable[i].cuotas+'-', //O
          // scoreTable[i].segmento+'-'+scoreTable[i].tipoTransaccion+'-'+scoreTable[i].tipoVenta+'-'+scoreTable[i].gama+'-'+scoreTable[i].cuota_inicial+'-'+scoreTable[i].cuotas+'-', //P
          'PROCEDE',                               //P
          scoreTable[i].usuario,                   //Q
          scoreTable[i].cargo_fijo_max,            //R
          scoreTable[i].cap_financ_prev,           //S
          scoreTable[i].score,                     //T
          scoreTable[i].num_lin_disp,              //U
          scoreTable[i].cod_finan                  //V
        ];
        fila.font = { size: 11}
        fila.alignment = { horizontal: 'center', vertical: 'middle'}
      }

      headerFila.font = { bold: true, size: 11 };
      headerFila.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerFila.height = 28;


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


     this.borderTableForExcepGeneral(sheet, scoreTable);
     this.fontUsuarioMasivo(sheet, scoreTable)
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
        '',               //P
        '',               //Q
        '',               //R
        'MOVISTAR TOTAL', //Cambiamos a Col S
        'FIJA',           //T
        'MOVIL B2C',      //U
        '',               //V
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
    console.log('CASOS-ESP',scoreTable, scoreTable[0].GAMADEEQUIPO, scoreTable[0].Fecha_APP);

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
        'COD DIN',          //K
        'LLAVE',            //L
      ];

      headerFila.font = { bold: true, size: 11, color: {argb: 'FF4169E1'} };
      headerFila.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerFila.height = 25;

      // Insertamos la data en las respectivas Columnas.
      const insertarFila = sheet.getRows(2, scoreTable.length)!;
      for (let i = 0; i < insertarFila.length; i++) {
        const fila = insertarFila[i];

        fila.values = [
          '8241',                       //A
          '',                           //B
          'DITO',                       //C
          'STD ALONE',                  //D
          'FINANCIADO',                 //E
          '',                           //F
          '',                           //G
          '3301',                       //H
          scoreTable[i].Segmento,       //I
          scoreTable[i].Num_Lin_Disp,   //J
          scoreTable[i].Usuario,        //K
          '8241-DITO-STD ALONE-FINANCIADO-1701-100-0-0-1', //L
        ];
        fila.font = { size: 11}
        fila.alignment = { horizontal: 'center', vertical: 'middle'}
      }

    //  this.borderTableForExcep(sheet, scoreTable);
    });
  }

  private createForExcepEscen(scoreTable: any): void {
    const sheet = this.wb.addWorksheet('FOR EXCEP V1-ESCEN');

    // Establecemos el ancho y estilo de las columnas de la Tabla
    sheet.getColumn('A').width = 35;
    sheet.getColumn('B').width = 15;
    sheet.getColumn('C').width = 25;
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
    sheet.getColumn('Q').width = 20;
    sheet.getColumn('R').width = 20;
    sheet.getColumn('S').width = 80;
    sheet.getColumn('T').width = 20;


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
        'VALID. WL',                    //Q
        'VALID. GAMA',                  //R
        'LLAVE',                        //S
        'VALID. LLAVE',                 //T
      ];

      // Insertamos la data en las respectivas Columnas.
      // const insertarFila = sheet.getRows(2, scoreTable.length != null? scoreTable.lengt : 1)!;
      const insertarFila = sheet.getRows(2, scoreTable.length)!;
      console.log('LENGTH-DIURNA', scoreTable.length);
      console.log('LENGTH-INSERT' , insertarFila.length);

      for (let i = 0; i < insertarFila.length; i++) {
        const fila = insertarFila[i];

        fila.values = [
          scoreTable[i].solicitante,     //A
          scoreTable[i].score,           //B
          scoreTable[i].rq,              //C
          scoreTable[i].idProyecto,      //D
          scoreTable[i].casos,           //E
          scoreTable[i].gama,            //F
          scoreTable[i].tipo_documento,  //G
          scoreTable[i].numero_documento,//H
          scoreTable[i].fecha_score,     //I
          scoreTable[i].score,           //J
          scoreTable[i].cargo_fijo_max,  //K
          scoreTable[i].num_lin_disp,    //L
          scoreTable[i].cap_financ_prev, //M
          scoreTable[i].cod_finan,       //N
          scoreTable[i].cap_finan_2,     //O
          scoreTable[i].usuario,         //P
          scoreTable[i].validWL,         //Q
          scoreTable[i].validGama,       //R
                scoreTable[i].rq+'-'+
                scoreTable[i].proyecto+'-'+
                scoreTable[i].casos+'-'+
                scoreTable[i].cuota_inicial+'-'+
                scoreTable[i].score+'-'+
                scoreTable[i].cargo_fijo_max+'-'+
                scoreTable[i].num_lin_disp+'-'+
                scoreTable[i].cap_financ_prev+'-'+
                scoreTable[i].cod_finan+'-'+
                scoreTable[i].validWL+'-'+
                scoreTable[i].validGama,    //S
          'PROCEDE',                        //T

        ];
        fila.font = { size: 11}
        fila.alignment = { horizontal: 'center', vertical: 'middle'}
      }

      headerFila.font = { bold: true, size: 11 };
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
     this.borderTableForExcepEscen(sheet, scoreTable);
    });
  }

  private createWL(scoreTable: any): void {
    const sheet = this.wb.addWorksheet('WL');

    // Establecemos el ancho y estilo de las columnas de la Tabla
    sheet.getColumn('A').width = 22;
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
        'TIPO_DOC',             //A
        'NUM_DOC',              //B
        'TX',                   //C
        'NUM_DOC-TEXTO',        //D
      ];

      // Insertamos la data en las respectivas Columnas.
      const insertarFila = sheet.getRows(2, scoreTable.length)!;
      for (let i = 0; i < insertarFila.length; i++) {
        const fila = insertarFila[i];

        fila.values = [
          scoreTable[i].tipo_doc,//A
          scoreTable[i].cod_doc, //B
          'MOVISTAR TOTAL',      //C
          scoreTable[i].cod_doc, //D
        ];
        fila.font = { size: 11}
        fila.alignment = { horizontal: 'center', vertical: 'middle'}
      }

      headerFila.font = { bold: true, size: 12, color:{argb: 'FFFFFFFF'} };
      headerFila.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerFila.height = 25;

      // Bauground fila 1 - Tabla
      sheet.getCell('A1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}} // Color Azul
      sheet.getCell('B1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('C1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}
      sheet.getCell('D1').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'FF4169E1'}}


     this.borderTableWL(sheet, scoreTable);
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

  private borderTable(sheet: Worksheet, scoreTable: any) {
    for (let i = 1; i < 1 + scoreTable.length; i++) {
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

