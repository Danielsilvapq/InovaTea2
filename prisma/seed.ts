/* Dados de demonstração. Execute com: npm run db:seed */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  await db.aacItem.deleteMany();
  await db.goal.deleteMany();
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

  // Segunda criança: não verbal, nível 3 de suporte, ainda não lê.
  const bia = await db.patient.create({
    data: {
      guardianId: guardian.id,
      name: "Bia",
      birthDate: new Date("2019-03-02"),
      avatar: "🐢",
      supportLevel: 3,
      interests: "música, água",
      notes: "Não verbal. Usa figuras para pedir coisas. Fica calma com música baixa.",
      accessCode: "BIA123",
      communication: "NONVERBAL",
      reading: "NONE",
      answerSupport: "FULL",
      narration: true,
      bigTargets: true,
    },
  });
  await db.professionalLink.create({ data: { professionalId: pro.id, patientId: bia.id } });
  const biaDay = new Date(Date.now() - 2 * 864e5);
  await db.activitySession.create({
    data: {
      patientId: bia.id, activityType: "AAC", activityKey: "minhavoz", level: 1, correct: 3, total: 3, accuracy: 1,
      durationSec: 180, points: 18, completed: true, mood: "calmo", startedAt: biaDay, endedAt: new Date(+biaDay + 180000),
      details: JSON.stringify({ phrases: [
        { text: "Eu quero música", at: biaDay.toISOString() },
        { text: "Eu estou feliz", at: new Date(+biaDay + 60000).toISOString() },
        { text: "Eu preciso de água", at: new Date(+biaDay + 120000).toISOString() },
      ] }),
    },
  });
  await db.patient.update({ where: { id: bia.id }, data: { totalPoints: 18 } });
  await db.aacItem.createMany({
    data: [
      { patientId: bia.id, authorId: guardian.id, type: "person", emoji: "🐶", label: "Thor", article: "o" },
      { patientId: bia.id, authorId: guardian.id, type: "action", emoji: "📺", label: "ver a Galinha Pintadinha" },
      { patientId: bia.id, authorId: guardian.id, type: "food", emoji: "🍫", label: "danone" },
      { patientId: bia.id, authorId: pro.id, type: "phrase", emoji: "🎧", label: "Quero o meu fone, está muito barulho." },
    ],
  });

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
  const twelveDaysAgo = new Date(Date.now() - 12 * 864e5);
  await db.goal.createMany({
    data: [
      {
        patientId: child.id, professionalId: pro.id, title: "Respirar antes da escola", emoji: "🎈",
        note: "Respirar devagar ajuda você a começar o dia mais calmo.", kind: "DAYS", activityKey: "respiracao",
        target: 3, createdAt: twelveDaysAgo,
      },
      {
        patientId: child.id, professionalId: pro.id, title: "Craque das emoções", emoji: "🌟",
        note: "Você está aprendendo muito sobre as emoções!", kind: "ACCURACY", activityKey: "emocoes",
        target: 3, minAccuracy: 0.75, createdAt: twelveDaysAgo,
      },
    ],
  });
  await db.comment.create({
    data: { patientId: child.id, authorId: guardian.id, content: "Hoje ele pediu sozinho para fazer a respiração do balão antes de dormir." },
  });

  console.log("Seed concluído.");
  console.log("Responsável: responsavel@inovatea.app / inovatea123");
  console.log("Profissional: profissional@inovatea.app / inovatea123");
  console.log("Crianças: Lucas (verbal, nível 1) e Bia (não verbal, nível 3)");
}

main().finally(() => db.$disconnect());
