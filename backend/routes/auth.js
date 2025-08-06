// 2. Update login route in auth.js to check status during login
// routes/auth.js - Enhanced login with status checking
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../db');

// Enhanced login route with status checking
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Get user with status
        const result = await db.query(
            'SELECT id, name, email, password, role, status FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Verify password first
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check user status AFTER password verification
        switch (user.status) {
            case 'banned':
                return res.status(403).json({ 
                    error: 'Your account has been banned. Contact administrator for assistance.',
                    code: 'ACCOUNT_BANNED'
                });
            
            case 'pending':
                return res.status(403).json({ 
                    error: 'Your account is pending approval. Please wait for admin approval before logging in.',
                    code: 'ACCOUNT_PENDING'
                });
            
            case 'approved':
                // Allow login
                break;
            
            default:
                return res.status(403).json({ 
                    error: 'Invalid account status. Contact administrator.',
                    code: 'INVALID_STATUS'
                });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user data without password
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Enhanced registration route with automatic status assignment
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (!['student', 'teacher'].includes(role)) {
            return res.status(400).json({ error: 'Role must be student or teacher' });
        }

        // Check if user already exists
        const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Determine initial status based on role
        let initialStatus = 'pending'; // Default to pending
        
        // You can customize this logic based on your requirements:
        // Option 1: All new users are pending
        // initialStatus = 'pending';
        
        // Option 2: Students auto-approved, teachers pending
        // initialStatus = role === 'student' ? 'approved' : 'pending';
        
        // Option 3: Check if this is the first user (make them admin)
        const userCount = await db.query('SELECT COUNT(*) FROM users');
        if (parseInt(userCount.rows[0].count) === 0) {
            // First user becomes admin and is auto-approved
            role = 'admin';
            initialStatus = 'approved';
        }

        // Insert new user
        const result = await db.query(
            'INSERT INTO users (name, email, password, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, status',
            [name, email, hashedPassword, role, initialStatus]
        );

        const newUser = result.rows[0];

        res.status(201).json({
            message: initialStatus === 'pending' 
                ? 'Registration successful. Please wait for admin approval.' 
                : 'Registration successful.',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status
            },
            requiresApproval: initialStatus === 'pending'
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

