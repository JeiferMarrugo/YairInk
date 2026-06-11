import Image from "next/image";

type PortfolioImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export default function PortfolioImage({
  src,
  alt,
  className = "",
  priority = false,
}: PortfolioImageProps) {
  return (
    <div className={`relative overflow-hidden bg-neutral-200 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover grayscale"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}
