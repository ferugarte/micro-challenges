import Purchases from 'react-native-purchases';
import { useGameStore } from '../store/useGameStore';

const RC_API_KEY = __DEV__ ? 'revenuecat_public_sdk_key_sandbox' : 'revenuecat_public_sdk_key_prod';
const ENTITLEMENT_ID = 'premium';

export async function initPurchases() {
  await Purchases.configure({ apiKey: RC_API_KEY });
  const info = await Purchases.getCustomerInfo();
  const active = !!info.entitlements.active[ENTITLEMENT_ID];
  useGameStore.getState().setPremium(active);
}

export async function purchasePremium() {
  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages?.[0];
  if (!pkg) return;
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  const active = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
  useGameStore.getState().setPremium(active);
}

export async function restore() {
  const { customerInfo } = await Purchases.restorePurchases();
  const active = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
  useGameStore.getState().setPremium(active);
}
