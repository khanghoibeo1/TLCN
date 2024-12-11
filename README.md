# SHOPYFI ECOMMERCE

Shopify provides an online shopping platform for users in the agricultural products sector. The project is built on MERN Stack technology. It includes a ReactJS front-end for the user interface, an ExpressJS and Node.js back-end, and MongoDB for the database. The admin panel allows administrators to manage banner, products, orders, and users efficiently.

## Prerequisites

- [Node.js](https://nodejs.org/en/download/package-manager) v18.17.0 (LTS) or later

## Project Structure
FullstackEcommerceReactJSWithAdminSourceCode/
```bash
├── admin/
│   ├── src/               # React Admin Panel Source
│   ├── package.json       # Admin dependencies
│   └── ...
├── client/
│   ├── src/               # React Frontend Source
│   ├── package.json       # Frontend dependencies
│   └── ...
├── server/
│   ├── models/            # Database Models
│   ├── routes/            # API Endpoints
│   ├── app.js             # Server entry point
│   ├── package.json       # Server dependencies
│   └── ...
└── README.md              # Project Documentation

## Installation and Setup
### Prerequisites

1. Install Node.js (v18+ recommended).
2. Install MongoDB.

### Steps

1. Clone the project from the repository:

    ```sh
    git clone https://github.com/khanghoibeo1/TLCN.git
    cd FullstackEcommerceReactJSWithAdminSourceCode
    ```

2. Open the project in your favorite IDE (Visual Studio Code is recommended).

3. Create the `.env` file:

   ```plaintext
   internhub-frontend/
     |-- ...
     |-- public/
     |-- src/
     |-- .env 👈
     |-- ...
   ```

    Add the following environment variables to the `.env.local` file:

    ```plaintext
   VITE_BACKEND_URL= # Your backend URL (e.g. http://localhost:8080/api/v1)
   ```

4. Install dependencies:

    ```sh
    npm install
    ```

5. Run the project:

    ```sh
    npm run dev
    ```

6. Open your browser and navigate to:

    [http://localhost:3000](http://localhost:3000)

7. Stop the project:

    Press `Ctrl + C` in the terminal.

## Technology Stack

- Programming Language: JavaScript
- Frontend: Reactjs
- Backend: Node.js, Express.js
- Database: JSON Web Tokens (JWT)
- Styling: Material-UI
- Authentication: JSON Web Tokens
- Testing: React Testing Library
- IDE: Visual Studio Code
- Version Control: Git

## Contributors

1. [@khanghoibeo1](https://github.com/khanghoibeo1) - Trần Trọng Khang - 21110834
2. [@ThienDang1409](https://github.com/ThienDang1409) - Đặng Minh Thiện - 21110855
