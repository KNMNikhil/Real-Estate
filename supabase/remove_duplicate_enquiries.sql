-- One-time cleanup: if the same person sent the same kind of request to the
-- same consultant more than once, keep the earliest and delete the extras.
delete from public.appointments a
using public.appointments b
where a.consultant_id = b.consultant_id
  and a.customer_id   = b.customer_id
  and a.kind          = b.kind
  and (a.appointment_date, a.created_at, a.id) > (b.appointment_date, b.created_at, b.id);
