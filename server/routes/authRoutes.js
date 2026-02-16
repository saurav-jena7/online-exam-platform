const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully', user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message || 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Login attempt for email:', email);
    const user = await User.findOne({ email });
    console.log('User found:', !!user, user ? user._id : null);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match for', email, ':', isMatch);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    // JWT removed: respond with user info only
    console.log('Login successful for user:', user._id);
    res.status(200).json({
      email: user.email,
      role: user.role,
      id: user._id,
    });
  } catch (error) {
    console.error('Login error:', error && error.stack ? error.stack : error);
    res.status(500).json({ error: error.message || 'Server error during login' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '_id email role'); 
    res.status(200).json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.delete('/user/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
