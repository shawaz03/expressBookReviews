curl -s -X POST -H "Content-Type: application/json" -d "{\"username\": \"testuser\", \"password\": \"testpassword\"}" -c cookie.txt http://localhost:5000/customer/login

{"message":"Customer successfully logged in"}
