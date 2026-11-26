import { siteConfig } from "@/lib/site";

type PlayLinkProps = {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
};

export function PlayLink({
  className,
  children = siteConfig.playNavLabel,
  onClick,
}: PlayLinkProps) {
  return (
    <a
      href={siteConfig.playUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
    >
      {children}
      <span className="sr-only"> (early preview, opens in a new tab)</span>
    </a>
  );
}
