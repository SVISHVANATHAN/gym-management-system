# 🏋️ Gym Management System

A full-stack Gym Management System developed to simplify gym administration, member management, and membership plan management.

This project provides a web-based interface and backend REST APIs for managing gym operations efficiently.

## 🚀 Features

### 👨‍💼 Admin Management

- Admin registration and login
- JWT-based authentication
- Protected API routes
- Password hashing using bcrypt
- Admin profile retrieval
- Admin information updates
- Admin deletion

### 👥 Member Management

- Create new members
- Retrieve all members
- Retrieve individual member details
- Update member information
- Delete member records
- Input validation using Zod
- Protected member management routes

### 📋 Membership Plan Management

- Create membership plans
- Retrieve membership plans
- Update membership plan details
- Delete membership plans

### 🎨 Frontend

- Login and registration interfaces
- Member management interface
- Membership plan interface
- User-friendly interface built with React and Material UI

> Note: Only list features that are implemented and tested in your current application.

## 🛠️ Technologies Used

### Frontend

- React.js
- JavaScript
- Material UI (MUI)
- HTML5
- CSS3

### Backend

- Node.js
- Express.js
- REST APIs
- JSON Web Token (JWT)
- bcrypt
- Zod

### Database

- MySQL

### Development Tools

- Git
- GitHub
- Visual Studio Code
- npm

## 📁 Project Structure

```text
NodeProject/
├── gym-management-backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── validators/
│   ├── package.json
│   └── ...
│
├── gym-management-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

The folder structure above is illustrative. Your actual directories may differ.

## ⚙️ Prerequisites

Before running this project, install:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- [MySQL](https://www.mysql.com/)
- [Git](https://git-scm.com/)

## 📥 Installation and Setup

### 1. Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/SVISHVANATHAN/gym-management-system.git
```

Navigate to the project directory:

```bash
cd gym-management-system
```

### 2. Configure the MySQL Database

Start your MySQL server and connect using MySQL Workbench or the MySQL command-line client.

Create the database:

```sql
CREATE DATABASE gym_management;
```

Select the database:

```sql
USE gym_management;
```

Create the required tables using your project's SQL schema.

The application requires the tables used by its implemented features, such as:

- `admins`
- `members`
- `membership_plans`

Make sure the table definitions, column names, and relationships match the SQL queries in your backend.

If your project does not yet include a database schema file, create one and add it to the repository so other developers can reproduce the database setup.

### 3. Configure Backend Environment Variables

Open a terminal and navigate to the backend directory:

```bash
cd gym-management-backend
```

Install the backend dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory.

Example configuration:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=gym_management
JWT_SECRET=replace_with_a_secure_random_secret
```

Replace the example values with your local configuration.

**Important:**

- Use the environment variable names expected by your backend code.
- Never commit your real `.env` file to GitHub.
- Never expose your database password or JWT secret.
- Ensure `.env` is included in `.gitignore`.

### 4. Start the Backend Server

Check the `scripts` section in the backend's `package.json`.

If a `dev` script is configured, run:

```bash
npm run dev
```

If the project uses a different startup script, run the appropriate command.

The backend should start on the port configured in your environment variables.

For example:

```text
http://localhost:5000
```

The actual URL and port depend on your application configuration.

### 5. Configure and Start the Frontend

Open a second terminal at the project root.

Navigate to the frontend directory:

```bash
cd gym-management-frontend
```

Install the dependencies:

```bash
npm install
```

Start the frontend using the script configured in `package.json`.

For a project with a `dev` script, run:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

Ensure that the frontend's API configuration points to the correct backend URL.

Keep both the frontend and backend running while testing the application.

## 🔌 API Documentation

The backend provides REST APIs for administrator, member, and membership plan management.

The following table is an overview based on the features implemented in the project. Confirm the exact route paths and HTTP methods against your Express router files before relying on these examples.

### Admin APIs

| Method | Example Endpoint  | Description                      | Authentication                  |
| ------ | ----------------- | -------------------------------- | ------------------------------- |
| POST   | `/admin/register` | Register an administrator        | Depends on router configuration |
| POST   | `/admin/login`    | Authenticate an administrator    | No token normally required      |
| GET    | `/admin/`         | Retrieve administrator records   | Protected if configured         |
| GET    | `/admin/:id`      | Retrieve an administrator by ID  | Protected if configured         |
| PATCH  | `/admin/:id`      | Update administrator information | Protected if configured         |
| DELETE | `/admin/:id`      | Delete an administrator          | Protected if configured         |

### Member APIs

| Method | Example Endpoint | Description             | Authentication |
| ------ | ---------------- | ----------------------- | -------------- |
| GET    | `/members`       | Retrieve all members    | Protected      |
| GET    | `/member/:id`    | Retrieve a member by ID | Protected      |
| POST   | `/member/`       | Create a member         | Protected      |
| PATCH  | `/member/:id`    | Update a member         | Protected      |
| DELETE | `/member/:id`    | Delete a member         | Protected      |

### Membership Plan APIs

The following operations describe the intended membership plan functionality. Replace the example paths and methods with those defined in your actual membership plan router.

| Method | Example Endpoint        | Description               |
| ------ | ----------------------- | ------------------------- |
| POST   | `/membership-plans`     | Create a membership plan  |
| GET    | `/membership-plans`     | Retrieve membership plans |
| GET    | `/membership-plans/:id` | Retrieve a plan by ID     |
| PATCH  | `/membership-plans/:id` | Update a membership plan  |
| DELETE | `/membership-plans/:id` | Delete a membership plan  |

### API Request Examples

The following are illustrative request bodies. Adjust the fields to match your Zod validation schemas and controller implementation.

#### Create a Member

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "gender": "Male",
  "date_of_birth": "2000-01-15",
  "address": "Chennai"
}
```

#### Create a Membership Plan

An example request might look like this:

```json
{
  "name": "Monthly Plan",
  "duration": 30,
  "price": 1500
}
```

Use the actual property names and data types required by your membership plan schema.

### Authentication

Protected endpoints require a valid JWT if that is how the route middleware is configured.

If your middleware reads a bearer token from the `Authorization` header, send:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Replace `YOUR_JWT_TOKEN` with the token returned by your login endpoint.

### API Base URL

For local development, the API base URL may look like:

```text
http://localhost:5000
```

Replace this example with the actual backend URL and port configured in your application.

## 🔐 Security

Security measures used in the project include:

- JWT-based authentication
- Password hashing with bcrypt
- Request validation using Zod
- Protected API routes
- Environment variables for sensitive configuration

Authentication and authorization should be tested for every protected endpoint before deploying the application.

## 🧪 Testing the Application

You can test the implemented APIs using a tool such as Postman or an equivalent HTTP client.

Recommended checks:

1. Register an administrator.
2. Log in and verify the authentication response.
3. Test protected endpoints with a valid token.
4. Test protected endpoints without a token.
5. Create, retrieve, update, and delete members.
6. Test the implemented membership plan operations.
7. Verify validation errors for invalid request bodies.
8. Confirm that invalid credentials are rejected.

Only mark tests as completed after verifying the actual application behavior.

## 🔮 Future Improvements

Potential improvements include:

- Membership expiry reminders
- Payment tracking and payment history
- Dashboard analytics
- Improved reporting
- Automated testing
- Application deployment

These are proposed enhancements and should not be interpreted as completed functionality.

## 👨‍💻 Developer

**Vishvanathan S**

Full-Stack Development Project

### GitHub Repository

[Gym Management System](https://github.com/SVISHVANATHAN/gym-management-system)

---

Thank you for visiting this project!
