// lib/pdfGenerator.ts

const getBase64ImageFromURL = async (url: string) => {
    try {
        const res = await fetch(url);
        if (!res.ok) return null; 
        
        const blob = await res.blob();
        if (!blob.type.startsWith('image/')) return null; 
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) { return null; }
};

const criarCabecalhoSecao = (titulo: string, corFundo: string = '#4f46e5') => ({
  table: { widths: ['*'], body: [[{ text: titulo, bold: true, color: '#ffffff', fillColor: corFundo, margin: [5, 4, 5, 4], alignment: 'center' }]] },
  layout: 'noBorders', margin: [0, 15, 0, 10]
});

const construirTabelaEquipe = (equipeAtual: any) => {
    const celulas = Object.values(equipeAtual).map((area: any) => {
        const profs = area.profissionais.map((p: any) => `${p.cargo}: ${p.nome} (${p.turno})`).join('\n');
        return {
            text: [
                { text: `${area.nome}:\n`, bold: true, color: '#4f46e5' },
                { text: profs || 'Nenhum profissional cadastrado', fontSize: 9 }
            ],
            margin: [5, 5]
        };
    });
    const rows = [];
    for (let i = 0; i < celulas.length; i += 2) {
        rows.push([celulas[i], celulas[i + 1] || { text: '' }]);
    }
    return rows;
};

export const gerarPDF = async (dados: any, equipeDinamica: any) => {
  try {
    const pdfMakeModule = await import("pdfmake/build/pdfmake");
    const pdfFontsModule = await import("pdfmake/build/vfs_fonts");

    const pdfMake = (pdfMakeModule as any).default || pdfMakeModule;
    const pdfFonts = (pdfFontsModule as any).default || pdfFontsModule;
    
    const vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

    const logoBase64 = await getBase64ImageFromURL('/logo.png');
    
    const contentArray: any[] = [];
    
    if (logoBase64) {
        contentArray.push({ image: logoBase64, width: 250, alignment: 'center', margin: [0, 0, 0, 10] });
    }
    
    contentArray.push(
      { text: 'RELATÓRIO DE ATENDIMENTO - EQUIPA TÉCNICA', style: 'mainTitle' },
      { text: 'CENTRO SÓCIOEDUCATIVO DE INTERNAÇÃO PROVISÓRIA DA REGIÃO DOS COCAIS - CSIPRC', style: 'subTitle' },
      { text: `DATA DO REGISTO: ${dados.dataRelatorio ? dados.dataRelatorio.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR')}`, style: 'dateTitle' },
      
      criarCabecalhoSecao('👥 COMPOSIÇÃO DA EQUIPA TÉCNICA MULTIDISCIPLINAR', '#3730a3'),
      {
        table: { widths: ['*', '*'], body: construirTabelaEquipe(equipeDinamica) },
        layout: 'lightHorizontalLines', margin: [0, 0, 0, 10], fontSize: 10
      },

      criarCabecalhoSecao('📝 REGISTROS DO ATENDIMENTO DIÁRIO', '#ec4899'),
      {
        stack: dados.registros && dados.registros.length > 0
          ? dados.registros.map((reg: any) => ({
              stack: [
                {
                  text: [
                    { text: `[ ${reg.horario} ] - `, bold: true, color: '#be185d' },
                    { text: `${reg.area} | `, bold: true, color: '#3730a3' },
                    { text: `Por: ${reg.profissional}`, italics: true, color: '#64748b' }
                  ],
                  margin: [0, 5, 0, 4], fontSize: 11
                },
                { text: reg.texto, margin: [0, 0, 0, 10], alignment: 'justify', fontSize: 10, lineHeight: 1.4 },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cbd5e1' }], margin: [0, 0, 0, 15] }
              ]
            }))
          : [{ text: 'Nenhum registo efetuado neste dia.', italics: true, color: '#64748b', margin: [0, 10], alignment: 'center' }]
      },

      { 
        unbreakable: true, margin: [0, 40, 0, 0],
        stack: [
          // CORREÇÃO: Coordenadas matemáticas exatas para centralizar a linha (largura 515, margem interna 107)
          { canvas: [{ type: 'line', x1: 107, y1: 0, x2: 408, y2: 0, lineWidth: 1, lineColor: '#000000' }], margin: [0, 0, 0, 10] },
          { text: 'Assinatura do(s) Profissional(is) Responsável(is)', alignment: 'center', fontSize: 10, bold: true },
          { text: 'Equipa Técnica - CSIPRC', alignment: 'center', fontSize: 9, color: '#64748b', margin: [0, 2, 0, 0] }
        ]
      }
    );

    const docDefinition: any = { 
        pageSize: 'A4', pageMargins: [40, 40, 40, 40], content: contentArray, defaultStyle: { fontSize: 11, color: '#0f172a' },
        styles: { mainTitle: { fontSize: 16, bold: true, alignment: 'center', color: '#1e3a8a', margin: [0, 0, 0, 4] }, subTitle: { fontSize: 9, bold: true, alignment: 'center', color: '#64748b', margin: [0, 0, 0, 15] }, dateTitle: { fontSize: 11, bold: true, alignment: 'center', color: '#ec4899', margin: [0, 0, 0, 15] } } 
    };
    
    const pdfDocGenerator = (pdfMake as any).createPdf(docDefinition, undefined, undefined, vfs);
    pdfDocGenerator.download(`Relatorio_Tecnico_${dados.dataRelatorio || new Date().toISOString().split('T')[0]}.pdf`);
    
  } catch (err) { 
    console.error(err); 
    alert("Erro ao gerar o PDF. Consulte o console para mais detalhes."); 
  }
};