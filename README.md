# Micro‑Desafíos diarios (React Native / Expo)

MVP listo para ads recompensados (pistas) y suscripción Premium (sin anuncios + pistas ilimitadas + retos extra semanales).

## Quick start
```bash
npx create-expo-app@latest micro-challenges --template
# (elige Blank Typescript)
cd micro-challenges
npm i @react-navigation/native @react-navigation/native-stack zustand date-fns react-native-purchases
npx expo install react-native-screens react-native-safe-area-context react-native-google-mobile-ads @react-native-firebase/app @react-native-firebase/analytics expo-notifications
npx expo start
```

## Monetización
- **Gratis**: banner discreto opcional + **rewarded** para ver pistas.
- **Premium (suscripción)**: sin anuncios, pistas ilimitadas, retos extra.
- **Precios sugeridos** (ajusta según región/tienda):
  - Mensual: **USD 2.99**
  - Anual: **USD 14.99** (≈ 6 meses)
  - Ofrece **3–7 días de prueba gratuita** para iOS/Android.
- **Entitlement RevenueCat**: `premium`

**Paywall Copy (ES)**
- Título: _Desbloqueá tu mejor versión_
- Bullets:
  - Sin anuncios
  - Pistas ilimitadas
  - Nuevos retos cada semana
- CTA principal: **Activar Premium**
- CTA secundario: **Seguir con la versión gratis**
- Nota legal: _La suscripción se renueva automáticamente. Podés cancelarla cuando quieras desde la configuración de la tienda._

**Paywall Copy (EN)**
- Title: _Unlock Your Best_
- Bullets: _No ads • Unlimited hints • New weekly challenges_
- CTA: **Go Premium**
- Secondary: **Continue Free**

## Privacidad / Niños
- Parental gate para compras y enlaces externos.
- Ads solo bajo demanda (rewarded). Evitá intersticiales intrusivos.
- Analítica agregada, sin datos personales.
