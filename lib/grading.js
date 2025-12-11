import Fuse from 'fuse.js';

// Fuzzy matching for answers (handles minor spelling errors)
export function compareAnswers(studentAnswer, correctAnswer, threshold = 0.8) {
  // Normalize strings
    const normalize = (str = '') => String(str).toLowerCase().trim().replace(/[^\w\s]/g, '');
  
  const student = normalize(studentAnswer);
  const correct = normalize(correctAnswer);
  
  // Exact match
  if (student === correct) return { match: true, similarity: 1.0 };
  
  // Fuzzy match using Fuse
  const fuse = new Fuse([correct], { threshold: 1 - threshold });
  const result = fuse.search(student);
  
  if (result.length > 0) {
    const similarity = 1 - (result[0].score || 0);
    return { match: similarity >= threshold, similarity };
  }
  
  return { match: false, similarity: 0 };
}

export function gradeTest(recognizedAnswers, answerKey) {
  let totalScore = 0;
  let maxScore = answerKey.totalPoints;
  const results = [];
  
  answerKey.questions.forEach((question, index) => {
    const studentAnswer = recognizedAnswers[index] || '';
    const comparison = compareAnswers(studentAnswer, question.answer);
    
    const points = comparison.match ? question.points : 0;
    totalScore += points;
    
    results.push({
      questionId: question.id,
      correctAnswer: question.answer,
      studentAnswer: studentAnswer,
      isCorrect: comparison.match,
      similarity: comparison.similarity,
      pointsEarned: points,
      maxPoints: question.points
    });
  });
  
  const percentage = (totalScore / maxScore) * 100;
  const letterGrade = getLetterGrade(percentage);
  
  return {
    totalScore,
    maxScore,
    percentage: Math.round(percentage),
    letterGrade,
    results
  };
}

export function getLetterGrade(percentage) {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
}

export function generateFeedback(gradingResult) {
  const { percentage, results } = gradingResult;
  
  const incorrect = results.filter(r => !r.isCorrect);
  const feedback = [];
  
  if (percentage >= 90) {
    feedback.push('Excellent work! You demonstrated strong understanding.');
  } else if (percentage >= 75) {
    feedback.push('Good job! You have a solid grasp of the material.');
  } else if (percentage >= 60) {
    feedback.push('Fair performance. Review the topics you missed.');
  } else {
    feedback.push('Needs improvement. Please review the material thoroughly.');
  }
  
  if (incorrect.length > 0) {
    feedback.push(`You missed ${incorrect.length} question(s).`);
    incorrect.forEach(q => {
      feedback.push(`Question ${q.questionId}: Your answer "${q.studentAnswer}" should be "${q.correctAnswer}"`);
    });
  }
  
  return feedback;
}
