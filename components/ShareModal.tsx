
import React, { useState, useEffect } from 'react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    getShareUrl: (scope: 'current' | 'all') => string;
}

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, getShareUrl }) => {
    const [longUrl, setLongUrl] = useState('');
    const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

    useEffect(() => {
        if (isOpen) {
            const url = getShareUrl('all');
            setLongUrl(url);
            setCopyState('idle');
        }
    }, [isOpen]); 

    const handleCopy = () => {
        navigator.clipboard.writeText(longUrl).then(() => {
            setCopyState('copied');
            setTimeout(() => setCopyState('idle'), 2000);
        });
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            aria-labelledby="share-modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 transform transition-all">
                <div className="flex justify-between items-start mb-4">
                    <h3 id="share-modal-title" className="text-lg font-bold text-gray-900">
                        Compartilhar Dados
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Fechar</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Use o botão abaixo para copiar o link com o histórico completo dos dados.
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Link de Compartilhamento</label>
                        <div className="flex gap-2 mb-2">
                            <input 
                                type="text" 
                                readOnly 
                                value={longUrl} 
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-500 focus:outline-none"
                            />
                            <button
                                onClick={handleCopy}
                                className={`flex-shrink-0 px-3 py-1 rounded text-sm font-medium transition-colors ${copyState === 'copied' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            >
                                {copyState === 'copied' ? <CheckIcon /> : <CopyIcon />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Dica: Caso o link seja muito extenso para enviar, utilize um encurtador externo manualmente (ex: tinyurl.com).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
