import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('expressjet.createBoilerplate', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No folder is open in the current VS Code window.');
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;

        const projectName = await vscode.window.showInputBox({
            prompt: 'Enter your project name (e.g., "my-api-backend")',
            placeHolder: 'my-express-app',
            value: path.basename(rootPath) 
        });

        if (!projectName) {
            vscode.window.showInformationMessage('Boilerplate generation cancelled. Project name is required.');
            return;
        }

        const packageManager = await vscode.window.showQuickPick(['npm', 'yarn'], {
            placeHolder: 'Choose your preferred package manager',
            canPickMany: false
        });

        if (!packageManager) {
            vscode.window.showInformationMessage('Boilerplate generation cancelled. Package manager choice is required.');
            return;
        }

        const moduleSystem = await vscode.window.showQuickPick(['CommonJS (require/module.exports)', 'ES Modules (import/export)'], {
            placeHolder: 'Choose your module system',
            canPickMany: false
        });

        if (!moduleSystem) {
            vscode.window.showInformationMessage('Boilerplate generation cancelled. Module system choice is required.');
            return;
        }

        const useESModules = moduleSystem === 'ES Modules (import/export)';
        const fileExtension = useESModules ? 'mjs' : 'js';
        const packageJsonType = useESModules ? '"type": "module",' : '';

        const includeAuth = await vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: 'Include Authentication (Email/Password with JWT)?',
            canPickMany: false
        });

        if (includeAuth === undefined) {
            vscode.window.showInformationMessage('Boilerplate generation cancelled. Authentication choice is required.');
            return;
        }
        const withAuth = includeAuth === 'Yes';

        const srcPath = path.join(rootPath, 'src');

        const folders = [
            'src',
            'src/config',
            'src/controllers',
            'src/models',
            'src/routes',
            'src/middlewares',
            'src/utils'
        ];

        const createFolders = () => {
            folders.forEach(folder => fs.mkdirSync(path.join(rootPath, folder), { recursive: true }));
        };

        const createFiles = () => {
            const appJsContent = useESModules ? `
import express from 'express';
import exampleRoute from './routes/example.route.${fileExtension}';
${withAuth ? `import authRoute from './routes/auth.route.${fileExtension}';` : ''}

const app = express();

app.use(express.json());

// Main routes
app.use('/api/example', exampleRoute);
${withAuth ? `app.use('/api/auth', authRoute);` : ''}

app.get('/', (req, res) => {
    res.send('API is running...');
});

export default app;
`.trim() : `
const express = require('express');
const exampleRoute = require('./routes/example.route');
${withAuth ? `const authRoute = require('./routes/auth.route');` : ''}

const app = express();

app.use(express.json());

// Main routes
app.use('/api/example', exampleRoute);
${withAuth ? `app.use('/api/auth', authRoute);` : ''}

app.get('/', (req, res) => {
    res.send('API is running...');
});

module.exports = app;
`.trim();
            fs.writeFileSync(path.join(srcPath, `app.${fileExtension}`), appJsContent);

            const serverJsContent = useESModules ? `
import app from './src/app.${fileExtension}';
import dotenv from 'dotenv';
import connectDB from './src/config/db.${fileExtension}';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

const server = app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(\`Error: \${err.message}\`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
`.trim() : `
const app = require('./src/app');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

const server = app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(\`Error: \${err.message}\`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
`.trim();
            fs.writeFileSync(path.join(rootPath, `server.${fileExtension}`), serverJsContent);

       
            const dbJsContent = useESModules ? `
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

export default connectDB;
`.trim() : `
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
`.trim();
            fs.writeFileSync(path.join(srcPath, 'config', `db.${fileExtension}`), dbJsContent);

            const envContent = `PORT=5000\nMONGO_URI=mongodb://localhost:27017/${projectName.toLowerCase().replace(/\s/g, '-')}-db${withAuth ? `\nJWT_SECRET=YOUR_SUPER_SECRET_KEY\nJWT_EXPIRES_IN=1h` : ''}`;
            fs.writeFileSync(path.join(rootPath, '.env'), envContent);

            const gitignoreContent = `node_modules/\n.env\n.vscode/\nbuild/`;
            fs.writeFileSync(path.join(rootPath, '.gitignore'), gitignoreContent);

            const readmeContent = `
# ${projectName} - Express + MongoDB Boilerplate

## 🔧 Installation

\`\`\`bash
${packageManager} install
\`\`\`

## 🚀 Run the server

\`\`\`bash
${packageManager === 'npm' ? 'npm run dev' : 'yarn dev'}
\`\`\`

## 📁 Folder Structure

- \`server.${fileExtension}\`: Main server entry point
- \`src/config\`: Database configuration
- \`src/controllers\`: Contains business logic for routes
- \`src/models\`: Mongoose schemas and models
- \`src/routes\`: API routes definitions
- \`src/middlewares\`: Custom Express middlewares
- \`src/utils\`: Helper functions, error handling, etc.

---

## 💡 Quick Start Example

This boilerplate includes a basic example for a "User" resource.

### Model: \`src/models/User.model.${fileExtension}\`

\`\`\`${useESModules ? 'js' : 'javascript'}
${useESModules ? `import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';` : `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');`}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    ${withAuth ? `password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },` : ''}
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

${withAuth ? `
// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
` : ''}

${useESModules ? `export default mongoose.model('User', userSchema);` : `module.exports = mongoose.model('User', userSchema);`}
\`\`\`

### Controller: \`src/controllers/example.controller.${fileExtension}\`

\`\`\`${useESModules ? 'js' : 'javascript'}
${useESModules ? `import User from '../models/User.model.${fileExtension}';` : `const User = require('../models/User.model');`}

${useESModules ? `export const getAllUsers = async (req, res) => {` : `exports.getAllUsers = async (req, res) => {`}
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

${useESModules ? `export const createUser = async (req, res) => {` : `exports.createUser = async (req, res) => {`}
    const { name, email ${withAuth ? ', password' : ''} } } = req.body;
    try {
        const newUser = new User({ name, email ${withAuth ? ', password' : ''} });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
\`\`\`

### Route: \`src/routes/example.route.${fileExtension}\`

\`\`\`${useESModules ? 'js' : 'javascript'}
${useESModules ? `import express from 'express';
import { getAllUsers, createUser } from '../controllers/example.controller.${fileExtension}';
${withAuth ? `import { protect } from '../middlewares/auth.middleware.${fileExtension}';` : ''}` : `const express = require('express');
const { getAllUsers, createUser } = require('../controllers/example.controller');
${withAuth ? `const { protect } = require('../middlewares/auth.middleware');` : ''}`}

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser);

// Example of a protected route
${withAuth ? `router.get('/protected-example', protect, (req, res) => {
    res.json({ message: 'This is a protected route!', user: req.user });
});` : ''}

${useESModules ? `export default router;` : `module.exports = router;`}
\`\`\`

${withAuth ? `
## 🔐 Authentication (Email/Password with JWT)

If you chose to include authentication, your project is set up with:

* **User Model:** Includes \`email\`, \`password\` (hashed), and \`role\` fields.
* **Registration:** \`POST /api/auth/register\`
* **Login:** \`POST /api/auth/login\`
* **Token Generation:** JWTs are issued upon successful registration/login.
* **Protected Routes:** A \`protect\` middleware to safeguard routes (e.g., \`/api/example/protected-example\`).

### Authentication API Endpoints

* **Register User:**
    * \`POST /api/auth/register\`
    * **Body:** \`{ "name": "...", "email": "...", "password": "..." }\`
    * **Response:** JWT token and user details.

* **Login User:**
    * \`POST /api/auth/login\`
    * **Body:** \`{ "email": "...", "password": "..." }\`
    * **Response:** JWT token and user details.

* **Access Protected Route (Example):**
    * \`GET /api/example/protected-example\`
    * **Headers:** \`Authorization: Bearer <YOUR_JWT_TOKEN>\`
    * **Response:** Access granted message and user data.

### Environment Variables for Auth

Make sure to set these in your \`.env\` file:

\`\`\`
JWT_SECRET=YOUR_SUPER_SECRET_KEY_REPLACE_THIS
JWT_EXPIRES_IN=1h
\`\`\`
` : ''}

---

## 🙏 Contribution & Support

Found an issue or have a feature request? Feel free to open an issue or submit a pull request on our GitHub repository:

* **Repository:** [https://github.com/IamNishant51/Backend-Folder-str-Generator](https://github.com/IamNishant51/Backend-Folder-str-Generator)
* **Issues:** [https://github.com/IamNishant51/Backend-Folder-str-Generator/issues](https://github.com/IamNishant51/Backend-Folder-str-Generator/issues)

## 📄 License

This extension is licensed under the ISC License.

---

**Crafted with 💖 by Nishant Unavane — The Web Architect**

---
`.trim();
            fs.writeFileSync(path.join(rootPath, 'README.md'), readmeContent);

            let generatedPackageJsonDependencies = `"dotenv": "^16.0.3",\n\t\t"express": "^4.18.2",\n\t\t"mongoose": "^7.6.0"`;
            let generatedPackageJsonDevDependencies = `"nodemon": "^3.0.1"`;

            if (withAuth) {
                generatedPackageJsonDependencies += `,\n\t\t"bcryptjs": "^2.4.3",\n\t\t"jsonwebtoken": "^9.0.2"`;
            }

            const packageJsonContent = `
{
    "name": "${projectName.toLowerCase().replace(/\s/g, '-')}",
    "version": "1.0.0",
    "description": "A modern Express.js and MongoDB backend boilerplate.",
    ${packageJsonType}
    "main": "server.${fileExtension}", 
    "scripts": {
        "start": "node server.${fileExtension}", 
        "dev": "nodemon server.${fileExtension}" 
    },
    "keywords": [
        "express",
        "mongodb",
        "boilerplate",
        "api"
    ],
    "author": "Nishant — The Web Architect",
    "license": "ISC",
    "dependencies": {
        ${generatedPackageJsonDependencies}
    },
    "devDependencies": {
        ${generatedPackageJsonDevDependencies}
    }
}
`.trim();
            fs.writeFileSync(path.join(rootPath, 'package.json'), packageJsonContent);

        
            const userModelContent = useESModules ? `
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    ${withAuth ? `password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },` : ''}
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

${withAuth ? `
// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
` : ''}

export default mongoose.model('User', userSchema);
`.trim() : `
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    ${withAuth ? `password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },` : ''}
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

${withAuth ? `
// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
` : ''}

module.exports = mongoose.model('User', userSchema);
`.trim();
            fs.writeFileSync(path.join(srcPath, 'models', `User.model.${fileExtension}`), userModelContent);

            const exampleControllerContent = useESModules ? `
import User from '../models/User.model.${fileExtension}';

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createUser = async (req, res) => {
    const { name, email ${withAuth ? ', password' : ''} } = req.body;
    try {
        const newUser = new User({ name, email ${withAuth ? ', password' : ''} });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
`.trim() : `
const User = require('../models/User.model');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createUser = async (req, res) => {
    const { name, email ${withAuth ? ', password' : ''} } = req.body;
    try {
        const newUser = new User({ name, email ${withAuth ? ', password' : ''} });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
`.trim();
            fs.writeFileSync(path.join(srcPath, 'controllers', `example.controller.${fileExtension}`), exampleControllerContent);

            const exampleRouteContent = useESModules ? `
import express from 'express';
import { getAllUsers, createUser } from '../controllers/example.controller.${fileExtension}';
${withAuth ? `import { protect } from '../middlewares/auth.middleware.${fileExtension}';` : ''}

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser);

// Example of a protected route
${withAuth ? `router.get('/protected-example', protect, (req, res) => {
    res.json({ message: 'This is a protected route!', user: req.user });
});` : ''}

export default router;
`.trim() : `
const express = require('express');
const { getAllUsers, createUser } = require('../controllers/example.controller');
${withAuth ? `const { protect } = require('../middlewares/auth.middleware');` : ''}

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser);

// Example of a protected route
${withAuth ? `router.get('/protected-example', protect, (req, res) => {
    res.json({ message: 'This is a protected route!', user: req.user });
});` : ''}

module.exports = router;
`.trim();
            fs.writeFileSync(path.join(srcPath, 'routes', `example.route.${fileExtension}`), exampleRouteContent);

            if (withAuth) {
                const authControllerContent = useESModules ? `
import User from '../models/User.model.${fileExtension}';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper function to send JWT token
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000), // Convert hours to ms
        httpOnly: true // Prevent client-side JS from accessing token
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        sendTokenResponse(user, 200, res);

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error or User Exists' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Please enter an email and password' });
    }

    try {
        // Check for user
        const user = await User.findOne({ email }).select('+password'); // Select password explicitly

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        // req.user is set by the protect middleware
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
`.trim() : `
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper function to send JWT token
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000), // Convert hours to ms
        httpOnly: true // Prevent client-side JS from accessing token
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        sendTokenResponse(user, 200, res);

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error or User Exists' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Please enter an email and password' });
    }

    try {
        // Check for user
        const user = await User.findOne({ email }).select('+password'); // Select password explicitly

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        // req.user is set by the protect middleware
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
`.trim();
                fs.writeFileSync(path.join(srcPath, 'controllers', `auth.controller.${fileExtension}`), authControllerContent);

                const authRouteContent = useESModules ? `
import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.${fileExtension}';
import { protect } from '../middlewares/auth.middleware.${fileExtension}';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
`.trim() : `
const express = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
`.trim();
                fs.writeFileSync(path.join(srcPath, 'routes', `auth.route.${fileExtension}`), authRouteContent);

                const authMiddlewareContent = useESModules ? `
import jwt from 'jsonwebtoken';
import User from '../models/User.model.${fileExtension}';

// Protect routes
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }
    // Else if using cookies, uncomment below
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};

// Grant access to specific roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: \`User role \${req.user.role} is not authorized to access this route\` });
        }
        next();
    };
};
`.trim() : `
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }
    // Else if using cookies, uncomment below
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: \`User role \${req.user.role} is not authorized to access this route\` });
        }
        next();
    };
};
`.trim();
                fs.writeFileSync(path.join(srcPath, 'middlewares', `auth.middleware.${fileExtension}`), authMiddlewareContent);
            }
        };

        try {
            createFolders();
            createFiles();
            vscode.window.showInformationMessage(`✅ Express backend boilerplate for "${projectName}" generated!`);

            const terminal = vscode.window.createTerminal(`Install Dependencies (${packageManager})`);
            terminal.show();
            terminal.sendText(`${packageManager} install`);
            terminal.sendText(`exit`);

            vscode.window.showInformationMessage(`Dependencies are being installed with ${packageManager}.`);

            const openReadme = 'Open README.md';
            const showExplorer = 'Show in Explorer';
            vscode.window.showInformationMessage(
                `Your Express.js backend is ready!`,
                openReadme,
                showExplorer
            ).then(selection => {
                if (selection === openReadme) {
                    vscode.workspace.openTextDocument(path.join(rootPath, 'README.md')).then(doc => {
                        vscode.window.showTextDocument(doc);
                    });
                } else if (selection === showExplorer) {
                    vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(rootPath));
                }
            });


        } catch (err: any) { 
            vscode.window.showErrorMessage(`❌ Error creating boilerplate: ${err.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }