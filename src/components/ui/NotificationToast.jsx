import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

function NotificationToast({ message, type, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animação de entrada
    const enterTimer = setTimeout(() => setIsVisible(true), 10);

    // Animação de saída e fechamento
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Espera a animação de saída terminar
    }, 3000); // A notificação fica visível por 3 segundos

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [message, type, onClose]);

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
  const Icon = isSuccess ? CheckCircleIcon : XCircleIcon;

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center p-4 rounded-lg shadow-xl text-white transition-all duration-300 ${bgColor} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
      }`}
    >
      <Icon className="h-6 w-6 mr-3" />
      <span className="font-semibold">{message}</span>
    </div>
  );
}

export default NotificationToast;