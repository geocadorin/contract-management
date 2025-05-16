import jsPDF from 'jspdf';
import { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, PageOrientation, Packer } from 'docx';
import { saveAs } from 'file-saver';
import { Owner, Lessee } from '../interfaces/Person';
import { RealEstate } from '../interfaces/RealEstate';
import { Contract } from '../interfaces/Contract';

// Cores do tema
const themeColors = {
  primary: '#742851',
  accent: '#0067B1',
  highlight: '#F39200',
  primaryDark: '#5E2041',
};

// Utilitário para formatar data
const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

// Utilitário para formatar moeda
const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
};

// Função para gerar cabeçalho comum para PDF
const createPdfHeader = (doc: jsPDF, title: string, logoBase64?: string) => {
  doc.setFillColor(themeColors.primary);
  doc.rect(0, 0, doc.internal.pageSize.width, 30, 'F');
  
  // Adiciona título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text(title, 15, 15);
  
  // Adiciona data
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, doc.internal.pageSize.width - 50, 15);
  
  // Adiciona linha divisória
  doc.setDrawColor(themeColors.highlight);
  doc.setLineWidth(0.5);
  doc.line(0, 30, doc.internal.pageSize.width, 30);
  
  // Reinicia cor do texto para o restante do documento
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(12);
};

// EXPORTAÇÃO PARA PROPRIETÁRIOS (OWNERS)
export const generateOwnerPdf = (owner: Owner) => {
  const doc = new jsPDF();
  
  createPdfHeader(doc, 'Ficha de Proprietário');
  
  // Dados do proprietário
  doc.setFontSize(14);
  doc.setTextColor(themeColors.primary);
  doc.text('Dados Pessoais', 15, 45);
  
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`Nome: ${owner.full_name}`, 15, 55);
  doc.text(`CPF: ${owner.cpf || '-'}`, 15, 65);
  doc.text(`RG: ${owner.rg || '-'} / Órgão Emissor: ${owner.issuing_body || '-'}`, 15, 75);
  doc.text(`Profissão: ${owner.profession || '-'}`, 15, 85);
  doc.text(`Celular: ${owner.celphone || '-'}`, 15, 95);
  doc.text(`Email: ${owner.email || '-'}`, 15, 105);
  
  // Endereço
  doc.setFontSize(14);
  doc.setTextColor(themeColors.primary);
  doc.text('Endereço', 15, 125);
  
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`CEP: ${owner.cep || '-'}`, 15, 135);
  doc.text(`Rua: ${owner.street || '-'}, Nº ${owner.number || '-'}`, 15, 145);
  doc.text(`Complemento: ${owner.complement || '-'}`, 15, 155);
  doc.text(`Bairro: ${owner.neighborhood || '-'}`, 15, 165);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('SOGRINHA GESTÃO DE CONTRATOS', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  
  // Salva o PDF
  doc.save(`proprietario_${owner.full_name.replace(/\s+/g, '_')}.pdf`);
};

export const generateOwnerDocx = async (owner: Owner) => {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 700,
              right: 700,
              bottom: 700,
              left: 700,
            },
          },
        },
        children: [
          new Paragraph({
            text: "FICHA DE PROPRIETÁRIO",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            thematicBreak: true,
            spacing: {
              after: 200,
            },
            style: "Strong",
          }),
          
          new Paragraph({
            text: "DADOS PESSOAIS",
            heading: HeadingLevel.HEADING_2,
            thematicBreak: true,
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Nome: ", bold: true }),
              new TextRun(owner.full_name),
            ],
            spacing: { before: 100, after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "CPF: ", bold: true }),
              new TextRun(owner.cpf || "-"),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "RG: ", bold: true }),
              new TextRun(owner.rg || "-"),
              new TextRun(" / "),
              new TextRun({ text: "Órgão Emissor: ", bold: true }),
              new TextRun(owner.issuing_body || "-"),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Profissão: ", bold: true }),
              new TextRun(owner.profession || "-"),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Celular: ", bold: true }),
              new TextRun(owner.celphone || "-"),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Email: ", bold: true }),
              new TextRun(owner.email || "-"),
            ],
            spacing: { after: 300 },
          }),
          
          new Paragraph({
            text: "ENDEREÇO",
            heading: HeadingLevel.HEADING_2,
            thematicBreak: true,
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "CEP: ", bold: true }),
              new TextRun(owner.cep || "-"),
            ],
            spacing: { before: 100, after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Rua: ", bold: true }),
              new TextRun(`${owner.street || "-"}, Nº ${owner.number || "-"}`),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Complemento: ", bold: true }),
              new TextRun(owner.complement || "-"),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Bairro: ", bold: true }),
              new TextRun(owner.neighborhood || "-"),
            ],
            spacing: { after: 500 },
          }),
          
          new Paragraph({
            text: `Documento gerado em ${new Date().toLocaleDateString('pt-BR')}`,
            alignment: AlignmentType.CENTER,
            spacing: { before: 500 },
          }),
          
          new Paragraph({
            text: "SOGRINHA GESTÃO DE CONTRATOS",
            alignment: AlignmentType.CENTER,
            style: "Strong",
          }),
        ],
      },
    ],
  });

  // Gera o arquivo
  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  saveAs(blob, `proprietario_${owner.full_name.replace(/\s+/g, '_')}.docx`);
};

// EXPORTAÇÃO PARA INQUILINOS (LESSEES)
export const generateLesseePdf = (lessee: Lessee) => {
  const doc = new jsPDF();
  
  createPdfHeader(doc, 'Ficha de Inquilino');
  
  // Dados do inquilino
  doc.setFontSize(14);
  doc.setTextColor(themeColors.accent);
  doc.text('Dados Pessoais', 15, 45);
  
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`Nome: ${lessee.full_name}`, 15, 55);
  doc.text(`CPF: ${lessee.cpf || '-'}`, 15, 65);
  doc.text(`RG: ${lessee.rg || '-'} / Órgão Emissor: ${lessee.issuing_body || '-'}`, 15, 75);
  doc.text(`Profissão: ${lessee.profession || '-'}`, 15, 85);
  doc.text(`Celular: ${lessee.celphone || '-'}`, 15, 95);
  doc.text(`Email: ${lessee.email || '-'}`, 15, 105);
  
  // Endereço
  doc.setFontSize(14);
  doc.setTextColor(themeColors.accent);
  doc.text('Endereço', 15, 125);
  
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`CEP: ${lessee.cep || '-'}`, 15, 135);
  doc.text(`Rua: ${lessee.street || '-'}, Nº ${lessee.number || '-'}`, 15, 145);
  doc.text(`Complemento: ${lessee.complement || '-'}`, 15, 155);
  doc.text(`Bairro: ${lessee.neighborhood || '-'}`, 15, 165);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('SOGRINHA GESTÃO DE CONTRATOS', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  
  // Salva o PDF
  doc.save(`inquilino_${lessee.full_name.replace(/\s+/g, '_')}.pdf`);
};

export const generateLesseeDocx = async (lessee: Lessee) => {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 700,
              right: 700,
              bottom: 700,
              left: 700,
            },
          },
        },
        children: [
          new Paragraph({
            text: "FICHA DE INQUILINO",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            thematicBreak: true,
            spacing: {
              after: 200,
            },
            style: "Strong",
          }),
          
          new Paragraph({
            text: "DADOS PESSOAIS",
            heading: HeadingLevel.HEADING_2,
            thematicBreak: true,
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Nome: ", bold: true }),
              new TextRun(lessee.full_name),
            ],
            spacing: { before: 100, after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "CPF: ", bold: true }),
              new TextRun(lessee.cpf || "-"),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "RG: ", bold: true }),
              new TextRun(lessee.rg || "-"),
              new TextRun(" / "),
              new TextRun({ text: "Órgão Emissor: ", bold: true }),
              new TextRun(lessee.issuing_body || "-"),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Profissão: ", bold: true }),
              new TextRun(lessee.profession || "-"),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Celular: ", bold: true }),
              new TextRun(lessee.celphone || "-"),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Email: ", bold: true }),
              new TextRun(lessee.email || "-"),
            ],
            spacing: { after: 300 },
          }),
          
          new Paragraph({
            text: "ENDEREÇO",
            heading: HeadingLevel.HEADING_2,
            thematicBreak: true,
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "CEP: ", bold: true }),
              new TextRun(lessee.cep || "-"),
            ],
            spacing: { before: 100, after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Rua: ", bold: true }),
              new TextRun(`${lessee.street || "-"}, Nº ${lessee.number || "-"}`),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Complemento: ", bold: true }),
              new TextRun(lessee.complement || "-"),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Bairro: ", bold: true }),
              new TextRun(lessee.neighborhood || "-"),
            ],
            spacing: { after: 500 },
          }),
          
          new Paragraph({
            text: `Documento gerado em ${new Date().toLocaleDateString('pt-BR')}`,
            alignment: AlignmentType.CENTER,
            spacing: { before: 500 },
          }),
          
          new Paragraph({
            text: "SOGRINHA GESTÃO DE CONTRATOS",
            alignment: AlignmentType.CENTER,
            style: "Strong",
          }),
        ],
      },
    ],
  });

  // Gera o arquivo
  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  saveAs(blob, `inquilino_${lessee.full_name.replace(/\s+/g, '_')}.docx`);
};

// EXPORTAÇÃO PARA IMÓVEIS (REAL ESTATES)
export const generateRealEstatePdf = (realEstate: RealEstate) => {
  const doc = new jsPDF();
  
  createPdfHeader(doc, 'Ficha de Imóvel');
  
  // Dados do imóvel
  doc.setFontSize(14);
  doc.setTextColor(themeColors.highlight);
  doc.text('Dados do Imóvel', 15, 45);
  
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`Tipo: ${realEstate.real_estate_kind || '-'}`, 15, 55);
  doc.text(`Matrícula: ${realEstate.municipal_registration || '-'}`, 15, 65);
  doc.text(`Status: ${realEstate.status_real_estate || '-'}`, 15, 75);
  
  // Endereço
  doc.setFontSize(14);
  doc.setTextColor(themeColors.highlight);
  doc.text('Localização', 15, 95);
  
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`CEP: ${realEstate.cep || '-'}`, 15, 105);
  doc.text(`Rua: ${realEstate.street || '-'}, Nº ${realEstate.number || '-'}`, 15, 115);
  doc.text(`Complemento: ${realEstate.complement || '-'}`, 15, 125);
  doc.text(`Bairro: ${realEstate.neighborhood || '-'}`, 15, 135);
  
  // Proprietário
  if (realEstate.owners) {
    doc.setFontSize(14);
    doc.setTextColor(themeColors.highlight);
    doc.text('Proprietário', 15, 155);
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Nome: ${realEstate.owners.full_name || '-'}`, 15, 165);
    doc.text(`Telefone: ${realEstate.owners.celphone || '-'}`, 15, 175);
  }
  
  // Inquilino (se houver)
  if (realEstate.lessees) {
    doc.setFontSize(14);
    doc.setTextColor(themeColors.highlight);
    doc.text('Inquilino Atual', 15, 195);
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Nome: ${realEstate.lessees.full_name || '-'}`, 15, 205);
    doc.text(`Telefone: ${realEstate.lessees.celphone || '-'}`, 15, 215);
  }
  
  // Observações
  if (realEstate.note) {
    doc.setFontSize(14);
    doc.setTextColor(themeColors.highlight);
    doc.text('Observações', 15, 235);
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    
    // Quebra o texto longo em múltiplas linhas
    const splitText = doc.splitTextToSize(realEstate.note, 180);
    doc.text(splitText, 15, 245);
  }
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('SOGRINHA GESTÃO DE CONTRATOS', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  
  // Salva o PDF
  doc.save(`imovel_${realEstate.street?.replace(/\s+/g, '_') || 'sem_endereco'}_${realEstate.number || ''}.pdf`);
};

export const generateRealEstateDocx = async (realEstate: RealEstate) => {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 700,
              right: 700,
              bottom: 700,
              left: 700,
            },
          },
        },
        children: [
          new Paragraph({
            text: "FICHA DE IMÓVEL",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            thematicBreak: true,
            spacing: {
              after: 200,
            },
            style: "Strong",
          }),
          
          new Paragraph({
            text: "DADOS DO IMÓVEL",
            heading: HeadingLevel.HEADING_2,
            thematicBreak: true,
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Tipo: ", bold: true }),
              new TextRun(realEstate.real_estate_kind || "-"),
            ],
            spacing: { before: 100, after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Matrícula: ", bold: true }),
              new TextRun(realEstate.municipal_registration || "-"),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Status: ", bold: true }),
              new TextRun(realEstate.status_real_estate || "-"),
            ],
            spacing: { after: 300 },
          }),
          
          new Paragraph({
            text: "LOCALIZAÇÃO",
            heading: HeadingLevel.HEADING_2,
            thematicBreak: true,
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "CEP: ", bold: true }),
              new TextRun(realEstate.cep || "-"),
            ],
            spacing: { before: 100, after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Rua: ", bold: true }),
              new TextRun(`${realEstate.street || "-"}, Nº ${realEstate.number || "-"}`),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Complemento: ", bold: true }),
              new TextRun(realEstate.complement || "-"),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Bairro: ", bold: true }),
              new TextRun(realEstate.neighborhood || "-"),
            ],
            spacing: { after: 300 },
          }),
          
          ...(realEstate.owners ? [
            new Paragraph({
              text: "PROPRIETÁRIO",
              heading: HeadingLevel.HEADING_2,
              thematicBreak: true,
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Nome: ", bold: true }),
                new TextRun(realEstate.owners.full_name || "-"),
              ],
              spacing: { before: 100, after: 100 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Telefone: ", bold: true }),
                new TextRun(realEstate.owners.celphone || "-"),
              ],
              spacing: { after: 300 },
            }),
          ] : []),
          
          ...(realEstate.lessees ? [
            new Paragraph({
              text: "INQUILINO ATUAL",
              heading: HeadingLevel.HEADING_2,
              thematicBreak: true,
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Nome: ", bold: true }),
                new TextRun(realEstate.lessees.full_name || "-"),
              ],
              spacing: { before: 100, after: 100 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Telefone: ", bold: true }),
                new TextRun(realEstate.lessees.celphone || "-"),
              ],
              spacing: { after: 300 },
            }),
          ] : []),
          
          ...(realEstate.note ? [
            new Paragraph({
              text: "OBSERVAÇÕES",
              heading: HeadingLevel.HEADING_2,
              thematicBreak: true,
            }),
            
            new Paragraph({
              text: realEstate.note,
              spacing: { before: 100, after: 300 },
            }),
          ] : []),
          
          new Paragraph({
            text: `Documento gerado em ${new Date().toLocaleDateString('pt-BR')}`,
            alignment: AlignmentType.CENTER,
            spacing: { before: 500 },
          }),
          
          new Paragraph({
            text: "SOGRINHA GESTÃO DE CONTRATOS",
            alignment: AlignmentType.CENTER,
            style: "Strong",
          }),
        ],
      },
    ],
  });

  // Gera o arquivo
  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  saveAs(blob, `imovel_${realEstate.street?.replace(/\s+/g, '_') || 'sem_endereco'}_${realEstate.number || ''}.docx`);
};

// EXPORTAÇÃO PARA CONTRATOS
export const generateContractPdf = (contract: Contract) => {
  const doc = new jsPDF();
  
  createPdfHeader(doc, 'Detalhes do Contrato');
  
  // Informações básicas do contrato
  doc.setFontSize(14);
  doc.setTextColor(themeColors.primaryDark);
  doc.text('Informações do Contrato', 15, 45);
  
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`Identificador: ${contract.identifier}`, 15, 55);
  doc.text(`Tipo: ${contract.contract_kind}`, 15, 65);
  doc.text(`Status: ${contract.status}`, 15, 75);
  doc.text(`Período: ${formatDate(contract.start_date)} a ${formatDate(contract.end_date)}`, 15, 85);
  doc.text(`Duração: ${contract.duration || '-'} meses`, 15, 95);
  doc.text(`Valor: ${formatCurrency(contract.payment_value)}`, 15, 105);
  doc.text(`Dia de Pagamento: ${contract.day_payment || '-'}`, 15, 115);
  
  // Proprietário
  if (contract.owners) {
    doc.setFontSize(14);
    doc.setTextColor(themeColors.primaryDark);
    doc.text('Proprietário', 15, 135);
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Nome: ${contract.owners.full_name || '-'}`, 15, 145);
    doc.text(`Telefone: ${contract.owners.celphone || '-'}`, 15, 155);
    doc.text(`Email: ${contract.owners.email || '-'}`, 15, 165);
  }
  
  // Inquilino
  if (contract.lessees) {
    doc.setFontSize(14);
    doc.setTextColor(themeColors.primaryDark);
    doc.text('Inquilino', 15, 185);
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Nome: ${contract.lessees.full_name || '-'}`, 15, 195);
    doc.text(`Telefone: ${contract.lessees.celphone || '-'}`, 15, 205);
    doc.text(`Email: ${contract.lessees.email || '-'}`, 15, 215);
  }
  
  // Imóvel
  if (contract.real_estates) {
    doc.setFontSize(14);
    doc.setTextColor(themeColors.primaryDark);
    doc.text('Imóvel', 15, 235);
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Tipo: ${contract.real_estates.real_estate_kind || '-'}`, 15, 245);
    doc.text(`Endereço: ${contract.real_estates.street || '-'}, ${contract.real_estates.number || '-'}`, 15, 255);
    doc.text(`Bairro: ${contract.real_estates.neighborhood || '-'}`, 15, 265);
  }
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('SOGRINHA GESTÃO DE CONTRATOS', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  
  // Salva o PDF
  doc.save(`contrato_${contract.identifier.replace(/\s+/g, '_')}.pdf`);
};

export const generateContractDocx = async (contract: Contract) => {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 700,
              right: 700,
              bottom: 700,
              left: 700,
            },
          },
        },
        children: [
          new Paragraph({
            text: "DETALHES DO CONTRATO",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            thematicBreak: true,
            spacing: {
              after: 200,
            },
            style: "Strong",
          }),
          
          new Paragraph({
            text: "INFORMAÇÕES DO CONTRATO",
            heading: HeadingLevel.HEADING_2,
            thematicBreak: true,
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Identificador: ", bold: true }),
              new TextRun(contract.identifier),
            ],
            spacing: { before: 100, after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Tipo: ", bold: true }),
              new TextRun(contract.contract_kind),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Status: ", bold: true }),
              new TextRun(contract.status),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Período: ", bold: true }),
              new TextRun(`${formatDate(contract.start_date)} a ${formatDate(contract.end_date)}`),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Duração: ", bold: true }),
              new TextRun(`${contract.duration || '-'} meses`),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Valor: ", bold: true }),
              new TextRun(formatCurrency(contract.payment_value)),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "Dia de Pagamento: ", bold: true }),
              new TextRun(`${contract.day_payment || '-'}`),
            ],
            spacing: { after: 300 },
          }),
          
          ...(contract.owners ? [
            new Paragraph({
              text: "PROPRIETÁRIO",
              heading: HeadingLevel.HEADING_2,
              thematicBreak: true,
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Nome: ", bold: true }),
                new TextRun(contract.owners.full_name || "-"),
              ],
              spacing: { before: 100, after: 100 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Telefone: ", bold: true }),
                new TextRun(contract.owners.celphone || "-"),
              ],
              spacing: { after: 100 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Email: ", bold: true }),
                new TextRun(contract.owners.email || "-"),
              ],
              spacing: { after: 300 },
            }),
          ] : []),
          
          ...(contract.lessees ? [
            new Paragraph({
              text: "INQUILINO",
              heading: HeadingLevel.HEADING_2,
              thematicBreak: true,
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Nome: ", bold: true }),
                new TextRun(contract.lessees.full_name || "-"),
              ],
              spacing: { before: 100, after: 100 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Telefone: ", bold: true }),
                new TextRun(contract.lessees.celphone || "-"),
              ],
              spacing: { after: 100 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Email: ", bold: true }),
                new TextRun(contract.lessees.email || "-"),
              ],
              spacing: { after: 300 },
            }),
          ] : []),
          
          ...(contract.real_estates ? [
            new Paragraph({
              text: "IMÓVEL",
              heading: HeadingLevel.HEADING_2,
              thematicBreak: true,
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Tipo: ", bold: true }),
                new TextRun(contract.real_estates.real_estate_kind || "-"),
              ],
              spacing: { before: 100, after: 100 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Endereço: ", bold: true }),
                new TextRun(`${contract.real_estates.street || "-"}, ${contract.real_estates.number || "-"}`),
              ],
              spacing: { after: 100 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "Bairro: ", bold: true }),
                new TextRun(contract.real_estates.neighborhood || "-"),
              ],
              spacing: { after: 300 },
            }),
          ] : []),
          
          new Paragraph({
            text: `Documento gerado em ${new Date().toLocaleDateString('pt-BR')}`,
            alignment: AlignmentType.CENTER,
            spacing: { before: 500 },
          }),
          
          new Paragraph({
            text: "SOGRINHA GESTÃO DE CONTRATOS",
            alignment: AlignmentType.CENTER,
            style: "Strong",
          }),
        ],
      },
    ],
  });

  // Gera o arquivo
  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  saveAs(blob, `contrato_${contract.identifier.replace(/\s+/g, '_')}.docx`);
}; 