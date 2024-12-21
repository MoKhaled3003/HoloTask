# Voucher Management API

This is a **Voucher Management API** built with **NestJS**, providing endpoints for managing customers, special offers, and vouchers. This guide explains how to run the project locally or using Docker.

---

## Prerequisites

Before running the project, ensure the following tools are installed on your system:

- **Node.js** (v16 or higher) and npm
- **PostgreSQL**
- **Docker** (optional for containerized setup)
- **Docker Compose** (optional for containerized setup)

---

## 1. Running Locally

### Step 1: Clone the Repository

```bash
git clone <https://github.com/MoKhaled3003/HoloTask.git>
cd HoloTask
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory and configure the following:

```env
# Application
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=voucher_pool
```

### Step 4: Start PostgreSQL Database

Start a PostgreSQL instance locally and ensure it matches the credentials in the `.env` file.

### Step 5: Run Migrations (if applicable)

If using database migrations, run:

```bash
npm run typeorm migration:run
```

### Step 6: Start the Application

Run the project:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.

### Access Swagger Documentation

Navigate to:

```
http://localhost:3000/api
```

---

## 2. Running with Docker

### Step 1: Build the Docker Image

Ensure the `Dockerfile` and `docker-compose.yml` files are in the root of the project.

### Step 2: Configure Environment Variables

Update the environment variables in the `docker-compose.yml` file if necessary:

```yaml
environment:
  DATABASE_HOST: postgres
  DATABASE_PORT: 5432
  DATABASE_USERNAME: postgres
  DATABASE_PASSWORD: postgres
  DATABASE_NAME: voucher_pool
```

### Step 3: Start the Containers

Run the following command to build and start the containers:

```bash
docker-compose up --build
```

This will start:
- The **NestJS API** on `http://localhost:3000`
- The **PostgreSQL Database** on `localhost:5432`

### Step 4: Access Swagger Documentation

Navigate to:

```
http://localhost:3000/api
```

### Step 5: Stop the Containers

To stop the running containers, use:

```bash
docker-compose down
```

---

## 3. Testing the API

Use tools like **Postman** or **cURL** to test the API endpoints. Refer to the Swagger documentation for available endpoints and payload formats.

---

## 4. Common Commands

### Run Linting

```bash
npm run lint
```

### Run Unit Tests

```bash
npm run test
```

### Run Migrations

```bash
npm run typeorm migration:run
```

---

## 5. Project Structure

```plaintext
src/
├── customer/
│   ├── customer.controller.ts
│   ├── customer.service.ts
│   ├── customer.entity.ts
├── special-offer/
│   ├── special-offer.controller.ts
│   ├── special-offer.service.ts
│   ├── special-offer.entity.ts
├── voucher/
│   ├── voucher.controller.ts
│   ├── voucher.service.ts
│   ├── voucher.entity.ts
└── app.module.ts
```

---

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running and the credentials match the `.env` or `docker-compose.yml` configurations.

### API Not Responding
- Verify that the application is running on `http://localhost:3000`.
- Check the logs for errors using:
  ```bash
  docker-compose logs -f
  ```

