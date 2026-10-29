import React, { useRef } from 'react';
import { FileSignature, X, Shield, AlertCircle, CheckCheck } from 'lucide-react';
import { ThemeStyles } from '../../types/theme';

interface SignatureHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  signatureType: 'touch' | 'type' | 'efirma';
  onSelectSignatureType: (type: 'touch' | 'type' | 'efirma') => void;
  typedName: string;
  onChangeTypedName: (name: string) => void;
  signatureDone: boolean;
  onSignatureDoneChange: (done: boolean) => void;
  isStamping: boolean;
  stampingStep: number;
  onStartStamping: () => void;
  styles: ThemeStyles;
}

export const SignatureHubModal: React.FC<SignatureHubModalProps> = ({
  isOpen,
  onClose,
  signatureType,
  onSelectSignatureType,
  typedName,
  onChangeTypedName,
  signatureDone,
  onSignatureDoneChange,
  isStamping,
  stampingStep,
  onStartStamping,
  styles
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  if (!isOpen) return null;

  // Drawing Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#1D4ED8';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    onSignatureDoneChange(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignatureDoneChange(false);
  };

  const isSignReady = (signatureType === 'touch' && signatureDone) || 
                      (signatureType === 'type' && typedName.trim().length >= 3) ||
                      (signatureType === 'efirma');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className={`w-full max-w-lg ${styles.panelBg} border rounded-2xl p-6 space-y-5 shadow-2xl animate-scaleUp`}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-base">Centro de Firma & Timbrado Legal NOM-151</h3>
          </div>
          <button 
            onClick={onClose} 
            className="opacity-60 hover:opacity-100 p-1 cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Signature Tabs (Touch vs Typed Script vs e.firma) - Visible when not stamping */}
        {!isStamping && (
          <div className="space-y-4">
            <div className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl text-xs border ${styles.pillClass}`}>
              <button
                onClick={() => onSelectSignatureType('touch')}
                className={`py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  signatureType === 'touch' ? 'bg-blue-600 text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
              >
                ✍️ Trazo / Touch
              </button>
              <button
                onClick={() => onSelectSignatureType('type')}
                className={`py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  signatureType === 'type' ? 'bg-blue-600 text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
              >
                🖋️ Tipeada (Script)
              </button>
              <button
                onClick={() => onSelectSignatureType('efirma')}
                className={`py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  signatureType === 'efirma' ? 'bg-indigo-600 text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
              >
                🔐 e.firma SAT
              </button>
            </div>

            {/* Option 1: Touch Drawing Canvas */}
            {signatureType === 'touch' && (
              <div className="space-y-2">
                <p className="text-xs opacity-75">Dibuja tu firma con tu dedo o ratón sobre el lienzo:</p>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white rounded-xl overflow-hidden relative shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={460}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair w-full h-40 touch-none"
                  />
                  {!signatureDone && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs font-medium">
                      Rúbrica digital aquí (Dibuja con mouse o dedo)
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[11px] opacity-60 font-mono">Vector Bézier temporal ~2 KB</span>
                  <button onClick={clearCanvas} className="text-red-500 hover:underline cursor-pointer">
                    Limpiar lienzo
                  </button>
                </div>
              </div>
            )}

            {/* Option 2: Typed Name in Realistic Cursive / Script Font */}
            {signatureType === 'type' && (
              <div className="space-y-3">
                <div>
                  <label className={styles.labelClass}>Escribe tu nombre legal completo</label>
                  <input
                    type="text"
                    value={typedName}
                    onChange={(e) => onChangeTypedName(e.target.value)}
                    placeholder="Ej. Sofía Valenzuela Mendoza"
                    className={styles.inputClass}
                  />
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1 shadow-inner text-center">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                    Vista Previa de tu Firma Caligráfica Oficial
                  </span>
                  <div className="h-20 flex items-center justify-center border-b border-slate-300">
                    <span className="font-signature text-3xl sm:text-4xl text-[#1D4ED8] tracking-wide select-none">
                      {typedName.trim() || 'Tu Nombre Aquí'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block pt-1 font-mono">
                    Rúbrica Electrónica Simple · Art. 89 Código de Comercio
                  </span>
                </div>
              </div>
            )}

            {/* Option 3: e.firma SAT Zero-Knowledge */}
            {signatureType === 'efirma' && (
              <div className={`p-4 rounded-xl border ${styles.infoBoxClass} space-y-3 text-xs`}>
                <div className="flex items-center gap-2 text-indigo-500 font-bold">
                  <Shield className="w-4 h-4" />
                  <span>Firma Electrónica Avanzada (FIEL / e.firma del SAT)</span>
                </div>
                <p className="text-[11px] opacity-80 leading-relaxed">
                  Tus archivos <code>.cer</code> y <code>.key</code> se procesan en la memoria local de tu navegador (Web Worker). Nunca se envían a ningún servidor (Arquitectura Zero-Knowledge).
                </p>
                <div className={`p-3 rounded-lg border text-center cursor-pointer ${styles.pillClass} hover:border-blue-500 transition-colors`}>
                  Cargar certificado (.cer) y llave (.key)
                </div>
              </div>
            )}

            {/* Validation Notice if not ready */}
            {!isSignReady && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Dibuja tu rúbrica o escribe tu nombre para habilitar la firma.</span>
              </div>
            )}

            {/* Confirm Action Button */}
            <button
              disabled={!isSignReady}
              onClick={onStartStamping}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Firmar y Obtener Sello NOM-151 Oficial</span>
            </button>
          </div>
        )}

        {/* Stamping Simulation Stepper */}
        {isStamping && (
          <div className="py-8 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto"></div>
            <h4 className="font-bold text-sm">Timbrando con Prestador de Certificación (PSC)...</h4>
            <div className="space-y-2 max-w-xs mx-auto text-xs opacity-75 font-mono text-left">
              <div className={`flex items-center gap-2 ${stampingStep >= 1 ? 'text-emerald-500 font-bold' : 'opacity-40'}`}>
                <CheckCheck className="w-3.5 h-3.5" /> 1. Digest SHA-256 canónico generado
              </div>
              <div className={`flex items-center gap-2 ${stampingStep >= 2 ? 'text-emerald-500 font-bold' : 'opacity-40'}`}>
                <CheckCheck className="w-3.5 h-3.5" /> 2. Transmisión a HSM FIPS 140-2 Nivel 3
              </div>
              <div className={`flex items-center gap-2 ${stampingStep >= 3 ? 'text-emerald-500 font-bold' : 'opacity-40'}`}>
                <CheckCheck className="w-3.5 h-3.5" /> 3. Estampa de tiempo CENAM atómica UTC
              </div>
              <div className={`flex items-center gap-2 ${stampingStep >= 4 ? 'text-emerald-500 font-bold' : 'opacity-40'}`}>
                <CheckCheck className="w-3.5 h-3.5" /> 4. Emisión Constancia ASN.1 DER
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
