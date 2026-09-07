export function masteryForDomain(domain, questions, state) {
  const domainQuestions = questions.filter((question) => question.domain === domain);
  if (!domainQuestions.length) return 0;
  const points = domainQuestions.reduce((total, question) => {
    if (state.mastered?.[question.id]) return total + 1;
    if (state.answer_map?.[question.id] === true) return total + 0.75;
    return total;
  }, 0);
  return Math.round((points / domainQuestions.length) * 100);
}
