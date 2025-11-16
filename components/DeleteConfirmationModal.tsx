import React, { useState, useEffect } from 'react';
import { PASSWORD } from '../constants';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    date: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, date }) => {
    const [passwordInput, setPasswordInput] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Reset state when modal is opened
        if (isOpen) {
            setPasswordInput('');
            setError('');
        }
    }, [isOpen]);

    const handleConfirmClick = () => {
        if (passwordInput === PASSWORD) {
            onConfirm();
        } else {
            setError('Senha incorreta.');
        }
    };
    
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 transform transition-all">
                <h3 id="modal-title" className="text-lg font-bold text-gray-900">Confirmar Exclusão</h3>
                <p className="mt-2 text-sm text-gray-600">
                    Você tem certeza que deseja excluir os dados do dia <span className="font-semibold">{date}</span>? Esta ação não pode ser desfeita.
                </p>
                <div className="mt-4">
                    <label htmlFor="delete-password" className="block text-sm font-medium text-gray-700">
                        Senha de confirmação
                    </label>
                    <input
                        type="password"
                        id="delete-password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                     {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>

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
                        onClick={handleConfirmClick}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
