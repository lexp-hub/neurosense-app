const INITIAL_PROMPT = 'Inizia. Fammi la prima domanda.';

const DEMO_KNOWLEDGE = [
  {
    guess: 'Pikachu',
    checks: [
      (answers) => answers[0] === 'Si',
      (answers) => answers[1] === 'No',
      (answers) => answers[2] === 'No',
    ],
  },
  {
    guess: 'Harry Potter',
    checks: [
      (answers) => answers[0] === 'Si',
      (answers) => answers[1] === 'Si',
      (answers) => answers[2] === 'No',
    ],
  },
  {
    guess: 'Spider-Man',
    checks: [
      (answers) => answers[0] === 'Si',
      (answers) => answers[1] === 'Si',
      (answers) => answers[2] === 'Si',
    ],
  },
  {
    guess: 'Lionel Messi',
    checks: [
      (answers) => answers[0] === 'No',
      (answers) => answers[1] === 'Si',
      (answers) => answers[2] === 'No',
    ],
  },
  {
    guess: 'Gatto',
    checks: [
      (answers) => answers[0] === 'No',
      (answers) => answers[1] === 'No',
      (answers) => answers[2] === 'Si',
    ],
  },
  {
    guess: 'Pizza',
    checks: [
      (answers) => answers[0] === 'No',
      (answers) => answers[1] === 'No',
      (answers) => answers[2] === 'No',
    ],
  },
];

const DEMO_QUESTIONS = [
  {
    question: 'Stai pensando a un personaggio inventato?',
    reaction: 'Partiamo con una domanda semplice.',
  },
  {
    question: 'Quel soggetto e umano?',
    reaction: 'Bene, sto gia restringendo il campo.',
  },
  {
    question: 'E famoso soprattutto per avere poteri o per combattere?',
    reaction: 'Ancora qualche indizio e provo a espormi.',
  },
  {
    question: 'Compare soprattutto in film, serie, anime o videogiochi?',
    reaction: 'Adesso il quadro si sta facendo piu chiaro.',
  },
  {
    question: 'E molto conosciuto anche da chi non segue quel mondo?',
    reaction: 'Sto capendo quanto sia iconico davvero.',
  },
  {
    question: 'Ha un aspetto molto riconoscibile?',
    reaction: 'Ultimo giro di indizi e poi provo a indovinare.',
  },
];

const normalizeAnswer = (value) => {
  if (!value) return 'Non lo so';
  const v = value.trim().toLowerCase();
  if (v === 'sì' || v === 'si') {
    return 'Si';
  }

  if (v === 'no') {
    return 'No';
  }

  return 'Non lo so';
};

const getUserAnswers = (history) =>
  (history || [])
    .filter((entry) => entry.role === 'user')
    .map((entry) => entry.content)
    .filter((value) => value !== INITIAL_PROMPT)
    .map(normalizeAnswer);

const buildFallbackGuess = (answers) => {
  if (answers.includes('Non lo so')) {
    return {
      question: '',
      isGuess: true,
      guess: 'mistero cosmico con scarsa collaborazione umana',
      reaction: 'Con cosi pochi indizi posso solo tentare un colpo di fantasia.',
    };
  }

  return {
    question: '',
    isGuess: true,
    guess: 'qualcosa fuori dal dataset demo',
    reaction: 'Sei uscito dal piccolo dataset demo, quindi qui vado a intuito.',
  };
};

export const isDemoModeEnabled = () =>
  typeof window !== 'undefined' &&
  window.location.hostname.includes('github.io');

export const getDemoNextTurn = (history) => {
  const answers = getUserAnswers(history);
  const currentStep = answers.length;

  if (currentStep < DEMO_QUESTIONS.length) {
    return {
      ...DEMO_QUESTIONS[currentStep],
      isGuess: false,
      guess: '',
    };
  }

  const match = DEMO_KNOWLEDGE.find((entry) =>
    entry.checks.every((check) => check(answers)),
  );

  if (match) {
    return {
      question: '',
      isGuess: true,
      guess: match.guess,
      reaction: 'Demo o non demo, la lettura neurale resta imbarazzantemente efficace.',
    };
  }

  return buildFallbackGuess(answers);
};
