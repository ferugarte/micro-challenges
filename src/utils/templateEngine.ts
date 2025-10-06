
// src/utils/templateEngine.ts
type Profile = {
  age?: number;
  interests?: string[];
  role?: 'child'|'mentor';
};

type Challenge = {
  id: string;
  title: string;
  text: string;
  hint?: string;
  options?: string[];
  solution?: string;
  interest?: string;
  audience?: string;
  ageMin?: number;
  ageMax?: number;
  difficulty?: number;
  premium?: boolean;
};

// Small token dictionaries per interest
const vocab: Record<string, Record<string, string[]>> = {
  sports: {
    sport: ['fútbol','básquet','handball','tenis','atletismo'],
    action: ['correr','saltar','pasar','patear','lanzar'],
    place: ['cancha','gimnasio','estadio','pista']
  },
  animals: {
    animal: ['perro','gato','loro','delfín','zorro'],
    sound: ['ladra','maúlla','chilla','silba','aúlla'],
    habitat: ['bosque','selva','río','mar','sabana']
  },
  videogames: {
    genre: ['plataformas','aventura','estrategia','deportes','carreras'],
    item: ['monedas','vidas','puntos','gemas']
  },
  music: {
    instrument: ['guitarra','piano','batería','violín','flauta'],
    tempo: ['adagio','andante','allegro']
  },
  math_basic: {
    obj: ['figuras','puntos','fichas','monedas']
  }
};

const TOKEN_RE = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random()*arr.length)];
}

/**
 * Fill tokens like {{sport}} or {{animal}} with words chosen
 * from vocab by interest. If a token key is missing, it is left as-is.
 */
export function fillTokens(text: string, interest?: string): string {
  if (!text) return text;
  return text.replace(TOKEN_RE, (_, key) => {
    const buckets = interest && vocab[interest] || undefined;
    if (buckets && buckets[key] && buckets[key].length) return pickRandom(buckets[key]);
    // global fallback: some generic pools
    const global: Record<string,string[]> = {
      color: ['rojo','azul','verde','amarillo'],
      shape: ['círculo','triángulo','cuadrado','estrella'],
    };
    if (global[key] && global[key].length) return pickRandom(global[key]);
    return `{{${key}}}`; // keep token if unknown
  });
}

/**
 * Apply template filling to a challenge object (text/hint/options).
 * Returns a shallow-cloned challenge.
 */
export function materializeChallenge(ch: Challenge): Challenge {
  const interest = ch.interest;
  const out: Challenge = { ...ch };
  if (typeof out.text === 'string') out.text = fillTokens(out.text, interest);
  if (typeof out.hint === 'string') out.hint = fillTokens(out.hint, interest);
  if (Array.isArray(out.options)) out.options = out.options.map(o => fillTokens(String(o), interest));
  if (typeof out.solution === 'string') out.solution = fillTokens(out.solution, interest);
  return out;
}

/**
 * Bulk apply materialization. Completely safe: if there are no tokens, items remain untouched.
 */
export function applyTemplates(list: Challenge[]): Challenge[] {
  if (!Array.isArray(list)) return list;
  return list.map(materializeChallenge);
}
