
import React, { useState, useEffect } from 'react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    getShareUrl: (scope: 'current' | 'all') => string;
}

const MagicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
    </svg>
);

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
    const [view, setView] = useState<'select' | 'result'>('select');
    const [longUrl, setLongUrl] = useState('');
    const [shortUrl, setShortUrl] = useState('');
    const [isShortening, setIsShortening] = useState(false);
    const [copyState, setCopyState] = useState<'idle' | 'copied_long' | 'copied_short'>('idle');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Reset state when opening
            setView('select');
            setLongUrl('');
            setShortUrl('');
            setIsShortening(false);
            setCopyState('idle');
            setError(null);
        }
    }, [isOpen]);

    const handleGenerate = (scope: 'current' | 'all') => {
        const url = getShareUrl(scope);
        setLongUrl(url);
        setView('result');
    };

    const handleShorten = async () => {
        setIsShortening(true);
        setError(null);
        try {
            const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
            if (!response.ok) throw new Error('Falha na conexão com o serviço de encurtamento.');
            const text = await response.text();
            setShortUrl(text);
        } catch (err) {
            console.error(err);
            setError('Não foi possível encurtar o link. Tente o link completo.');
        } finally {
            setIsShortening(false);
        }
    };

    const handleCopy = (text: string, type: 'long' | 'short') => {
        navigator.clipboard.writeText(text).then(() => {
            setCopyState(type === 'long' ? 'copied_long' : 'copied_short');
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
                        {view === 'select' ? 'Compartilhar Dados' : 'Link Gerado'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Fechar</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {view === 'select' ? (
                    <>
                        <p className="text-sm text-gray-600 mb-6">
                            Selecione o que deseja incluir no link de compartilhamento.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleGenerate('current')}
                                className="w-full flex justify-between items-center px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
                            >
                                <div className="text-left">
                                    <span className="block font-semibold text-blue-700">Apenas Data Atual</span>
                                    <span className="text-xs text-blue-500">Gera um link mais leve.</span>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>

                            <button
                                onClick={() => handleGenerate('all')}
                                className="w-full flex justify-between items-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                                <div className="text-left">
                                    <span className="block font-semibold text-gray-700">Histórico Completo</span>
                                    <span className="text-xs text-gray-500">Inclui todos os registros passados.</span>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        {/* Short URL Section */}
                        {shortUrl ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 animate-fade-in">
                                <label className="block text-xs font-semibold text-green-700 uppercase mb-1">Link Encurtado</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={shortUrl} 
                                        className="w-full bg-white border border-green-300 rounded px-2 py-1 text-sm text-gray-800 focus:outline-none"
                                    />
                                    <button
                                        onClick={() => handleCopy(shortUrl, 'short')}
                                        className={`flex-shrink-0 px-3 py-1 rounded text-sm font-medium transition-colors ${copyState === 'copied_short' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                    >
                                        {copyState === 'copied_short' ? <CheckIcon /> : <CopyIcon />}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Link Completo</label>
                                <div className="flex gap-2 mb-2">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={longUrl} 
                                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-500 focus:outline-none"
                                    />
                                    <button
                                        onClick={() => handleCopy(longUrl, 'long')}
                                        className={`flex-shrink-0 px-3 py-1 rounded text-sm font-medium transition-colors ${copyState === 'copied_long' ? 'bg-gray-700 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {copyState === 'copied_long' ? <CheckIcon /> : <CopyIcon />}
                                    </button>
                                </div>
                                
                                {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

                                <button
                                    onClick={handleShorten}
                                    disabled={isShortening}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {isShortening ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Encurtando...
                                        </span>
                                    ) : (
                                        <>
                                            <MagicIcon />
                                            Encurtar Link
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => setView('select')}
                            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4 underline"
                        >
                            Voltar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShareModal;
