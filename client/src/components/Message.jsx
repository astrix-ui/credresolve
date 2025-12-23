import React, { useEffect } from 'react';

const Message = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`message ${type === 'error' ? 'error' : ''} show`}>
      {message}
    </div>
  );
};

export default Message;
