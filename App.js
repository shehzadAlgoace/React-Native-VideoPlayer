import React, {useRef, useState} from 'react';
import {View, Text, Image, StyleSheet, Pressable} from 'react-native';
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
      setClicked(!clicked);
    }
  };
  // // Function to handle double-tap for seek forward and backward
  const handleDoubleTap = callback => {
    let lastTap = null;
    const delay = 300; // Delay in milliseconds for double-tap detection

    return () => {
      const now = Date.now();

      if (lastTap && now - lastTap < delay) {
        callback();
      }
      lastTap = now;
    };
  };

  // Function to handle single and double taps for seeking forward and backward
  // const handleDoubleTap = (singleTapCallback, doubleTapCallback) => {
  //   let lastTap = null;
  //   const delay = 300; // Delay in milliseconds for double-tap detection

  //   return () => {
  //     const now = Date.now();
  //     if (lastTap && now - lastTap < delay) {
  //       doubleTapCallback();
  //       lastTap = null; // Reset the lastTap after a double-tap
  //     } else {
  //       lastTap = now;
  //       setTimeout(() => {
  //         if (Date.now() - lastTap < delay) {
  //           console.log('skdj');
  //           setClicked(!clicked);
  //           singleTapCallback();
  //         }
  //         lastTap = null; // Reset the lastTap after handling single tap
  //       }, delay);
  //     }
  //   };
  // };

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
                style={{width: '35%', height: '100%', backgroundColor: 'coral'}}
                // onPress={() =>
                //   videoRef.current?.seek(parseInt(progress.currentTime) - 10)
                // }
                // onPress={() => {
                //   handleDoubleTap(() =>
                //     videoRef.current?.seek(parseInt(progress.currentTime) - 10),
                //   );
                //   setClicked(!clicked);
                // }}
                onPress={() => {
                  handleDoubleTap(() =>
                    videoRef.current?.seek(parseInt(progress.currentTime) - 10),
                  );
                  if (!handleDoubleTap) {
                    setClicked(!clicked);
                  }
                }}>
                {/* <Image
                  source={require('./src/backward.png')}
                  style={styles.controlIcon}
                /> */}
              </Pressable>
              <Pressable
                style={{width: '30%', height: 30, backgroundColor: 'yellow'}}
                onPress={handlePlayPause}>
                <Image
                  source={
                    paused
                      ? require('./src/play-button.png')
                      : require('./src/pause.png')
                  }
                  style={[styles.controlIcon, {marginLeft: 50}]}
                />
              </Pressable>
              <Pressable
                style={{width: '35%', height: '100%', backgroundColor: 'green'}}
                // onPress={() =>
                //   videoRef.current?.seek(parseInt(progress.currentTime) + 10)
                // }
                // onPress={() => {
                //   handleDoubleTap(() =>
                //     videoRef.current?.seek(parseInt(progress.currentTime) + 10),
                //   );
                //   setClicked(!clicked);
                // }}
                onPress={handleDoubleTap(() =>
                  videoRef.current?.seek(parseInt(progress.currentTime) + 10),
                )}>
                <Image
                  source={require('./src/forward.png')}
                  style={[styles.controlIcon, {marginLeft: 50}]}
                />
              </Pressable>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    backgroundColor: 'rgba(0,0,0,.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    width: 30,
    height: 30,
    backgroundColor: 'coral',
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
