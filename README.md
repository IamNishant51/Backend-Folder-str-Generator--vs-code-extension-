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



**Crafting smooth, modern, and smart digital experiences.**

Are you tired of setting up the same Express.js and MongoDB boilerplate for every new backend project? **ExpressJet** is your flight ticket to instantly generate a robust, well-structured, and customizable backend foundation directly within VS Code! Get productive in seconds, not minutes, and focus on building the interactive experiences you love.

## ✨ Features & Benefits

* **⚡️ Instant Backend Setup:** Generate a complete Express.js and MongoDB project structure with a single command.
* **⚙️ Highly Customizable:**
    * **Package Manager:** Choose between `npm` or `yarn`.
    * **Module System:** Select `CommonJS` (using `require`/`module.exports`) or `ES Modules` (using `import`/`export`).
    * **Authentication Boilerplate (NEW!):** Opt to include a ready-to-use JWT-based email/password authentication system, complete with user registration, login, token generation, and protected routes.
* **📁 Opinionated Structure:** Get a clean, scalable folder structure (`server.js`, `src/config`, `src/controllers`, `src/models`, `src/routes`, `src/middlewares`, `src/utils`) out-of-the-box.
* **💡 Ready-to-use Examples:** Includes a basic "User" CRUD (Create, Read) example, and if chosen, full authentication routes and middlewares to kickstart your development.
* **📦 Automated Dependency Installation:** ExpressJet automatically installs `express`, `mongoose`, `dotenv`, `nodemon`, and (conditionally) `bcryptjs` and `jsonwebtoken` for you.
* **📝 Comprehensive `README.md`:** The generated project comes with its own detailed `README.md` including installation, run instructions, and API endpoint details.
* **🚀 Boost Your Productivity:** Stop wasting time on repetitive setup tasks and dive straight into crafting your application logic. Perfect for young, growing, and learning developers eager to build interactive experiences.

## ✈️ How to Use ExpressJet

Using ExpressJet is designed to be incredibly simple and guided:

1.  **Prepare Your Workspace:** Open an **empty folder** in VS Code where you want your new Express.js backend project to be created.
2.  **Launch the Command:**
    * Open the VS Code Command Palette by pressing `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS).
    * Type `ExpressJet` and select the command: `ExpressJet: Generate Express & MongoDB Backend`.
3.  **Follow the Interactive Prompts:**
    * **Project Name:** Enter a descriptive name for your new backend project (e.g., `my-cool-api`). This will be used for your `package.json` and database URI.
    * **Package Manager:** Choose your preferred package manager between `npm` or `yarn`.
    * **Module System:** Decide if you want `CommonJS` (`require`/`module.exports`) or modern `ES Modules` (`import`/`export`) for your project.
    * **Include Authentication? (NEW!):** Select `Yes` to add a robust email/password authentication system using JWTs, or `No` for a simpler boilerplate.
4.  **Instant Generation & Installation:**
    * ExpressJet will swiftly generate the complete folder structure and boilerplate files based on your choices.
    * An integrated VS Code terminal will automatically open and run `${packageManager} install` to fetch all necessary dependencies.
5.  **Start Developing!**
    * Once dependencies are installed, you're ready to run your server. Check the newly generated `README.md` inside your project for details on how to start the server (`npm run dev` or `yarn dev`).
    * For projects with authentication, the generated `README.md` will also provide details on the `/api/auth/register` and `/api/auth/login` endpoints.

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