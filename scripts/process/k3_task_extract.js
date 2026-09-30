import { sha256Text } from './stable_json.js';

const TASK_HEADING = /^#+[ \t]+Task[ \t]+([0-9]+)(?:[^0-9]|$)/;

function logicalLines(text) {
  const lines = text.split('\n');
  if (lines.length > 0 && lines.at(-1) === '') lines.pop();
  return lines;
}

function scanTaskHeadings(planText) {
  let inFence = false;
  const headings = [];
  const lines = logicalLines(planText);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.startsWith('```')) inFence = !inFence;
    if (inFence) continue;
    const match = line.match(TASK_HEADING);
    if (match) headings.push({ index, taskId: Number(match[1]), line });
  }
  return { lines, headings };
}

export function extractTask(planText, taskId) {
  if (!Number.isInteger(taskId) || taskId < 1) {
    throw new Error(`TASK_PACKET_COMPILE_BLOCKED invalid task id: ${taskId}`);
  }
  const { lines, headings } = scanTaskHeadings(planText);
  const matches = headings.filter((heading) => heading.taskId === taskId);
  if (matches.length === 0) {
    throw new Error(`TASK_PACKET_COMPILE_BLOCKED Task ${taskId} not found`);
  }
  if (matches.length > 1) {
    throw new Error(`TASK_PACKET_COMPILE_BLOCKED duplicate Task ${taskId} headings`);
  }

  const start = matches[0].index;
  const next = headings.find((heading) => heading.index > start);
  const end = next ? next.index : lines.length;
  return `${lines.slice(start, end).join('\n')}\n`;
}

export function taskSourceDigest(taskText) {
  return sha256Text(taskText);
}
