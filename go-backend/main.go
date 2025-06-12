package main
import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)
type User struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
func signupHandler(db *sqlx.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}
		var user User
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		if user.Email == "" || user.Password == "" {
			http.Error(w, "Please provide both email and password", http.StatusBadRequest)
			return
		}
		var count int
		err := db.Get(&count, "SELECT COUNT(*) FROM users WHERE email=$1", user.Email)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
		if count > 0 {
			http.Error(w, "Email already registered", http.StatusConflict)
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Failed to hash password", http.StatusInternalServerError)
			return
		}

		_, err = db.Exec("INSERT INTO users (email, password) VALUES ($1, $2)", user.Email, string(hashedPassword))
		if err != nil {
			http.Error(w, "Failed to save user:"+err.Error(), http.StatusInternalServerError)
			return
		}

		fmt.Println("User registered", user.Email)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "Signup successful",
		})
	}
}

func loginHandler(db *sqlx.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		var user User
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if user.Email == "" || user.Password == "" {
			http.Error(w, "Please provide both email and password", http.StatusBadRequest)
			return
		}

		var storedHash string
		err := db.Get(&storedHash, "SELECT password FROM users WHERE email=$1", user.Email)
		if err != nil {
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(user.Password)); err != nil {
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "Login successful",
		})
	}
}

func checkEmailHandler(db *sqlx.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		var req struct {
			Email string `json:"email"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		if req.Email == "" {
			http.Error(w, "Email is required", http.StatusBadRequest)
			return
		}

		var count int
		err := db.Get(&count, "SELECT COUNT(*) FROM users WHERE email=$1", req.Email)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}

		if count > 0 {
			json.NewEncoder(w).Encode(map[string]interface{}{
				"exists": true,
			})
		} else {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"exists": false,
			})
		}
	}
}

func resetPasswordHandler(db *sqlx.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		var req struct {
			Email       string `json:"email"`
			NewPassword string `json:"new_password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if req.Email == "" || req.NewPassword == "" {
			http.Error(w, "Email and new password are required", http.StatusBadRequest)
			return
		}

		var count int
		err := db.Get(&count, "SELECT COUNT(*) FROM users WHERE email=$1", req.Email)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
		if count == 0 {
			http.Error(w, "Email not found", http.StatusNotFound)
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Failed to hash password", http.StatusInternalServerError)
			return
		}

		_, err = db.Exec("UPDATE users SET password=$1 WHERE email=$2", string(hashedPassword), req.Email)
		if err != nil {
			http.Error(w, "Failed to update password", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "Password reset successful",
		})
	}
}

func main() {
	db, err := sqlx.Connect("postgres", "user=postgres dbname=postgres sslmode=disable password=baimon2547 host=localhost")
	if err != nil {
		log.Fatalln(err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("Cannot connect to database:", err)
	} else {
		log.Println("Connected to PostgreSQL")
	}

	http.HandleFunc("/signup", signupHandler(db))
	http.HandleFunc("/login", loginHandler(db))
	http.HandleFunc("/check-email", checkEmailHandler(db))
	http.HandleFunc("/reset-password", resetPasswordHandler(db))

	log.Println("Go backend running on http://192.168.11.193:8080")
	// log.Println("Go backend running on http://10.150.10.104:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
