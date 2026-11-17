import "server-only";
import { db } from "./db";
import { getCurrentUser } from "./auth";

/** O modo criança é aberto pelo responsável, na conta dele. */
export async function getKidPatient(patientId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "GUARDIAN") return null;
  const patient = await db.patient.findFirst({ where: { id: patientId, guardianId: user.id } });
  return patient;
}
