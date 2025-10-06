import React from "react";
import { useProgress } from "@/store/useProgress";
import { getActivity } from "@/lib/activities";

type Props = { onOpenActivity: (id: string) => void };

export default function ContinueCard({ onOpenActivity }: Props) {
  const { lastActivityId } = useProgress();
  if (!lastActivityId) return null;

  const a = getActivity(lastActivityId);
  if (!a) return null;

  return (
    <div className="border rounded-2xl p-4 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">Continuar donde quedaste</div>
        <div className="font-semibold">{a.title}</div>
      </div>
      <button
        onClick={() => onOpenActivity(a.id)}
        className="px-4 py-2 rounded-xl bg-black text-white"
      >
        Continuar
      </button>
    </div>
  );
}