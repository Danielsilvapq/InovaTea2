// Comunicação Alternativa e Aumentativa (CAA) do InovaTea.
// Vocabulário organizado em grupos, com cores por tipo de palavra (como na
// Chave de Fitzgerald, comum em pranchas de CAA), e regras simples de
// português para que o aparelho fale frases naturais pela criança.

export type AacKind =
  | "phrase" // frase pronta: fala na hora
  | "starter" // começo de frase: "Eu quero", "Eu preciso de"...
  | "feeling" | "state" // como estou
  | "body" // partes do corpo
  | "food" | "thing" // coisas
  | "action" // verbos
  | "place" | "person"
  | "time" | "desc"; // quando / palavras soltas

export interface AacCard {
  id: string;
  emoji: string;
  label: string; // como aparece e como é falado sozinho
  kind: AacKind;
  obj?: string; // com artigo: "a bola", "a mamãe", "o parque"
  to?: string; // destino: "ao parque", "para casa"
  poss?: string; // "minha cabeça" (corpo)
  em?: string; // "na cabeça" (corpo)
  imageUrl?: string; // figura personalizada (foto)
}

const c = (id: string, emoji: string, label: string, kind: AacKind, extra: Partial<AacCard> = {}): AacCard => ({ id, emoji, label, kind, ...extra });
const phrase = (id: string, emoji: string, label: string) => c(id, emoji, label, "phrase");

/** Fala na hora, sempre visível no topo da prancha. */
export const AAC_URGENT: AacCard[] = [
  phrase("u-ajuda", "🆘", "Preciso de ajuda!"),
  phrase("u-dor", "🤕", "Estou com dor."),
  phrase("u-banheiro", "🚽", "Quero ir ao banheiro."),
  phrase("u-pare", "✋", "Pare, por favor!"),
  phrase("u-pausa", "⏸️", "Preciso de uma pausa."),
];

export const AAC_STARTERS: AacCard[] = [
  c("s-quero", "🙋", "Eu quero", "starter"),
  c("s-naoquero", "🙅", "Eu não quero", "starter"),
  c("s-preciso", "🆘", "Eu preciso de", "starter"),
  c("s-estou", "💭", "Eu estou", "starter"),
  c("s-gosto", "❤️", "Eu gosto de", "starter"),
  c("s-naogosto", "💔", "Eu não gosto de", "starter"),
  c("s-doendo", "🤕", "Está doendo", "starter"),
  c("s-vamos", "👉", "Vamos", "starter"),
  c("s-meda", "🤲", "Me dá", "starter"),
  c("s-ajuda", "🧑‍🤝‍🧑", "Me ajuda a", "starter"),
  c("s-onde", "🔎", "Onde está", "starter"),
  c("s-vejo", "👀", "Eu vejo", "starter"),
  c("s-tenho", "🎒", "Eu tenho", "starter"),
  c("s-posso", "🙏", "Posso", "starter"),
];

export interface AacCategory {
  id: string;
  title: string;
  emoji: string;
  color: "social" | "people" | "action" | "noun" | "desc" | "time" | "question" | "custom";
  cards: AacCard[];
}

export const AAC_CATEGORIES: AacCategory[] = [
  {
    id: "rapidas", title: "Rápidas", emoji: "⚡", color: "social",
    cards: [
      phrase("r-sim", "👍", "Sim."), phrase("r-nao", "👎", "Não."), phrase("r-naosei", "🤷", "Não sei."),
      phrase("r-mais", "➕", "Mais, por favor."), phrase("r-acabou", "🏁", "Acabou."), phrase("r-denovo", "🔁", "De novo!"),
      phrase("r-espera", "⏳", "Espera um pouco."), phrase("r-naogosto", "😖", "Não gosto disso."), phrase("r-gostei", "😍", "Eu gostei!"),
      phrase("r-terminei", "✅", "Terminei."), phrase("r-minhavez", "☝️", "É a minha vez."), phrase("r-suavez", "👉", "É a sua vez."),
      phrase("r-naoentendi", "😕", "Eu não entendi."), phrase("r-repete", "🔂", "Pode repetir, por favor?"), phrase("r-barulho", "🔊", "Está muito barulho."),
      phrase("r-claro", "💡", "Está muito claro."), phrase("r-sozinho", "🧍", "Quero ficar sozinho um pouco."), phrase("r-casa", "🏠", "Quero ir para casa."),
      phrase("r-abraco", "🤗", "Quero um abraço."), phrase("r-naotoque", "🚫", "Não me toque, por favor."),
    ],
  },
  {
    id: "conversa", title: "Conversa", emoji: "💬", color: "social",
    cards: [
      phrase("cv-oi", "👋", "Oi!"), phrase("cv-tchau", "👋", "Tchau!"), phrase("cv-bomdia", "🌅", "Bom dia!"),
      phrase("cv-boatarde", "🌤️", "Boa tarde!"), phrase("cv-boanoite", "🌙", "Boa noite!"), phrase("cv-tudobem", "🙂", "Tudo bem?"),
      phrase("cv-estoubem", "😊", "Eu estou bem."), phrase("cv-obrigado", "🙏", "Obrigado!"), phrase("cv-porfavor", "🥺", "Por favor."),
      phrase("cv-desculpa", "🙇", "Desculpa."), phrase("cv-licenca", "🙋", "Com licença."), phrase("cv-nome", "📛", "Qual é o seu nome?"),
      phrase("cv-brincar", "🤝", "Vamos brincar juntos?"), phrase("cv-amo", "💖", "Eu te amo."), phrase("cv-parabens", "🎉", "Parabéns!"),
      phrase("cv-legal", "😎", "Que legal!"), phrase("cv-saudade", "🥹", "Estou com saudade."), phrase("cv-quero-ficar", "🫶", "Fica comigo."),
    ],
  },
  {
    id: "perguntas", title: "Perguntas", emoji: "❓", color: "question",
    cards: [
      phrase("p-oque", "❓", "O que é isso?"), phrase("p-onde", "📍", "Onde está?"), phrase("p-quando", "🗓️", "Quando vamos?"),
      phrase("p-quem", "🧑", "Quem é?"), phrase("p-porque", "🤔", "Por quê?"), phrase("p-posso", "🙏", "Posso?"),
      phrase("p-horas", "🕐", "Que horas são?"), phrase("p-mamae", "👩", "Cadê a mamãe?"), phrase("p-papai", "👨", "Cadê o papai?"),
      phrase("p-agora", "⏰", "O que vamos fazer agora?"), phrase("p-depois", "➡️", "O que vem depois?"), phrase("p-acabar", "⌛", "Quando vai acabar?"),
      phrase("p-comer", "🍽️", "Tem comida?"), phrase("p-casa", "🏠", "Vamos para casa?"),
    ],
  },
  {
    id: "sentimentos", title: "Sentimentos", emoji: "😊", color: "desc",
    cards: [
      c("f-feliz", "😄", "feliz", "feeling"), c("f-triste", "😢", "triste", "feeling"), c("f-bravo", "😠", "bravo", "feeling"),
      c("f-medo", "😨", "com medo", "feeling"), c("f-calmo", "😌", "calmo", "feeling"), c("f-nervoso", "😬", "nervoso", "feeling"),
      c("f-animado", "🤩", "animado", "feeling"), c("f-cansado", "😴", "cansado", "feeling"), c("f-incomodado", "😣", "incomodado", "feeling"),
      c("f-confuso", "😵‍💫", "confuso", "feeling"), c("f-entediado", "🥱", "entediado", "feeling"), c("f-envergonhado", "😳", "envergonhado", "feeling"),
      c("f-saudade", "🥹", "com saudade", "feeling"), c("f-ciume", "😒", "com ciúme", "feeling"), c("f-orgulhoso", "🏅", "orgulhoso", "feeling"),
      c("f-surpreso", "😮", "surpreso", "feeling"),
    ],
  },
  {
    id: "corpo", title: "Corpo e saúde", emoji: "🤒", color: "noun",
    cards: [
      c("st-dor", "🤕", "com dor", "state"), c("st-febre", "🤒", "com febre", "state"), c("st-enjoado", "🤢", "enjoado", "state"),
      c("st-frio", "🥶", "com frio", "state"), c("st-calor", "🥵", "com calor", "state"), c("st-sono", "😪", "com sono", "state"),
      c("st-fome", "🤤", "com fome", "state"), c("st-sede", "💧", "com sede", "state"), c("st-machucado", "🩹", "machucado", "state"),
      c("st-coceira", "🫳", "com coceira", "state"), c("st-tontura", "💫", "com tontura", "state"),
      c("b-cabeca", "🧠", "cabeça", "body", { poss: "minha cabeça", em: "na cabeça" }),
      c("b-barriga", "🫃", "barriga", "body", { poss: "minha barriga", em: "na barriga" }),
      c("b-dente", "🦷", "dente", "body", { poss: "meu dente", em: "no dente" }),
      c("b-ouvido", "👂", "ouvido", "body", { poss: "meu ouvido", em: "no ouvido" }),
      c("b-garganta", "🗣️", "garganta", "body", { poss: "minha garganta", em: "na garganta" }),
      c("b-olho", "👁️", "olho", "body", { poss: "meu olho", em: "no olho" }),
      c("b-mao", "✋", "mão", "body", { poss: "minha mão", em: "na mão" }),
      c("b-pe", "🦶", "pé", "body", { poss: "meu pé", em: "no pé" }),
      c("b-perna", "🦵", "perna", "body", { poss: "minha perna", em: "na perna" }),
      c("b-braco", "💪", "braço", "body", { poss: "meu braço", em: "no braço" }),
      c("b-costas", "🧍", "costas", "body", { poss: "minhas costas", em: "nas costas" }),
    ],
  },
  {
    id: "comer", title: "Comer e beber", emoji: "🍽️", color: "noun",
    cards: [
      c("fd-agua", "💧", "água", "food"), c("fd-suco", "🧃", "suco", "food"), c("fd-leite", "🥛", "leite", "food"),
      c("fd-pao", "🍞", "pão", "food"), c("fd-fruta", "🍎", "fruta", "food"), c("fd-banana", "🍌", "banana", "food"),
      c("fd-maca", "🍏", "maçã", "food"), c("fd-uva", "🍇", "uva", "food"), c("fd-arroz", "🍚", "arroz e feijão", "food"),
      c("fd-macarrao", "🍝", "macarrão", "food"), c("fd-frango", "🍗", "frango", "food"), c("fd-ovo", "🍳", "ovo", "food"),
      c("fd-biscoito", "🍪", "biscoito", "food"), c("fd-iogurte", "🥣", "iogurte", "food"), c("fd-queijo", "🧀", "queijo", "food"),
      c("fd-pizza", "🍕", "pizza", "food"), c("fd-sorvete", "🍦", "sorvete", "food"), c("fd-bolo", "🎂", "bolo", "food"),
      c("fd-cafe", "🥐", "café da manhã", "food"), c("fd-almoco", "🍲", "almoço", "food"), c("fd-lanche", "🥪", "lanche", "food"),
      c("fd-jantar", "🍽️", "jantar", "food"),
    ],
  },
  {
    id: "brincar", title: "Brincar", emoji: "🧸", color: "noun",
    cards: [
      c("t-bola", "⚽", "bola", "thing", { obj: "a bola" }), c("t-carrinho", "🚗", "carrinho", "thing", { obj: "o carrinho" }),
      c("t-boneca", "🪆", "boneca", "thing", { obj: "a boneca" }), c("t-blocos", "🧱", "blocos", "thing", { obj: "os blocos" }),
      c("t-quebra", "🧩", "quebra-cabeça", "thing", { obj: "o quebra-cabeça" }), c("t-massinha", "🟣", "massinha", "thing", { obj: "a massinha" }),
      c("t-livro", "📖", "livro", "thing", { obj: "o livro" }), c("t-tablet", "📱", "tablet", "thing", { obj: "o tablet" }),
      c("t-tv", "📺", "televisão", "thing", { obj: "a televisão" }), c("t-video", "🎮", "videogame", "thing", { obj: "o videogame" }),
      c("t-bolhas", "🫧", "bolhas de sabão", "thing", { obj: "as bolhas de sabão" }), c("t-balao", "🎈", "balão", "thing", { obj: "o balão" }),
      c("t-pelucia", "🧸", "bicho de pelúcia", "thing", { obj: "o bicho de pelúcia" }), c("t-lapis", "🖍️", "giz de cera", "thing", { obj: "o giz de cera" }),
      c("a-desenhar", "🎨", "desenhar", "action"), c("a-dancar", "💃", "dançar", "action"), c("a-cantar", "🎤", "cantar", "action"),
      c("a-correr", "🏃", "correr", "action"), c("a-pular", "🦘", "pular", "action"), c("a-balanco", "🎠", "andar de balanço", "action"),
      c("a-bicicleta", "🚲", "andar de bicicleta", "action"), c("a-musica", "🎵", "ouvir música", "action"), c("a-historia", "📚", "ouvir uma história", "action"),
      c("a-desenho", "📺", "ver desenho", "action"),
    ],
  },
  {
    id: "acoes", title: "Ações", emoji: "🏃", color: "action",
    cards: [
      c("a-brincar", "🧸", "brincar", "action"), c("a-comer", "🍽️", "comer", "action"), c("a-beber", "🥤", "beber", "action"),
      c("a-dormir", "🛏️", "dormir", "action"), c("a-descansar", "🛋️", "descansar", "action"), c("a-sair", "🚪", "sair", "action"),
      c("a-passear", "🚶", "passear", "action"), c("a-abrir", "📂", "abrir", "action"), c("a-fechar", "📁", "fechar", "action"),
      c("a-pegar", "🫴", "pegar", "action"), c("a-ver", "👀", "ver", "action"), c("a-ouvir", "👂", "ouvir", "action"),
      c("a-ler", "📖", "ler", "action"), c("a-escrever", "✍️", "escrever", "action"), c("a-sentar", "🪑", "sentar", "action"),
      c("a-levantar", "🧍", "levantar", "action"), c("a-esperar", "⏳", "esperar", "action"), c("a-parar", "✋", "parar", "action"),
      c("a-ligar", "🔛", "ligar", "action"), c("a-desligar", "📴", "desligar", "action"), c("a-conversar", "💬", "conversar", "action"),
      c("a-abracar", "🤗", "abraçar", "action"), c("a-nadar", "🏊", "nadar", "action"), c("a-cozinhar", "🍳", "cozinhar", "action"),
    ],
  },
  {
    id: "lugares", title: "Lugares", emoji: "🏠", color: "noun",
    cards: [
      c("l-casa", "🏠", "casa", "place", { obj: "a casa", to: "para casa" }), c("l-escola", "🏫", "escola", "place", { obj: "a escola", to: "à escola" }),
      c("l-parque", "🌳", "parque", "place", { obj: "o parque", to: "ao parque" }), c("l-banheiro", "🚽", "banheiro", "place", { obj: "o banheiro", to: "ao banheiro" }),
      c("l-quarto", "🛏️", "quarto", "place", { obj: "o quarto", to: "para o quarto" }), c("l-cozinha", "🍳", "cozinha", "place", { obj: "a cozinha", to: "para a cozinha" }),
      c("l-sala", "🛋️", "sala", "place", { obj: "a sala", to: "para a sala" }), c("l-lafora", "☀️", "lá fora", "place", { obj: "lá fora", to: "lá fora" }),
      c("l-carro", "🚗", "carro", "place", { obj: "o carro", to: "para o carro" }), c("l-mercado", "🛒", "mercado", "place", { obj: "o mercado", to: "ao mercado" }),
      c("l-medico", "🏥", "médico", "place", { obj: "o médico", to: "ao médico" }), c("l-terapia", "🩺", "terapia", "place", { obj: "a terapia", to: "à terapia" }),
      c("l-praia", "🏖️", "praia", "place", { obj: "a praia", to: "à praia" }), c("l-piscina", "🏊", "piscina", "place", { obj: "a piscina", to: "à piscina" }),
      c("l-vovo", "🏡", "casa da vovó", "place", { obj: "a casa da vovó", to: "para a casa da vovó" }), c("l-igreja", "⛪", "igreja", "place", { obj: "a igreja", to: "à igreja" }),
    ],
  },
  {
    id: "pessoas", title: "Pessoas", emoji: "👨‍👩‍👧", color: "people",
    cards: [
      c("pe-eu", "🙋", "eu", "person", { obj: "eu" }), c("pe-voce", "👉", "você", "person", { obj: "você" }),
      c("pe-mamae", "👩", "mamãe", "person", { obj: "a mamãe" }), c("pe-papai", "👨", "papai", "person", { obj: "o papai" }),
      c("pe-vovo-f", "👵", "vovó", "person", { obj: "a vovó" }), c("pe-vovo-m", "👴", "vovô", "person", { obj: "o vovô" }),
      c("pe-irmao", "👦", "irmão", "person", { obj: "o meu irmão" }), c("pe-irma", "👧", "irmã", "person", { obj: "a minha irmã" }),
      c("pe-tio", "🧔", "tio", "person", { obj: "o tio" }), c("pe-tia", "👩‍🦱", "tia", "person", { obj: "a tia" }),
      c("pe-prof", "👩‍🏫", "professora", "person", { obj: "a professora" }), c("pe-amigo", "🧒", "amigo", "person", { obj: "o meu amigo" }),
      c("pe-terapeuta", "🩺", "terapeuta", "person", { obj: "a terapeuta" }), c("pe-medico", "👨‍⚕️", "médico", "person", { obj: "o médico" }),
      c("pe-bebe", "👶", "bebê", "person", { obj: "o bebê" }), c("pe-cachorro", "🐶", "cachorro", "person", { obj: "o cachorro" }),
      c("pe-gato", "🐱", "gato", "person", { obj: "o gato" }),
    ],
  },
  {
    id: "rotina", title: "Rotina", emoji: "🛁", color: "action",
    cards: [
      c("ro-banho", "🛁", "tomar banho", "action"), c("ro-dentes", "🪥", "escovar os dentes", "action"), c("ro-maos", "🧼", "lavar as mãos", "action"),
      c("ro-roupa", "👕", "trocar de roupa", "action"), c("ro-pijama", "🌙", "vestir o pijama", "action"), c("ro-sapato", "👟", "calçar o sapato", "action"),
      c("ro-cabelo", "💇", "pentear o cabelo", "action"), c("ro-fralda", "🧷", "trocar a fralda", "action"), c("ro-remedio", "💊", "tomar remédio", "action"),
      c("ro-tarefa", "📝", "fazer a tarefa", "action"), c("ro-arrumar", "🧹", "arrumar", "action"), c("ro-guardar", "📦", "guardar os brinquedos", "action"),
      c("ro-casaco", "🧥", "casaco", "thing", { obj: "o casaco" }), c("ro-mochila", "🎒", "mochila", "thing", { obj: "a mochila" }),
      c("ro-fone", "🎧", "fone de ouvido", "thing", { obj: "o fone de ouvido" }), c("ro-cobertor", "🛌", "cobertor", "thing", { obj: "o cobertor" }),
    ],
  },
  {
    id: "quando", title: "Quando", emoji: "🕐", color: "time",
    cards: [
      c("q-agora", "⏰", "agora", "time"), c("q-depois", "➡️", "depois", "time"), c("q-maistarde", "🕓", "mais tarde", "time"),
      c("q-hoje", "📅", "hoje", "time"), c("q-amanha", "🌄", "amanhã", "time"), c("q-ontem", "⏪", "ontem", "time"),
      c("q-manha", "🌅", "de manhã", "time"), c("q-tarde", "🌤️", "de tarde", "time"), c("q-noite", "🌙", "de noite", "time"),
      c("q-ja", "⚡", "já", "time"), c("q-umpouco", "🤏", "um pouco", "time"),
    ],
  },
  {
    id: "palavras", title: "Palavras", emoji: "🔤", color: "desc",
    cards: [
      c("d-mais", "➕", "mais", "desc"), c("d-pouco", "🤏", "um pouquinho", "desc"), c("d-muito", "💯", "muito", "desc"),
      c("d-grande", "🐘", "grande", "desc"), c("d-pequeno", "🐭", "pequeno", "desc"), c("d-quente", "🔥", "quente", "desc"),
      c("d-gelado", "🧊", "gelado", "desc"), c("d-gostoso", "😋", "gostoso", "desc"), c("d-ruim", "🤢", "ruim", "desc"),
      c("d-devagar", "🐢", "devagar", "desc"), c("d-rapido", "🐇", "rápido", "desc"), c("d-baixinho", "🤫", "baixinho", "desc"),
      c("d-sozinho", "🧍", "sozinho", "desc"), c("d-junto", "🫂", "junto", "desc"), c("d-denovo", "🔁", "de novo", "desc"),
      c("d-porfavor", "🙏", "por favor", "desc"),
    ],
  },
];

export const AAC_CARD_COLORS: Record<AacCategory["color"], string> = {
  social: "aac-social", people: "aac-people", action: "aac-action", noun: "aac-noun",
  desc: "aac-desc", time: "aac-time", question: "aac-question", custom: "aac-custom",
};
/** Cor de cada tipo de palavra (Chave de Fitzgerald, adaptada em tons suaves). */
export function cardColor(card: AacCard) {
  switch (card.kind) {
    case "person": return "aac-people";
    case "action": return "aac-action";
    case "food": case "thing": case "place": case "body": return "aac-noun";
    case "feeling": case "state": case "desc": return "aac-desc";
    case "time": return "aac-time";
    case "starter": return "aac-starter";
    default: return "aac-social";
  }
}

// ---------------------------------------------------------------------------
// Montagem da frase
// ---------------------------------------------------------------------------

/** "de" + artigo: de a mamãe → da mamãe; de o parque → do parque. */
function de(x: string) {
  if (/^a /.test(x)) return "da " + x.slice(2);
  if (/^o /.test(x)) return "do " + x.slice(2);
  if (/^as /.test(x)) return "das " + x.slice(3);
  if (/^os /.test(x)) return "dos " + x.slice(3);
  return "de " + x;
}
const join = (xs: string[]) => (xs.length <= 1 ? xs.join("") : xs.slice(0, -1).join(", ") + " e " + xs[xs.length - 1]);
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const objOf = (k: AacCard) => k.obj ?? k.label;

/** Base falada de cada começo (sem a preposição, que vem com cada figura). */
const STARTER_BASE: Record<string, string> = {
  "s-preciso": "Eu preciso", "s-gosto": "Eu gosto", "s-naogosto": "Eu não gosto", "s-ajuda": "Me ajuda",
};

/** Como cada figura entra depois de cada começo de frase. */
function after(starterId: string, k: AacCard): string {
  switch (starterId) {
    case "s-quero":
    case "s-naoquero":
      if (k.kind === "place") return "ir " + (k.to ?? "para " + objOf(k));
      if (k.kind === "feeling") return "ficar " + k.label;
      if (k.kind === "person" || k.kind === "thing") return objOf(k);
      return k.label;
    case "s-preciso":
      if (k.kind === "action") return k.label;
      if (k.kind === "place") return "ir " + (k.to ?? "para " + objOf(k));
      return de(objOf(k));
    case "s-gosto":
    case "s-naogosto":
      if (k.kind === "action") return "de " + k.label;
      return de(objOf(k));
    case "s-estou":
      if (k.kind === "body") return "com dor " + (k.em ?? "no " + k.label);
      return k.label;
    case "s-vamos":
      if (k.kind === "place") return k.to ?? "para " + objOf(k);
      if (k.kind === "person") return "com " + objOf(k);
      return k.label;
    case "s-meda":
    case "s-onde":
    case "s-vejo":
    case "s-tenho":
      return objOf(k);
    case "s-ajuda":
      return k.kind === "action" ? "a " + k.label : "com " + objOf(k);
    case "s-posso":
      if (k.kind === "place") return "ir " + (k.to ?? "para " + objOf(k));
      if (k.kind === "action") return k.label;
      return "pegar " + objOf(k);
    default:
      return k.label;
  }
}

/**
 * Transforma as figuras tocadas numa frase falada natural.
 * Ex.: [Eu quero][parque][depois] → "Eu quero ir ao parque depois."
 *      [Está doendo][barriga] → "Minha barriga está doendo."
 */
export function composeSentence(parts: AacCard[]): string {
  if (!parts.length) return "";
  if (parts.length === 1 && parts[0].kind === "phrase") return parts[0].label;
  const starter = parts[0].kind === "starter" ? parts[0] : null;
  const rest = starter ? parts.slice(1) : parts;
  const polite = rest.some((k) => k.id === "d-porfavor");
  const times = rest.filter((k) => k.kind === "time").map((k) => k.label);
  const descs = rest.filter((k) => k.kind === "desc" && k.id !== "d-porfavor").map((k) => k.label);
  const content = rest.filter((k) => !["time", "desc", "phrase", "starter"].includes(k.kind));
  const phrases = rest.filter((k) => k.kind === "phrase").map((k) => k.label.replace(/[.!]$/, ""));

  let core = "";
  let question = false;
  if (!starter) {
    core = join(content.map((k) => k.label));
  } else if (starter.id === "s-doendo") {
    const bodies = content.filter((k) => k.kind === "body");
    core = bodies.length
      ? cap(join(bodies.map((k) => k.poss ?? "meu " + k.label))) + (bodies.length > 1 || bodies[0].poss?.startsWith("minhas") ? " estão doendo" : " está doendo")
      : "Está doendo";
  } else if (starter.id === "s-onde") {
    core = "Onde está " + join(content.map(objOf));
    question = true;
  } else if (starter.id === "s-posso") {
    core = "Posso " + join(content.map((k) => after(starter.id, k)));
    question = true;
  } else {
    const base = STARTER_BASE[starter.id] ?? starter.label;
    // Ação + pessoa: "Eu quero brincar com a mamãe" (a pessoa vira companhia).
    const hasAction = content.some((k) => k.kind === "action");
    const companions = hasAction && starter.id !== "s-gosto" && starter.id !== "s-naogosto" ? content.filter((k) => k.kind === "person") : [];
    const main = content.filter((k) => !companions.includes(k));
    core = base + (main.length ? " " + join(main.map((k) => after(starter.id, k))) : "");
    if (companions.length) core += " com " + join(companions.map(objOf));
  }
  let text = [core, ...descs, ...times].filter(Boolean).join(" ").trim();
  if (phrases.length) text = [text, ...phrases].filter(Boolean).join(". ");
  if (polite) text += ", por favor";
  text = cap(text.replace(/\s+/g, " "));
  if (!/[.!?]$/.test(text)) text += question ? "?" : ".";
  return text;
}

export function allAacCards(): AacCard[] {
  return [...AAC_URGENT, ...AAC_STARTERS, ...AAC_CATEGORIES.flatMap((g) => g.cards)];
}

// ---------------------------------------------------------------------------
// Figuras e frases personalizadas (cadastradas por pais e terapeutas)
// ---------------------------------------------------------------------------
export interface AacItemLike {
  id: string;
  type: string;
  emoji: string;
  label: string;
  article?: string | null;
}
export const CUSTOM_TYPES = [
  { value: "phrase", label: "Frase pronta (fala do jeito que está escrita)" },
  { value: "thing", label: "Coisa ou brinquedo" },
  { value: "food", label: "Comida ou bebida" },
  { value: "person", label: "Pessoa ou bicho de estimação" },
  { value: "place", label: "Lugar" },
  { value: "action", label: "Ação (verbo, como 'ver o Bob Zoom')" },
];
/** Converte o item salvo numa figura da prancha, com artigo e destino corretos. */
export function customToCard(it: AacItemLike): AacCard {
  const art = it.article && ["o", "a", "os", "as"].includes(it.article) ? it.article : null;
  const obj = art ? `${art} ${it.label}` : it.label;
  const to = art === "o" ? `ao ${it.label}` : art === "a" ? `à ${it.label}` : art === "os" ? `aos ${it.label}` : art === "as" ? `às ${it.label}` : `para ${it.label}`;
  const kind = (["phrase", "thing", "food", "person", "place", "action"].includes(it.type) ? it.type : "thing") as AacKind;
  return { id: "c-" + it.id, emoji: it.emoji || "⭐", label: it.type === "phrase" && !/[.!?]$/.test(it.label) ? it.label + "." : it.label, kind, obj, to };
}

/** Frases faladas registradas nas sessões da Minha Voz (as mais recentes primeiro). */
export function phrasesFromSessions(sessions: { activityKey: string; details: string | null | Record<string, unknown>; startedAt: Date | string }[]) {
  const out: { text: string; at: string }[] = [];
  for (const s of sessions) {
    if (s.activityKey !== "minhavoz" || !s.details) continue;
    try {
      const d = typeof s.details === "string" ? JSON.parse(s.details) : s.details;
      for (const p of (d?.phrases ?? []) as { text: string; at?: string }[]) out.push({ text: p.text, at: p.at ?? new Date(s.startedAt).toISOString() });
    } catch {}
  }
  return out.sort((a, b) => +new Date(b.at) - +new Date(a.at));
}
export function topPhrases(list: { text: string }[], n = 6) {
  const counts = new Map<string, number>();
  for (const p of list) counts.set(p.text, (counts.get(p.text) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([text, count]) => ({ text, count }));
}
