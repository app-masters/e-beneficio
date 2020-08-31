import React, { useEffect, useRef } from 'react';
import 'webrtc-adapter';
import { isIOS } from './platform';

interface VideoPermissionProps {
  onError: (error: MediaStreamError) => void;
  onSuccess: () => void;
}

/**
 * Component used to ask permission to use video
 */
export const VideoPermission: React.FC<VideoPermissionProps> = ({ onError, onSuccess }) => {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    /**
     * gotStream
     * @param stream
     */
    const gotStream: NavigatorUserMediaSuccessCallback = (stream) => {
      stream.getVideoTracks();

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      window.stream = stream; // make variable available to browser console
      if (video.current) {
        video.current.srcObject = stream;
      }
      if (onSuccess) {
        onSuccess();
      }
    };
    /**
     * onfail
     * @param error
     */
    const onfail: NavigatorUserMediaErrorCallback = (error) => {
      console.log("permission not granted or system don't have media devices." + error.name);
      if (onError) {
        onError(error);
      }
    };

    if (!isIOS()) {
      navigator.getUserMedia({ video: true }, gotStream, onfail);
    } else {
      onError({ message: 'iOS is not currently supported', name: 'NotFoundError' } as MediaStreamError);
    }
  }, [onError, onSuccess]);

  return (
    <div style={{ position: 'relative' }}>
      <video
        style={{ width: 1, height: 1, position: 'absolute', top: -9999, left: -9999 }}
        ref={video}
        id="local"
        autoPlay={false}
      ></video>
    </div>
  );
};
