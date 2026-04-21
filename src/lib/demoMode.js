const INITIAL_PROMPT = 'Ok partiamo, fai la prima domanda.';

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
    question: 'Stai pensando a qualcosa che esiste soprattutto in universi pop o immaginari?',
    reaction: 'Modalita demo agganciata. Niente cloud, solo sinapsi locali ben calibrate.',
  },
  {
    question: 'Quel soggetto e umano?',
    reaction: 'Stringiamo il buffer. Prova a non sabotare il protocollo con risposte vaghe.',
  },
  {
    question: 'Quel soggetto e famoso soprattutto per combattimenti o poteri?',
    reaction: 'La traiettoria si pulisce. Ancora un paio di bit e ti leggo dentro.',
  },
];

const normalizeAnswer = (value) => {
  if (value === 'Sì' || value === 'Si') {
    return 'Si';
  }

  if (value === 'No') {
    return 'No';
  }

  return 'Non lo so';
};

const getUserAnswers = (history) =>
  history
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
      reaction: 'In demo mode fai il caotico, quindi improvviso. La colpa resta tua.',
    };
  }

  return {
    question: '',
    isGuess: true,
    guess: 'qualcosa fuori dal dataset demo',
    reaction: 'Hai superato il campione locale. Per la lettura completa serve il backend vero.',
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
