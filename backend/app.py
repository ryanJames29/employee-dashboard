from flask import Flask, request, jsonify
import pymysql
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
bcrypt = Bcrypt(app)

# JWT configuration
app.config['JWT_SECRET_KEY'] = 'your_secret_key_here'  # Change to a strong secret key
jwt = JWTManager(app)

# MySQL configuration
MYSQL_HOST = 'localhost'
MYSQL_USER = 'root'
MYSQL_PASSWORD = 'testServer'
MYSQL_DB = 'flask_app'

# Database connection function
def get_db_connection():
    return pymysql.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB,
        cursorclass=pymysql.cursors.DictCursor
    )
    
@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Server is running!"}), 200

# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Validate input
    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    try:
        # Connect to the database
        connection = get_db_connection()
        with connection.cursor() as cursor:
            # Query for user
            sql = "SELECT id, username, password FROM Users WHERE username = %s"
            cursor.execute(sql, (username,))
            user = cursor.fetchone()

            print("User retrieved from database:", user)  # Debugging

            if user and bcrypt.check_password_hash(user['password'], password):
                # Generate access token
                additional_claims = {"id": user['id'], "username": user['username']}
                access_token = create_access_token(identity=user['id'], additional_claims=additional_claims)
                return jsonify({"access_token": access_token, "message": "Login successful"}), 200
                access_token = create_access_token(identity=identity)
                return jsonify({"access_token": access_token, "message": "Login successful"}), 200
            else:
                return jsonify({"message": "Invalid username or password"}), 401

    except Exception as e:
        print("Error during login:", e)
        return jsonify({"message": "Internal server error"}), 500

    finally:
        if 'connection' in locals():
            connection.close()

        
# Create user route
@app.route('/create', methods=['POST'])
def create():
    try:
        # Get JSON data from the request
        data = request.json
        username = data.get('username')
        password = data.get('password')

        # Check if both username and password are provided
        if not username or not password:
            return jsonify({"message": "Username and password are required"}), 400

        # Hash the password
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        # Connect to the database
        connection = get_db_connection()

        # Insert the user into the database
        with connection.cursor() as cursor:
            # Check if user already exists
            cursor.execute("SELECT * FROM Users WHERE username = %s", (username,))
            if cursor.fetchone():
                return jsonify({"message": "Username already exists"}), 409  # Conflict

            # Insert the new user
            sql = "INSERT INTO Users (username, password) VALUES (%s, %s)"
            cursor.execute(sql, (username, hashed_password))
            connection.commit()

        return jsonify({"message": "User created successfully"}), 201

    except Exception as e:
        print("Error adding user to database:", e)
        return jsonify({"message": "Internal server error"}), 500

    finally:
        if 'connection' in locals():
            connection.close()
            
@app.route('/record-time', methods=['POST'])
def record_time():
    data = request.json
    print("Received data:", data)

    user_id = data.get('user_id')
    action = data.get('action')
    timestamp = datetime.now()

    print("Action:", action)
    print("User ID:", user_id)
    print("Timestamp:", timestamp)

    # Validate input
    if not user_id or not action:
        return jsonify({"message": "Missing required fields"}), 400

    try:
        # Connect to the database
        print("Connecting to the database...")
        connection = get_db_connection()
        print("Database connected.")

        with connection.cursor() as cursor:
            if action == "clock_in":
                print("Clocking in...")
                sql = "INSERT INTO TimeLogs (user_id, clock_in_time) VALUES (%s, %s)"
                print("Executing SQL:", sql)
                cursor.execute(sql, (user_id, timestamp))
                connection.commit()
                return jsonify({"message": "Clock In Recorded", "timestamp": str(timestamp)}), 200

            elif action == "clock_out":
                print("Clocking out...")
                sql = """
                UPDATE TimeLogs
                SET clock_out_time = %s
                WHERE user_id = %s AND clock_out_time IS NULL
                ORDER BY clock_in_time DESC
                LIMIT 1
                """
                print("Executing SQL:", sql)
                cursor.execute(sql, (timestamp, user_id))
                if cursor.rowcount == 0:
                    print("No active clock-in found.")
                    return jsonify({"message": "No active clock-in found"}), 400
                connection.commit()
                return jsonify({"message": "Clock Out Recorded", "timestamp": str(timestamp)}), 200

            else:
                print("Invalid action.")
                return jsonify({"message": "Invalid action"}), 400

    except Exception as e:
        print("Error recording timestamp:", e)
        return jsonify({"message": f"Internal server error: {str(e)}"}), 500

    finally:
        if 'connection' in locals():
            connection.close()
            print("Database connection closed.")

@app.route('/time-records/<int:user_id>', methods=['GET'])
def get_time_records(user_id):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            # Fetch time records for the user
            sql = "SELECT * FROM TimeLogs WHERE user_id = %s ORDER BY clock_in_time DESC"
            cursor.execute(sql, (user_id,))
            records = cursor.fetchall()
            print("Fetched records for user_id:", user_id, records)
            return jsonify({"records": records}), 200
    except Exception as e:
        print("Error fetching time records:", e)
        return jsonify({"message": "Internal server error"}), 500
    finally:
        if 'connection' in locals():
            connection.close()
            
# Enable CORS specifically for the '/create' endpoint
CORS(app, resources={r"/*": {"origins": "*"}})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
# Run the app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
