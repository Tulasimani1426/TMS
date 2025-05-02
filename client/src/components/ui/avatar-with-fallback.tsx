import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface AvatarWithFallbackProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export function AvatarWithFallback({ 
  src, 
  alt, 
  className,
  fallbackClassName
}: AvatarWithFallbackProps) {
  const initials = getInitials(alt);
  
  return (
    <Avatar className={className}>
      {src ? <AvatarImage src={src} alt={alt} /> : null}
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  );
}
