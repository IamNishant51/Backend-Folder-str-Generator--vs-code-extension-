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

        // 1. Prompt for Project Name
        const projectName = await vscode.window.showInputBox({
            prompt: 'Enter your project name (e.g., "my-api-backend")',
            placeHolder: 'my-express-app',
            value: path.basename(rootPath) // Suggest current folder name as default
        });

        if (!projectName) {
            vscode.window.showInformationMessage('Boilerplate generation cancelled. Project name is required.');
            return;
        }

        // 2. Prompt for Package Manager
        const packageManager = await vscode.window.showQuickPick(['npm', 'yarn'], {
            placeHolder: 'Choose your preferred package manager',
            canPickMany: false
        });

        if (!packageManager) {
            vscode.window.showInformationMessage('Boilerplate generation cancelled. Package manager choice is required.');
            return;
        }

        // 3. Prompt for ES Modules vs CommonJS
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

        const srcPath = path.join(rootPath, 'src');

        const folders = [
            'src',
            'src/config',
            'src/controllers',
            'src/models',
            'src/routes',
            'src/middlewares',
            'src/utils' // Added for utilities like error handling or helper functions
        ];

        const createFolders = () => {
            folders.forEach(folder => fs.mkdirSync(path.join(rootPath, folder), { recursive: true }));
        };

        const createFiles = () => {
            const appJsContent = useESModules ? `
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.${fileExtension}';
import exampleRoute from './routes/example.route.${fileExtension}'; // Example route

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Example route usage
app.use('/api/example', exampleRoute);

app.get('/', (req, res) => {
    res.send('API is running...');
});

connectDB();

app.listen(PORT, () => {
    console.log(\`Server is running on port \${PORT}\`);
});
`.trim() : `
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const exampleRoute = require('./routes/example.route'); // Example route

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Example route usage
app.use('/api/example', exampleRoute);

app.get('/', (req, res) => {
    res.send('API is running...');
});

connectDB();

app.listen(PORT, () => {
    console.log(\`Server is running on port \${PORT}\`);
});
`.trim();

            fs.writeFileSync(path.join(srcPath, `app.${fileExtension}`), appJsContent);

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

            const envContent = `PORT=5000\nMONGO_URI=mongodb://localhost:27017/${projectName.toLowerCase().replace(/\s/g, '-')}-db`;
            fs.writeFileSync(path.join(rootPath, '.env'), envContent);

            const gitignoreContent = `node_modules/\n.env\n.vscode/`; // Added .vscode for good measure
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
${useESModules ? `import mongoose from 'mongoose';` : `const mongoose = require('mongoose');`}

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
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

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
    const { name, email } = req.body;
    try {
        const newUser = new User({ name, email });
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
import { getAllUsers, createUser } from '../controllers/example.controller.${fileExtension}';` : `const express = require('express');
const { getAllUsers, createUser } = require('../controllers/example.controller');`}

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser);

${useESModules ? `export default router;` : `module.exports = router;`}
\`\`\`
`.trim();

            fs.writeFileSync(path.join(rootPath, 'README.md'), readmeContent);

            const packageJsonContent = `
{
    "name": "${projectName.toLowerCase().replace(/\s/g, '-')}",
    "version": "1.0.0",
    "description": "A modern Express.js and MongoDB backend boilerplate.",
    ${packageJsonType}
    "main": "src/app.${fileExtension}",
    "scripts": {
        "start": "node src/app.${fileExtension}",
        "dev": "nodemon src/app.${fileExtension}"
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
        "dotenv": "^16.0.3",
        "express": "^4.18.2",
        "mongoose": "^7.6.0"
    },
    "devDependencies": {
        "nodemon": "^3.0.1"
    }
}
`.trim();

            fs.writeFileSync(path.join(rootPath, 'package.json'), packageJsonContent);

            // Create example model, controller, route
            const exampleModelContent = useESModules ? `
import mongoose from 'mongoose';

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
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('User', userSchema);
`.trim() : `
const mongoose = require('mongoose');

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
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', userSchema);
`.trim();

            fs.writeFileSync(path.join(srcPath, 'models', `User.model.${fileExtension}`), exampleModelContent);

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
    const { name, email } = req.body;
    try {
        const newUser = new User({ name, email });
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
    const { name, email } = req.body;
    try {
        const newUser = new User({ name, email });
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

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser);

export default router;
`.trim() : `
const express = require('express');
const { getAllUsers, createUser } = require('../controllers/example.controller');

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser);

module.exports = router;
`.trim();
            fs.writeFileSync(path.join(srcPath, 'routes', `example.route.${fileExtension}`), exampleRouteContent);
        };

        try {
            createFolders();
            createFiles();
            vscode.window.showInformationMessage(`✅ Express backend boilerplate for "${projectName}" generated!`);

            // Install dependencies
            const terminal = vscode.window.createTerminal(`Install Dependencies (${packageManager})`);
            terminal.show();
            terminal.sendText(`${packageManager} install`);
            terminal.sendText(`exit`); // Close terminal after command

            vscode.window.showInformationMessage(`Dependencies are being installed with ${packageManager}.`);

            // Suggest next steps
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


        } catch (err: any) { // Type 'any' for error to access message property
            vscode.window.showErrorMessage(`❌ Error creating boilerplate: ${err.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }

