// Adaptive Leitner-style spacing: a skill's `level` (0-5) drives BOTH how
// hard its problems are (generators.js reads the same level) and how long
// until it's due again. Getting a problem right at speed moves a skill up a
// box (harder problems, longer gap); a miss drops it two boxes (easier
// problems, due again soon) -- a bigger drop than the promotion step, on
// purpose, so a slip gets more reps before the gap stretches back out.
export const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30]
export const MAX_LEVEL = BOX_INTERVAL_DAYS.length - 1

// Skills only start offering timed drills once there's some raw automaticity
// to test -- timed mode below this would just be measuring how fast someone
// can fail, not the "fluency under the clock" the spec calls out.
export const TIMED_MODE_MIN_LEVEL = 3

export function nextLevel({ level, correct, mode, responseMs, timeTargetSec }) {
  if (!correct) return Math.max(0, level - 2)
  const metTimeTarget = mode !== 'timed' || responseMs == null || responseMs <= timeTargetSec * 1000
  return metTimeTarget ? Math.min(MAX_LEVEL, level + 1) : level
}

export function nextDueAt(level, from = new Date()) {
  const days = BOX_INTERVAL_DAYS[Math.max(0, Math.min(level, MAX_LEVEL))]
  return new Date(from.getTime() + days * 86400000).toISOString()
}

// Builds one drill session's problem queue: due skills first (round-robin,
// so it's interleaved rather than blocked one-skill-at-a-time), topped up
// with extra reps on whichever enabled skills are lowest-level if there
// aren't enough due skills to fill a short session.
export function buildSessionPlan({ enabledSkillIds, stateBySkill, targetCount = 8, mode = 'untimed' }) {
  const now = Date.now()
  const eligible = mode === 'timed'
    ? enabledSkillIds.filter(id => (stateBySkill[id]?.level ?? 0) >= TIMED_MODE_MIN_LEVEL)
    : enabledSkillIds

  const due = eligible.filter(id => {
    const st = stateBySkill[id]
    return !st || !st.next_due_at || new Date(st.next_due_at).getTime() <= now
  })
  const rest = eligible.filter(id => !due.includes(id))
    .sort((a, b) => (stateBySkill[a]?.level ?? 0) - (stateBySkill[b]?.level ?? 0))

  if (eligible.length === 0) return []

  const queue = []
  let i = 0
  // Round-robin over due skills first so consecutive problems interleave
  // skills rather than drilling one skill several times in a row.
  while (queue.length < targetCount && due.length > 0) {
    queue.push(due[i % due.length])
    i++
    if (i >= due.length * 2 && due.length > 0 && queue.length < targetCount) {
      // Every due skill has had 2 reps; stop over-repeating and top up instead.
      break
    }
  }
  let j = 0
  while (queue.length < targetCount && rest.length > 0) {
    queue.push(rest[j % rest.length])
    j++
  }
  // Still short (e.g. only one skill enabled) — repeat what's eligible.
  while (queue.length < targetCount && eligible.length > 0) {
    queue.push(eligible[queue.length % eligible.length])
  }
  return queue.slice(0, targetCount)
}
