# 🎟️ Book My Ticket - Backend Ninja

A production-style backend system for a movie ticket booking platform. This project extends a starter codebase to implement a secure authentication layer and a robust, thread-safe seat booking flow using **Node.js, Express, and PostgreSQL**.

## 🚀 Features

* **User Authentication**: Secure registration and login flow using JWT (JSON Web Tokens).
* **Protected Routes**: Middleware-restricted access to booking endpoints.
* **Transaction-Safe Booking**: Implementation of SQL Transactions (`BEGIN`, `COMMIT`, `ROLLBACK`) and Row-Level Locking (`FOR UPDATE`) to prevent race conditions and duplicate bookings.
* **Centralized Error Handling**: Custom `ApiError` and `ApiResponse` utilities for consistent API communication.
* **Input Validation**: Dedicated validator layer to ensure data integrity before reaching the database.

---

## 🛠️ Tech Stack

* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: PostgreSQL (pg-pool for connection management)
* **Authentication**: JWT & Bcrypt (Password hashing)
* **Environment**: Dotenv for configuration

---

## 📁 Project Structure

```text
backend/
├── src/
│   ├── controllers/    # Request handlers (auth, password, seats)
│   ├── middlewares/    # Auth guards (isLoggedIn) and request validation
│   ├── routes/         # API endpoint definitions
│   ├── services/       # Business logic and DB interactions
│   ├── utils/          # Global helpers (ApiError, ApiResponse, AsyncHandler)
│   ├── validators/     # Schema validation logic
│   ├── app.js          # Express app configuration
│   └── index.js        # Server entry point & DB connection
├── .env                # Environment variables
└── package.json        # Dependencies and scripts
```

---

## ⚙️ Setup & Installation

1.  **Clone the Repository**
    ```bash
    git clone <your-repo-link>
    cd book-my-ticket/backend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory and add:
    ```env
    PORT=8000
    DATABASE_URL=your_postgresql_connection_string
    JWT_SECRET=your_secret_key
    ```

4.  **Database Setup**
    Ensure your PostgreSQL instance has a `seats` table:
    ```sql
    CREATE TABLE seats (
        id SERIAL PRIMARY KEY,
        seat_no VARCHAR(10) UNIQUE NOT NULL,
        is_booked BOOLEAN DEFAULT FALSE,
        booked_by INTEGER REFERENCES users(id)
    );
    ```

5.  **Run the Server**
    ```bash
    npm run dev
    ```

---

## 🛡️ Key Implementation Details

### 1. Concurrent Booking Protection
To prevent two users from booking the same seat simultaneously, the `bookSeats` controller utilizes a **PostgreSQL Transaction**:
* **`FOR UPDATE`**: Locks the specific row during the check.
* **`BEGIN/COMMIT`**: Ensures the check and the update happen as a single atomic unit.
* **`ROLLBACK`**: Automatically reverts changes if an error occurs during the process.

### 2. Security
* **SQL Injection Prevention**: All queries use parameterized inputs (e.g., `$1`, `$2`) instead of string interpolation.
* **Authentication**: The `isLoggedIn` middleware extracts and verifies the JWT from the request headers to populate `req.user`.

---

## 🛣️ API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register a new user | No |
| `POST` | `/api/v1/auth/login` | Login and receive token | No |
| `GET` | `/api/v1/seats` | Fetch all available seats | No |
| `POST` | `/api/v1/seats/book` | Book a specific seat | **Yes** |

---

## 📝 Author
Developed as part of the **Chai Aur SQL** Hackathon challenge.