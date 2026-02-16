require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const questionRoutes = require('./routes/questinRoutes'); 
const authRoutes = require('./routes/authRoutes');
const studentSubmissionRoutes = require('./routes/studentSubmissionRoutes');

const app = express();

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser requests or same-origin
      if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/questions', questionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/submission', studentSubmissionRoutes);

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
})
.then(() => {
  console.log('✅ MongoDB connected');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Auto-seed sample React questions if none exist
const seedSampleQuestions = async () => {
  try {
    const Question = require('./models/Question');
    const count = await Question.countDocuments({ subject: 'React', global: true });
    if (count === 0) {
      const sample = [
        { questionText: 'Which hook lets you add state to a functional component?', options: ['useEffect','useState','useRef','useContext'], correctAnswer: 'useState', subject: 'React', difficulty: 'Easy', tags: ['react','hooks','state'], type: 'mcq', global: true },
        { questionText: 'Which hook runs after every render by default and can be used for side effects?', options: ['useMemo','useCallback','useEffect','useLayoutEffect'], correctAnswer: 'useEffect', subject: 'React', difficulty: 'Easy', tags: ['react','hooks','lifecycle'], type: 'mcq', global: true },
        { questionText: 'What is the purpose of key props when rendering lists in React?', options: ['To style list items','To identify items for reconciliation','To pass data to children','To set tab order'], correctAnswer: 'To identify items for reconciliation', subject: 'React', difficulty: 'Medium', tags: ['react','lists','reconciliation'], type: 'mcq', global: true },
        { questionText: 'Which of the following is NOT a valid way to update state in React?', options: ['setCount(count + 1)','setState(prev => ({...prev, value: x}))','state = x','setValue(() => compute())'], correctAnswer: 'state = x', subject: 'React', difficulty: 'Easy', tags: ['react','state','best-practices'], type: 'mcq', global: true },
        { questionText: 'Which hook would you use to memoize a computed value to avoid expensive recalculation?', options: ['useRef','useMemo','useCallback','useEffect'], correctAnswer: 'useMemo', subject: 'React', difficulty: 'Medium', tags: ['react','performance','hooks'], type: 'mcq', global: true },
        { questionText: 'What does React.Fragment allow you to do?', options: ['Attach lifecycle methods','Return multiple elements without an extra DOM node','Create a portal','Persist state across renders'], correctAnswer: 'Return multiple elements without an extra DOM node', subject: 'React', difficulty: 'Easy', tags: ['react','jsx','fragments'], type: 'mcq', global: true },
        { questionText: 'Which API would you use to render a component subtree into a DOM node outside the parent DOM hierarchy?', options: ['createPortal','cloneElement','hydrate','createRoot'], correctAnswer: 'createPortal', subject: 'React', difficulty: 'Medium', tags: ['react','portals','rendering'], type: 'mcq', global: true },
        { questionText: 'When should you use useCallback?', options: ['To persist values across renders','To memoize a function identity between renders','To perform side effects','To create refs'], correctAnswer: 'To memoize a function identity between renders', subject: 'React', difficulty: 'Medium', tags: ['react','hooks','performance'], type: 'mcq', global: true },
        { questionText: 'Which pattern provides a way to pass data deeply without prop drilling?', options: ['Higher-order components','Render props','Context API','Refs'], correctAnswer: 'Context API', subject: 'React', difficulty: 'Easy', tags: ['react','context','patterns'], type: 'mcq', global: true },
        { questionText: 'What will cause a component to re-render?', options: ['Changing props','Changing state via setter','Parent re-rendering (by default)','All of the above'], correctAnswer: 'All of the above', subject: 'React', difficulty: 'Easy', tags: ['react','render','lifecycle'], type: 'mcq', global: true }
      ];
      await Question.insertMany(sample);
      console.log('Seeded sample React questions (10)');
    } else {
      console.log(`Sample questions present: ${count}`);
    }
  } catch (err) {
    console.error('Seeding check error:', err.message || err);
  }
};

// Run seed after mongoose connects
mongoose.connection.once('open', () => {
  seedSampleQuestions();
});

module.exports = app;

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
    process.exit(1);
  });
}
