/**
 * Utility functions for question management
 */

/**
 * Verifies and fixes question subjects if needed
 * @param {Array} questions - The array of questions to process
 * @returns {Array} - The questions with verified subjects
 */
export const verifyQuestionSubjects = (questions) => {
  if (!Array.isArray(questions)) return [];
  
  return questions.map(q => {
    // If question has no subject or empty subject, set to General
    if (!q.subject || q.subject.trim() === '') {
      console.log(`Question "${q.question?.substring(0, 20)}..." had no subject, setting to General`);
      return { ...q, subject: 'General' };
    }
    return q;
  });
};

/**
 * Makes sure subjects in questions match the subjects in the list
 * @param {Array} questions - The questions to check
 * @param {Array} subjects - The list of valid subjects
 * @returns {Array} - Questions with verified subjects
 */
export const validateQuestionSubjects = (questions, subjects) => {
  if (!Array.isArray(questions) || !Array.isArray(subjects)) return questions;
  
  // Convert subjects to lowercase for case-insensitive comparison
  const lowerSubjects = subjects.map(s => s.toLowerCase());
  
  return questions.map(q => {
    const questionSubject = q.subject || 'General';
    
    // Check if the subject exists (case-insensitive)
    const subjectExists = lowerSubjects.includes(questionSubject.toLowerCase());
    
    if (!subjectExists) {
      console.warn(`Question has invalid subject: "${questionSubject}", defaulting to General`);
      return { ...q, subject: 'General' };
    }
    
    // Find the correct capitalization
    const subjectIndex = lowerSubjects.findIndex(s => s === questionSubject.toLowerCase());
    if (subjectIndex !== -1 && subjects[subjectIndex] !== questionSubject) {
      console.log(`Fixing subject capitalization from "${questionSubject}" to "${subjects[subjectIndex]}"`);
      return { ...q, subject: subjects[subjectIndex] };
    }
    
    return q;
  });
};
