import { Badge } from "./badge"
import { AlertTriangle } from "lucide-react"

export function WarningBadge({ message }: { message: string }) {
  return (
    <Badge variant="destructive" className="animate-pulse">
      <AlertTriangle className="w-3 h-3 mr-1" />
      {message}
    </Badge>
  )
}
