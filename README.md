# SuperCar Virtual Sales Assistant 
Chat interface that interacts with an AI agent through a backend API. The AI agent, named Lex, is a virtual sales lead follow-up assistant for SuperCar car dealerships.

# Desktop
 ![image](https://github.com/user-attachments/assets/0746b0cd-71e4-4cac-aa0b-e5801acebadc)

# Tablet
![image](https://github.com/user-attachments/assets/d948ec2f-1e53-46f4-aa3a-a6ed3b02e14f)

# Mobile 
![image](https://github.com/user-attachments/assets/7f471142-67eb-4881-995e-d85de748e769)

 
## Getting Started

### Running the Backend

* First go to https://console.groq.com/playground and create an account.
* Then go to https://console.groq.com/keys and create a new key.
* Place the key in the ```backend/.env``` file. There is already a .env.example file that you can use as a template.

You have two options to run the backend:

#### Option 1: Using Docker

```bash
cd backend
docker build -t SuperCar-assistant-backend.
docker run -p 8000:8000 SuperCar-assistant-backend
```

#### Option 2: Using Docker Compose

```bash
cd infrastructure
docker-compose up backend
```
 
#### Running with Docker Compose
 
```bash
cd infrastructure
docker-compose up
```

 
