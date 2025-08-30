# ExpressJet: Express & MongoDB Boilerplate Generator 

A VS Code extension that automatically generates a standardized folder structure for backend projects with Express.js and MongoDB, including boilerplate code setup.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![VS Code](https://img.shields.io/badge/Visual_Studio_Code-0078D4?style=flat&logo=visual-studio-code&logoColor=white)

## Features ⚡

- **Automated Structure Generation**: Creates a complete backend project structure with a single command
- **Express.js Setup**: Includes pre-configured Express.js boilerplate code
- **MongoDB Integration**: Built-in MongoDB connection setup
- **Best Practices**: Follows industry-standard project organization
- **Time-Saving**: Eliminates manual folder creation and basic code setup

## Project Structure 📁

## Installation 📥

1. Open Visual Studio Code
2. Navigate to Extensions (Ctrl+Shift+X)
3. Search for "Backend Folder Structure Generator"
4. Click Install
5. Reload VS Code when prompted

Alternatively, install it via the VS Code Marketplace website:
[Install ExpressJet from VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=NishantUnavane.express-jet) (This link will work once published!)

## Usage 🚀

1. Open VS Code Command Palette (Ctrl+Shift+P)
2. Type "Generate Backend Structure"
3. Select the desired location for your project
4. The extension will automatically create the folder structure and necessary files

## Generated Files 📋

- **server.js**: Express server setup with basic configuration
- **config/db.js**: MongoDB connection configuration
- **.env**: Environment variables template
- Basic folder structure for MVC architecture

## Requirements 🛠️

- Visual Studio Code 1.60.0 or higher
- Node.js and npm installed
- Basic understanding of Express.js and MongoDB

## Configuration ⚙️

The extension creates a default configuration that you can modify according to your needs:
- MongoDB connection string in `.env`
- Server port settings
- Basic middleware setup

## Benefits 💪

- **Consistency**: Maintains uniform project structure across teams
- **Efficiency**: Reduces setup time significantly
- **Best Practices**: Implements proven architectural patterns
- **Flexibility**: Easy to customize generated structure

## Contributing 🤝

Contributions are welcome! To contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Author ✍️

Nishant Unavane
- GitHub: [@IamNishant51](https://github.com/IamNishant51)
- Email: anonymouslucifer400@gmail.com

## License 📄

This project is licensed under the ISC License - see the LICENSE file for details.

## Support 🌟

If you find this extension helpful, please consider:
- Star the repository
- Sharing it with others
- Providing feedback and suggestions
- Contributing to its development

---

Made with ❤️ by Nishant Unavane

Are you tired of setting up the same Express.js and MongoDB boilerplate for every new backend project? **ExpressJet** is your flight ticket to instantly generate a robust, well-structured, and customizable backend foundation directly within VS Code! Get productive in seconds, not minutes, and focus on building the interactive experiences you love.

## 📂 Generated Folder Structure

Your new project will have a clean, logical structure ready for expansion:

* your-project-name/ 
  * ├── .env
  * ├── .gitignore
  * ├── package.json
  * ├── README.md
  * ├── server.js               # Main server entry   * point (or server.mjs)
  * └── src/
  * ├── app.js              # Express app   * configuration (or app.mjs)
  * ├── config/
  * │   └── db.js           # MongoDB connection   * (or db.mjs)
  * ├── controllers/
  * │   ├── auth.controller.js  # User   * authentication logic (if selected)
  * │   └── example.controller.js # Example CRUD   * logic
  * ├── models/
  * │   └── User.model.js   # User schema (updated   * for auth if selected)
  * ├── routes/
  * │   ├── auth.route.js   # Auth API routes (if   * selected)
  * │   └── example.route.js # Example API routes
  * ├── middlewares/
  * │   └── auth.middleware.js # JWT protection   * middleware (if selected)
  * └── utils/