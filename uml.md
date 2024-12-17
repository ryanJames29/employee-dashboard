# UML Diagram for Flask + React + MySQL Application

## **1. Backend (Flask)**
- **Purpose**: Handles API requests and interacts with the MySQL database.
- **Classes/Components**:
   - `User` (Model)
     - **Attributes**:
       - `id: int`
       - `username: string`
       - `password: string (hashed)`
     - **Methods**:
       - `register_user(username, password)`
       - `authenticate_user(username, password)`
   - `TimeLog` (Model)
     - **Attributes**:
       - `id: int`
       - `user_id: int`
       - `clock_in_time: datetime`
       - `clock_out_time: datetime`
     - **Methods**:
       - `log_clock_in(user_id, time)`
       - `log_clock_out(user_id, time)`
       - `fetch_time_logs(user_id)`

- **Endpoints**:
   - `/register [POST]` → Adds a new user to the database.
   - `/login [POST]` → Validates user credentials.
   - `/clock-in [POST]` → Logs a clock-in time.
   - `/clock-out [POST]` → Logs a clock-out time.
   - `/time-logs [GET]` → Fetches time logs for a user.

---

## **2. Frontend (React)**
- **Purpose**: Renders the UI and interacts with the Flask backend via API calls.

- **Components**:
   - `LoginForm`:
     - **Fields**: `username`, `password`
     - **Actions**:
       - `POST /login` → Authenticate user.
   - `RegisterForm`:
     - **Fields**: `username`, `password`
     - **Actions**:
       - `POST /register` → Add new user.
   - `TimeTracker`:
     - **Buttons**: `Clock In`, `Clock Out`
     - **Actions**:
       - `POST /clock-in` → Log clock-in time.
       - `POST /clock-out` → Log clock-out time.
   - `Dashboard`:
     - **Displays**: List of time logs for the logged-in user.
     - **Actions**:
       - `GET /time-logs` → Fetch and display time logs.

---

## **3. Database (MySQL)**
- **Tables**:
   - `Users`:
     - `id` (Primary Key, INT, AUTO_INCREMENT)
     - `username` (VARCHAR, UNIQUE)
     - `password` (VARCHAR, hashed)
   - `TimeLogs`:
     - `id` (Primary Key, INT, AUTO_INCREMENT)
     - `user_id` (Foreign Key → Users.id)
     - `clock_in_time` (DATETIME)
     - `clock_out_time` (DATETIME)

---

## **4. Interactions Between Components**

### **User Registration**:
1. React ➞ `POST /register`
2. Flask validates input and inserts user data into the `Users` table.
3. Success or failure message sent back to React.

### **User Login**:
1. React ➞ `POST /login`
2. Flask verifies credentials against the `Users` table.
3. Flask sends a success response (e.g., JWT token) or error message.

### **Time Tracking**:
1. React ➞ `POST /clock-in` or `POST /clock-out`.
2. Flask logs the time in the `TimeLogs` table.
3. Success message sent back to React.

### **Dashboard Data**:
1. React ➞ `GET /time-logs`
2. Flask queries `TimeLogs` for the current user.
3. Flask sends JSON data back to React.
4. React displays the data in the dashboard.
