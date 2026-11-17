// Catálogo de atividades e conteúdo dos quizzes.
// Linguagem literal, frases curtas e apoio visual (emoji) em todas as perguntas.

export type ActivityType = "QUIZ" | "MEMORY" | "SEQUENCE" | "BREATHING" | "CHAT";

export interface ActivityDef {
  key: string;
  type: ActivityType;
  title: string;
  emoji: string;
  description: string;
  skill: string; // habilidade trabalhada (mostrada aos adultos)
  color: string; // token de cor do cartão
  levels: number;
}

export const ACTIVITIES: ActivityDef[] = [
  {
    key: "emocoes",
    type: "QUIZ",
    title: "Quiz das Emoções",
    emoji: "😊",
    description: "Descubra como as pessoas estão se sentindo.",
    skill: "Reconhecimento de emoções",
    color: "sky",
    levels: 3,
  },
  {
    key: "rotina",
    type: "QUIZ",
    title: "Minha Rotina",
    emoji: "🗓️",
    description: "O que vem antes e o que vem depois?",
    skill: "Rotina e sequência temporal",
    color: "sage",
    levels: 3,
  },
  {
    key: "social",
    type: "QUIZ",
    title: "Situações do Dia a Dia",
    emoji: "🤝",
    description: "O que podemos fazer em cada situação?",
    skill: "Habilidades sociais",
    color: "lavender",
    levels: 3,
  },
  {
    key: "memoria",
    type: "MEMORY",
    title: "Jogo da Memória",
    emoji: "🧩",
    description: "Encontre os pares iguais.",
    skill: "Memória e atenção",
    color: "sand",
    levels: 3,
  },
  {
    key: "sequencia",
    type: "SEQUENCE",
    title: "Siga a Sequência",
    emoji: "🔷",
    description: "Observe e repita as formas na mesma ordem.",
    skill: "Atenção e memória de trabalho",
    color: "sky",
    levels: 3,
  },
  {
    key: "respiracao",
    type: "BREATHING",
    title: "Respirar com o Balão",
    emoji: "🎈",
    description: "Um momento calmo para respirar devagar.",
    skill: "Autorregulação emocional",
    color: "sage",
    levels: 1,
  },
  {
    key: "conversa",
    type: "CHAT",
    title: "Conversar com o Tito",
    emoji: "🤖",
    description: "O Tito é um robô amigo que gosta de conversar.",
    skill: "Comunicação e conversação",
    color: "lavender",
    levels: 1,
  },
];

export function getActivity(key: string) {
  return ACTIVITIES.find((a) => a.key === key);
}

export interface QuizQuestion {
  prompt: string;
  visual: string; // emoji grande que ilustra a pergunta
  options: { label: string; emoji: string }[];
  answer: number; // índice da opção correta
  hint: string; // explicação mostrada depois da resposta
}

export const QUIZZES: Record<string, Record<number, QuizQuestion[]>> = {
  emocoes: {
    1: [
      {
        prompt: "Como esta carinha está se sentindo?",
        visual: "😄",
        options: [
          { label: "Feliz", emoji: "😄" },
          { label: "Triste", emoji: "😢" },
          { label: "Bravo", emoji: "😠" },
        ],
        answer: 0,
        hint: "A boca está sorrindo. Isso quer dizer feliz.",
      },
      {
        prompt: "Como esta carinha está se sentindo?",
        visual: "😢",
        options: [
          { label: "Feliz", emoji: "😄" },
          { label: "Triste", emoji: "😢" },
          { label: "Com sono", emoji: "😴" },
        ],
        answer: 1,
        hint: "Tem uma lágrima. Isso quer dizer triste.",
      },
      {
        prompt: "Como esta carinha está se sentindo?",
        visual: "😴",
        options: [
          { label: "Com medo", emoji: "😨" },
          { label: "Bravo", emoji: "😠" },
          { label: "Com sono", emoji: "😴" },
        ],
        answer: 2,
        hint: "Os olhos estão fechados e tem um Zzz. Isso quer dizer sono.",
      },
      {
        prompt: "Como esta carinha está se sentindo?",
        visual: "😠",
        options: [
          { label: "Bravo", emoji: "😠" },
          { label: "Feliz", emoji: "😄" },
          { label: "Surpreso", emoji: "😮" },
        ],
        answer: 0,
        hint: "As sobrancelhas estão para baixo. Isso quer dizer bravo.",
      },
    ],
    2: [
      {
        prompt: "Ganhei um presente que eu queria muito. Como eu me sinto?",
        visual: "🎁",
        options: [
          { label: "Feliz", emoji: "😄" },
          { label: "Triste", emoji: "😢" },
          { label: "Com medo", emoji: "😨" },
        ],
        answer: 0,
        hint: "Ganhar algo que queremos costuma deixar a gente feliz.",
      },
      {
        prompt: "Meu sorvete caiu no chão. Como eu posso me sentir?",
        visual: "🍦",
        options: [
          { label: "Feliz", emoji: "😄" },
          { label: "Triste", emoji: "😢" },
          { label: "Com sono", emoji: "😴" },
        ],
        answer: 1,
        hint: "Perder algo que gostamos pode deixar a gente triste. Tudo bem sentir isso.",
      },
      {
        prompt: "Ouvi um barulho muito alto de trovão. Como eu posso me sentir?",
        visual: "⛈️",
        options: [
          { label: "Com medo", emoji: "😨" },
          { label: "Feliz", emoji: "😄" },
          { label: "Com fome", emoji: "🤤" },
        ],
        answer: 0,
        hint: "Barulhos altos podem dar medo. Podemos tapar os ouvidos ou pedir ajuda.",
      },
      {
        prompt: "Alguém pegou meu brinquedo sem pedir. Como eu posso me sentir?",
        visual: "🧸",
        options: [
          { label: "Bravo", emoji: "😠" },
          { label: "Com sono", emoji: "😴" },
          { label: "Feliz", emoji: "😄" },
        ],
        answer: 0,
        hint: "É normal ficar bravo. Podemos dizer: 'Por favor, me devolva'.",
      },
    ],
    3: [
      {
        prompt: "Estou muito bravo. O que pode me ajudar a ficar calmo?",
        visual: "😤",
        options: [
          { label: "Respirar devagar", emoji: "🌬️" },
          { label: "Gritar com alguém", emoji: "📢" },
          { label: "Jogar as coisas", emoji: "💥" },
        ],
        answer: 0,
        hint: "Respirar devagar ajuda o corpo a se acalmar.",
      },
      {
        prompt: "Meu amigo está chorando. Como ele está se sentindo?",
        visual: "🧒",
        options: [
          { label: "Triste", emoji: "😢" },
          { label: "Feliz", emoji: "😄" },
          { label: "Animado", emoji: "🤩" },
        ],
        answer: 0,
        hint: "Chorar muitas vezes quer dizer que a pessoa está triste.",
      },
      {
        prompt: "Meu amigo está triste. O que eu posso fazer?",
        visual: "💙",
        options: [
          { label: "Perguntar se ele está bem", emoji: "🗣️" },
          { label: "Rir dele", emoji: "😂" },
          { label: "Ir embora sem falar", emoji: "🚶" },
        ],
        answer: 0,
        hint: "Perguntar 'Você está bem?' mostra que nos importamos.",
      },
      {
        prompt: "Tem muito barulho e luz na sala. Eu fico incomodado. O que posso fazer?",
        visual: "🔊",
        options: [
          { label: "Pedir para ir a um lugar calmo", emoji: "🏡" },
          { label: "Ficar quieto e aguentar sozinho", emoji: "😣" },
          { label: "Bater na mesa", emoji: "✊" },
        ],
        answer: 0,
        hint: "Podemos pedir uma pausa ou usar um fone. Pedir ajuda é uma boa escolha.",
      },
    ],
  },
  rotina: {
    1: [
      {
        prompt: "O que fazemos quando acordamos de manhã?",
        visual: "🌅",
        options: [
          { label: "Escovar os dentes", emoji: "🪥" },
          { label: "Dormir", emoji: "🛏️" },
          { label: "Ver as estrelas", emoji: "✨" },
        ],
        answer: 0,
        hint: "De manhã, escovamos os dentes.",
      },
      {
        prompt: "O que fazemos antes de comer?",
        visual: "🍽️",
        options: [
          { label: "Lavar as mãos", emoji: "🧼" },
          { label: "Tomar banho de chuva", emoji: "🌧️" },
          { label: "Calçar o sapato", emoji: "👟" },
        ],
        answer: 0,
        hint: "Lavamos as mãos antes de comer para tirar a sujeira.",
      },
      {
        prompt: "Onde nós dormimos?",
        visual: "🌙",
        options: [
          { label: "Na cama", emoji: "🛏️" },
          { label: "Na geladeira", emoji: "🧊" },
          { label: "No carro", emoji: "🚗" },
        ],
        answer: 0,
        hint: "Dormimos na cama.",
      },
      {
        prompt: "O que levamos para a escola?",
        visual: "🏫",
        options: [
          { label: "Mochila", emoji: "🎒" },
          { label: "Travesseiro", emoji: "🛌" },
          { label: "Panela", emoji: "🍳" },
        ],
        answer: 0,
        hint: "Levamos a mochila com os materiais.",
      },
    ],
    2: [
      {
        prompt: "Primeiro eu tomo banho. Depois eu...",
        visual: "🛁",
        options: [
          { label: "Me seco com a toalha", emoji: "🧺" },
          { label: "Entro na piscina", emoji: "🏊" },
          { label: "Durmo no banheiro", emoji: "😴" },
        ],
        answer: 0,
        hint: "Depois do banho, nos secamos com a toalha.",
      },
      {
        prompt: "Primeiro eu coloco a meia. Depois eu coloco...",
        visual: "🧦",
        options: [
          { label: "O sapato", emoji: "👟" },
          { label: "O chapéu no pé", emoji: "🎩" },
          { label: "A luva", emoji: "🧤" },
        ],
        answer: 0,
        hint: "A meia vem primeiro, e o sapato vem depois.",
      },
      {
        prompt: "O que vem depois do almoço?",
        visual: "🍲",
        options: [
          { label: "Escovar os dentes", emoji: "🪥" },
          { label: "Tomar café da manhã", emoji: "🥣" },
          { label: "Acordar", emoji: "⏰" },
        ],
        answer: 0,
        hint: "Depois de comer, escovamos os dentes.",
      },
      {
        prompt: "Está chovendo e eu vou sair. O que eu levo?",
        visual: "🌧️",
        options: [
          { label: "Guarda-chuva", emoji: "☂️" },
          { label: "Óculos de sol", emoji: "🕶️" },
          { label: "Boia", emoji: "🛟" },
        ],
        answer: 0,
        hint: "O guarda-chuva protege da chuva.",
      },
    ],
    3: [
      {
        prompt: "Qual é a ordem certa para dormir?",
        visual: "🌙",
        options: [
          { label: "Pijama → dentes → cama", emoji: "🛏️" },
          { label: "Cama → pijama → almoço", emoji: "🍝" },
          { label: "Sapato → mochila → cama", emoji: "🎒" },
        ],
        answer: 0,
        hint: "Colocamos o pijama, escovamos os dentes e depois vamos para a cama.",
      },
      {
        prompt: "A rotina mudou hoje e eu não gostei. O que posso fazer?",
        visual: "🔄",
        options: [
          { label: "Perguntar o que vai acontecer", emoji: "❓" },
          { label: "Esconder e não falar nada", emoji: "🙈" },
          { label: "Gritar", emoji: "📢" },
        ],
        answer: 0,
        hint: "Perguntar 'O que vai acontecer agora?' ajuda a entender a mudança.",
      },
      {
        prompt: "Quantas refeições principais fazemos no dia?",
        visual: "🍎",
        options: [
          { label: "Café, almoço e jantar", emoji: "🍽️" },
          { label: "Só o jantar", emoji: "🌙" },
          { label: "Nenhuma", emoji: "🚫" },
        ],
        answer: 0,
        hint: "Café da manhã, almoço e jantar.",
      },
      {
        prompt: "Terminei a tarefa da escola. O que eu faço com o material?",
        visual: "📚",
        options: [
          { label: "Guardo na mochila", emoji: "🎒" },
          { label: "Deixo no chão", emoji: "⬇️" },
          { label: "Jogo no lixo", emoji: "🗑️" },
        ],
        answer: 0,
        hint: "Guardamos o material para usar de novo amanhã.",
      },
    ],
  },
  social: {
    1: [
      {
        prompt: "Alguém disse 'Oi' para mim. O que eu posso responder?",
        visual: "👋",
        options: [
          { label: "Oi!", emoji: "👋" },
          { label: "Não falar nada", emoji: "🤐" },
          { label: "Tchau e correr", emoji: "🏃" },
        ],
        answer: 0,
        hint: "Quando alguém diz oi, podemos responder oi. Acenar também vale.",
      },
      {
        prompt: "Alguém me deu um lanche. O que eu digo?",
        visual: "🥪",
        options: [
          { label: "Obrigado!", emoji: "🙏" },
          { label: "Não quero você", emoji: "🙅" },
          { label: "Mais!", emoji: "➕" },
        ],
        answer: 0,
        hint: "Dizemos 'obrigado' quando recebemos algo.",
      },
      {
        prompt: "Eu quero brincar com o brinquedo do meu colega. O que eu faço?",
        visual: "🚂",
        options: [
          { label: "Pergunto: posso brincar?", emoji: "🗣️" },
          { label: "Pego sem pedir", emoji: "✋" },
          { label: "Choro", emoji: "😭" },
        ],
        answer: 0,
        hint: "Perguntar 'Posso brincar?' é educado.",
      },
      {
        prompt: "Esbarrei em alguém sem querer. O que eu digo?",
        visual: "💥",
        options: [
          { label: "Desculpa!", emoji: "🙇" },
          { label: "Saia da frente!", emoji: "😤" },
          { label: "Nada", emoji: "🤐" },
        ],
        answer: 0,
        hint: "Pedir desculpa mostra que foi sem querer.",
      },
    ],
    2: [
      {
        prompt: "Estou numa fila. O que eu faço?",
        visual: "🧍",
        options: [
          { label: "Espero a minha vez", emoji: "⏳" },
          { label: "Passo na frente de todos", emoji: "⏩" },
          { label: "Saio da fila gritando", emoji: "📢" },
        ],
        answer: 0,
        hint: "Na fila, cada pessoa espera a sua vez.",
      },
      {
        prompt: "Não entendi o que a professora explicou. O que eu faço?",
        visual: "👩‍🏫",
        options: [
          { label: "Levanto a mão e pergunto", emoji: "🙋" },
          { label: "Fico parado sem fazer nada", emoji: "😶" },
          { label: "Rasgo a folha", emoji: "📄" },
        ],
        answer: 0,
        hint: "Levantar a mão e perguntar é uma ótima ideia.",
      },
      {
        prompt: "Meu colega está falando. O que eu faço?",
        visual: "🗣️",
        options: [
          { label: "Escuto e espero ele terminar", emoji: "👂" },
          { label: "Falo junto, mais alto", emoji: "📢" },
          { label: "Tapo a boca dele", emoji: "✋" },
        ],
        answer: 0,
        hint: "Esperamos a outra pessoa terminar de falar. Depois é a nossa vez.",
      },
      {
        prompt: "Perdi no jogo. O que eu posso dizer?",
        visual: "🎲",
        options: [
          { label: "Foi legal! Vamos de novo?", emoji: "🙂" },
          { label: "Jogo as peças longe", emoji: "💢" },
          { label: "Você roubou!", emoji: "😠" },
        ],
        answer: 0,
        hint: "Perder faz parte. Podemos jogar de novo.",
      },
    ],
    3: [
      {
        prompt: "Um colega disse: 'Está chovendo canivete!'. O que ele quer dizer?",
        visual: "🌧️",
        options: [
          { label: "Está chovendo muito forte", emoji: "⛈️" },
          { label: "Caem facas do céu", emoji: "🔪" },
          { label: "Está fazendo sol", emoji: "☀️" },
        ],
        answer: 0,
        hint: "É uma expressão. Quer dizer chuva muito forte. Não caem facas de verdade.",
      },
      {
        prompt: "Quero entrar numa conversa do grupo. Como eu começo?",
        visual: "👥",
        options: [
          { label: "Espero uma pausa e digo: posso participar?", emoji: "🙋" },
          { label: "Interrompo falando de outro assunto", emoji: "🔀" },
          { label: "Fico olhando sem falar nada", emoji: "👀" },
        ],
        answer: 0,
        hint: "Esperar uma pausa e perguntar é uma boa forma de entrar na conversa.",
      },
      {
        prompt: "Alguém está com o rosto sério e os braços cruzados. Como a pessoa pode estar?",
        visual: "🙅",
        options: [
          { label: "Chateada ou brava", emoji: "😒" },
          { label: "Muito feliz", emoji: "😄" },
          { label: "Com sono", emoji: "😴" },
        ],
        answer: 0,
        hint: "Rosto sério e braços cruzados podem mostrar que a pessoa está chateada.",
      },
      {
        prompt: "Estou falando do meu assunto favorito. Meu amigo boceja e olha para o lado. O que faço?",
        visual: "🥱",
        options: [
          { label: "Pergunto do que ele quer falar", emoji: "❓" },
          { label: "Continuo falando por muito tempo", emoji: "⏱️" },
          { label: "Fico bravo com ele", emoji: "😠" },
        ],
        answer: 0,
        hint: "Bocejar pode ser sinal de cansaço. Perguntar o que o amigo quer falar é gentil.",
      },
    ],
  },
};

export function getQuiz(key: string, level: number): QuizQuestion[] | null {
  return QUIZZES[key]?.[level] ?? null;
}

/** Símbolos usados no jogo da memória e na sequência. */
export const MEMORY_SYMBOLS = ["🐶", "🐱", "🐢", "🐟", "🦋", "🐸", "🦉", "🐰", "🦁", "🐼"];
export const MEMORY_PAIRS_BY_LEVEL: Record<number, number> = { 1: 3, 2: 4, 3: 6 };

export const SEQUENCE_SHAPES = [
  { id: "circulo", emoji: "🔵", label: "Círculo azul" },
  { id: "quadrado", emoji: "🟩", label: "Quadrado verde" },
  { id: "triangulo", emoji: "🔺", label: "Triângulo" },
  { id: "estrela", emoji: "⭐", label: "Estrela" },
];
export const SEQUENCE_LENGTH_BY_LEVEL: Record<number, number> = { 1: 3, 2: 4, 3: 5 };
export const SEQUENCE_ROUNDS = 4;
