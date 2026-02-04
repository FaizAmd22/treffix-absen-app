import React, { useEffect, useRef, useState, useCallback } from "react";
import { Page, Button, Link, f7 } from "framework7-react";
import { useDispatch, useSelector } from "react-redux";
import { selectSettings } from "../../../slices/settingsSlice";
import { IoIosArrowRoundBack } from "react-icons/io";
import { updateTest } from "../../../slices/testSlice";
import TrainingPopup from "./trainingPopup";
import { API } from "../../../api/axios";
import { selectLanguages } from "../../../slices/languagesSlice";
import { translate } from "../../../utils/translate";
import Loading from "../../../components/loading";
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-youtube';
import RatingPopup from "./ratingPopup";
import { showToastFailed } from "../../../functions/toast";
import ButtonFixBottom from "../../../components/buttonFixBottom";
import CustomButton from "../../../components/customButton";

const VideoLearning = () => {
    const [isVideoFinished, setIsVideoFinished] = useState(false);
    const [popupOpened, setPopupOpened] = useState(false);
    const [data, setData] = useState({});
    const [videoUrl, setVideoUrl] = useState("");
    const [videoData, setVideoData] = useState(null);
    const [ratingOpened, setRatingOpened] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [playerInitialized, setPlayerInitialized] = useState(false);

    const token = localStorage.getItem("token");
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);

    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const nextStepRef = useRef();
    const isInitializingRef = useRef(false);

    const getYoutubeId = (url) => {
        if (!url) return null;

        let match = url.match(/youtu\.be\/([^?&]+)/);
        if (match) return match[1];

        match = url.match(/youtube\.com\/watch\?v=([^&]+)/);
        if (match) return match[1];

        match = url.match(/youtu\.be%2F([^%?&]+)/);
        if (match) return match[1];

        return null;
    };

    const setScreenOrientation = useCallback((orientation) => {
        return new Promise((resolve, reject) => {
            try {
                if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
                    window.screen.orientation.lock(orientation)
                        .then(resolve)
                        .catch(error => {
                            console.warn('Cordova screen orientation lock failed:', error);
                            tryNativeOrientation(orientation, resolve, reject);
                        });
                }
                else if (window.screen && window.screen.lockOrientation) {
                    const success = window.screen.lockOrientation(orientation);
                    if (success) {
                        resolve();
                    } else {
                        tryNativeOrientation(orientation, resolve, reject);
                    }
                }
                else {
                    tryNativeOrientation(orientation, resolve, reject);
                }
            } catch (error) {
                console.warn('Screen orientation not supported:', error);
                reject(error);
            }
        });
    }, []);

    const tryNativeOrientation = useCallback((orientation, resolve, reject) => {
        try {
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock(orientation).then(resolve).catch(reject);
            } else if (screen.lockOrientation) {
                const success = screen.lockOrientation(orientation);
                success ? resolve() : reject(new Error('Lock failed'));
            } else if (screen.mozLockOrientation) {
                const success = screen.mozLockOrientation(orientation);
                success ? resolve() : reject(new Error('Lock failed'));
            } else if (screen.msLockOrientation) {
                const success = screen.msLockOrientation(orientation);
                success ? resolve() : reject(new Error('Lock failed'));
            } else {
                reject(new Error('No orientation API available'));
            }
        } catch (error) {
            reject(error);
        }
    }, []);

    const unlockScreenOrientation = useCallback(() => {
        try {
            if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
                window.screen.orientation.unlock();
            }
            else if (window.screen && window.screen.unlockOrientation) {
                window.screen.unlockOrientation();
            }
            else if (screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
            } else if (screen.unlockOrientation) {
                screen.unlockOrientation();
            } else if (screen.mozUnlockOrientation) {
                screen.mozUnlockOrientation();
            } else if (screen.msUnlockOrientation) {
                screen.msUnlockOrientation();
            }
        } catch (error) {
            console.warn('Screen orientation unlock not supported:', error);
        }
    }, []);

    const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );

        console.log('Document fullscreen state:', isCurrentlyFullscreen);
        console.log('Player exists:', !!playerRef.current);

        setIsFullscreen(isCurrentlyFullscreen);

        if (playerRef.current && playerRef.current.el()) {
            console.log('Player element still exists during fullscreen change');
        }

        if (isCurrentlyFullscreen) {
            setScreenOrientation('landscape-primary')
                .catch(() => setScreenOrientation('landscape'))
                .catch(() => setScreenOrientation('landscape-secondary'))
                .catch(err => {
                    console.warn('Failed to set landscape orientation:', err);
                    setTimeout(() => {
                        setScreenOrientation('landscape').catch(console.warn);
                    }, 100);
                });
        } else {
            unlockScreenOrientation();

            setTimeout(() => {
                if (window.innerHeight < window.innerWidth) {
                    setScreenOrientation('portrait-primary')
                        .catch(() => setScreenOrientation('portrait'))
                        .catch(console.warn);
                }
            }, 100);
        }
    };

    console.log("videoData :", videoData);

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        document.addEventListener('orientationchange', () => {
            console.log('Orientation changed:', window.orientation);
        });

        const handleBackButton = () => {
            if (isFullscreen && playerRef.current) {
                playerRef.current.exitFullscreen();
                return false;
            }
            return true;
        };

        const onDeviceReady = () => {
            console.log('Cordova device ready');

            if (document.addEventListener) {
                document.addEventListener('backbutton', handleBackButton, false);
            }
        };

        if (window.cordova) {
            document.addEventListener('deviceready', onDeviceReady, false);
        } else {
            onDeviceReady();
        }

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
            document.removeEventListener('backbutton', handleBackButton);

            if (playerRef.current && !isFullscreen) {
                try {
                    playerRef.current.dispose();
                } catch (error) {
                    console.warn('Error disposing player on cleanup:', error);
                }
                playerRef.current = null;
            }

            unlockScreenOrientation();
        };
    }, []);

    useEffect(() => {
        const id = f7.views.main.router.currentRoute.params.id;
        console.log("id:", id);

        const fetchQuestion = async () => {
            try {
                const response = await API.get(`/user-developments/${id}/test-details`);

                const payload = response.data.payload;
                console.log("payload :", payload);

                setData(payload.data);
                nextStepRef.current = payload.next_step;
                const vidUrl = payload.data.video_url;
                setVideoUrl(vidUrl);
            } catch (error) {
                console.log("error:", error);
                f7.views.main.router.back()
                showToastFailed(translate('training_detail_failed_getdetail', language))
            }
        };

        if (token) {
            fetchQuestion();
        }
    }, [token, language]);

    useEffect(() => {
        if (videoUrl) {
            const partsVideo = videoUrl.split(" ");
            console.log("partsvideo:", partsVideo[1]);

            const fetchVideoUrl = async () => {
                setIsLoading(true);
                try {
                    const response = await API.post(
                        `/master-developments/video-url`,
                        {
                            development_id: f7.views.main.router.currentRoute.params.id,
                            video_key: partsVideo[0],
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    console.log("response fetchVideo:", response.data);

                    if (partsVideo[1] === "[video/mp4]") {
                        setVideoData({
                            type: "mp4",
                            url: response.data.payload.signed_url
                        });
                    } else if (partsVideo[1] === "[video/youtube]") {
                        const youtubeUrl = response.data.payload.video_key;
                        const youtubeId = getYoutubeId(youtubeUrl);

                        if (youtubeId) {
                            setVideoData({
                                type: "youtube",
                                url: youtubeUrl,
                                id: youtubeId
                            });
                        } else {
                            console.error("Could not extract YouTube ID from URL:", youtubeUrl);
                            setVideoData({
                                type: "error",
                                message: "Invalid YouTube URL"
                            });
                        }
                    } else {
                        setVideoData({
                            type: "other",
                            url: response.data.payload.video_key
                        });
                    }
                } catch (error) {
                    console.log("error video:", error);
                    f7.views.main.router.back()
                    showToastFailed(translate('training_detail_failed_getdetail', language))
                }
                finally {
                    setIsLoading(false);
                }
            };

            fetchVideoUrl();
        }
    }, [videoUrl, token, language]);

    const setupPlayer = (videoElement, options) => {
        const player = videojs(videoElement, options, function onPlayerReady() {
            console.log('Player is ready:', this);

            window.debugPlayer = this;

            if (data.show_control_bar === false) {
                const controlBar = this.controlBar;

                const playToggle = controlBar.getChild('playToggle');
                const fullscreenToggle = controlBar.getChild('fullscreenToggle');

                while (controlBar.children_.length > 0) {
                    const child = controlBar.children_[0];
                    controlBar.removeChild(child);
                }

                controlBar.addChild(playToggle);
                controlBar.addChild(fullscreenToggle);
            }

            this.on('fullscreenchange', () => {
                const isPlayerFullscreen = this.isFullscreen();
                console.log('Player fullscreen state:', isPlayerFullscreen);
                console.log('Player element exists:', !!this.el());
                console.log('Video element exists:', !!this.el().querySelector('video'));

                if (isPlayerFullscreen) {
                    console.log('Entering fullscreen mode');

                    setTimeout(() => {
                        setScreenOrientation('landscape-primary')
                            .catch(() => setScreenOrientation('landscape'))
                            .catch(() => setScreenOrientation('landscape-secondary'))
                            .catch(err => {
                                console.warn('Failed to set landscape orientation:', err);
                            });
                    }, 100);
                } else {
                    console.log('Exiting fullscreen mode');

                    unlockScreenOrientation();

                    setTimeout(() => {
                        if (window.innerHeight < window.innerWidth) {
                            setScreenOrientation('portrait-primary')
                                .catch(() => setScreenOrientation('portrait'))
                                .catch(console.warn);
                        }
                    }, 200);
                }
            });

            this.on('ended', () => {
                console.log('Video ended');
                setIsVideoFinished(true);
            });

            this.on('error', (e) => {
                console.error('Video.js error:', this.error());
            });

            this.on('dispose', () => {
                console.log('Player disposed - this should not happen during fullscreen!');
                if (isFullscreen) {
                    console.warn('Player being disposed during fullscreen - attempting to prevent');
                    return false;
                }
            });

            this.on('loadstart', () => {
                console.log('Video load started');
            });

            this.on('loadeddata', () => {
                console.log('Video data loaded');
            });
        });

        return player;
    };

    useEffect(() => {
        if (!videoRef.current || !videoData || isLoading || isInitializingRef.current) {
            return;
        }

        if (playerRef.current && isFullscreen) {
            console.log('Skipping player re-initialization during fullscreen');
            return;
        }

        if (playerInitialized && playerRef.current && playerRef.current.el()) {
            console.log('Player already initialized and ready');
            return;
        }

        isInitializingRef.current = true;

        if (playerRef.current && !isFullscreen) {
            console.log('Disposing previous player');
            try {
                playerRef.current.dispose();
            } catch (error) {
                console.warn('Error disposing player:', error);
            }
            playerRef.current = null;
            setPlayerInitialized(false);
        }

        if (videoRef.current && !isFullscreen) {
            const existingVideo = videoRef.current.querySelector('video');
            if (existingVideo && !existingVideo.classList.contains('video-js')) {
                videoRef.current.removeChild(existingVideo);
            }
        }

        const initializePlayer = () => {
            try {
                console.log('Initializing new player with data:', videoData);

                let options = {
                    autoplay: false,
                    controls: true,
                    fluid: false,
                    aspectRatio: '16:9',
                    fill: true,
                    responsive: true,
                    poster: data.thumbnail || '',
                    preload: 'none',
                    bigPlayButton: true,
                    fullscreen: {
                        options: {
                            navigationUI: 'hide'
                        }
                    },
                    restoreEl: false,
                    html5: {
                        hls: {
                            enableLowInitialPlaylist: true,
                            smoothQualityChange: true,
                            overrideNative: true
                        },
                        nativeVideoTracks: false,
                        nativeAudioTracks: false,
                        nativeTextTracks: false
                    }
                };

                if (videoData.type === "youtube") {
                    console.log("Initializing YouTube player with ID:", videoData.id);

                    options.techOrder = ["youtube"];
                    options.youtube = {
                        ytControls: 0,
                        enablePrivacyEnhancedMode: false,
                        iv_load_policy: 3,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0
                    };
                    options.sources = [{
                        type: "video/youtube",
                        src: `https://www.youtube.com/watch?v=${videoData.id}`
                    }];
                } else {
                    console.log("Initializing MP4 player with URL:", videoData.url);

                    options.sources = [{
                        src: videoData.url,
                        type: "video/mp4"
                    }];
                }

                console.log("Video.js options:", options);

                if (videoRef.current) {
                    const player = setupPlayer(videoRef.current, options);
                    playerRef.current = player;
                    setPlayerInitialized(true);

                    console.log('Player initialized successfully');
                }

            } catch (error) {
                console.error("Error initializing video player:", error);
            } finally {
                isInitializingRef.current = false;
            }
        };

        const timeoutId = setTimeout(initializePlayer, 300);

        return () => {
            clearTimeout(timeoutId);
            isInitializingRef.current = false;
        };

    }, [videoData, isLoading]);

    const handleLogoutClick = () => {
        setPopupOpened(true);
    };

    const fetchSubmit = async () => {
        const id = f7.views.main.router.currentRoute.params.id;

        try {
            const response = await API.post(
                `/user-developments/${id}/test-submit`, {}
            );

            console.log("response submit:", response.data);
            if (!nextStepRef.current) {
                setRatingOpened(true)
            } else {
                f7.views.main.router.navigate(`/question/${id}/`, { clearPreviousHistory: true });
            }
        } catch (error) {
            console.log("error submit:", error);
            f7.views.main.router.back()
            showToastFailed(translate('training_detail_failed_getdetail', language))
        }
    };

    const handleConfirm = () => {
        setPopupOpened(false);
        fetchSubmit();
    };

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ color: theme === "light" ? "black" : "white" }}>
                <div className="video-container" style={{
                    height: "200px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    color: theme === "light" ? "black" : "white"
                }}>
                    {isLoading ? (
                        <Loading height="70vh" />
                    ) : (
                        <>
                            {videoData && videoData.type !== "error" ? (
                                <div data-vjs-player style={{ width: "100%", height: "200px", marginTop: "-10px" }}>
                                    <video
                                        ref={videoRef}
                                        className="video-js vjs-big-play-centered"
                                        playsInline
                                        data-setup="{}"
                                        style={{
                                            width: "100%",
                                            height: "200px",
                                            objectFit: "cover"
                                        }}
                                    />
                                </div>
                            ) : videoData && videoData.type === "error" ? (
                                <div style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "column",
                                    height: "100%",
                                    padding: "20px",
                                    textAlign: "center"
                                }}>
                                    <p>Error loading video: {videoData?.message || "Unknown error"}</p>
                                </div>
                            ) : null}
                        </>
                    )}
                </div>

                <div style={{ padding: "5px 18px", marginTop: "20px" }}>
                    <p style={{ fontSize: "var(--font-sm)", fontWeight: 700 }}>{data.title}</p>
                </div>

                <ButtonFixBottom needBorderTop={true}>
                    <CustomButton
                        color={!isVideoFinished ? "var(--color-gray)" : "white"}
                        bg={isVideoFinished ? "var(--bg-primary-green)" : (theme === "light" ? "rgba(217, 218, 220, 1)" : "rgba(32, 32, 32, 1)")}
                        text={translate('done', language)}
                        handleClick={handleLogoutClick}
                        disable={!isVideoFinished}
                    />
                </ButtonFixBottom>

                <TrainingPopup
                    popupOpened={popupOpened}
                    setPopupOpened={setPopupOpened}
                    handleConfirm={handleConfirm}
                    theme={theme}
                    title={!nextStepRef.current ? translate('question_finished', language) : translate('next_post_test', language)}
                    desc={!nextStepRef.current ? translate('end_test', language) : translate('next_post_test_text', language)}
                    btnYes={translate('continue', language)}
                    btnNo={translate('training_cancel', language)}
                />

                <RatingPopup ratingOpened={ratingOpened} setRatingOpened={setRatingOpened} />
            </div>
        </Page>
    );
};

export default VideoLearning;