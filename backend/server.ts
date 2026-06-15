import express from "express";
import cors from "cors";

import patientsRouter from "./server/routes/patients";
import doctorsRouter from "./server/routes/doctors";
import appointmentsRouter from "./server/routes/appointments";
import billingRouter from "./server/routes/billing";
import recordsRouter from "./server/routes/records";
import analyticsRouter from "./server/routes/analytics";
import chatRouter from "./server/routes/chat";
import issuesRouter from "./server/routes/issues";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API ROUTES ---
  app.use("/api/patients", patientsRouter);
  app.use("/api/doctors", doctorsRouter);
  app.use("/api/appointments", appointmentsRouter);
  app.use("/api/billing", billingRouter);
  app.use("/api/records", recordsRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/issues", issuesRouter);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:3000`);
  });
}

startServer();
