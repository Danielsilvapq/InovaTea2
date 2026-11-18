import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export interface TeaBotContext {
  childName: string;
  age: number;
  interests: string | null;
}

function systemPrompt(ctx: TeaBotContext) {
  return `Você é o TeaBot, um robô amigo dentro do InovaTea, um aplicativo de apoio para crianças e adolescentes com Transtorno do Espectro Autista (TEA). Você conversa em português do Brasil com ${ctx.childName}, que tem ${ctx.age} anos.${
    ctx.interests ? ` Os interesses favoritos de ${ctx.childName} são: ${ctx.interests}. Use esses temas para criar conexão quando fizer sentido.` : ""
  }

Seu objetivo é praticar conversação de forma segura, previsível e acolhedora: fazer e responder perguntas, revezar a vez de falar, nomear emoções e falar sobre o dia a dia.

Como você fala:
- Frases curtas e simples, adequadas à idade. No máximo 3 frases por resposta.
- Linguagem literal. Não use ironia, sarcasmo, metáforas, duplo sentido nem expressões figuradas. Se precisar usar uma expressão, explique o significado.
- Faça só uma pergunta por vez. Quando der, ofereça opções concretas (por exemplo: "Você prefere falar de animais ou de planetas?").
- Seja calmo, gentil e paciente. Elogie o esforço de forma específica ("Gostei de como você explicou isso").
- Aceite respostas curtas, repetidas ou fora do assunto sem corrigir de forma brusca. Se a criança mudar de assunto, acompanhe e depois, se for natural, volte ao tema.
- Pode usar no máximo um emoji por resposta. Não use letras maiúsculas para enfatizar nem muitos pontos de exclamação.
- Responda apenas com o texto da fala do TeaBot, sem marcações, listas ou títulos.

Segurança:
- Você não é médico nem terapeuta. Não faça diagnósticos e não dê orientações médicas.
- Se a criança disser que está machucada, com dor, com muito medo, que alguém fez mal a ela, ou falar em se machucar, responda com calma, diga que isso é importante e que ela deve contar agora para um adulto de confiança (como a mãe, o pai, o responsável ou a professora). Não investigue detalhes.
- Não peça dados pessoais como endereço, telefone, escola ou senhas. Se a criança oferecer, diga gentilmente que não precisa contar isso.
- Mantenha os assuntos apropriados para crianças.`;
}

let client: Anthropic | null = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) return null;
  client ??= new Anthropic();
  return client;
}

export function teabotGreeting(ctx: TeaBotContext) {
  return `Oi, ${ctx.childName}! Eu sou o TeaBot, um robô amigo. 🤖 Como você está se sentindo hoje?`;
}

export async function teabotReply(
  ctx: TeaBotContext,
  history: { role: "user" | "assistant"; content: string }[],
): Promise<{ text: string; source: "claude" | "roteiro" }> {
  const anthropic = getClient();
  if (anthropic) {
    try {
      const response = await anthropic.beta.messages.create({
        model: process.env.CLAUDE_MODEL || "claude-opus-5-5",
        max_tokens: 2000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "low" },
        system: systemPrompt(ctx),
        messages: history,
      });
      if (response.stop_reason !== "refusal") {
        const text = response.content
          .map((b) => (b.type === "text" ? b.text : ""))
          .join("")
          .trim();
        if (text) return { text, source: "claude" };
      }
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        console.error(`[teabot] Erro da API ${error.status}: ${error.message}`);
      } else {
        console.error("[teabot] Falha ao chamar a API", error);
      }
    }
  }
  return { text: scriptedReply(ctx, history), source: "roteiro" };
}

// ---------------------------------------------------------------------------
// Modo roteirizado: funciona sem chave de API, com respostas previsíveis.
// ---------------------------------------------------------------------------

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const SAFETY = ["machuc", "dor", "doendo", "bateu", "me bate", "sangue", "morrer", "me matar", "socorro"];

const FEELINGS: [string[], string][] = [
  [["feliz", "bem", "otimo", "legal", "alegre", "contente"], "Que bom que você está feliz! O que deixou você feliz hoje?"],
  [["triste", "chorei", "chorando", "mal"], "Obrigado por me contar. Tudo bem ficar triste às vezes. Você quer me contar o que aconteceu?"],
  [["bravo", "raiva", "irritado", "chateado"], "Entendi, você está bravo. Respirar devagar pode ajudar. Quer tentar respirar comigo? Puxe o ar contando até 4."],
  [["medo", "assustado", "nervoso", "ansioso"], "Sentir medo é normal. Você está seguro aqui comigo. Quer contar para um adulto como você está se sentindo?"],
  [["cansado", "sono", "cansada"], "Parece que você está cansado. Descansar é importante. Você dormiu bem hoje?"],
];

const FOLLOW_UPS = [
  "Qual é a sua comida favorita?",
  "Você prefere brincar dentro de casa ou ao ar livre?",
  "Qual é o seu animal preferido? Eu gosto de tartarugas. 🐢",
  "O que você fez hoje de manhã?",
  "Se você pudesse ir a qualquer lugar, onde iria?",
  "Qual é a sua cor favorita? A minha é azul.",
  "Você tem um desenho ou jogo favorito?",
];

function scriptedReply(ctx: TeaBotContext, history: { role: string; content: string }[]) {
  const last = norm(history.filter((m) => m.role === "user").at(-1)?.content ?? "");
  const turn = history.filter((m) => m.role === "user").length;

  if (SAFETY.some((w) => last.includes(w))) {
    return "Obrigado por me contar. Isso é muito importante. Por favor, conte agora para um adulto de confiança, como seu responsável ou sua professora.";
  }
  for (const [words, reply] of FEELINGS) {
    if (words.some((w) => last.split(/\W+/).includes(w))) return reply;
  }
  if (/^(oi|ola|e ai|bom dia|boa tarde|boa noite)\b/.test(last)) {
    return `Oi, ${ctx.childName}! Que bom falar com você. Do que você quer conversar hoje?`;
  }
  if (/(tchau|ate logo|ate mais|vou sair)/.test(last)) {
    return "Tchau! Gostei muito de conversar com você. Até a próxima! 👋";
  }
  if (ctx.interests && turn === 2) {
    const first = ctx.interests.split(/,|e /)[0].trim();
    return `Eu sei que você gosta de ${first}. Pode me contar uma coisa legal sobre isso?`;
  }
  if (last.endsWith("?")) {
    return `Boa pergunta! Eu sou um robô e ainda estou aprendendo. O que você acha? ${FOLLOW_UPS[turn % FOLLOW_UPS.length]}`;
  }
  const praise = ["Que legal!", "Entendi.", "Obrigado por me contar.", "Muito interessante!"][turn % 4];
  return `${praise} ${FOLLOW_UPS[turn % FOLLOW_UPS.length]}`;
}
