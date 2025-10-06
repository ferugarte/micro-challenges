import React from "react";
import { useSubscription } from "@/store/useSubscription";
import { track } from "@/lib/analytics";

type Props = {
  open: boolean;
  onClose: () => void;
  source?: string; // dónde se mostró (ej: "trial_limit_reached")
};

export default function PaywallModal({ open, onClose, source }: Props) {
  const { setPro } = useSubscription();

  React.useEffect(() => {
    if (open) track("paywall_view", { source });
  }, [open, source]);

  if (!open) return null;

  function startSubscribe() {
    track("subscribe_click", { source });
    // aquí va tu integración real de pago
    // mock ok:
    setTimeout(() => {
      setPro(true);
      track("subscribe_success", { source });
      onClose();
    }, 300);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-2">Desbloquea Premium</h2>
        <p className="text-sm text-gray-600 mb-4">
          Accede a <strong>tracks avanzados</strong>, dificultad adaptativa,
          y <strong>estadísticas detalladas</strong>. Prueba gratis 3 actividades premium por mes.
        </p>

        <ul className="list-disc ml-5 text-sm space-y-1 mb-6">
          <li>Contenido premium completo (STEM, Artes, Cognitivo)</li>
          <li>Más explicaciones y feedback</li>
          <li>Progresión y retos exclusivos</li>
        </ul>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">
            Más tarde
          </button>
          <button
            onClick={startSubscribe}
            className="px-4 py-2 rounded-xl bg-black text-white"
          >
            Suscribirme
          </button>
        </div>
      </div>
    </div>
  );
}