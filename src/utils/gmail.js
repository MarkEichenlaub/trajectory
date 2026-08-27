export function openGmailDraft({ to, subject, body }) {
  const params = new URLSearchParams({ view: 'cm', to, su: subject, body })
  window.open(`https://mail.google.com/mail/?${params.toString()}`, '_blank')
}

const PORTAL_URL = 'https://portal.eichenlaubphysics.com'

function resourceLabel(p) {
  if (p.type === 'Book') return 'Book'
  if (p.type === 'Handout') return 'Handout'
  if (p.type === 'Exam') return 'Test PDF'
  return 'Problem'
}

const OPENING_LINES = [
  (name) => `Hi ${name}, Here are some problems I put together for you for next time:`,
  (name) => `Hi ${name}, These problems should get you ready for our next session:`,
  (name) => `Hi ${name}, Here's a set of problems to work through before we meet again:`,
  (name) => `Hi ${name}, I picked out these problems for you to try before next time:`,
  (name) => `Hi ${name}, Here are some problems to work on for our next session:`,
  (name) => `Hi ${name}, These are the problems I'd like you to work through for next time:`,
  (name) => `Hi ${name}, I put together a few problems for you for our next session:`,
  (name) => `Hi ${name}, Here are your problems for next time — good luck!`,
  (name) => `Hi ${name}, Here's your problem set for the next session:`,
  (name) => `Hi ${name}, Take a look at these problems before our next meeting:`,
  (name) => `Hi ${name}, Here are some problems to keep you sharp before we meet again:`,
  (name) => `Hi ${name}, I've lined up some problems for you to try for next time:`,
  (name) => `Hi ${name}, Here's what I'd like you to work on before our next session:`,
  (name) => `Hi ${name}, These problems will set you up well for our next class:`,
  (name) => `Hi ${name}, Here are a few problems I've selected for you for next time:`,
  (name) => `Hi ${name}, Here's your assignment for our next session:`,
  (name) => `Hi ${name}, I've put these problems together for you to work on before we meet:`,
  (name) => `Hi ${name}, Here are some physics problems for you to try before next time:`,
  (name) => `Hi ${name}, Here's a set of problems to tackle before our next session:`,
  (name) => `Hi ${name}, I'd like you to work through these problems before we meet again:`,
  (name) => `Hi ${name}, Here are the problems I've chosen for you for our next meeting:`,
  (name) => `Hi ${name}, These problems should be a great warm-up for our next session:`,
  (name) => `Hi ${name}, Here's some work to do before our next class:`,
  (name) => `Hi ${name}, I've put together this set of problems for you for next time:`,
  (name) => `Hi ${name}, Here are your problems to work on before our next session:`,
  (name) => `Hi ${name}, Take a crack at these before we meet next time:`,
  (name) => `Hi ${name}, Here are some problems to think about before our next session:`,
  (name) => `Hi ${name}, I've got a few problems lined up for you for next time:`,
  (name) => `Hi ${name}, Here are the problems I'd like you to try before we meet again:`,
  (name) => `Hi ${name}, Here's your next set of problems — see you soon!`,
]

// Covering note for a progress report. Addressed to whoever is on file for
// reports — usually the student and both parents — so it stays in the third
// person about the student rather than writing "you" at a mixed audience.
export function buildReportEmail(student, report) {
  const firstName = student.first_name || student.name.split(' ')[0]
  const subject = `${firstName}'s progress report — ${report.title}`
  const covered = report.sessions_covered
    ? `It covers our last ${report.sessions_covered} sessions`
    : 'It covers our sessions since the last report'
  const body = [
    `Hi all,`,
    ``,
    `${firstName}'s latest progress report is ready.`,
    ``,
    `${covered}, and includes what we've been working on, where ${firstName} is`,
    `making progress, the plan for the coming cycle, and an appendix listing every`,
    `session with a short summary of what we covered.`,
    ``,
    `Read it here:`,
    `  ${report.pdf_url}`,
    ``,
    `It's also in the portal under Progress and Plan, along with every earlier report:`,
    `  ${PORTAL_URL}/`,
    ``,
    `Happy to talk through any of it — just reply to this email.`,
    ``,
    `-Mark`,
  ].join('\n')
  return { subject, body }
}

// Closing block telling the student when we meet next and where to join. Times
// are shown in the student's own timezone, matching the session reminder email.
// Returns [] when there's no upcoming session on the books, so the email just
// ends after the problems.
function nextSessionLines(student, session) {
  if (!session?.scheduled_at) return []
  const when = new Date(session.scheduled_at).toLocaleString('en-US', {
    timeZone: student.timezone || 'America/New_York',
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  })
  const lines = [`Our next session is ${when}.`]
  if (session.meet_url) lines.push(`   Video call: ${session.meet_url}`)
  if (session.miro_board_url) lines.push(`   Whiteboard: ${session.miro_board_url}`)
  lines.push('')
  return lines
}

// `takeableExamIds` are exams that have been digitized into the portal's F=ma
// runner. Those get a link to the page the student actually sits the test on
// rather than to the exam PDF, which they can't answer on.
export function buildEmailBody(student, problems, takeableExamIds = new Set(), nextSession = null) {
  const firstName = student.first_name || student.name.split(' ')[0]
  const opener = OPENING_LINES[Math.floor(Math.random() * OPENING_LINES.length)](firstName)
  const lines = [opener, '']
  problems.forEach((p, i) => {
    const isResource = p.type === 'Book' || p.type === 'Handout' || p.type === 'Exam'
    const header = isResource
      ? `${i + 1}. ${p.name} (${p.contest})`
      : `${i + 1}. ${p.name} (${p.contest} ${p.year} ${p.label})`
    lines.push(header)
    if (p.assignmentNote) lines.push(`   ${p.assignmentNote}`)
    if (takeableExamIds.has(p.id)) {
      // The F=ma tab opens on whichever exam is assigned, so no deep link needed.
      lines.push(`   Take the test: ${PORTAL_URL}/fma-progress`)
    } else if (p.problemUrl) {
      lines.push(`   ${resourceLabel(p)}: ${p.problemUrl}`)
    }
    lines.push('')
  })
  lines.push(...nextSessionLines(student, nextSession))
  lines.push('-Mark')
  return lines.join('\n')
}
