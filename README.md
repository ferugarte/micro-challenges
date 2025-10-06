
# Lote 4 — Motor de plantillas (SAFE)

Este paquete agrega un motor **opcional** para convertir tokens `{{token}}`
en las preguntas (texto/hints/opciones) según el **interest** del reto.
Es 100% **retrocompatible**: si no hay tokens, no cambia nada.

## Archivos
- `src/utils/templateEngine.ts` — funciones:
  - `fillTokens(text, interest)`
  - `materializeChallenge(ch)`
  - `applyTemplates(list)`

## Cómo conectarlo sin romper nada
En `src/store/useGameStore.ts`, dentro de `bootstrap()` donde cargas `localChallenges`,
aplica las plantillas **después** de tener el array final (local+remoto), así:

```ts
// 1) Importa el motor
import { applyTemplates } from '../utils/templateEngine';

// 2) Después de tener "finalList" (tu lista de retos) haz:
const personalized = applyTemplates(finalList);

// 3) Usa "personalized" en lugar de "finalList"
set({ challenges: personalized, todaysId: pickToday(personalized) });
```

> Si falla el import o algo no existe, el store seguirá funcionando con la lista original,
> porque `applyTemplates` es una simple transformación y podés envolverla con `try/catch`:

```ts
let finalList = merged; // o localChallenges
try {
  const { applyTemplates } = require('../utils/templateEngine');
  finalList = applyTemplates(merged);
} catch {}
```

## Tokens disponibles
Dependen del `interest` del reto:
- sports: `{{sport}}`, `{{action}}`, `{{place}}`
- animals: `{{animal}}`, `{{sound}}`, `{{habitat}}`
- videogames: `{{genre}}`, `{{item}}`
- music: `{{instrument}}`, `{{tempo}}`
- math_basic: `{{obj}}`
- global: `{{color}}`, `{{shape}}`

## Ejemplo de reto con tokens
```json
{
  "id": "TMP_001",
  "title": "Cuenta en contexto",
  "interest": "sports",
  "audience": "child",
  "ageMin": 7,
  "ageMax": 12,
  "difficulty": 1,
  "text": "En {{place}} hay 5 {{obj}} de color {{color}}. Si sumas 3 más, ¿cuántos hay?",
  "options": ["6","7","8","9"],
  "correct": 3,
  "hint": "Piensa en sumar objetos en la {{place}}"
}
```

Al mostrarlo, `{{place}}` podría volverse “cancha”, `{{obj}}` “puntos” y `{{color}}` “rojo”.
