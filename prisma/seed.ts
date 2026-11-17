/* Dados de demonstração. Execute com: npm run db:seed */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  await db.comment.deleteMany();
  await db.evaluation.deleteMany();
  await db.chatMessage.deleteMany();
  await db.activitySession.deleteMany();
  await db.professionalLink.deleteMany();
  await db.patient.deleteMany();
  await db.user.deleteMany();

  const passwordHash = await bcrypt.hash("inovatea123", 10);
  const guardian = await db.user.create({
    data: { name: "Ana Souza", email: "responsavel@inovatea.app", passwordHash, role: "GUARDIAN", relationship: "Mãe" },
  });
  const pro = await db.user.create({
    data: {
      name: "Dra. Carla Mendes",
      email: "profissional@inovatea.app",
      passwordHash,
      role: "PROFESSIONAL",
      specialty: "Psicologia",
      registryNumber: "CRP 06/123456",
      institution: "Clínica Espaço Azul",
    },
  });
  const child = await db.patient.create({
    data: {
      guardianId: guardian.id,
      name: "Lucas",
      birthDate: new Date("2016-05-10"),
      avatar: "🦕",
      supportLevel: 1,
      interests: "dinossauros, planetas",
      notes: "Fica incomodado com barulhos altos. Gosta de saber antes o que vai acontecer.",
      accessCode: "LUCAS1",
    },
  });
  await db.professionalLink.create({ data: { professionalId: pro.id, patientId: child.id } });

  // Sessões dos últimos 12 dias, com melhora gradual
  const plan: [string, string, number][] = [
    ["QUIZ", "emocoes", 1], ["MEMORY", "memoria", 1], ["QUIZ", "rotina", 1], ["BREATHING", "respiracao", 1],
    ["QUIZ", "emocoes", 1], ["SEQUENCE", "sequencia", 1], ["QUIZ", "emocoes", 2], ["MEMORY", "memoria", 2],
    ["QUIZ", "social", 1], ["QUIZ", "emocoes", 2], ["SEQUENCE", "sequencia", 2], ["QUIZ", "rotina", 2],
  ];
  let total = 0;
  for (let i = 0; i < plan.length; i++) {
    const [type, key, level] = plan[i];
    const day = new Date();
    day.setDate(day.getDate() - (plan.length - i));
    day.setHours(16, 10 + i, 0, 0);
    const questions = type === "BREATHING" ? 0 : 4;
    const correct = questions ? Math.min(questions, 2 + Math.floor(i / 4) + (i % 2)) : 0;
    const duration = 120 + i * 15;
    const points = type === "BREATHING" ? 30 : correct * 10 * level + 20 + (correct === questions ? 15 : 0);
    total += points;
    await db.activitySession.create({
      data: {
        patientId: child.id, activityType: type, activityKey: key, level,
        correct, wrong: questions - correct, total: questions,
        accuracy: questions ? correct / questions : 1,
        durationSec: duration, points, completed: true,
        mood: ["feliz", "calmo", "ok", "feliz"][i % 4],
        startedAt: day, endedAt: new Date(+day + duration * 1000),
      },
    });
  }
  await db.patient.update({ where: { id: child.id }, data: { totalPoints: total } });

  await db.evaluation.create({
    data: {
      patientId: child.id, professionalId: pro.id,
      communication: 3, socialInteraction: 3, attention: 4, emotionalRegulation: 3, autonomy: 4,
      summary: "Lucas demonstra boa adesão às atividades e evolução no reconhecimento de emoções básicas. Ainda apresenta dificuldade em situações sociais com linguagem figurada.",
      recommendations: "Manter o quiz de emoções no nível 2 e introduzir o quiz de situações do dia a dia 3x por semana.",
    },
  });
  await db.comment.create({
    data: { patientId: child.id, authorId: guardian.id, content: "Hoje ele pediu sozinho para fazer a respiração do balão antes de dormir." },
  });

  console.log("Seed concluído.");
  console.log("Responsável: responsavel@inovatea.app / inovatea123");
  console.log("Profissional: profissional@inovatea.app / inovatea123");
}

main().finally(() => db.$disconnect());
