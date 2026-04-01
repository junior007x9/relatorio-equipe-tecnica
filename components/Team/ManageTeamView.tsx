// components/Team/ManageTeamView.tsx
"use client";

import { useState } from 'react';
import { Trash2, Plus, UserPlus } from 'lucide-react';

export default function ManageTeamView({ equipe, setEquipe }: any) {
  const [novoProfissional, setNovoProfissional] = useState({ area: 'pedagogica', cargo: '', nome: '', turno: 'Manhã' });

  const removerProfissional = (areaKey: string, index: number) => {
    const novaEquipe = { ...equipe };
    novaEquipe[areaKey].profissionais.splice(index, 1);
    setEquipe(novaEquipe);
  };

  const adicionarProfissional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoProfissional.nome || !novoProfissional.cargo) return;

    const novaEquipe = { ...equipe };
    novaEquipe[novoProfissional.area].profissionais.push({
      cargo: novoProfissional.cargo,
      nome: novoProfissional.nome,
      turno: novoProfissional.turno
    });
    setEquipe(novaEquipe);
    setNovoProfissional({ ...novoProfissional, cargo: '', nome: '' }); // Limpa os campos
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Formulário de Adição */}
      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
        <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
          <UserPlus size={20} /> Cadastrar Novo Profissional
        </h3>
        <form onSubmit={adicionarProfissional} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select 
            value={novoProfissional.area} 
            onChange={(e) => setNovoProfissional({...novoProfissional, area: e.target.value})}
            className="p-3 rounded-xl border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {Object.entries(equipe).map(([key, area]: any) => (
              <option key={key} value={key}>{area.nome}</option>
            ))}
          </select>
          <input 
            type="text" placeholder="Cargo (Ex: Psicólogo)" required
            value={novoProfissional.cargo} onChange={(e) => setNovoProfissional({...novoProfissional, cargo: e.target.value})}
            className="p-3 rounded-xl border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input 
            type="text" placeholder="Nome Completo" required
            value={novoProfissional.nome} onChange={(e) => setNovoProfissional({...novoProfissional, nome: e.target.value})}
            className="p-3 rounded-xl border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <select 
            value={novoProfissional.turno} 
            onChange={(e) => setNovoProfissional({...novoProfissional, turno: e.target.value})}
            className="p-3 rounded-xl border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
            <option value="Noite">Noite</option>
            <option value="Integral">Integral</option>
          </select>
          <button type="submit" className="bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors p-3 md:p-0">
            <Plus size={20} /> Adicionar
          </button>
        </form>
      </div>

      {/* Listagem das Áreas e Profissionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(equipe).map(([key, area]: any) => (
          <div key={key} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h4 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">{area.nome}</h4>
            {area.profissionais.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Nenhum profissional cadastrado nesta área.</p>
            ) : (
              <ul className="space-y-3">
                {area.profissionais.map((prof: any, idx: number) => (
                  <li key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-700 text-sm">{prof.nome} <span className="font-normal text-slate-500">({prof.cargo})</span></p>
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full uppercase font-black">{prof.turno}</span>
                    </div>
                    <button 
                      onClick={() => removerProfissional(key, idx)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Remover Profissional"
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}