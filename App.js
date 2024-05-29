/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import Orientation from 'react-native-orientation-locker';

const App = () => {
  const [clicked, setClicked] = useState(false);
  const [paused, setPaused] = useState(true);
  const [videoStarted, setVideoStarted] = useState(false); // Track if the video has started
  const [progress, setProgress] = useState({
    currentTime: 0,
    seekableDuration: 0,
  });
  const [fullScreen, setFullScreen] = useState(false);
  const videoRef = useRef();
  const tapTimeoutRef = useRef(null);

  const format = seconds => {
    let mins = parseInt(seconds / 60)
      .toString()
      .padStart(2, '0');
    let secs = (Math.trunc(seconds) % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handlePlayPause = () => {
    if (paused && progress.currentTime >= progress.seekableDuration) {
      videoRef.current.seek(0);
      setProgress({
        currentTime: 0,
        seekableDuration: progress.seekableDuration,
      });
    }
    setPaused(!paused);
    setClicked(true);
    if (!videoStarted) {
      setVideoStarted(true);
    }
  };

  const handleFullscreen = () => {
    if (fullScreen) {
      Orientation.lockToPortrait();
    } else {
      Orientation.lockToLandscape();
    }
    setFullScreen(!fullScreen);
  };

  const handleVideoEnd = () => {
    setPaused(true);
    setVideoStarted(false);
    setProgress({currentTime: 0, seekableDuration: 0});
    setClicked(false);
    if (fullScreen) {
      Orientation.lockToPortrait();
      setFullScreen(false);
    }
  };
  const handleClick = () => {
    if (videoStarted) {
      handleTap(); // Use handleTap instead of directly setting clicked
    }
  };
  // // Function to handle double-tap for seek forward and backward

  const handleTap = direction => {
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
      handleDoubleTap(direction);
    } else {
      tapTimeoutRef.current = setTimeout(() => {
        handleSingleTap();
        tapTimeoutRef.current = null;
      }, 300); // Adjust timeout value as needed
    }
  };

  const handleDoubleTap = direction => {
    if (direction === 'left') {
      videoRef.current?.seek(Math.max(0, progress.currentTime - 10));
    } else if (direction === 'right') {
      videoRef.current?.seek(
        Math.min(progress.seekableDuration, progress.currentTime + 10),
      );
    }
  };

  const handleSingleTap = () => {
    setClicked(!clicked);
  };

  return (
    <View style={{flex: 1}}>
      <Pressable
        style={{width: '100%', height: fullScreen ? '100%' : 220}}
        onPress={() => handleClick()}>
        <Video
          onError={error => console.error(error)}
          paused={paused}
          source={{
            uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          }}
          ref={videoRef}
          onProgress={x => setProgress(x)}
          onEnd={handleVideoEnd}
          style={{width: '100%', height: fullScreen ? '100%' : 220}}
          resizeMode="contain"
        />

        {!videoStarted && (
          <Image
            source={{
              uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
            }}
            style={styles.thumbnail}
          />
        )}
        {!videoStarted && (
          <View style={styles.playButtonOverlay}>
            <Pressable onPress={handlePlayPause}>
              <Image
                source={require('./src/play-button.png')}
                style={styles.playButton}
              />
            </Pressable>
          </View>
        )}
        {clicked && (
          <Pressable
            style={styles.overlay}
            onPress={() => setClicked(!clicked)}>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Pressable
                style={{
                  width: '35%',
                  height: '100%',
                }}
                onPress={() => handleTap('left')}
              />
              <Pressable
                style={{
                  width: '30%',
                  height: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handlePlayPause}>
                <Image
                  source={
                    paused
                      ? require('./src/play-button.png')
                      : require('./src/pause.png')
                  }
                  style={[styles.controlIcon]}
                />
              </Pressable>
              <Pressable
                style={{
                  width: '35%',
                  height: '100%',
                }}
                onPress={() => handleTap('right')}
              />
            </View>
            <View style={styles.bottomControls}>
              <Text style={{color: 'white'}}>
                {format(progress.currentTime)}
              </Text>
              <Slider
                value={progress.currentTime}
                style={{width: '80%', height: 40}}
                minimumValue={0}
                maximumValue={progress.seekableDuration}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#fff"
                onValueChange={x => videoRef.current?.seek(x)}
              />
              <Text style={{color: 'white'}}>
                {format(progress.seekableDuration)}
              </Text>
            </View>
            <View style={styles.topControls}>
              <Pressable onPress={handleFullscreen}>
                <Image
                  source={
                    fullScreen
                      ? require('./src/minimize.png')
                      : require('./src/full-size.png')
                  }
                  style={{width: 24, height: 24, tintColor: 'white'}}
                />
              </Pressable>
            </View>
          </Pressable>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  thumbnail: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2 )',
  },
  playButton: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
  overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
  bottomControls: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
  },
  topControls: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 10,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
  },
});

export default App;
