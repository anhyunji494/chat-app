import React from 'react';
import './Input.css';

const Input = ({ message, setMessage, sendMessage }) => {
  const handleSubmit = (event) => {
    event.preventDefault(); // 폼의 기본 제출 동작을 방지
    sendMessage(event);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        className="input"
        type="text"
        placeholder="메세지를 작성하세요..."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyPress={(event) =>
          event.key === 'Enter' ? handleSubmit(event) : null
        }
      />
      <button className="sendButton" type="submit" onClick={handleSubmit}>
        전송
      </button>
    </form>
  );
};

export default Input;
