"use client";

import * as RadixAvatar from "@radix-ui/react-avatar";

type AvatarProps = {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
};

export default function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  className = "",
}: AvatarProps) {
  return (
    <RadixAvatar.Root
      className={`inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-beige align-middle ${sizes[size]} ${className}`}
    >
      {src && (
        <RadixAvatar.Image
          src={src}
          alt={alt ?? fallback}
          className="h-full w-full object-cover grayscale"
        />
      )}
      <RadixAvatar.Fallback
        delayMs={200}
        className="flex h-full w-full items-center justify-center bg-black font-medium text-white"
      >
        {fallback}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}

export function avatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e8e0d4&textColor=000000`;
}
