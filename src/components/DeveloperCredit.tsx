import DeveloperLogo from "@/components/DeveloperLogo";

type DeveloperCreditProps = {
  /** Fondo de la barra de crédito */
  barClassName?: string;
  /** Color del texto y logo (usa currentColor en el SVG) */
  textClassName?: string;
  /** Logo blanco sobre fondo oscuro */
  logoInverted?: boolean;
  label?: string;
  href?: string;
};

export default function DeveloperCredit({
  barClassName = "bg-black text-white",
  textClassName = "text-white/80",
  logoInverted = true,
  label = "DESARROLLADO POR",
  href,
}: DeveloperCreditProps) {
  const content = (
    <>
      <span className={`text-[8px] tracking-[0.22em] ${textClassName}`}>
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visitar sitio del desarrollador"
          className="shrink-0 transition-opacity hover:opacity-75"
        >
          <DeveloperLogo
            className="h-[18px] w-[18px]"
            inverted={logoInverted}
          />
        </a>
      ) : (
        <DeveloperLogo
          className="h-[18px] w-[18px] shrink-0"
          inverted={logoInverted}
        />
      )}
    </>
  );

  return <div className={`flex items-center justify-center gap-2.5 px-6 py-3 ${barClassName}`}>{content}</div>;
}
