/**
 * Is the device an iOS device
 */
export const isIOS = () => {
  return (
    navigator.platform &&
    (/iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
  );
};
