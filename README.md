# INSY7314 POE - PART 1 - HustleHub+

## 1. System Overview 📄
HustleHub+ is a secure, MERN-based RESTful API designed to power a modern freelancing platform. The system acts as the core backend infrastructure that handles user provisioning, authentication and the secure processing of business logic. 

### Intended Users 👥
HutsleHub+ serves two primary user roles, enforced through Role-Based Access Control (RBAC):
*   **Freelancers:** Users who utilize the platform to post service offerings (Gigs), manage their portfolios and track income.
*   **Clients:** Users who browse the platform to find services, book gigs and manage their transactions.

---

## 2. System Architecture & Backend Structure 🏗️
The backend strictly adheres to the Model-View-Controller (MVC) design pattern to ensure a clean separation of concerns, scalability and maintainability (Fowler, 2002).

### Links
* **Video Presentation - Part 1** - https://youtu.be/_9yda8v-7QQ?feature=shared
* **Postman Collection** - https://github.com/EMECPE/insy7314-2026-poe-clawtiger/blob/main/INSY7314.postman_collection.json

### **API screenshot (Visual Studio Code):**
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/d8f87f07-5b0c-4687-8aec-6727c669c1bc" />

### **API Requests (Postman):**
* **Register:**
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/bab4e03b-8332-4ffd-9d50-4911c60a0f3e" />

* **Sign In:**
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/63bac6d1-cf2b-4563-9a5b-bda2b255739a" />


### System Architecture Diagram
<img width="787" height="1601" alt="INSY7314 System Arch Diagram" src="https://github.com/user-attachments/assets/e86a7d82-9bb8-43ea-acb3-a100dd1183c6" />
(Draw.io, 2026)

### Request Flow & Storage Toggle 🔁
1.  **Client Request:** The client (Postman) initiates a request over an encrypted HTTPS connection.
2.  **HTTPS Server:** The Express.js server, wrapped in Node's native HTTPS module, receives the traffic on Port 5000.
3.  **Security Middleware:** Protected routes intercept the request, validating the JSON Web Token (JWT) and checking user permissions (`validateAuth`, `validateRole`).
4.  **Controllers:** The request is routed to the appropriate controller (Auth, Gigs, Bookings) to process business logic.
5.  **Dynamic Storage Toggle:** The system evaluates the `STORAGE_MODE` environment variable:
    *   *Mongo Mode:* Routes data through the Mongoose Object Data Modeling (ODM) library to a cloud-hosted MongoDB Atlas cluster.
    *   *Local Mode:* Bypasses Mongoose and routes data through Node's native `fs` module to read/write from a local `users.json` file.

---

## 3. Security Rationale & Implementation 🪪🪛
Security was prioritized at every layer of the HustleHub+ API architecture to protect user data and ensure secure transactions (OWASP, 2024).

### HTTPS & Data in Transit 🔐
The local server is configured using self-signed OpenSSL certificates to run over HTTPS rather than standard HTTP. This encrypts all data in transit between the client and the server. HTTPS is critical because it prevents Man-in-the-Middle (MitM) attacks, ensuring that sensitive payloads such as passwords and authorization tokens cannot be intercepted or read by malicious actors on the network (Mozilla, 2024).

### Password Hashing (Bcrypt) 🤐
Passwords are never stored in plain text. We implemented `bcryptjs` with a salt round configuration of 12. Bcrypt applies a cryptographic hash and a unique "salt" to every password before saving it to the database. This mitigates the risk of rainbow table attacks and ensures that even if the database is compromised, user passwords remain secure (Auth0, 2024).

### Token-Based Authentication (JWT) 🪙
To manage user sessions securely without relying on server-side cookies, the API utilizes JSON Web Tokens (JWT). 
*   **Statelessness:** Once a user logs in, the server generates a cryptographically signed JWT. The server does not need to store session IDs, making the API scalable.
*   **Validation Approach:** For protected routes, the client must include the JWT in the `Authorization: Bearer` header. Our custom middleware extracts this token, verifies its signature using the secret key (`JWT_SECRET`) and attaches the decoded user context to the request object. If the token is missing, expired or tampered with, the request is immediately rejected with a 401 Unauthorized status (IETF, 2015).

### Input Validation & Error Handling ⚠️
Strict input validation is enforced at the controller level before any database operations occur. 
*   Requests are checked for missing required fields (name, email, password).
*   Regular expressions (Regex) validate email formats and password length checks ensure minimum security standards.
*   These validations prevent malformed data from causing app crashes and mitigate injection vulnerabilities. We also incorporated a global error handler to catch internal exceptions, preventing sensitive stack traces from leaking to the client (Express, 2024).

---

## 4. Contributors 👥🏆
*   **Anique:** Core Business API (Models, Controllers, Business Logic)
*   **Kyle:** Security Integration & Testing (Auth Middleware, Postman Validation)
*   **Natheer:** Infrastructure & Documentation (HTTPS Configuration, Architecture, Repository Management)

---

## Reference List 📜

*   Auth0, 2024. *Hashing in Action: Understanding bcrypt*. [online] Available at: <https://auth0.com/blog/hashing-in-action-understanding-bcrypt/> [Accessed 3 September 2026].
*   Draw.io. 2026. Flowchart Maker. [Online] Available at: <https://app.diagrams.net/ > [Accessed 01 Septemeber 2026].
*   Express, 2024. *Security Best Practices*. [online] Available at: <https://expressjs.com/en/advanced/best-practice-security.html> [Accessed 3 September 2026].
*   Fowler, M., 2002. *Patterns of Enterprise Application Architecture*. Addison-Wesley Professional.
*   IETF, 2015. *RFC 7519: JSON Web Token (JWT)*. [online] Available at: <https://datatracker.ietf.org/doc/html/rfc7519> [Accessed 3 September 2026].
*   Mozilla, 2024. *HTTPS - MDN Web Docs*. [online] Available at: <https://developer.mozilla.org/en-US/docs/Glossary/HTTPS> [Accessed 3 September 2026].
*   OWASP, 2024. *OWASP Top 10 API Security Risks*. [online] Available at: <https://owasp.org/API-Security/editions/2023/en/0x11-t10/> [Accessed 3 September 2026].
