import React from "react";
import taxonomy from "@/data/taxonomy.json";
import { useProfile } from "@/store/useProfile";
import { recommendChallenges } from "@/lib/recommend";

export default function Onboarding() {
  const { age, interests, setAge, toggleInterest, setPlaylist } = useProfile();
  const [step, setStep] = React.useState<1|2>(1);

  function next() {
    if (step===1 && age && age>0) setStep(2);
    else if (step===2 && age) {
      const picks = recommendChallenges(age, interests, 2);
      setPlaylist(picks);
      // navegar a home o dashboard
      // router.push("/dashboard");
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      {step===1 && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">¿Qué edad tienes?</h1>
          <input
            type="number" min={6} max={120}
            className="w-full border rounded-xl p-3"
            value={age ?? ""}
            onChange={e=>setAge(parseInt(e.target.value||"0",10))}
          />
          <button onClick={next} className="px-4 py-2 rounded-xl bg-black text-white">Continuar</button>
        </div>
      )}
      {step===2 && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Elige tus intereses</h1>
          <div className="flex flex-wrap gap-2">
            {taxonomy.interests.map((k:string)=>(
              <button
                key={k}
                onClick={()=>toggleInterest(k)}
                className={`px-3 py-2 rounded-xl border ${interests.includes(k) ? "bg-black text-white" : "bg-white"}`}
              >{k}</button>
            ))}
          </div>
          <button onClick={next} className="px-4 py-2 rounded-xl bg-black text-white">Comenzar</button>
        </div>
      )}
    </div>
  );
}