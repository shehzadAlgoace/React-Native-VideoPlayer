/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import Orientation from 'react-native-orientation-locker';
interface VideoPlayerProps {
  videoUri: String;
  videoPoster: String;
}
interface VideoRef {
  seek: (time: number) => void;
}
const VideoPlayer = ({videoUri, videoPoster}: VideoPlayerProps) => {
  // State
  const [clicked, setClicked] = useState(false);
  const [paused, setPaused] = useState(true);
  const [videoStarted, setVideoStarted] = useState(false); // Track if the video has started
  const [modalVisible, setModalVisible] = useState(false);
  const [speedModalVisible, setSpeedModalVisible] = useState(false);
  const [locked, setLocked] = useState(false);
  const [visibleLockButton, setVisibleLockButton] = useState(false);
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);
  const [progress, setProgress] = useState({
    currentTime: 0,
    seekableDuration: 0,
  });
  const [fullScreen, setFullScreen] = useState(false);
  // Hook

  // Refs for video and tap timeout
  const videoRef = useRef<VideoRef>(null);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Functions
  // Function to format seconds into MM:SS
  const format = (seconds: number): string => {
    let mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    let secs = (Math.trunc(seconds) % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  // Function to handle play/pause button press
  const handlePlayPause = () => {
    console.log('klklk∂');
    if (paused && progress.currentTime >= progress.seekableDuration) {
      videoRef.current?.seek(0); // Restart the video if it has ended
      setProgress({
        currentTime: 0,
        seekableDuration: progress.seekableDuration,
      });
    }
    setPaused(!paused); // Toggle pause state
    // setClicked(true); // Show controls overlay
    if (!videoStarted) {
      setVideoStarted(true);
    }
  };
  // Function to handle fullscreen toggle
  const handleFullscreen = () => {
    if (fullScreen) {
      Orientation.lockToPortrait();
    } else {
      Orientation.lockToLandscape();
    }
    setFullScreen(!fullScreen);
  };
  // Function to handle video end event
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
      handleTap();
    }
  };

  // Function to handle double-tap for seek forward and backward
  const handleTap = (direction: 'left' | 'right') => {
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

  const handleDoubleTap = (direction: 'left' | 'right') => {
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
  const handleSetting = () => {
    setModalVisible(!modalVisible);
  };
  const handleLock = () => {
    if (locked) {
      setLocked(!locked);
      setFullScreen(!fullScreen);
      setLocked(!locked);
      setClicked(false);
    } else {
      Orientation.lockToLandscape();
      setModalVisible(!modalVisible);
      setFullScreen(!fullScreen);
      setClicked(!clicked);
      setLocked(!locked);
    }
  };
  const handleFullscreenLock = () => {
    if (locked) {
      setLocked(!locked);
      setClicked(false);
    } else {
      setModalVisible(!modalVisible);
      setClicked(!clicked);
      setLocked(!locked);
    }
  };
  const speeds = [
    {label: '0.5x', value: 0.5},
    {label: '1x', value: 1},
    {label: '1.5x', value: 1.5},
    {label: '2x', value: 2},
  ];

  const handleSpeed = (value: {label: string; value: number}) => {
    const speed = value.value;
    setSelectedSpeed(speed);
    setSpeedModalVisible(!speedModalVisible);
  };

  return (
    <View style={styles.mainStyle}>
      <Pressable
        style={[{width: '100%', height: fullScreen ? '100%' : 220}]}
        onPress={() => handleClick()}>
        {/*  Lock Button */}
        {locked && (
          <Pressable
            onPress={() => setVisibleLockButton(!visibleLockButton)}
            style={styles.lockViewStyle}>
            {visibleLockButton && (
              <TouchableOpacity
                style={styles.lockboxStyle}
                onPress={() => {
                  if (fullScreen) {
                    handleFullscreenLock();
                  } else {
                    handleLock();
                  }
                }}>
                <Image
                  source={require('./Images/lockIcon.jpeg')}
                  style={styles.lockIcon}
                />
                <Text style={styles.lockIconTextStyle}>Lock</Text>
              </TouchableOpacity>
            )}
          </Pressable>
        )}

        <Video
          onError={error => console.error(error)}
          paused={paused}
          source={{
            uri: videoUri as string,
          }}
          ref={videoRef}
          onProgress={x => setProgress(x)}
          onEnd={handleVideoEnd}
          style={{width: '100%', height: fullScreen ? '100%' : 220}}
          resizeMode="contain"
          fullscreen={fullScreen}
          rate={selectedSpeed}
        />

        {!videoStarted && (
          <Image
            source={{
              uri: videoPoster as string,
            }}
            style={styles.thumbnail}
          />
        )}
        {!videoStarted && (
          <View style={styles.playButtonOverlay}>
            <Pressable onPress={handlePlayPause}>
              <Image
                source={require('./Images/play-button.png')}
                style={styles.playButton}
              />
            </Pressable>
          </View>
        )}

        <Pressable
          style={[styles.overlay, {opacity: clicked && !locked ? 1 : 0}]}
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
                width: '45%',
                height: '100%',
              }}
              onPress={() => handleTap('left')}
            />
            {clicked && (
              <Pressable
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 10,
                }}
                onPress={handlePlayPause}>
                <Image
                  source={
                    paused
                      ? require('./Images/play-button.png')
                      : require('./Images/pause.png')
                  }
                  style={[styles.controlIcon]}
                />
              </Pressable>
            )}
            <Pressable
              style={{
                width: '45%',
                height: '100%',
              }}
              onPress={() => handleTap('right')}
            />
          </View>
          <View style={styles.bottomControls}>
            <Text style={{color: 'white'}}>
              {format(progress.currentTime)}/
              <Text style={{color: 'white'}}>
                {format(progress.seekableDuration)}
              </Text>
            </Text>
            <Slider
              value={progress.currentTime}
              style={{width: '90%'}}
              minimumValue={0}
              maximumValue={progress.seekableDuration}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#fff"
              onValueChange={x => videoRef.current?.seek(x)}
            />
          </View>

          {clicked && (
            <View style={styles.settingIcon}>
              <Pressable onPress={handleSetting}>
                <Image
                  source={require('./Images/images.png')}
                  style={{width: 24, height: 24}}
                />
              </Pressable>
            </View>
          )}
          {clicked && (
            <View style={styles.topControls}>
              <Pressable onPress={handleFullscreen}>
                <Image
                  source={
                    fullScreen
                      ? require('./Images/minimize.png')
                      : require('./Images/full-size.png')
                  }
                  style={{width: 24, height: 24, tintColor: 'white'}}
                />
              </Pressable>
            </View>
          )}
        </Pressable>
      </Pressable>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <TouchableOpacity
          onPress={() => setModalVisible(!modalVisible)}
          style={styles.centeredView}>
          <Pressable
            style={[
              styles.modalView,
              // {height: fullScreen ? '32%' : '18%'},
              {width: fullScreen ? '60%' : '90%'},
            ]}>
            <TouchableOpacity
              onPress={() => {
                setSpeedModalVisible(!speedModalVisible);
                setModalVisible(!modalVisible);
              }}
              style={styles.settingModalViewStyle}>
              <Image
                source={require('./Images/playSpeedIcon.png')}
                style={styles.settingModalIconsStyle}
              />
              {/* <ICONS.playSpeedIcon /> */}
              <View
                style={{
                  flex: 1,
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                }}>
                <Text style={styles.textStyle}>Play Speed</Text>
                <Text style={styles.textStyle}>Normal {'>'}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (fullScreen) {
                  handleFullscreenLock();
                } else {
                  handleLock();
                }
              }}
              style={styles.settingModalViewStyle}>
              <Image
                source={require('./Images/lockIcon.jpeg')}
                style={styles.settingModalIconsStyle}
              />
              <View
                style={{
                  flex: 1,
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                }}>
                <Text style={styles.textStyle}>Lock Screen</Text>
              </View>
            </TouchableOpacity>
          </Pressable>
        </TouchableOpacity>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={speedModalVisible}
        onRequestClose={() => {
          setSpeedModalVisible(!modalVisible);
        }}>
        <TouchableOpacity
          onPress={() => setSpeedModalVisible(!speedModalVisible)}
          style={styles.speedModalView}>
          <Pressable
            style={[
              styles.modalView,
              // {height: fullScreen ? '32%' : '18%'},
              {width: fullScreen ? '60%' : '90%'},
            ]}>
            {speeds.map((speed, index) => (
              <TouchableOpacity
                onPress={() => handleSpeed(speed)}
                style={{
                  paddingVertical: 10,
                  marginVertical: 3,
                }}
                key={index}>
                <Text style={styles.textStyle}>{speed.label}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainStyle: {flex: 1},
  thumbnail: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    zIndex: 999,
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
    position: 'absolute',
    bottom: 0,
    paddingLeft: 7,
  },
  topControls: {
    flexDirection: 'row',
    right: 0,
    position: 'absolute',
    bottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  settingIcon: {
    flexDirection: 'row',
    right: 0,
    position: 'absolute',
    top: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,.3)',
    alignItems: 'center',
  },
  speedModalView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,.3)',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    paddingTop: 7,
    marginBottom: 12,
    justifyContent: 'center',
  },
  settingModalViewStyle: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  settingModalIconsStyle: {
    width: 24,
    height: 24,
  },
  textStyle: {
    color: 'black',
    fontWeight: 'bold',
    marginLeft: 12,
  },
  speedTextStyle: {
    paddingVertical: 5,
    // backgroundColor: 'coral',
    color: 'black',
    fontWeight: 'bold',
  },
  lockIcon: {
    width: 24,
    height: 24,
  },
  lockIconTextStyle: {
    color: 'black',
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  lockViewStyle: {
    position: 'absolute',
    zIndex: 999,
    flex: 1,
    // backgroundColor: 'coral',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  lockboxStyle: {
    backgroundColor: 'white',
    padding: 3,
    alignItems: 'center',
    borderRadius: 7,
    flexDirection: 'row',
    top: 280,
  },
});

export default VideoPlayer;
