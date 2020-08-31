/**
 * Default Device Id Chooser
 */
const defaultDeviceIdChooser = (
  filteredDevices: MediaDeviceInfo[],
  videoDevices: MediaDeviceInfo[],
  facingMode: string
) => {
  if (filteredDevices.length > 0) {
    return filteredDevices[0].deviceId;
  }
  if (videoDevices.length == 1 || facingMode == 'user') {
    return videoDevices[0].deviceId;
  }
  return videoDevices[1].deviceId;
};

/**
 * Get Facing Mode Pattern
 */
const getFacingModePattern = (facingMode: string) =>
  facingMode == 'environment' ? /rear|back|environment/gi : /front|user|face/gi;

/**
 * asdasd
 */
export const getDeviceId = (facingMode: string, chooseDeviceId = defaultDeviceIdChooser) => {
  // Get manual deviceId from available devices.
  return new Promise((resolve, reject) => {
    let enumerateDevices;
    try {
      enumerateDevices = navigator.mediaDevices.enumerateDevices();
    } catch (err) {
      reject(new Error('No video input device'));
    }
    enumerateDevices?.then((devices) => {
      // Filter out non-videoinputs
      const videoDevices = devices.filter((device) => device.kind == 'videoinput');

      if (videoDevices.length < 1) {
        reject(new Error('No video input device'));
        return;
      }

      const pattern = getFacingModePattern(facingMode);

      // Filter out video devices without the pattern
      const filteredDevices = videoDevices.filter(({ label }) => pattern.test(label));

      resolve(chooseDeviceId(filteredDevices, videoDevices, facingMode));
    });
  });
};
