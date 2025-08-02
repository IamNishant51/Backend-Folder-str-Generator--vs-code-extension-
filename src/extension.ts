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
    const srcPath = path.join(rootPath, 'src');

    const folders = [
      'src',
      'src/config',
      'src/controllers',
      'src/models',
      'src/routes',
      'src/middlewares',
    ];

    const createFolders = () => {
      folders.forEach(folder => fs.mkdirSync(path.join(rootPath, folder), { recursive: true }));
    };

    const createFiles = () => {
      const appJsContent = `
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running...');
});

connectDB();

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});
`.trim();

      fs.writeFileSync(path.join(srcPath, 'app.js'), appJsContent);

      const dbJsContent = `
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

      fs.writeFileSync(path.join(srcPath, 'config', 'db.js'), dbJsContent);

      const envContent = `PORT=5000\nMONGO_URI=mongodb://localhost:27017/your-db-name`;
      fs.writeFileSync(path.join(rootPath, '.env'), envContent);

      const gitignoreContent = `node_modules/\n.env`;
      fs.writeFileSync(path.join(rootPath, '.gitignore'), gitignoreContent);

      const readmeContent = `
# Express + MongoDB Boilerplate

## 🔧 Installation

\`\`\`bash
npm install express mongoose dotenv
\`\`\`

## 🚀 Run the server

\`\`\`bash
node src/app.js
# or with nodemon
nodemon src/app.js
\`\`\`

## 📁 Folder Structure

- \`src/config\`: DB config
- \`src/controllers\`: Controllers (add your logic)
- \`src/models\`: Mongoose models
- \`src/routes\`: API routes
- \`src/middlewares\`: Middlewares
`.trim();

      fs.writeFileSync(path.join(rootPath, 'README.md'), readmeContent);

      const packageJsonContent = `
{
  "name": "express-backend",
  "version": "1.0.0",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  },
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
    };

    try {
      createFolders();
      createFiles();
      vscode.window.showInformationMessage('✅ Express backend boilerplate generated in current folder!');
    } catch (err) {
      vscode.window.showErrorMessage(`❌ Error creating boilerplate: ${err}`);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
