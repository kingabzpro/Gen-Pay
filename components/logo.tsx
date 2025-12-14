import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: number;
  href?: string;
}

export function Logo({ className = "", showText = true, size = 32, href = "/" }: LogoProps) {
  const LogoContent = (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/Gen-Pay-Logo.svg"
        alt="GEN-PAY"
        width={size}
        height={size}
        className="shrink-0"
      />
      {showText && <span className="ml-2 text-2xl font-bold text-primary">GEN-PAY</span>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {LogoContent}
      </Link>
    );
  }

  return LogoContent;
}
