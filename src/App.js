/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet, View, Button, StatusBar} from 'react-native';
import {
  RTCPeerConnection,
  RTCView,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';
import {initStream} from './utils/initStream';
import databaseRef from './firebase';

const WEBRTC_CONFIG = {
  iceServers: [{url: 'stun:stun.l.google.com:19302'}],
};
var USER_ID = Math.floor(Math.random() * 1000000000);

const PC = new RTCPeerConnection(WEBRTC_CONFIG);

const App: () => React$Node = () => {
  const [videoURL, setVideoURL] = useState();
  const [isFront, setIsFront] = useState(true);
  const [logs, setLogs] = useState('');

  const readMessage = async data => {
    const msg = JSON.parse(data.val().message);
    const sender = data.val().sender;
    if (sender !== USER_ID) {
      if (msg.ice !== undefined) {
        await PC.addIceCandidate(new RTCIceCandidate(msg.ice));
      } else if (msg.sdp.type === 'offer') {
        await PC.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        const answer = await PC.createAnswer();
        await PC.setLocalDescription(answer);
        await sendMessage(USER_ID, JSON.stringify({sdp: PC.localDescription}));
      } else if (msg.sdp.type === 'answer') {
        await PC.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      }
    }
  };

  const sendMessage = async (senderId, data) => {
    const msg = await databaseRef.push({sender: senderId, message: data});
    await msg.remove();
  };

  databaseRef.on('child_added', readMessage);

  PC.onaddstream = event => {
    console.log('onaddstream', event);
    setVideoURL(event.stream.toURL());
  };

  PC.onicecandidate = event => {
    event.candidate
      ? sendMessage(USER_ID, JSON.stringify({ice: event.candidate}))
      : console.log('Sent All Ice');
  };

  useEffect(() => {
    console.log('videoURL', videoURL);
    const initLocalStream = async () => {
      const {stream} = await initStream(isFront);
      setVideoURL(stream.toURL());
      PC.addStream(stream);
    };

    if (!videoURL) {
      initLocalStream();
    }
  }, []);

  const showPartnerFace = async () => {
    const desc = await PC.createOffer();
    console.log('desc', desc);
    await PC.setLocalDescription(desc);
    await sendMessage(USER_ID, JSON.stringify({sdp: PC.localDescription}));
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <View style={styles.body}>
          <RTCView streamURL={videoURL} style={styles.stream} />
          <Button
            onPress={showPartnerFace}
            title="START VIDEO CALL"
            accessibilityLabel=""
          />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  body: {
    height: '100%',
  },
  stream: {
    flex: 1,
  },
});

export default App;
