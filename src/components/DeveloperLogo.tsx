import Image from "next/image";

type DeveloperLogoProps = {
  className?: string;
  title?: string;
  /** Convierte el logo negro a blanco (para fondos oscuros) */
  inverted?: boolean;
};

export default function DeveloperLogo({
  className = "h-5 w-5",
  title = "Logo del desarrollador",
  inverted = false,
}: DeveloperLogoProps) {
  return (
    <Image
      src="/images/developer-logo.png"
      alt={title}
      width={20}
      height={20}
      sizes="20px"
      className={`object-contain ${inverted ? "brightness-0 invert" : ""} ${className ?? ""}`}
      priority={false}
    />
  );
}
