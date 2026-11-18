// Catálogo de atividades e conteúdo dos quizzes.
// Linguagem literal, frases curtas e apoio visual (emoji) em todas as perguntas.

export type ActivityType = "QUIZ" | "MEMORY" | "SEQUENCE" | "ODD" | "COUNT" | "SORT" | "ORDER" | "BREATHING" | "CHAT";

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
    levels: 5,
  },
  {
    key: "rotina",
    type: "QUIZ",
    title: "Minha Rotina",
    emoji: "🗓️",
    description: "O que vem antes e o que vem depois?",
    skill: "Rotina e sequência temporal",
    color: "sage",
    levels: 5,
  },
  {
    key: "social",
    type: "QUIZ",
    title: "Situações do Dia a Dia",
    emoji: "🤝",
    description: "O que podemos fazer em cada situação?",
    skill: "Habilidades sociais",
    color: "lavender",
    levels: 5,
  },
  {
    key: "memoria",
    type: "MEMORY",
    title: "Jogo da Memória",
    emoji: "🧩",
    description: "Encontre os pares iguais.",
    skill: "Memória e atenção",
    color: "sand",
    levels: 5,
  },
  {
    key: "sequencia",
    type: "SEQUENCE",
    title: "Siga a Sequência",
    emoji: "🔷",
    description: "Observe e repita as formas na mesma ordem.",
    skill: "Atenção e memória de trabalho",
    color: "sky",
    levels: 5,
  },
  {
    key: "diferente",
    type: "ODD",
    title: "Encontre o Diferente",
    emoji: "🔍",
    description: "Qual figura não é igual às outras?",
    skill: "Atenção visual e discriminação",
    color: "sand",
    levels: 5,
  },
  {
    key: "contar",
    type: "COUNT",
    title: "Vamos Contar",
    emoji: "🔢",
    description: "Conte as figuras e escolha o número.",
    skill: "Números, contagem e cálculo",
    color: "sky",
    levels: 5,
  },
  {
    key: "classificar",
    type: "SORT",
    title: "Separar e Organizar",
    emoji: "🧺",
    description: "Coloque cada figura no grupo certo.",
    skill: "Categorização e flexibilidade",
    color: "lavender",
    levels: 5,
  },
  {
    key: "passos",
    type: "ORDER",
    title: "Passo a Passo",
    emoji: "🪜",
    description: "Monte a ordem certa de cada tarefa.",
    skill: "Sequência de ações e funções executivas",
    color: "sage",
    levels: 5,
  },
  {
    key: "respiracao",
    type: "BREATHING",
    title: "Respirar com o Balão",
    emoji: "🎈",
    description: "Um momento calmo para respirar devagar.",
    skill: "Autorregulação emocional",
    color: "sage",
    levels: 3,
  },
  {
    key: "conversa",
    type: "CHAT",
    title: "Conversar com o TeaBot",
    emoji: "🤖",
    description: "O TeaBot é um robô amigo que gosta de conversar.",
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

// ---------------------------------------------------------------------------
// Níveis 4 e 5 dos quizzes: emoções mais complexas, rotina com tempo e
// imprevistos, e linguagem social não literal (expressões e ironia).
// ---------------------------------------------------------------------------
const q = (prompt: string, visual: string, options: [string, string][], hint: string, answer = 0): QuizQuestion => ({
  prompt,
  visual,
  options: options.map(([label, emoji]) => ({ label, emoji })),
  answer,
  hint,
});

Object.assign(QUIZZES.emocoes, {
  4: [
    q("Montei sozinho um quebra-cabeça difícil. Como eu me sinto?", "🧩", [["Orgulhoso", "🏅"], ["Envergonhado", "😳"], ["Entediado", "🥱"]], "Quando conseguimos algo difícil, sentimos orgulho."),
    q("Tropecei na frente da turma e todos olharam. Como posso me sentir?", "🏫", [["Feliz", "😄"], ["Envergonhado", "😳"], ["Com fome", "🤤"]], "Sentir vergonha é normal. Esse sentimento passa.", 1),
    q("Tentei várias vezes e o desenho não ficou como eu queria. Como me sinto?", "✏️", [["Animado", "🤩"], ["Com sono", "😴"], ["Frustrado", "😣"]], "Isso se chama frustração. Fazer uma pausa ajuda.", 2),
    q("Abri a porta e meus amigos gritaram: Feliz aniversário! Como me sinto?", "🎉", [["Surpreso", "😮"], ["Triste", "😢"], ["Bravo", "😠"]], "Quando algo bom e inesperado acontece, ficamos surpresos."),
  ],
  5: [
    q("Meu irmão ganhou um elogio e eu não. Sinto algo ruim no peito. O que pode ser?", "👦", [["Ciúme", "😒"], ["Alegria", "😄"], ["Sono", "😴"]], "Isso pode ser ciúme. Conversar com um adulto ajuda a entender."),
    q("Estou muito nervoso antes da prova. O que posso fazer?", "📝", [["Rasgar a prova", "📄"], ["Respirar e lembrar que estudei", "🌬️"], ["Sair correndo", "🏃"]], "Respirar devagar acalma o corpo e ajuda a pensar.", 1),
    q("Meu colega disse que tem medo do escuro. O que posso dizer?", "🌙", [["Isso é bobagem", "🙄"], ["Rir dele", "😂"], ["Eu entendo, às vezes também sinto medo", "🤝"]], "Mostrar que entendemos o outro se chama empatia.", 2),
    q("Que sinais o corpo dá quando estou ficando bravo?", "🌡️", [["O coração acelera e fico quente", "❤️‍🔥"], ["Fico com fome", "🍔"], ["Fico com sono", "😴"]], "Quando notar esses sinais, é hora de fazer uma pausa."),
  ],
});

Object.assign(QUIZZES.rotina, {
  4: [
    q("Quantos dias tem uma semana?", "📅", [["7 dias", "7️⃣"], ["3 dias", "3️⃣"], ["30 dias", "🔢"]], "A semana tem 7 dias: de domingo a sábado."),
    q("Que dia vem depois de segunda-feira?", "🗓️", [["Domingo", "📕"], ["Terça-feira", "📗"], ["Sexta-feira", "📘"]], "Depois da segunda vem a terça-feira.", 1),
    q("O relógio marca 8 horas da noite. O que costumamos fazer?", "🕗", [["Ir para a escola", "🏫"], ["Almoçar", "🍲"], ["Preparar para dormir", "🛏️"]], "À noite nos preparamos para dormir.", 2),
    q("Vou ao médico amanhã. O que me ajuda a ficar tranquilo?", "🩺", [["Saber antes como vai ser", "🗺️"], ["Esconder e não falar", "🙈"], ["Ficar acordado a noite toda", "🌙"]], "Saber o que vai acontecer deixa tudo mais previsível."),
  ],
  5: [
    q("O que eu preparo na noite antes da escola?", "🎒", [["Material e uniforme", "📚"], ["Brinquedos de praia", "🏖️"], ["Panela", "🍳"]], "Deixar tudo pronto à noite deixa a manhã mais calma."),
    q("Me perdi no supermercado. O que eu faço?", "🛒", [["Saio sozinho para a rua", "🚶"], ["Procuro um funcionário de uniforme", "🧑‍💼"], ["Me escondo", "🙈"]], "Fique parado ou procure um funcionário para pedir ajuda.", 1),
    q("Vou mudar de escola. O que pode ajudar?", "🏫", [["Não falar sobre isso", "🤐"], ["Ficar acordado a noite toda", "🌙"], ["Visitar a escola antes", "👀"]], "Conhecer o lugar antes ajuda a se acostumar.", 2),
    q("Tenho tarefa e quero jogar videogame. Qual é a melhor ordem?", "🎮", [["Tarefa primeiro, depois o jogo", "✅"], ["Só o jogo", "🎮"], ["Nenhum dos dois", "🚫"]], "Primeiro a obrigação, depois a diversão."),
  ],
});

Object.assign(QUIZZES.social, {
  4: [
    q("Meu amigo diz: 'Estou morrendo de fome!'. O que ele quer dizer?", "🍽️", [["Está com muita fome", "🤤"], ["Está doente", "🏥"], ["Não quer comer", "🙅"]], "É uma expressão. Quer dizer que a fome é grande."),
    q("Alguém me pede para 'dar uma mãozinha'. O que é?", "✋", [["Entregar a minha mão", "🖐️"], ["Ajudar", "🤝"], ["Bater palmas", "👏"]], "'Dar uma mãozinha' quer dizer ajudar.", 1),
    q("Meu colega disse que não gostou do meu desenho. O que posso fazer?", "🎨", [["Rasgar o desenho dele", "💢"], ["Nunca mais falar com ele", "🚫"], ["Respeitar a opinião dele", "🙂"]], "Cada pessoa pode ter um gosto diferente.", 2),
    q("Estou conversando e a pessoa olha o relógio várias vezes. O que pode significar?", "⌚", [["Que ela precisa ir embora", "🚪"], ["Que ela ama relógios", "❤️"], ["Que quer conversar mais", "🗣️"]], "Olhar o relógio pode ser sinal de pressa. Podemos perguntar: 'Você precisa ir?'"),
  ],
  5: [
    q("Quero falar com alguém que está ocupado. O que eu faço?", "📱", [["Espero e digo 'com licença'", "🙋"], ["Puxo o braço dele", "✊"], ["Grito o nome dele", "📢"]], "'Com licença' é a forma educada de chamar alguém ocupado."),
    q("Um colega está sozinho no recreio. O que posso fazer?", "🧒", [["Rir dele", "😂"], ["Convidar para brincar", "🤝"], ["Fingir que não vi", "🙈"]], "Convidar alguém para brincar é uma atitude gentil.", 1),
    q("Alguém derrubou suco e disse 'Que ótimo...' com cara séria. O que significa?", "🧃", [["Que adorou", "😄"], ["Que quer mais suco", "🥤"], ["Que não achou bom (ironia)", "🙃"]], "Às vezes as pessoas dizem o contrário do que sentem. Isso se chama ironia.", 2),
    q("Prometi uma coisa e não consegui cumprir. O que eu faço?", "🤞", [["Explico e peço desculpas", "🙇"], ["Finjo que esqueci", "🤷"], ["Culpo outra pessoa", "👉"]], "Ser sincero e pedir desculpas mantém a confiança."),
  ],
});

/** Símbolos usados no jogo da memória e na sequência. */
export const MEMORY_SYMBOLS = ["🐶", "🐱", "🐢", "🐟", "🦋", "🐸", "🦉", "🐰", "🦁", "🐼", "🐧", "🦒"];
export const MEMORY_PAIRS_BY_LEVEL: Record<number, number> = { 1: 3, 2: 4, 3: 6, 4: 8, 5: 10 };

export const SEQUENCE_SHAPES = [
  { id: "circulo", emoji: "🔵", label: "Círculo azul" },
  { id: "quadrado", emoji: "🟩", label: "Quadrado verde" },
  { id: "triangulo", emoji: "🔺", label: "Triângulo" },
  { id: "estrela", emoji: "⭐", label: "Estrela" },
  { id: "coracao", emoji: "💜", label: "Coração roxo" },
  { id: "lua", emoji: "🌙", label: "Lua" },
];
export const SEQUENCE_LENGTH_BY_LEVEL: Record<number, number> = { 1: 3, 2: 4, 3: 5, 4: 5, 5: 6 };
/** Do nível 4 em diante, a sequência usa 6 formas em vez de 4. */
export const sequenceShapesForLevel = (level: number) => SEQUENCE_SHAPES.slice(0, level >= 4 ? 6 : 4);
export const SEQUENCE_ROUNDS = 4;

/** Respiração: mais ciclos e expiração mais longa a cada nível. */
export const BREATHING_BY_LEVEL: Record<number, { cycles: number; inhale: number; hold: number; exhale: number }> = {
  1: { cycles: 3, inhale: 4, hold: 2, exhale: 5 },
  2: { cycles: 5, inhale: 4, hold: 2, exhale: 5 },
  3: { cycles: 7, inhale: 4, hold: 3, exhale: 6 },
};

/** Encontre o Diferente: pares [figura repetida, figura diferente], cada vez mais parecidos. */
export const ODD_BY_LEVEL: Record<number, { cells: number; cols: number; pairs: [string, string][] }> = {
  1: { cells: 4, cols: 2, pairs: [["🍎", "🚗"], ["🐶", "⭐"], ["🌞", "🍦"], ["🎈", "🐟"], ["🌳", "🚲"], ["🧸", "🍕"]] },
  2: { cells: 6, cols: 3, pairs: [["🍎", "🍌"], ["🐶", "🐮"], ["🚗", "🚌"], ["⚽", "🏀"], ["🌹", "🌻"], ["🐟", "🐬"]] },
  3: { cells: 9, cols: 3, pairs: [["🐶", "🐱"], ["🍊", "🍑"], ["🚗", "🚕"], ["🌲", "🌳"], ["🐸", "🐢"], ["🍪", "🍩"]] },
  4: { cells: 12, cols: 4, pairs: [["🙂", "😊"], ["🐻", "🐨"], ["🍏", "🍐"], ["🐺", "🦊"], ["🚒", "🚑"], ["📗", "📘"]] },
  5: { cells: 16, cols: 4, pairs: [["😀", "😄"], ["🐭", "🐹"], ["🕐", "🕒"], ["😐", "😑"], ["🌘", "🌗"], ["🔹", "🔷"]] },
};
export const ODD_ROUNDS = 5;

/** Vamos Contar: o que cada nível pede. */
export const COUNT_BY_LEVEL: Record<number, { kind: "count" | "add" | "sub"; min: number; max: number }> = {
  1: { kind: "count", min: 1, max: 5 },
  2: { kind: "count", min: 3, max: 10 },
  3: { kind: "count", min: 8, max: 15 },
  4: { kind: "add", min: 2, max: 10 },
  5: { kind: "sub", min: 5, max: 12 },
};
export const COUNT_EMOJIS = ["🍎", "⭐", "🐟", "🎈", "🐞", "🌸", "🍪", "🚗"];
export const COUNT_ROUNDS = 5;

/** Separar e Organizar: grupos e figuras de cada nível. */
export interface SortSet {
  title: string;
  categories: { label: string; emoji: string }[];
  items: { emoji: string; label: string; category: number }[];
}
const items = (category: number, list: [string, string][]) => list.map(([emoji, label]) => ({ emoji, label, category }));
export const SORT_BY_LEVEL: Record<number, SortSet> = {
  1: {
    title: "Frutas ou animais?",
    categories: [{ label: "Frutas", emoji: "🍎" }, { label: "Animais", emoji: "🐶" }],
    items: [...items(0, [["🍌", "Banana"], ["🍇", "Uva"], ["🍓", "Morango"]]), ...items(1, [["🐱", "Gato"], ["🐰", "Coelho"], ["🐮", "Vaca"]])],
  },
  2: {
    title: "Roupa ou comida?",
    categories: [{ label: "Roupas", emoji: "👕" }, { label: "Comidas", emoji: "🍽️" }],
    items: [...items(0, [["👖", "Calça"], ["🧦", "Meia"], ["🧢", "Boné"], ["👗", "Vestido"]]), ...items(1, [["🍕", "Pizza"], ["🍞", "Pão"], ["🧀", "Queijo"], ["🥕", "Cenoura"]])],
  },
  3: {
    title: "Onde cada um fica: céu, mar ou terra?",
    categories: [{ label: "Céu", emoji: "☁️" }, { label: "Mar", emoji: "🌊" }, { label: "Terra", emoji: "🌳" }],
    items: [...items(0, [["✈️", "Avião"], ["🐦", "Passarinho"], ["🎈", "Balão"]]), ...items(1, [["🐟", "Peixe"], ["🐙", "Polvo"], ["⛵", "Barco"]]), ...items(2, [["🐄", "Vaca"], ["🚗", "Carro"], ["🐿️", "Esquilo"]])],
  },
  4: {
    title: "Em que lugar da casa ou da escola usamos?",
    categories: [{ label: "Escola", emoji: "🏫" }, { label: "Cozinha", emoji: "🍳" }, { label: "Banheiro", emoji: "🛁" }],
    items: [...items(0, [["✏️", "Lápis"], ["📚", "Livros"], ["🎒", "Mochila"], ["📏", "Régua"]]), ...items(1, [["🥄", "Colher"], ["🍳", "Frigideira"], ["🥣", "Tigela"], ["🫖", "Bule"]]), ...items(2, [["🪥", "Escova de dentes"], ["🧼", "Sabonete"], ["🧻", "Papel higiênico"], ["🚿", "Chuveiro"]])],
  },
  5: {
    title: "Esse animal voa, nada ou anda?",
    categories: [{ label: "Voa", emoji: "🕊️" }, { label: "Nada", emoji: "🐠" }, { label: "Anda", emoji: "🐾" }],
    items: [...items(0, [["🦅", "Águia"], ["🦋", "Borboleta"], ["🦉", "Coruja"], ["🐝", "Abelha"]]), ...items(1, [["🐬", "Golfinho"], ["🦈", "Tubarão"], ["🐳", "Baleia"], ["🐡", "Baiacu"]]), ...items(2, [["🐘", "Elefante"], ["🦒", "Girafa"], ["🐕", "Cachorro"], ["🐎", "Cavalo"]])],
  },
};

/** Passo a Passo: tarefas do dia a dia com a ordem certa dos passos. */
export interface Routine {
  title: string;
  emoji: string;
  steps: { emoji: string; label: string }[];
}
const r = (title: string, emoji: string, steps: [string, string][]): Routine => ({
  title,
  emoji,
  steps: steps.map(([e, label]) => ({ emoji: e, label })),
});
export const ROUTINES_BY_SIZE: Record<number, Routine[]> = {
  3: [
    r("Escovar os dentes", "🪥", [["🪥", "Pegar a escova"], ["🧴", "Colocar a pasta"], ["😁", "Escovar os dentes"]]),
    r("Lavar as mãos", "🧼", [["🚰", "Abrir a torneira"], ["🧼", "Passar sabão"], ["🧻", "Secar as mãos"]]),
    r("Plantar uma flor", "🌱", [["🕳️", "Fazer um buraco"], ["🌱", "Colocar a semente"], ["💧", "Regar"]]),
    r("Comer cereal", "🥣", [["🥣", "Pegar a tigela"], ["🌾", "Colocar o cereal"], ["🥛", "Colocar o leite"]]),
    r("Calçar o tênis", "👟", [["🧦", "Colocar a meia"], ["👟", "Calçar o tênis"], ["🎀", "Amarrar o cadarço"]]),
  ],
  4: [
    r("Tomar banho", "🚿", [["🚿", "Ligar o chuveiro"], ["🧴", "Lavar o cabelo"], ["🧼", "Ensaboar o corpo"], ["🧺", "Secar com a toalha"]]),
    r("Fazer um sanduíche", "🥪", [["🍞", "Pegar o pão"], ["🧈", "Passar manteiga"], ["🧀", "Colocar o queijo"], ["🥪", "Fechar o sanduíche"]]),
    r("Ir para a escola", "🏫", [["⏰", "Acordar"], ["👕", "Me vestir"], ["🥣", "Tomar café"], ["🎒", "Pegar a mochila"]]),
    r("Hora de dormir", "🌙", [["🛁", "Tomar banho"], ["👕", "Vestir o pijama"], ["🪥", "Escovar os dentes"], ["🛏️", "Deitar na cama"]]),
  ],
  5: [
    r("Atravessar a rua", "🚦", [["🛑", "Parar na calçada"], ["🤝", "Dar a mão ao adulto"], ["🚦", "Esperar o sinal verde"], ["👀", "Olhar para os dois lados"], ["🚶", "Atravessar na faixa"]]),
    r("Fazer um bolo", "🎂", [["🥚", "Separar os ingredientes"], ["🥣", "Misturar tudo"], ["🍰", "Colocar na forma"], ["🔥", "Assar no forno"], ["🎂", "Esperar esfriar e comer"]]),
    r("Lavar a louça", "🍽️", [["🍽️", "Juntar os pratos"], ["🚰", "Abrir a torneira"], ["🧽", "Ensaboar com a esponja"], ["💦", "Enxaguar"], ["🧺", "Secar e guardar"]]),
    r("Escovar os dentes direitinho", "🪥", [["🪥", "Pegar a escova"], ["🧴", "Colocar a pasta"], ["😁", "Escovar os dentes"], ["💧", "Enxaguar a boca"], ["🧼", "Lavar a escova"]]),
  ],
};
/** Tamanho das tarefas e número de rodadas em cada nível. */
export const ORDER_BY_LEVEL: Record<number, { size: number; rounds: number }> = {
  1: { size: 3, rounds: 3 },
  2: { size: 3, rounds: 4 },
  3: { size: 4, rounds: 3 },
  4: { size: 4, rounds: 4 },
  5: { size: 5, rounds: 3 },
};

export const LEVEL_EMOJIS = ["🌱", "🌿", "🌳", "⭐", "🚀"];
