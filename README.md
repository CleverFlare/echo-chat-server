# Backend Code Documentation & Guidelines

## 📌 Overview

This backend follows a **three-layered architecture** to ensure a clean separation of concerns. Each layer has a distinct role, making the codebase modular, maintainable, and scalable.

### 🔹 Three-Layered Structure

1. **Transport Layer** (Handlers)

   - Handles HTTP-specific logic (status codes, request/response handling).
   - Does not contain any business logic.
   - Consumes services from the domain layer.

2. **Domain Layer** (Services)

   - Houses all business logic.
   - Does not interact with the database directly.
   - Calls repositories from the data access layer.

3. **Data Access Layer** (Repositories)

   - Acts as a **facade** for data access.
   - Keeps business logic **database-agnostic**.
   - Encapsulates all data handling operations.

---

## 📁 Folder Structure

```
backend/
│── modules/
│   ├── auth/
│   │   ├── handlers.ts
│   │   ├── login.ts
│   │   ├── register.ts
│   │   ├── repository.ts
│   ├── orders/
│   ├── products/
│── helpers/
|   ├── app-error/
│   |   ├── index.ts (The AppError object which extends the base Error object)
|   ├── validate-body/
│   |   ├── index.ts (Joi validation helper)
|   ├── error-handler/
│   |   ├── index.ts (Handles AppErrors globally)
|   ├── logger/ (Loggers related files)
│── handlers.ts (Groups all handlers in a single router to be used in the index.ts app directly)
│── index.ts (Main entry point)
```

Each module (e.g., `auth`, `orders`) contains its **handlers, services, and repositories**, keeping related logic encapsulated.

---

## ⚡ Communication Between Modules

Modules **do not** directly interact with each other’s repositories. Instead, they communicate **via services**. For example:

- The **Orders module** may need to update user information.
- Instead of directly modifying the **Auth module's repository**, it calls the **Auth module’s service**.

```typescript
// orders/services/orderService.ts
import { updateUserProfile } from "../auth/services/authService";

const processCheckout = async (orderData) => {
  // Process order logic...
  await updateUserProfile(orderData.userId, { lastOrderDate: new Date() });
};
```

This keeps modules **loosely coupled** while allowing **cross-module functionality**.

---

## ✅ Request Validation

To validate request bodies, use the **validateBody** helper located in `helpers/validateBody.ts`.

```typescript
import Joi from "joi";
import { validateBody } from "@/helpers/validateBody";

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

app.post("/login", validateBody(loginSchema), loginHandler);
```

---

## ❌ Error Handling

Errors are handled using the **AppError** class, which extends JavaScript’s built-in `Error`.

### Throwing an Error

Use `AppError` to return meaningful error responses:

```typescript
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../utils/AppError";

if (!user) {
  throw new AppError(StatusCodes.NOT_FOUND, "User not found");
}
```

### Global Error Handling Middleware

The middleware in `middleware/errorHandler.ts` automatically catches `AppError` instances and sends structured responses.

```typescript
import { Response } from "express";
import { AppError } from "../app-error";
import { logger } from "../logger";

export const errorHandler = (err: AppError, res?: Response) => {
  logger.info(err);

  if (!err?.isOperational) {
    process.exit(1);
  }

  if (res) res.status(err.statusCode).json({ message: err.message });
};
```

---

## 🚀 Best Practices

✅ Keep **handlers lightweight** – only handle HTTP concerns.

✅ Ensure **services contain all business logic**.

✅ Keep repositories **database-agnostic**.

✅ Use **validation middleware** to keep handlers clean.

✅ Always \*\*throw \*\***`AppError`** instead of manually handling responses in services.

✅ Modules should only communicate via **services**, never directly with each other’s repositories.

This structure ensures a scalable, maintainable, and **clean architecture**. 🚀

---

## 🗄️ How to run the database

1. Ensure you've got both docker and docker-compose installed on your local machine.
2. Open the terminal emulator.
3. Use the `cd` command to navigate to the projects directory and set it as the current working directory in the terminal.
4. Run the following docker-compose command:

   ```BASH
   docker-compose up -d
   ```

   The `-d` option ensures the process is forked to run in the background.

5. After a successful pull of the Apache Cassandra image, use the following command to inspect the IP address of the container:

   ```BASH
   docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' cass_cluster
   ```

6. Set the `DATABASE_URL` environment variable to the container's IP address, and set the rest of the environment variables exactly as follows:

   ```
   DATABASE_URL=<THE IP ADDRESS OF THE CONTAINER>
   DATA_CENTER="datacenter1"
   KEYSPACE="sportex"
   ```

7. Run the following command to populate the schemas:
   ```
   npm run migrate
   ```
