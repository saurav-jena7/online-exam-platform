require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');

const MONGODB_URI = process.env.MONGODB_URI;

const questions = [
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

async function seed() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not set in environment. Aborting.');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  try {
    // Remove existing global questions created by this seed to avoid duplicates
    await Question.deleteMany({ subject: 'React', global: true });
    const created = await Question.insertMany(questions);
    console.log(`Inserted ${created.length} questions`);
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
    process.exit(0);
  }
}

seed();
