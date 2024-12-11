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
```

## Installation and Setup
### Prerequisites

1. Install Node.js (v18+ recommended).
2. Install MongoDB.
- Cloudinary Account (for image hosting)
- Mailtrap Account (for email testing)
- PayPal Developer Account (for payment integration)

### Steps

1. Clone the project from the repository:

    ```sh
    git clone https://github.com/khanghoibeo1/TLCN.git
    cd FullstackEcommerceReactJSWithAdminSourceCode
    ```

2. Open the project in your favorite IDE (Visual Studio Code is recommended).

3. Create `.env`:
- Create `.env` in the `server` directory with the following content:

   ```plaintext
    # Server configuration
    PORT=8000
    
    # Client base URL
    CLIENT_BASE_URL= # Example: http://localhost:3000
    
    # Database configuration
    CONNECTION_STRING= # MongoDB connection string
    
    # Cloudinary configuration
    cloudinary_Config_Cloud_Name= # Your Cloudinary cloud name
    cloudinary_Config_api_key= # Your Cloudinary API key
    cloudinary_Config_api_secret= # Your Cloudinary API secret
    
    # Authentication
    JSON_WEB_TOKEN_SECRET_KEY= # Your JWT secret key
    
    # Email service
    MAILTRAP_API_TOKEN= # Your Mailtrap API token
    
    # PayPal integration
    PAYPAL_CLIENT_ID= # Your PayPal client ID
    PAYPAL_SECRET_KEY= # Your PayPal secret key
   ```
- Create `.env` file in the `client` directory with the following content:

  ```plaintext
    # Backend API URL
    REACT_APP_API_URL= # Example: http://localhost:8000
    
    # Firebase configuration
    REACT_APP_FIREBASE_API_KEY=
    REACT_APP_FIREBASE_AUTH_DOMAIN=
    REACT_APP_FIREBASE_PROJECT_ID=
    REACT_APP_FIREBASE_STORAGE_BUCKET=
    REACT_APP_FIREBASE_APP_ID=
    
    # PayPal integration
    REACT_APP_PAYPAL_CLIENT_ID=
  ```
- Create `.env` file in the `admin` directory with the following content:

  ```plaintext
    # Backend API URL
    REACT_APP_API_URL= # Example: http://localhost:8000
  ```
5. Install dependencies:

    ```sh
    # Install dependencies for the admin panel
    cd admin
    npm install
    
    # Install dependencies for the client
    cd ../client
    npm install
    
    # Install dependencies for the server
    cd ../server
    npm install
    ```

6. Run the project:

    ```sh
    # Start the server
    cd server
    npm start
    
    # Start the client
    cd ../client
    npm start
    
    # Start the admin panel
    cd ../admin
    npm start
    ```

7. Open your browser and navigate to:

- client: [http://localhost:3008](http://localhost:3008)
- admin: [http://localhost:3002](http://localhost:3002)

8. Stop the project:

    Press `Ctrl + C` in the terminal.

---
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

---
## Contributors

1. [@khanghoibeo1](https://github.com/khanghoibeo1) - Trần Trọng Khang - 21110834
2. [@ThienDang1409](https://github.com/ThienDang1409) - Đặng Minh Thiện - 21110855
