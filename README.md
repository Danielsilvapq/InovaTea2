# InovaTea 🧩

Plataforma SaaS de apoio terapêutico para **crianças e adolescentes com TEA** (Transtorno do Espectro Autista).
Oferece quizzes, mini-jogos e conversa com um robô amigo. Todas as atividades geram pontos, níveis e
registros de evolução, que podem ser acompanhados por **responsáveis** e **profissionais de saúde**.

## Funcionalidades

### Para a criança (modo criança)
- **Quizzes** com 3 níveis cada: Emoções, Minha Rotina e Situações do Dia a Dia (habilidades sociais).
- **Mini-jogos**: Jogo da Memória, Siga a Sequência e Respirar com o Balão (autorregulação).
- **Conversa com o TeaBot**: robô amigo com linguagem literal e frases curtas, usando a API do Claude. Sem chave de API, funciona com respostas prontas.
- **Barra de progresso sempre visível**: em cada atividade (pergunta X de Y, tempo da sessão), no nível geral e na meta do dia.
- **Pontos e níveis**: nível geral (Semente → Galáxia) e níveis por atividade. O próximo nível é liberado com 70% de acerto.
- **Humor ao final**: a criança diz como se sente, e isso fica registrado na sessão.
- **Trilha de conquistas**: 22 medalhas em 7 trilhas (emoções, calma, social, rotina, atenção, números e constância), com barra de progresso em cada uma e aviso ao conquistar.
- **Trava para adultos**: para sair do modo criança é preciso segurar o botão por 2 segundos.

### Para responsáveis
- Cadastro de uma ou mais crianças, com avatar, interesses e observações sensoriais.
- Painel de evolução com gráficos de acerto e tempo de uso, evolução por atividade, histórico detalhado de sessões (incluindo as conversas com o TeaBot), avaliações e comentários.
- Preferências sensoriais: som (desligado por padrão), redução de movimentos e tamanho do texto.
- Código de acesso para vincular profissionais, que também podem ser removidos.

### Para profissionais de saúde
- Cadastro com especialidade e registro profissional (CRP, CRM, CRFa…).
- Vínculo com o paciente pelo código fornecido pelo responsável.
- **Avaliações estruturadas** (comunicação, interação social, atenção, regulação emocional e autonomia, de 1 a 5), com parecer e recomendações, compartilhadas ou não com o responsável.
- Comentários no perfil e acesso a todo o histórico de sessões.
- **Metas personalizadas** para cada paciente (terminar uma atividade N vezes, fazer em N dias diferentes, atingir um acerto mínimo ou chegar a um nível), com prazo opcional e recado para a criança. A meta aparece na trilha de conquistas da criança.

## Ambiente adaptado ao TEA
- Paleta suave e pouco saturada (azul calmo, verde sálvia, lavanda, areia), com modo escuro.
- O erro aparece em âmbar suave e com mensagem acolhedora ("Quase! …"), nunca em vermelho intenso.
- Nada pisca. A sequência é mostrada parada, e as animações respeitam `prefers-reduced-motion` e a preferência do perfil.
- Fonte Atkinson Hyperlegible, botões grandes, layout previsível e apoio visual (emoji) em todas as perguntas.
- Linguagem literal e frases curtas. Expressões figuradas aparecem só como conteúdo de aprendizado, sempre explicadas.

## Tecnologias
Next.js 15 (App Router) · React 19 · TypeScript · Prisma (SQLite em desenvolvimento) · API do Claude (`@anthropic-ai/sdk`) · autenticação por JWT em cookie httpOnly.

## Como rodar

```bash
npm install
cp .env.example .env      # ajuste AUTH_SECRET e, se quiser, ANTHROPIC_API_KEY
npm run setup             # cria o banco e carrega dados de demonstração
npm run dev               # http://localhost:3000
```

Contas de demonstração (senha `inovatea123`):
- Responsável: `responsavel@inovatea.app`
- Profissional: `profissional@inovatea.app`

Código de acesso da criança de exemplo: `LUCAS1`.

Para produção, troque o `provider` em `prisma/schema.prisma` para `postgresql` e defina `DATABASE_URL` e `AUTH_SECRET`.

## Estrutura

```
prisma/schema.prisma          Modelo de dados (usuários, pacientes, sessões, avaliações…)
src/lib/activities.ts         Catálogo de atividades e conteúdo dos quizzes
src/lib/gamification.ts       Regras de pontos e níveis
src/lib/stats.ts              Indicadores de evolução
src/lib/teabot.ts               Robô de conversa (Claude + modo roteirizado)
src/app/(site)/               Área de responsáveis e profissionais
src/app/crianca/[id]/         Modo criança e atividades
src/app/api/                  Registro de sessões e conversa
src/components/kid/           Jogos, quiz, conversa e tela de resultado
```

## Privacidade (LGPD)
Os dados de saúde só ficam visíveis para o responsável e para os profissionais que ele vincular.
O cadastro exige consentimento explícito. Antes de usar com pacientes reais, revise a política de
privacidade, a hospedagem e os contratos com os operadores de dados.

---
Desenvolvido para uso clínico e familiar no acompanhamento do TEA.
