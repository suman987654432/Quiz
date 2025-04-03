import { useState } from 'react';
import { API_URL } from '../../config/config';
import { toast } from 'react-toastify';

const QuizSettings = ({ settings, quizDuration, setQuizDuration }) => {
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [newDuration, setNewDuration] = useState(quizDuration);

  const handleUpdateDuration = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/quiz/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ duration: newDuration })
      });

      if (!response.ok) {
        throw new Error('Failed to update quiz duration');
      }

      setQuizDuration(newDuration);
      setShowDurationModal(false);
      toast.success('Quiz duration updated successfully');
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to update quiz duration');
    }
  };

  return (
    <>
      <div className="mb-8 p-5 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm">
        <h2 className="text-lg font-semibold mb-2 text-indigo-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          Quiz Settings
        </h2>
        <p className="text-indigo-700 font-medium">Current Duration: {quizDuration} minutes</p>
        
        <button
          onClick={() => setShowDurationModal(true)}
          className="mt-3 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200 flex items-center gap-2 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Change Duration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-xl shadow-sm border border-indigo-100">
          <h2 className="text-xl font-semibold mb-4 text-indigo-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            Quiz Settings
          </h2>
          <p className="text-indigo-700 font-medium">Duration: {settings.duration} minutes</p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl shadow-sm border border-indigo-100">
          <h2 className="text-xl font-semibold mb-4 text-indigo-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Quiz Status
          </h2>
          <p className={`text-lg font-medium ${settings.isLive ? 'text-green-600' : 'text-red-600'}`}>
            {settings.isLive ? 'Quiz is Live' : 'Quiz is Not Active'}
          </p>
        </div>
      </div>

      {showDurationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-96 shadow-2xl border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-indigo-800">Set Quiz Duration</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDurationModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDuration}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuizSettings;
