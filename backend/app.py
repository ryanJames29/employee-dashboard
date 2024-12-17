from flask import Flask, request, jsonify
import pymysql
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token

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
    data = request.json  # Get JSON data from request
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    try:
        # Connect to the database
        connection = get_db_connection()
        cursor = connection.cursor()

        # Check if the user exists
        cursor.execute("SELECT * FROM Users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if user:
            # Validate the password
            if bcrypt.check_password_hash(user['password'], password):
                # Create a JWT token for the user
                access_token = create_access_token(identity=user['id'])
                return jsonify({"message": "Login successful", "access_token": access_token}), 200
            else:
                return jsonify({"message": "Invalid password"}), 401
        else:
            return jsonify({"message": "User not found"}), 404

    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "Internal server error"}), 500

    finally:
        cursor.close()
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

# Enable CORS specifically for the '/create' endpoint
CORS(app, resources={r"/create": {"origins": "http://localhost:3000"}})
CORS(app, resources={r"/login": {"origins": "http://localhost:3000"}})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
# Run the app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
