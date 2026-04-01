"use client";

import { useState, useRef, useEffect } from 'react';
import { AREAS_TECNICAS_DEFAULT } from '@/lib/equipe';
import { FileText, FileDown, Save, Mic, MicOff, CalendarDays, CalendarRange, History, PenLine, Users, Clock, DatabaseBackup } from 'lucide-react';
import HistoryView from '@/components/History/HistoryView';
import ManageTeamView from '@/components/Team/ManageTeamView';

export default function Home() {
  const [telaAtual, setTelaAtual] = useState<'formulario' | 'historico' | 'equipe'>('formulario'); 
  const [equipe, setEquipe] = useState<any>(AREAS_TECNICAS_DEFAULT);
  
  // NOVO: Estado para armazenar o histórico de dias fechados
  const [historicoGlobal, setHistoricoGlobal] = useState<any[]>([]);

  const [dataRelatorio, setDataRelatorio] = useState('');
  const [areaSelecionada, setAreaSelecionada] = useState('');
  const [profissionalSelecionado, setProfissionalSelecionado] = useState('');
  const [relatorioTexto, setRelatorioTexto] = useState('');
  const [registrosDoDia, setRegistrosDoDia] = useState<any[]>([]);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setDataRelatorio(new Date().toISOString().split('T')[0]);
    const equipeSalva = localStorage.getItem('equipe_csiprc');
    if (equipeSalva) setEquipe(JSON.parse(equipeSalva));

    // Carrega o histórico ao iniciar
    const historicoSalvo = localStorage.getItem('historico_csiprc');
    if (historicoSalvo) setHistoricoGlobal(JSON.parse(historicoSalvo));
  }, []);

  const atualizarEquipe = (novaEquipe: any) => {
    setEquipe(novaEquipe);
    localStorage.setItem('equipe_csiprc', JSON.stringify(novaEquipe));
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + ' ';
        }
        if (finalTranscript) setRelatorioTexto((prev) => prev + finalTranscript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleMicrofone = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); } 
    else { recognitionRef.current?.start(); setIsListening(true); }
  };

  const salvarRegistroTimeline = () => {
    if (!areaSelecionada) return alert("Por favor, selecione a sua Área!");
    if (!profissionalSelecionado) return alert("Por favor, selecione o seu Nome!");
    if (!relatorioTexto.trim()) return alert("A descrição do atendimento não pode estar vazia!");

    const novoRegistro = {
      id: Date.now(),
      area: equipe[areaSelecionada].nome,
      profissional: profissionalSelecionado,
      texto: relatorioTexto,
      horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setRegistrosDoDia([...registrosDoDia, novoRegistro]);
    setRelatorioTexto('');
    setProfissionalSelecionado('');
    setAreaSelecionada('');
  };

  // NOVO: Salva todo o dia (vários registos) no Histórico Global
  const salvarDiaCompletoNoHistorico = () => {
    if (registrosDoDia.length === 0) return alert("Não há registos na linha do tempo para salvar!");

    const novoHistorico = [...historicoGlobal];
    // Verifica se já existe um histórico salvo nesta data
    const indexExistente = novoHistorico.findIndex(h => h.data === dataRelatorio);

    const diaConsolidado = {
      id: indexExistente !== -1 ? novoHistorico[indexExistente].id : Date.now(),
      data: dataRelatorio,
      registros: [...registrosDoDia]
    };

    if (indexExistente !== -1) {
      // Se a data já existia, substitui/atualiza
      novoHistorico[indexExistente] = diaConsolidado;
    } else {
      // Se é um dia novo, adiciona
      novoHistorico.push(diaConsolidado);
    }

    // Ordena do mais recente para o mais antigo
    novoHistorico.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    setHistoricoGlobal(novoHistorico);
    localStorage.setItem('historico_csiprc', JSON.stringify(novoHistorico));
    alert("O Relatório Diário foi salvo com sucesso na aba Histórico!");
  };

  const prepararExportacao = async (tipo: 'pdf' | 'word') => {
    if (registrosDoDia.length === 0) return alert("Não há registos para exportar.");
    const dados = { dataRelatorio, registros: registrosDoDia };
    if (tipo === 'pdf') {
        const { gerarPDF } = await import('@/lib/pdfGenerator');
        gerarPDF(dados, equipe);
    } else {
        const { gerarWord } = await import('@/lib/wordGenerator');
        gerarWord(dados, equipe);
    }
  };

  return (
    <main className="min-h-screen p-2 md:p-8 bg-slate-50 flex justify-center">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative">
        
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 md:p-8 text-white relative">
          <h1 className="text-2xl md:text-4xl font-extrabold mb-2 drop-shadow-md pr-16 md:pr-0">
            {telaAtual === 'formulario' ? 'Registo da Equipa Técnica' : telaAtual === 'historico' ? 'Histórico de Registos' : 'Gerenciar Equipe'}
          </h1>
          <p className="text-indigo-100 font-medium text-sm md:text-base mb-6 md:mb-0">CSIPRC - Sistema Multidisciplinar</p>

          <div className="flex flex-wrap gap-2 md:absolute md:top-8 md:right-8">
            <button onClick={() => setTelaAtual('formulario')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${telaAtual === 'formulario' ? 'bg-white text-indigo-700 shadow-md' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
              <PenLine size={16} /> <span className="hidden md:inline">Registo</span>
            </button>
            <button onClick={() => setTelaAtual('historico')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${telaAtual === 'historico' ? 'bg-white text-indigo-700 shadow-md' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
              <History size={16} /> <span className="hidden md:inline">Histórico</span>
            </button>
            <button onClick={() => setTelaAtual('equipe')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${telaAtual === 'equipe' ? 'bg-white text-indigo-700 shadow-md' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
              <Users size={16} /> <span className="hidden md:inline">Equipe</span>
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {/* Passa o historicoGlobal para o componente HistoryView */}
          {telaAtual === 'historico' && <HistoryView historico={historicoGlobal} />}
          {telaAtual === 'equipe' && <ManageTeamView equipe={equipe} setEquipe={atualizarEquipe} />}
          
          {telaAtual === 'formulario' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-sm md:text-lg font-semibold text-slate-700 mb-2">📅 Data do Registo:</label>
                <input type="date" value={dataRelatorio} onChange={(e) => setDataRelatorio(e.target.value)} className="w-full md:w-auto p-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 outline-none text-slate-700 font-bold"/>
              </div>

              <div>
                <label className="block text-sm md:text-lg font-semibold text-slate-700 mb-3">Selecione a sua Área:</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(equipe).map(([key, area]: any) => (
                    <button key={key} onClick={() => { setAreaSelecionada(key); setProfissionalSelecionado(''); }} className={`p-3 md:p-4 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center justify-center text-center ${areaSelecionada === key ? 'border-indigo-500 bg-indigo-50 text-indigo-700 scale-[1.02] shadow-md' : 'border-slate-200 text-slate-500 hover:border-indigo-300'}`}>
                      {area.nome}
                    </button>
                  ))}
                </div>
              </div>

              {areaSelecionada && equipe[areaSelecionada] && equipe[areaSelecionada].profissionais.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 animate-in zoom-in duration-300">
                  <label className="block text-sm md:text-md font-bold text-indigo-900 mb-2">Quem está a realizar este registo?</label>
                  <select 
                    value={profissionalSelecionado} 
                    onChange={(e) => setProfissionalSelecionado(e.target.value)}
                    className="w-full p-3 rounded-xl border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-slate-700"
                  >
                    <option value="">Selecione o seu nome...</option>
                    {equipe[areaSelecionada].profissionais.map((prof: any, i: number) => (
                      <option key={i} value={prof.nome}>{prof.nome} ({prof.cargo} - {prof.turno})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="relative">
                <div className="flex justify-between items-end mb-3 mt-4">
                  <label className="block text-sm md:text-lg font-semibold text-slate-700">Descrição do Atendimento:</label>
                  <button onClick={toggleMicrofone} type="button" className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-md ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}>
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />} {isListening ? 'A Gravar...' : 'Ditar'}
                  </button>
                </div>
                <textarea rows={6} className={`w-full rounded-xl border-2 p-4 outline-none transition-all text-slate-700 text-sm md:text-base ${isListening ? 'border-red-400 ring-4 ring-red-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'}`} placeholder="Descreva as atividades deste horário..." value={relatorioTexto} onChange={(e) => setRelatorioTexto(e.target.value)}/>
              </div>

              <button onClick={salvarRegistroTimeline} className="w-full @utility btn-primary bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-lg">
                <Save size={24} /> Enviar p/ Linha do Tempo
              </button>

              <hr className="my-8 border-slate-200" />

              {registrosDoDia.length > 0 && (
                <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 mb-8 shadow-inner">
                  <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-300 pb-2">
                    <Clock size={20} className="text-indigo-600"/> Registos Salvos Hoje ({registrosDoDia.length})
                  </h3>
                  <div className="space-y-4">
                    {registrosDoDia.map((reg) => (
                      <div key={reg.id} className="p-4 bg-white rounded-xl border border-slate-200 relative shadow-sm hover:shadow-md transition-shadow">
                        <span className="absolute top-4 right-4 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md shadow-sm border border-indigo-100">
                          🕒 {reg.horario}
                        </span>
                        <p className="font-bold text-slate-800 text-sm mb-2">{reg.area} <span className="text-slate-400 font-normal ml-1">| Por: {reg.profissional}</span></p>
                        <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{reg.texto}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-black text-slate-800 mb-2 text-center">Exportar e Fechar o Dia</h2>
                <p className="text-sm text-slate-500 mb-6 text-center">Gere o documento final e salve os dados permanentemente no Histórico.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <button onClick={() => prepararExportacao('pdf')} className="bg-white border-2 border-rose-500 text-rose-600 font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-rose-50 transition-all flex items-center justify-center gap-2">
                    <FileText size={20} /> PDF do Dia ({registrosDoDia.length} partes)
                  </button>
                  <button onClick={() => prepararExportacao('word')} className="bg-white border-2 border-cyan-500 text-cyan-600 font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-cyan-50 transition-all flex items-center justify-center gap-2">
                    <FileDown size={20} /> Word do Dia ({registrosDoDia.length} partes)
                  </button>
                </div>

                {/* BOTÃO DE SALVAR NO HISTÓRICO */}
                <div className="border-t border-slate-100 pt-4 mt-2">
                  <button 
                    onClick={salvarDiaCompletoNoHistorico} 
                    className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl shadow-md hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                  >
                    <DatabaseBackup size={20} /> Salvar Relatório Completo no Histórico 
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </main>
  );
}