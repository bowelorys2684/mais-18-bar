import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, FileDown, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CheckIn {
  id: number;
  name: string;
  whatsapp: string;
  profile: string;
  created_at: string;
}

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCheckins = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Admin: Buscando lista de check-ins...');
      const response = await fetch('/api/checkins');
      if (!response.ok) throw new Error('Falha ao buscar dados');
      const data = await response.json();
      setCheckins(data);
    } catch (error) {
      console.error('Erro ao buscar check-ins:', error);
      alert('Erro ao carregar a lista. Verifique a conexão.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleExportPDF = () => {
    if (checkins.length === 0) {
      alert('A lista está vazia.');
      return;
    }
    const doc = new jsPDF();
    doc.text('Lista de Check-ins - Bar Liberal', 14, 15);
    
    const tableData = checkins.map(c => [
      c.name,
      c.whatsapp,
      c.profile,
      new Date(c.created_at).toLocaleString('pt-BR')
    ]);

    autoTable(doc, {
      head: [['Nome', 'WhatsApp', 'Perfil', 'Data/Hora']],
      body: tableData,
      startY: 20,
    });

    doc.save('checkins-bar-liberal.pdf');
  };

  const handleClearHistory = async () => {
    if (!confirm('ATENÇÃO: Isso apagará TODOS os dados coletados permanentemente. Deseja continuar?')) return;
    
    try {
      const response = await fetch('/api/checkins/clear', { 
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        await fetchCheckins();
        alert('Histórico limpo com sucesso!');
      } else {
        alert(`Erro ao limpar histórico: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      alert('Erro de conexão ao tentar limpar o histórico.');
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const d = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const t = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${d} • ${t}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[100] flex flex-col p-6 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10">
            <img 
              src="https://i.imgur.com/16ghhZu.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">
            LISTA ({checkins.length})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchCheckins}
            className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
            title="Atualizar Lista"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <button
          onClick={handleFullscreen}
          className="flex flex-col items-center justify-center gap-2 py-4 bg-zinc-900 rounded-2xl text-zinc-400 font-bold text-[10px] tracking-widest uppercase hover:bg-zinc-800 transition-colors"
        >
          <Maximize2 size={18} />
          FULLSCREEN
        </button>
        <button
          onClick={handleExportPDF}
          className="flex flex-col items-center justify-center gap-2 py-4 bg-white text-black rounded-2xl font-bold text-[10px] tracking-widest uppercase hover:bg-zinc-200 transition-colors"
        >
          <FileDown size={18} />
          PDF
        </button>
        <button
          onClick={handleClearHistory}
          className="flex flex-col items-center justify-center gap-2 py-4 bg-red-900/20 border border-red-500/20 text-red-500 rounded-2xl font-bold text-[10px] tracking-widest uppercase hover:bg-red-900/30 transition-colors"
        >
          <Trash2 size={18} />
          LIMPAR HISTÓRICO
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
        {isLoading && checkins.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-pink" />
          </div>
        ) : checkins.length === 0 ? (
          <div className="text-center py-20 text-zinc-600 font-bold uppercase tracking-widest">
            Nenhum check-in realizado
          </div>
        ) : (
          checkins.map((c) => (
            <motion.div
              key={c.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-[#0a0a0a] border border-zinc-900 p-6 rounded-3xl flex items-center justify-between"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tight leading-none flex items-center gap-2">
                  {c.name}
                  <span className="text-[10px] text-zinc-700 font-mono">#{c.id}</span>
                </h3>
                <div className="flex items-center gap-3 text-zinc-600 font-bold text-sm">
                  <span>{c.whatsapp}</span>
                  <span className="opacity-30">•</span>
                  <span className="text-zinc-400">{formatDateTime(c.created_at)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="px-4 py-1.5 border border-[#00e5ff]/30 rounded-lg">
                  <span className="text-[#00e5ff] text-[10px] font-black uppercase tracking-widest">
                    {c.profile}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
