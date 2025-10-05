import mobileAds, { RewardedAd, RewardedAdEventType, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const REWARDED_ID = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

export async function initAds() {
  await mobileAds().initialize();
}

export async function showHintRewarded(): Promise<boolean> {
  return new Promise((resolve) => {
    const rewarded = RewardedAd.createForAdRequest(REWARDED_ID);
    let reward = false;
    rewarded.onAdEvent((type, error) => {
      if (type === RewardedAdEventType.EARNED_REWARD) reward = true;
      if (type === AdEventType.CLOSED) resolve(reward);
      if (error) resolve(false);
    });
    rewarded.load();
    setTimeout(() => rewarded.show().catch(() => resolve(false)), 800);
  });
}
