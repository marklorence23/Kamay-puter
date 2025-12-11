// Simple answer key storage (you can move this to Firebase later)
const answerKeys = {
  'math-quiz-1': {
    name: 'Math Quiz 1',
    questions: [
      { id: 1, answer: '42', points: 10 },
      { id: 2, answer: '7', points: 10 },
      { id: 3, answer: '100', points: 10 },
      { id: 4, answer: '25', points: 10 },
      { id: 5, answer: '8', points: 10 }
    ],
    totalPoints: 50
  },
  'english-quiz-1': {
    name: 'English Quiz 1',
    questions: [
      { id: 1, answer: 'noun', points: 5 },
      { id: 2, answer: 'verb', points: 5 },
      { id: 3, answer: 'adjective', points: 5 },
      { id: 4, answer: 'adverb', points: 5 }
    ],
    totalPoints: 20
  }
};

export function getAnswerKey(testId) {
  return answerKeys[testId] || null;
}

export function getAllTests() {
  return Object.keys(answerKeys).map(key => ({
    id: key,
    name: answerKeys[key].name,
    totalQuestions: answerKeys[key].questions.length,
    totalPoints: answerKeys[key].totalPoints
  }));
}