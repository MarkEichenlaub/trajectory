// Mirror the DB invariant trigger: an active student must keep >=1 verified
// meet recipient, >=1 invoice recipient, >=1 login-capable contact. These
// helpers identify the controls that would drop the last one (the trigger is
// the real guard).
export function makeContactLocks(contacts) {
  const verifiedMeetIds = contacts.filter(c => c.verified && c.receives_meets).map(c => c.id)
  const invoiceIds = contacts.filter(c => c.receives_invoices).map(c => c.id)
  const loginIds = contacts.filter(c => c.can_login).map(c => c.id)
  const isLastVerifiedMeet = (c) => verifiedMeetIds.length === 1 && verifiedMeetIds[0] === c.id
  const isLastInvoice = (c) => invoiceIds.length === 1 && invoiceIds[0] === c.id
  const isLastLogin = (c) => loginIds.length === 1 && loginIds[0] === c.id
  const deleteLocked = (c) => isLastVerifiedMeet(c) || isLastInvoice(c) || isLastLogin(c)
  const toggleLocked = (c, field) =>
    (field === 'receives_meets' && isLastVerifiedMeet(c)) ||
    (field === 'receives_invoices' && isLastInvoice(c))
  return { isLastVerifiedMeet, isLastInvoice, isLastLogin, deleteLocked, toggleLocked }
}
