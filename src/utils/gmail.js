export function openGmailDraft({ to, subject, body }) {
  const params = new URLSearchParams({ view: 'cm', to, su: subject, body })
  window.open(`https://mail.google.com/mail/?${params.toString()}`, '_blank')
}

function resourceLabel(p) {
  if (p.type === 'Book') return 'Book'
  if (p.type === 'Handout') return 'Handout'
  return 'Problem'
}

export function buildEmailBody(student, problems) {
  const lines = [
    `Hi ${student.name},`,
    '',
    `Here are some problems for you to work on:`,
    '',
  ]
  problems.forEach((p, i) => {
    const isResource = p.type === 'Book' || p.type === 'Handout'
    const header = isResource
      ? `${i + 1}. ${p.name} (${p.contest})`
      : `${i + 1}. ${p.name} (${p.contest} ${p.year} ${p.label})`
    lines.push(header)
    if (p.assignmentNote) lines.push(`   ${p.assignmentNote}`)
    if (p.problemUrl) lines.push(`   ${resourceLabel(p)}: ${p.problemUrl}`)
    if (p.solutionUrl) lines.push(`   Solution: ${p.solutionUrl}`)
    lines.push('')
  })
  return lines.join('\n')
}
