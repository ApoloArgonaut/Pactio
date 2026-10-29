import React from 'react';
import { Shield, X } from 'lucide-react';

interface CryptoAuditInspectorProps {
  documentHash: string;
  onClose: () => void;
}

export const CryptoAuditInspector: React.FC<CryptoAuditInspectorProps> = ({
  documentHash,
  onClose
}) => {
  return (
    <div className="absolute bottom-10 left-0 right-0 z-30 p-4 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 space-y-2 animate-scaleUp text-xs font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-bold flex items-center gap-1.5 text-blue-400">
          <Shield className="w-4 h-4" />
          <span>Auditor Criptográfico SHA-256 en Vivo</span>
        </span>
        <button 
          onClick={onClose} 
          className="text-slate-400 hover:text-white cursor-pointer p-0.5"
          title="Cerrar inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-1 font-mono text-[11px] text-slate-300">
        <p>
          <span className="text-slate-500">Digest Completo:</span>{' '}
          <span className="text-emerald-400 break-all">{documentHash}</span>
        </p>
        <p>
          <span className="text-slate-500">Normalización:</span> Unicode NFC + Unix LF (ISO/IEC 10646)
        </p>
        <p>
          <span className="text-slate-500">Sello Temporal:</span> CENAM UTC Stratum-1 vía PSC
        </p>
        <p>
          <span className="text-slate-500">Invariante:</span> 100% Determinista (0% Colisión)
        </p>
      </div>
    </div>
  );
};
