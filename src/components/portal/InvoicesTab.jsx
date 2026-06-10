import InvoiceList from './InvoiceList'

export default function InvoicesTab({ invoices, setInvoices, isAdmin }) {
  if (!invoices || invoices.length === 0) {
    return <div className="empty-state">No invoices yet.</div>
  }

  return (
    <div>
      <InvoiceList invoices={invoices} setInvoices={setInvoices} isAdmin={isAdmin} />
    </div>
  )
}
