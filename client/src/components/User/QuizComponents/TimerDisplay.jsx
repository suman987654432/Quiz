import React from 'react';

const TimerDisplay = ({ timeLeft, isQuizLive, isTimerRunning }) => {
  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeLeftColor = () => {
    if (timeLeft === null) return 'text-gray-700';
    if (timeLeft > 300) return 'text-green-600'; 
    if (timeLeft > 60) return 'text-yellow-600'; 
    return 'text-red-600'; 
  };

  const getTimerStatus = () => {
    if (!isQuizLive) {
      return <span className="text-red-600">Quiz not activated by admin</span>;
    }
    
    if (!isTimerRunning) {
      return <span className="text-amber-600">Click any option to start the timer</span>;
    }
    
    return <span className={getTimeLeftColor()}>{formatTime(timeLeft)}</span>;
  };

  return (
    <div className="font-bold text-xl">
      {getTimerStatus()}
    </div>
  );
};

export default TimerDisplay;
