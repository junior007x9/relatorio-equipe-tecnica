// lib/wordGenerator.ts
import { Document, Packer, Paragraph, TextRun, AlignmentType, Header, ImageRun, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';

const carregarImagemBuffer = async (url: string) => {
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        return await blob.arrayBuffer();
    } catch (e) { return null; }
};

const base64ToUint8Array = (base64: string) => {
    const binaryString = window.atob(base64.split(',')[1]);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
};

const construirTabelaEquipeWord = (equipeAtual: any) => {
    const celulas = Object.values(equipeAtual).map((area: any) => {
        const children = [new Paragraph({ children: [new TextRun({ text: area.nome, bold: true })] })];
        if (area.profissionais.length === 0) {
            children.push(new Paragraph({ children: [new TextRun({ text: "Nenhum profissional cadastrado", italics: true })] }));
        } else {
            area.profissionais.forEach((p: any) => {
                children.push(new Paragraph({ text: `${p.cargo}: ${p.nome} (${p.turno})` }));
            });
        }
        return new TableCell({ children, margins: { top: 100, bottom: 100, left: 100, right: 100 } });
    });
    const rows = [];
    for (let i = 0; i < celulas.length; i += 2) {
        rows.push(new TableRow({ children: [celulas[i], celulas[i + 1] || new TableCell({ children: [new Paragraph({ text: "" })] })] }));
    }
    return rows;
};

export const gerarWord = async (dados: any, equipeDinamica: any) => {
  try {
      const logoBuffer = await carregarImagemBuffer('/logo.png');
      const noSpacing = { after: 0, before: 0 }; 
      
      const childrenParagraphs = [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [ new TextRun({ text: "RELATÓRIO DE ATENDIMENTO – EQUIPA TÉCNICA", bold: true, size: 28, color: "1E3A8A" }) ], spacing: noSpacing }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [ new TextRun({ text: "CENTRO SÓCIOEDUCATIVO DE INTERNAÇÃO PROVISÓRIA DA REGIÃO DOS COCAIS - CSIPRC", bold: true, size: 16, color: "64748B" }) ], spacing: { after: 200 } }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [ new TextRun({ text: `DATA DO REGISTO: ${dados.dataRelatorio ? dados.dataRelatorio.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR')}`, bold: true, size: 20, color: "EC4899" }) ], spacing: { after: 400 } }),
            
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "COMPOSIÇÃO DA EQUIPA TÉCNICA", bold: true, size: 22 })], spacing: { after: 200 } }),
            new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: construirTabelaEquipeWord(equipeDinamica) }),

            new Paragraph({ text: "", spacing: { after: 600 } }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "REGISTROS DO ATENDIMENTO DIÁRIO", bold: true, size: 22 })], spacing: { after: 400 } })
      ];

      if (dados.registros && dados.registros.length > 0) {
          dados.registros.forEach((reg: any) => {
              childrenParagraphs.push(
                  new Paragraph({
                      children: [
                          new TextRun({ text: `[ ${reg.horario} ] - `, bold: true, size: 20, color: "BE185D" }),
                          new TextRun({ text: `${reg.area} | `, bold: true, size: 20, color: "3730A3" }),
                          new TextRun({ text: `Por: ${reg.profissional}`, italics: true, size: 18, color: "64748B" })
                      ],
                      spacing: { before: 200, after: 100 }
                  }),
                  // NOVO: A imagem entra no mesmo parágrafo do texto, logo no final!
                  new Paragraph({
                      children: [
                          new TextRun({ text: reg.texto + "   ", size: 20 }),
                          ...(reg.assinatura ? [
                              new ImageRun({
                                  data: base64ToUint8Array(reg.assinatura),
                                  transformation: { width: 100, height: 40 },
                                  type: "png"
                              })
                          ] : [])
                      ],
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { after: 200, line: 360 }
                  }),
                  new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "------------------------------------------------------", color: "CBD5E1" })],
                      spacing: { after: 300 }
                  })
              );
          });
      } else {
          childrenParagraphs.push(new Paragraph({ children: [new TextRun({ text: "Nenhum registo efetuado neste dia.", italics: true })], alignment: AlignmentType.CENTER }));
      }

      childrenParagraphs.push(
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "_________________________________________" })], keepNext: true, spacing: { before: 800 } }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [ new TextRun({ text: "Visto da Coordenação / Direção", bold: true, size: 18 }) ], keepNext: true }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Equipa Técnica - CSIPRC", size: 16, color: "64748B" })] })
      );

      const doc = new Document({ 
          sections: [{ 
              properties: { page: { margin: { top: 700, bottom: 700, left: 700, right: 700 } } } as any, 
              headers: { default: new Header({ children: [ new Paragraph({ alignment: AlignmentType.CENTER, children: [ logoBuffer ? new ImageRun({ data: new Uint8Array(logoBuffer as any), transformation: { width: 500, height: 120 }, type: "png" }) : new TextRun("") ] }), new Paragraph({ text: "" }) ] }) }, 
              children: childrenParagraphs 
          }] 
      });
      
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Relatorio_Tecnico_${dados.dataRelatorio || new Date().toISOString().split('T')[0]}.docx`);
  } catch (err) { console.error(err); alert("Erro ao criar o ficheiro do Word."); }
};