import {mediaDevices} from 'react-native-webrtc';

export const initStream = async isFront => {
  try {
    let videoSourceId = null;
    // Get all devices (video/audio) in array list
    const sourceInfos = await mediaDevices.enumerateDevices();
    // Iterate the list above and find the front camera
    await Promise.all(
      sourceInfos.map(async sourceInfo => {
        if (
          sourceInfo.kind === 'videoinput' &&
          sourceInfo.facing === (isFront ? 'front' : 'environment')
        ) {
          videoSourceId = sourceInfo.deviceId;
        }
      }),
    );
    // Get the stream of front camera
    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: {
        mandatory: {
          minWidth: 500, // Provide your own width, height and frame rate here
          minHeight: 300,
          minFrameRate: 30,
        },
        facingMode: isFront ? 'user' : 'environment',
        optional: [{sourceId: videoSourceId}],
      },
    });
    console.log('stream', stream);
    return {stream, videoSourceId};
  } catch (error) {
    console.log(error);
  }
};
