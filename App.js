import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import VideoPlayer from './src/components/videoPlayer/videoPlayer';

// import VideoPlayer from './src/components/videoPlayer/videoPlayer';

const App = () => {
  return (
    <View style={styles.container}>
      <VideoPlayer
        videoUri={
          'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        }
        videoPoster={
          'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg'
        }
      />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {flex: 1},
});
