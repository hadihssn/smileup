import { APPOINTMENT_STATUSES, type AppointmentRow } from "@/lib/appointments";
import type { ServiceOption } from "@/lib/services";

interface Props {
  action: (formData: FormData) => void | Promise<void>;
  services: ServiceOption[];
  defaultValues?: AppointmentRow;
  submitLabel: string;
  error?: string;
}

// Shared by both the "new appointment" and "edit appointment" pages —
// same fields either way, just different default values and submit
// target. Kept as a plain (non-client) component since it's static markup
// with defaultValue props; the Server Actions it posts to handle
// everything, no client-side state needed.
export function AppointmentForm({ action, services, defaultValues, submitLabel, error }: Props) {
  return (
    <form action={action} className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      {defaultValues && <input type="hidden" name="id" value={defaultValues.id} />}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-ink">Patient name</label>
          <input
            type="text"
            name="patientName"
            required
            defaultValue={defaultValues?.patientName}
            className="w-full rounded-lg border border-line px-3 py-2.5 font-[inherit] text-[14px]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-ink">Phone</label>
          <input
            type="tel"
            name="patientPhone"
            required
            defaultValue={defaultValues?.patientPhone}
            className="w-full rounded-lg border border-line px-3 py-2.5 font-[inherit] text-[14px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-ink">Service</label>
          <select
            name="serviceId"
            defaultValue={defaultValues?.serviceId ?? ""}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 font-[inherit] text-[14px]"
          >
            <option value="">No specific service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-ink">Status</label>
          <select
            name="status"
            defaultValue={defaultValues?.status ?? "confirmed"}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 font-[inherit] text-[14px] capitalize"
          >
            {APPOINTMENT_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-ink">Date</label>
          <input
            type="date"
            name="date"
            required
            defaultValue={defaultValues?.date}
            className="w-full rounded-lg border border-line px-3 py-2.5 font-[inherit] text-[14px]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-ink">Time</label>
          <input
            type="time"
            name="time"
            required
            defaultValue={defaultValues?.time?.slice(0, 5)}
            className="w-full rounded-lg border border-line px-3 py-2.5 font-[inherit] text-[14px]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-ink">
            Charge (PKR)
          </label>
          <input
            type="number"
            name="chargeAmount"
            min={0}
            step={1}
            placeholder="e.g. 3000"
            defaultValue={defaultValues?.chargeAmount ?? ""}
            className="w-full rounded-lg border border-line px-3 py-2.5 font-[inherit] text-[14px]"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-ink">
          Notes (optional)
        </label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={defaultValues?.notes ?? ""}
          className="w-full resize-y rounded-lg border border-line px-3 py-2.5 font-[inherit] text-[14px]"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <a
          href="/admin"
          className="rounded-lg border border-line bg-white px-4 py-2.5 text-[13.5px] font-semibold text-ink hover:bg-section"
        >
          Cancel
        </a>
        <button
          type="submit"
          className="rounded-lg bg-brand px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-brand-dark"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
