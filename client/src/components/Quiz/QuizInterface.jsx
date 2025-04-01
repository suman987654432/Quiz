import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/config';

const QuizInterface = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [quizDuration, setQuizDuration] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchQuizSettings();
        fetchQuestions();
    }, [navigate]);

    const fetchQuizSettings = async () => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/quiz/settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('userToken');
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch quiz settings');
            }

            const data = await response.json();
            setQuizDuration(data.duration);
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to fetch quiz settings');
        }
    };

    const fetchQuestions = async () => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/quiz/active`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('userToken');
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch questions');
            }

            const data = await response.json();
            setQuestions(data);
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to fetch questions');
        }
    };

    // Rest of the component...
};

export default QuizInterface; 