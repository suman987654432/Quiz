const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const auth = require('../middleware/auth');
const Result = require('../models/Result');
const QuizSettings = require('../models/QuizSettings');

// Get quiz duration for users (no auth needed)
router.get('/quiz/duration', async (req, res) => {  // Changed back to /quiz/duration
    try {
        const settings = await QuizSettings.findOne();
        if (!settings) {
            // Create default settings if none exist
            const defaultSettings = new QuizSettings({ duration: 30 });
            await defaultSettings.save();
            return res.json({ duration: 30 });
        }
        res.json({ duration: settings.duration });
    } catch (error) {
        console.error('Error fetching quiz duration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all questions (admin only)
router.get('/questions', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const questions = await Question.find();
        res.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new question (admin only)
router.post('/questions', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { question, options, correctAnswer, timer } = req.body;

        // Validate input
        if (!question || !options || correctAnswer === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (!Array.isArray(options) || options.length !== 4) {
            return res.status(400).json({ message: 'Must provide exactly 4 options' });
        }

        const newQuestion = new Question({
            question,
            options,
            correctAnswer,
            timer: timer || 30
        });

        await newQuestion.save();
        res.status(201).json(newQuestion);
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a specific question
router.get('/questions/:id', auth, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a question (admin only)
router.put('/questions/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const question = await Question.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a question (admin only)
router.delete('/questions/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const question = await Question.findByIdAndDelete(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle quiz status
router.post('/quiz/toggle-status', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        const { isLive } = req.body;
        
        // Update quiz settings with new status
        let settings = await QuizSettings.findOne();
        if (!settings) {
            settings = new QuizSettings({ 
                duration: 30,
                isLive: isLive 
            });
        } else {
            settings.isLive = isLive;
        }
        await settings.save();
        
        res.json({ success: true, isLive });
    } catch (error) {
        console.error('Error toggling quiz status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add endpoint to check if quiz is live
router.get('/quiz/status', async (req, res) => {
    try {
        const settings = await QuizSettings.findOne();
        if (!settings) {
            return res.json({ isLive: false });
        }
        res.json({ isLive: settings.isLive });
    } catch (error) {
        console.error('Error checking quiz status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get active quiz questions (for users) - no auth needed
router.get('/quiz/active', async (req, res) => {
    try {
        const questions = await Question.find().select('-correctAnswer');

        const sanitizedQuestions = questions.map(q => ({
            _id: q._id,
            question: q.question,
            options: q.options,
            timer: q.timer
        }));

        res.json(sanitizedQuestions);
    } catch (error) {
        console.error('Error fetching active quiz:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Submit quiz answers - no auth needed
router.post('/quiz/submit', async (req, res) => {  // Changed back to /quiz/submit
    try {
        const { answers, userName, userEmail } = req.body;

        if (!answers || !userName || !userEmail) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if quiz is live before allowing submission
        const settings = await QuizSettings.findOne();
        if (!settings || !settings.isLive) {
            return res.status(403).json({ 
                message: 'Quiz is not active', 
                quizActive: false 
            });
        }

        // Get all questions
        const questions = await Question.find();

        if (!questions.length) {
            return res.status(400).json({ message: 'No questions available' });
        }

        // Calculate score
        let score = 0;
        const results = questions.map((q, index) => {
            const userAnswer = answers[index];
            const correct = userAnswer === q.correctAnswer - 1;
            if (correct) score++;

            return {
                question: q.question,
                userAnswer: q.options[userAnswer],
                correctAnswer: q.options[q.correctAnswer - 1],
                correct
            };
        });

        // Create and save result
        const result = new Result({
            user: {
                name: userName,
                email: userEmail
            },
            score,
            total: questions.length,
            answers: results,
            createdAt: new Date()
        });

        await result.save();

        // Send response
        res.json({
            score,
            total: questions.length,
            results
        });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add this route to get all user results (admin only)
router.get('/quiz/results', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Get all unique users who have taken the quiz
        const results = await Result.find()
            .sort({ createdAt: -1 }) // Most recent first
            .populate('user', 'name email'); // Include user details

        res.json(results);
    } catch (error) {
        console.error('Error fetching quiz results:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update global timer
router.put('/questions/timer', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { timer } = req.body;

        if (!timer || timer < 10 || timer > 180) {
            return res.status(400).json({ message: 'Invalid timer value' });
        }

        // Update all questions with new timer
        await Question.updateMany({}, { timer });

        res.json({ message: 'Timer updated successfully' });
    } catch (error) {
        console.error('Error updating timer:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update quiz duration
router.put('/quiz/settings', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { duration } = req.body;

        if (!duration || duration < 1 || duration > 180) {
            return res.status(400).json({ message: 'Invalid duration value' });
        }

        // Update or create quiz settings
        let settings = await QuizSettings.findOne();
        if (!settings) {
            settings = new QuizSettings({ duration });
        } else {
            settings.duration = duration;
        }
        await settings.save();

        res.json({ message: 'Quiz duration updated successfully', duration });
    } catch (error) {
        console.error('Error updating quiz duration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get quiz settings
router.get('/settings', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        let settings = await QuizSettings.findOne();
        if (!settings) {
            settings = new QuizSettings({ duration: 30 });
            await settings.save();
        }
        res.json(settings);
    } catch (error) {
        console.error('Error fetching quiz settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a user result (admin only)
router.delete('/quiz/results/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const result = await Result.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        res.json({ message: 'Result deleted successfully' });
    } catch (error) {
        console.error('Error deleting result:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete all results (admin only)
router.delete('/quiz/results/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete all results from the database
        await Result.deleteMany({});

        console.log('All results deleted by admin');
        res.json({ message: 'All results deleted successfully' });
    } catch (error) {
        console.error('Error deleting all results:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;