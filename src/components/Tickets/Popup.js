import React from 'react';

const Popup = ({ popupVisible, popupMessage, handleClose }) => {
    return (
        popupVisible && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-4 rounded shadow-lg">
                    <h3 className="text-lg font-bold mb-2">Alerte</h3>
                    <p>{popupMessage}</p>
                    <button onClick={handleClose} className="bg-blue-500 text-white p-2 rounded mt-2">
                        Fermer
                    </button>
                </div>
            </div>
        )
    );
};

export default Popup;
