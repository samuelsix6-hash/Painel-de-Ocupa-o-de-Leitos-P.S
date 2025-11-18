import React from 'react';

interface OverwriteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    date: string;
}

const OverwriteConfirmationModal: React.FC<OverwriteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, date }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 transform transition-all">
                <h3 id="modal-title" className="text-lg font-bold text-gray-900">Confirmar Sobrescrita</h3>
                <p className="mt-2 text-sm text-gray-600">
                    Já existem dados para o dia <span className="font-semibold">{date}</span>. Deseja sobrescrever as informações existentes?
                </p>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
                    >
                        Sobrescrever
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OverwriteConfirmationModal;
