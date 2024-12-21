### for non mac pcs, make sure to use this
~ docker run --rm --privileged multiarch/qemu-user-static --reset -p yes

#### **Run Services with Docker Compose**
- Start the services:
  ```bash
  docker-compose up --build
  ```
- Access the services:
    - **User Notifications Manager**: Accessible on port `8080`.
    - **Notification Service**: Accessible on port `5001`.

#### **Stop Services**
- Shut down the services:
  ```bash
  docker-compose down
  ```

---

### .env file content:
NOTIFICATION_SERVICE_URI=http://localhost:5001
* already set in docker compose


### endpoints
the service exposes 3 endpoints(see ./contracts.ts for definitions):
- POST /notifications/preferences 
  - Body:     
    ```json
    {
    "email": "user@example.com",
    "telephone": "+123456786",
    "preferences": { "email": true, "sms": false }
    }
     ```
  - creates a new user, or returns an existing if email already found
- PUT /notifications/preferences
  - body: 
       ```json
     {
       "email": "user@example.com",
       "preferences": { "email": true, "sms": false }
     }
     ```
  - updates an existing user prefs, or throws if not exists
- POST /notifications:
  - body: 
       ```json
     {
       "userId": 1,
       "message": "This is your notification message."
     }
     ```
  - sends a notifications to the channels set in the user prefs

