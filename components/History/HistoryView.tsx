// components/History/HistoryView.tsx
"use client";

import { useState } from 'react';
import { Calendar, Search, Users, FileText, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export default function HistoryView({ historico }: any) {
  const [expandido, setExpandido] = useState<number | null>(null);
  const [termoBusca, setTermoBusca] = useState('');

  // Filtra o histórico pela data ou conteúdo
  const historicoFiltrado = historico?.filter((dia: any) => 
    dia.data.includes(termoBusca) || 
    dia.registros.some((r: any) => r.texto.toLowerCase().includes(termoBusca.toLowerCase()) || r.profissional.toLowerCase().includes(termoBusca.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Barra de Pesquisa */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar por nome, texto ou data (AAAA-MM-DD)..." 
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          className="bg-transparent border-none outline-none w-full text-slate-700"
        />
      </div>

      {historicoFiltrado.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 font-medium">Nenhum registo encontrado no histórico.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {historicoFiltrado.map((dia: any) => {
            // Conta os profissionais únicos que participaram neste dia
            const profissionaisEnvolvidos = Array.from(new Set(dia.registros.map((r: any) => r.profissional))).join(', ');
            const isExpanded = expandido === dia.id;

            return (
              <div key={dia.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                
                {/* Cabeçalho do Card (Resumo do Dia) */}
                <div 
                  onClick={() => setExpandido(isExpanded ? null : dia.id)}
                  className="p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 text-indigo-700 p-3 rounded-xl flex flex-col items-center justify-center min-w-[80px]">
                      <Calendar size={20} className="mb-1" />
                      <span className="text-xs font-black">{dia.data.split('-').reverse().join('/')}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{dia.registros.length} Atendimentos Registados</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <Users size={14} /> Profissionais: {profissionaisEnvolvidos}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-3 text-indigo-600 font-bold text-sm">
                    {isExpanded ? (
                      <><span className="md:hidden">Ocultar Registos</span> <ChevronUp size={24} /></>
                    ) : (
                      <><span className="md:hidden">Ver Registos</span> <ChevronDown size={24} /></>
                    )}
                  </div>
                </div>

                {/* Área Expandida (Timeline do Dia) */}
                {isExpanded && (
                  <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-4">
                    <h5 className="font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">Linha do Tempo:</h5>
                    {dia.registros.map((reg: any, idx: number) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 relative shadow-sm">
                        <span className="absolute top-4 right-4 text-xs font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded-md border border-pink-100">
                          🕒 {reg.horario}
                        </span>
                        <p className="font-bold text-slate-800 text-sm mb-2">{reg.area} <span className="text-slate-400 font-normal ml-1">| Por: {reg.profissional}</span></p>
                        <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{reg.texto}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}