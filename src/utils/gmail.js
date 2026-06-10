export function openGmailDraft({ to, subject, body }) {
  const params = new URLSearchParams({ view: 'cm', to, su: subject, body })
  window.open(`https://mail.google.com/mail/?${params.toString()}`, '_blank')
}

function resourceLabel(p) {
  if (p.type === 'Book') return 'Book'
  if (p.type === 'Handout') return 'Handout'
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

export function buildEmailBody(student, problems) {
  const firstName = student.first_name || student.name.split(' ')[0]
  const opener = OPENING_LINES[Math.floor(Math.random() * OPENING_LINES.length)](firstName)
  const lines = [opener, '']
  problems.forEach((p, i) => {
    const isResource = p.type === 'Book' || p.type === 'Handout'
    const header = isResource
      ? `${i + 1}. ${p.name} (${p.contest})`
      : `${i + 1}. ${p.name} (${p.contest} ${p.year} ${p.label})`
    lines.push(header)
    if (p.assignmentNote) lines.push(`   ${p.assignmentNote}`)
    if (p.problemUrl) lines.push(`   ${resourceLabel(p)}: ${p.problemUrl}`)
    lines.push('')
  })
  lines.push('-Mark')
  return lines.join('\n')
}
