export function shuffle(values, rng = Math.random) {
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function weightedAllocation(weights, total) {
  const entries = Object.entries(weights);
  const raw = entries.map(([domain, weight]) => ({ domain, raw: Number(weight) * total / 100 }));
  const base = raw.map(item => ({ ...item, count: Math.floor(item.raw), remainder: item.raw - Math.floor(item.raw) }));
  let assigned = base.reduce((sum, item) => sum + item.count, 0);
  base.sort((a, b) => b.remainder - a.remainder || b.raw - a.raw || a.domain.localeCompare(b.domain));
  for (let i = 0; assigned < total; i = (i + 1) % base.length) {
    base[i].count += 1;
    assigned += 1;
  }
  return Object.fromEntries(base.sort((a,b)=>entries.findIndex(([d])=>d===a.domain)-entries.findIndex(([d])=>d===b.domain)).map(item => [item.domain, item.count]));
}

export function sampleWeightedExam(questions, weights, total = 200, rng = Math.random) {
  const allocation = weightedAllocation(weights, total);
  const picked = [];
  for (const [domain, count] of Object.entries(allocation)) {
    const pool = questions.filter(q => q.domain === domain);
    if (pool.length < count) throw new Error(`Not enough questions in ${domain}: need ${count}, have ${pool.length}`);
    picked.push(...shuffle(pool, rng).slice(0, count));
  }
  return shuffle(picked, rng);
}

export function sampleSectionExam(questions, domain, count, rng = Math.random) {
  const pool = questions.filter(q => q.domain === domain);
  if (!pool.length) throw new Error(`No questions for ${domain}`);
  const size = count === 'all' ? pool.length : Math.min(Number(count), pool.length);
  return shuffle(pool, rng).slice(0, size);
}

export function buildOptionOrders(questions, rng = Math.random) {
  // Balance the displayed correct answer positions, then randomize their sequence.
  // For a 200-question exam this guarantees exactly 50 A / 50 B / 50 C / 50 D.
  const targetPositions = shuffle(questions.map((_, i) => i % 4), rng);
  return Object.fromEntries(questions.map((q, index) => {
    const target = targetPositions[index];
    const distractors = shuffle(q.options.map((_, i) => i).filter(i => i !== q.answer), rng);
    const order = [...distractors];
    order.splice(target, 0, q.answer);
    return [q.id, order];
  }));
}

export function scoreExam(examQuestions, answers) {
  const perDomain = {};
  let correct = 0;
  let answered = 0;
  for (const q of examQuestions) {
    if (!perDomain[q.domain]) perDomain[q.domain] = { correct: 0, answered: 0, total: 0 };
    const bucket = perDomain[q.domain];
    bucket.total += 1;
    const selected = answers[q.id];
    if (selected !== undefined && selected !== null) {
      answered += 1;
      bucket.answered += 1;
      if (Number(selected) === q.answer) {
        correct += 1;
        bucket.correct += 1;
      }
    }
  }
  return {
    correct,
    answered,
    unanswered: examQuestions.length - answered,
    total: examQuestions.length,
    percent: examQuestions.length ? Math.round(correct / examQuestions.length * 1000) / 10 : 0,
    perDomain,
  };
}
