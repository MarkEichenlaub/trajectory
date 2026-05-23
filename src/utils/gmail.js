export function openGmailDraft({ to, subject, body }) {
  const params = new URLSearchParams({ view: 'cm', to, su: subject, body })
  window.open(`https://mail.google.com/mail/?${params.toString()}`, '_blank')
}

export function buildEmailBody(student, problems) {
  const lines = [
    `Hi ${student.name},`,
    '',
    `Here are some problems for you to work on:`,
    '',
  ]
  problems.forEach((p, i) => {
    lines.push(`${i + 1}. ${p.name} (IPhO ${p.year} ${p.label})`)
    lines.push(`   Problem: ${p.problemUrl}`)
    if (p.solutionUrl) lines.push(`   Solution: ${p.solutionUrl}`)
    lines.push('')
  })
  lines.push('Let me know if you have questions!')
  return lines.join('\n')
}
