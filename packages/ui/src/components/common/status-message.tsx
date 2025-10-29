import { AlertTriangle } from "lucide-react";
import { useRouter } from "@workspace/i18n/navigation";
import { Button } from "@workspace/ui/components/button";

interface StatusMessageProps {
  title: string;
  description: string;
  buttonText: string;
}

export function StatusMessage({
  title,
  description,
  buttonText,
}: StatusMessageProps) {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col justify-center gap-6 p-6">
      <div className="flex flex-col items-center text-center gap-6">
        <AlertTriangle className="h-16 w-16 text-primary" />
        <h1 className="text-2xl leading-none font-semibold text-center">
          {title}
        </h1>
        <p className="max-w-lg text-muted-foreground text-center">
          {description}
        </p>
      </div>
      <div className="flex justify-center">
        <Button size="lg" onClick={() => router.push("/")}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
