import { create } from "zustand";

export type Profile = {
  age: number|null;
  interests: string[];
  playlist: string[]; // challenge IDs sugeridos
};

type Actions = {
  setAge: (n:number)=>void;
  toggleInterest: (k:string)=>void;
  setPlaylist: (ids:string[])=>void;
  reset: ()=>void;
};

export const useProfile = create<Profile & Actions>((set, get)=>({
  age: null,
  interests: [],
  playlist: [],
  setAge: (n)=> set({age:n}),
  toggleInterest: (k)=> {
    const xs = new Set(get().interests);
    xs.has(k) ? xs.delete(k) : xs.add(k);
    set({interests:[...xs]});
  },
  setPlaylist: (ids)=> set({playlist: ids}),
  reset: ()=> set({age:null, interests:[], playlist:[]})
}));