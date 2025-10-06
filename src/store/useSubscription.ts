import { create } from "zustand";

type SubState = {
  isPro: boolean;
  trialUsedThisMonth: number; // actividades premium consumidas
  monthKey: string; // YYYY-MM
};

type Actions = {
  startTrialUse: ()=>boolean; // true si permite consumir 1 premium
  setPro: (v:boolean)=>void;
  resetIfNewMonth: ()=>void;
};

function currentMonthKey(){
  const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}

export const useSubscription = create<SubState & Actions>((set, get)=>({
  isPro: false,
  trialUsedThisMonth: 0,
  monthKey: currentMonthKey(),
  resetIfNewMonth: ()=>{
    const now = currentMonthKey();
    if (get().monthKey!==now) set({monthKey: now, trialUsedThisMonth: 0});
  },
  startTrialUse: ()=>{
    const s = get(); s.resetIfNewMonth?.();
    if (s.isPro) return true;
    if (s.trialUsedThisMonth < 3) { set({trialUsedThisMonth: s.trialUsedThisMonth+1}); return true; }
    return false;
  },
  setPro: (v)=> set({isPro: v})
}));