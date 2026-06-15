import { Router } from "express";
import { getPatients, getPatientById, createPatient, updatePatient, deletePatient } from "../controllers/patientController";

const router = Router();

router.get("/", getPatients);
router.get("/:id", getPatientById);
router.post("/", createPatient);
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);

export default router;
