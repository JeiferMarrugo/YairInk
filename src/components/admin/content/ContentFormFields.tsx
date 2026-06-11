"use client";

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  multiline?: boolean;
  rows?: number;
};

export function Field({
  label,
  value,
  onChange,
  hint,
  multiline,
  rows = 3,
}: FieldProps) {
  const inputClass =
    "mt-1.5 w-full border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30";

  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.12em] text-black/50">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
      {hint && <p className="mt-1 text-[10px] text-black/40">{hint}</p>}
    </label>
  );
}

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-black/10 bg-white p-5">
      <h2 className="font-serif text-xl">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-black/50">{description}</p>
      )}
      <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

export function SaveBar({
  saving,
  onSave,
  label = "GUARDAR CAMBIOS",
}: {
  saving: boolean;
  onSave: () => void;
  label?: string;
}) {
  return (
    <div className="sticky bottom-0 z-10 flex justify-end border-t border-black/10 bg-off-white/95 px-6 py-4 backdrop-blur-sm">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="bg-black px-8 py-3 text-[10px] tracking-[0.15em] text-white transition-colors hover:bg-black/80 disabled:opacity-50"
      >
        {saving ? "GUARDANDO..." : label}
      </button>
    </div>
  );
}

export function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-[10px] tracking-[0.12em] transition-colors ${
        active
          ? "bg-black text-white"
          : "border border-black/10 bg-white text-black/60 hover:border-black/30"
      }`}
    >
      {children}
    </button>
  );
}
