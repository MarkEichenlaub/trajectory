-- Set PDF URLs on all historical invoices (Supabase public storage)
DO $$
DECLARE base text := 'https://nxvtaxbntqhcfqtazbnt.supabase.co/storage/v1/object/public/invoice-pdfs/';
BEGIN
  UPDATE public.invoices SET stripe_invoice_url = base || 'leo/Invoice_1_2026-04-03.pdf'
    WHERE student_id = 'leo' AND created_at::date = '2026-04-03' AND status = 'paid';

  UPDATE public.invoices SET stripe_invoice_url = base || 'borna/2026-03-10.pdf'
    WHERE student_id = 'borna' AND created_at::date = '2026-03-10';
  UPDATE public.invoices SET stripe_invoice_url = base || 'borna/2026-03-12.pdf'
    WHERE student_id = 'borna' AND created_at::date = '2026-03-12';
  UPDATE public.invoices SET stripe_invoice_url = base || 'borna/2026-03-29.pdf'
    WHERE student_id = 'borna' AND created_at::date = '2026-03-29';
  UPDATE public.invoices SET stripe_invoice_url = base || 'borna/2026-04-06.pdf'
    WHERE student_id = 'borna' AND created_at::date = '2026-04-06';
  UPDATE public.invoices SET stripe_invoice_url = base || 'borna/2026-04-10.pdf'
    WHERE student_id = 'borna' AND created_at::date = '2026-04-10';
  UPDATE public.invoices SET stripe_invoice_url = base || 'borna/2026-04-20.pdf'
    WHERE student_id = 'borna' AND created_at::date = '2026-04-20';
  UPDATE public.invoices SET stripe_invoice_url = base || 'borna/2026-04-26.pdf'
    WHERE student_id = 'borna' AND created_at::date = '2026-04-26';
  UPDATE public.invoices SET stripe_invoice_url = base || 'borna/2026-05-04.pdf'
    WHERE student_id = 'borna' AND created_at::date = '2026-05-04';
  UPDATE public.invoices SET stripe_invoice_url = base || 'borna/2026-05-11.pdf'
    WHERE student_id = 'borna' AND created_at::date = '2026-05-11';
  UPDATE public.invoices SET stripe_invoice_url = base || 'borna/2026-05-24.pdf'
    WHERE student_id = 'borna' AND created_at::date = '2026-05-24';
  UPDATE public.invoices SET stripe_invoice_url = base || 'borna/2026-05-28.pdf'
    WHERE student_id = 'borna' AND created_at::date = '2026-05-28';
END $$;
