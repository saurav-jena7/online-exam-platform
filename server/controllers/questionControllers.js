const Question = require('../models/Question');
const Submission = require('../models/Submission');

// 🔧 Helper to generate a random email (fallback)
const generateRandomEmail = () => {
  const id = Math.random().toString(36).substring(2, 10);
  return `user_${id}@example.com`;
};

// ✅ Get questions for specific email or all
exports.getQuestions = async (req, res) => {
  const userEmail = req.query.email;

  try {
    let questions;
    if (userEmail) {
      questions = await Question.find({
        $or: [
          { global: true },
          { assignedToEmails: userEmail }
        ]
      });
    } else {
      questions = await Question.find({ global: true });
    }

    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get single question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create a single question (global or assigned)
exports.createQuestion = async (req, res) => {
  try {
    const {
      questionText,
      correctAnswer,
      options,
      subject,
      difficulty,
      tags,
      type = 'mcq',
      global = false,
      assignedToEmails = []
    } = req.body;

    if (!questionText || !correctAnswer) {
      return res.status(400).json({ error: 'Question text and correct answer are required' });
    }

    const question = new Question({
      questionText,
      correctAnswer,
      options: type === 'short' ? [] : options,
      subject,
      difficulty,
      tags,
      type,
      global,
      assignedToEmails: global ? [] : assignedToEmails
    });

    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Create multiple questions (supports both global and assigned)
exports.createMultipleQuestions = async (req, res) => {
  try {
    const questions = req.body.questions;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Invalid questions data' });
    }

    const formatted = questions.map(q => ({
      questionText: q.questionText,
      correctAnswer: q.correctAnswer,
      options: q.type === 'short' ? [] : q.options,
      subject: q.subject,
      difficulty: q.difficulty,
      tags: q.tags,
      type: q.type || 'mcq',
      global: q.global || false,
      assignedToEmails: q.global ? [] : q.assignedToEmails || [generateRandomEmail()]
    }));

    await Question.insertMany(formatted);
    res.status(201).json({ message: 'Questions created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create questions' });
  }
};

// ✅ Update a question by ID
exports.updateQuestion = async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });

    if (!updatedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ message: 'Question updated', updatedQuestion });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
};

// ✅ Delete a question
exports.deleteQuestion = async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Submit answers (with snapshots if present)
exports.submitAnswers = async (req, res) => {
  try {
    const { studentEmail, answers, snapshots } = req.body;

    if (!studentEmail || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const submission = new Submission({
      studentEmail,
      answers,
      snapshots: snapshots || [],
      submittedAt: new Date()
    });

    await submission.save();

    res.status(201).json({ message: 'Submission saved successfully' });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Failed to save submission' });
  }
};
