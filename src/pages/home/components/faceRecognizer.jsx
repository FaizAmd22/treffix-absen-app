import React, { useEffect, useRef, useState } from 'react';
import { Page, f7, Preloader, Link } from 'framework7-react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAbsentIn, selectAbsentOut } from '../../../slices/absentSlice';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors } from '@mediapipe/drawing_utils';
import { selectLanguages } from '../../../slices/languagesSlice';
import { translate } from '../../../utils/translate';
import { selectUser } from '../../../slices/userSlice';
import { captureFullFaceImage } from '../../../functions/captureFullFaceImage';
import { API, APIFaceRecog } from '../../../api/axios';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { setActiveTab } from '../../../slices/tabSlice';
import { setRequestBodyData } from '../../../slices/requestBodySlice';
import ConfirmAttendancePopup from './confirmAttendancePopup';
import { compressImage } from '../../../functions/compressImage';
import { GiPlainCircle } from 'react-icons/gi';
import { selectSettings } from '../../../slices/settingsSlice';
import { showToast, showToastFailed } from '../../../functions/toast';
import LoadingPopup from '../../../components/loadingPopup';
import MessageAlert from '../../../components/messageAlert';
import AlertFailedLight from '../../../assets/messageAlert/alert-failed-light.png'
import AlertFailedDark from '../../../assets/messageAlert/alert-failed-dark.png'
import ImageAlertLight from '../../../assets/messageAlert/absen-light.png'
import ImageAlertDark from '../../../assets/messageAlert/absen-dark.png'

const FaceRecognizer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const [livenessStatus, setLivenessStatus] = useState('');
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [capturedFaceImage, setCapturedFaceImage] = useState(null);
  const [location, setLocation] = useState({});
  const [isInOfficeLocation, setIsInOfficeLocation] = useState(false);
  const [isOutOfficeLocationPopup, setIsOutOfficeLocationPopup] = useState(false);
  const [isCaptureEnabled, setIsCaptureEnabled] = useState(false);
  const [officeName, setOfficeName] = useState(null);
  const [officeAreas, setOfficeAreas] = useState([]);
  const [address, setAddress] = useState('');
  const [attendanceType, setAttendanceType] = useState(null);
  const [showLoading, setShowLoading] = useState(false);
  const [sheetOpened, setSheetOpened] = useState(false);
  const [sheetOpenedFailed, setSheetOpenedFailed] = useState(false);
  const [textFailed, setTextFailed] = useState(null);
  const selectedUser = useSelector(selectUser)
  const absenIn = useSelector(selectAbsentIn);
  const absenOut = useSelector(selectAbsentOut);
  const theme = useSelector(selectSettings)
  const language = useSelector(selectLanguages);
  const dispatch = useDispatch();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const cameraRef = useRef(null);
  const checksRef = useRef({
    currentChallenge: null,
    completedChallenges: [],
    checksCompleted: false,
    lastBlinkState: false,
    blinkCount: 0,
    lastEyeOpenness: 1.0,
    selectedChallenges: null,
  });
  console.log("completedChallenges :", checksRef.current.completedChallenges);

  useEffect(() => {
    if (!absenIn) {
      setAttendanceType('clockin');
    }
    else if (absenIn && !absenOut) {
      setAttendanceType('clockout');
    }
    else if (absenIn && absenOut) {
      setAttendanceType('clockin');
    }
  }, [absenIn, absenOut]);

  function isPointInPolygon(point, polygon) {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi + 0.00000001) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  const fetchOfficeArea = async () => {
    try {
      const response = await API.get('/mobile/attendances/areas');

      const data = response.data.payload
      setOfficeAreas(data)

    } catch (error) {
      console.error('filed get office area:', error);
    }
  }

  const checkOfficeLocation = (location, officeAreas) => {
    if (!location) return { insideOffice: false, officeName: null };

    const userPoint = [location.latitude, location.longitude];
    let insideOffice = false;
    let officeName = '';

    officeAreas.forEach(area => {
      if (area.coordinates && isPointInPolygon(userPoint, area.coordinates)) {
        insideOffice = true;
        officeName = area.area_name;
      }
    });

    return { insideOffice, officeName };
  };

  useEffect(() => {
    if (location) {
      const { insideOffice, officeName } = checkOfficeLocation(location, officeAreas);

      setIsInOfficeLocation(insideOffice);
      setOfficeName(officeName);
    }
  }, [location]);

  const getAddress = async () => {
    if (!navigator.geolocation) {
      // f7.dialog.alert(translate('location_not_supported', language));
      // showToastFailed(translate('location_not_supported', language))
      setTextFailed(translate('location_not_supported', language))
      setSheetOpenedFailed(true)
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    };

    return new Promise((resolve, reject) => {
      let bestPosition = null;
      let watchId;

      const successCallback = (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`Lokasi diperoleh: ${latitude}, ${longitude} (Akurasi: ${accuracy}m)`);

        if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
          bestPosition = position;
        }

        if (accuracy < 50) {
          navigator.geolocation.clearWatch(watchId);
          resolve(position);
        }
      };

      const errorCallback = (error) => {
        console.error('Error getting location:', error);
        let errorMessage = translate('location_permission_denied', language);

        if (error.code === 1) {
          errorMessage = translate('location_permission_denied', language);
        } else if (error.code === 2) {
          errorMessage = translate('face_recognize_location_not_found', language);
        } else if (error.code === 3) {
          errorMessage = translate('face_recognize_location_timeout', language);
        }

        navigator.geolocation.clearWatch(watchId);
        reject(new Error(errorMessage));
      };

      watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, options);

      setTimeout(() => {
        navigator.geolocation.clearWatch(watchId);
        if (bestPosition) {
          resolve(bestPosition);
        }
        else {
          // reject(new Error(translate('face_recognize_signal_weak', language)));
          console.log("lokasi tidak akurat");

        }
      }, 3000);
    })
      .then((position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        setLocation(locationData);

        // return fetch(`https://geocoder.rtrsite.com/reverse?lat=${locationData.latitude}&lon=${locationData.longitude}&format=json`)
        //   .then(response => response.json())
        //   .then(data => {
        //     if (data && data.display_name) {
        //       console.log("data address:", data);
        //       setAddress(data.display_name);
        //     }
        //   })
        //   .catch(error => console.error('Error fetching address:', error));
      })
      .catch((error) => {
        // f7.dialog.alert(error.message, () => {
        //   f7.views.main.router.navigate('/home/', { clearPreviousHistory: true });
        // });

        if (error?.response?.data?.message === "CONFIGURATION NOT FOUND") {
          setTextFailed(translate('attendance_failed_performance', language))
        } else {
          setTextFailed(translate('attendance_failed_text', language))
        }

        setSheetOpenedFailed(true)
        // f7.views.main.router.navigate('/home/', { clearPreviousHistory: true });
        // showToastFailed(translate('attendance_submission_failed', language))
      });
  };

  const submitAttendanceRecord = async (faceImage) => {
    setShowLoading(true);
    console.log("location :", location);
    console.log("faceImage :", faceImage);
    console.log("selectedUser :", selectedUser);

    if (!location || !faceImage || !selectedUser) {
      // f7.dialog.alert(translate('incomplete_attendance_data', language));
      // showToastFailed(translate('incomplete_attendance_data', language))
      setTextFailed(translate('incomplete_attendance_data', language))
      setSheetOpenedFailed(true)
      setShowLoading(false);
      return;
    }

    try {
      // console.log('Original image size:', faceImage.length);
      // const compressedImage = await compressImage(faceImage, 0.6, 640, 480);
      // console.log('Compressed image size:', compressedImage.length);

      const requestBody = {
        employee_id: selectedUser.employee_id,
        coordinate: {
          latitude: String(location.latitude),
          longitude: String(location.longitude),
        },
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        attendance_type: attendanceType,
        picture: faceImage.substring(23),
        notes: null,
      };

      console.log("requestBody :", requestBody);

      if (!isInOfficeLocation) {
        console.log("Not in office location, waiting for location data...");

        const waitForLocationData = async () => {
          return new Promise((resolve, reject) => {
            const checkLocation = () => {
              if (location && location.latitude && location.longitude) {
                resolve(location);
              } else {
                getAddress().then(() => {
                  setTimeout(() => {
                    if (location && location.latitude && location.longitude) {
                      resolve(location);
                    } else {
                      reject(new Error('Failed to get location data'));
                    }
                  }, 100);
                }).catch(reject);
              }
            };

            checkLocation();
          });
        };

        try {
          const locationData = await waitForLocationData();

          requestBody.coordinate = {
            latitude: String(locationData.latitude),
            longitude: String(locationData.longitude),
          };

          setShowLoading(false);
          dispatch(setRequestBodyData(requestBody));
          setIsOutOfficeLocationPopup(true);
          if (cameraRef.current) {
            cameraRef.current.stop();
            cameraRef.current = null;
          }

          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => {
              track.stop();
            });
            streamRef.current = null;
          }

          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }

          setIsLoading(false);
          setPermissionStatus('prompt');
          setCurrentChallenge(null);

          checksRef.current = {
            currentChallenge: null,
            completedChallenges: [],
            checksCompleted: false,
            lastBlinkState: false,
            blinkCount: 0,
            lastEyeOpenness: 1.0,
            selectedChallenges: null,
          };
          return;

        } catch (locationError) {
          console.error('Failed to get location data:', locationError);
          // f7.dialog.alert(translate('face_recognize_location_not_found', language));
          // showToastFailed(translate('face_recognize_location_not_found', language))
          setTextFailed(translate('face_recognize_location_not_found', language))
          setSheetOpenedFailed(true)
          setShowLoading(false);
          return;
        }
      }

      const startTime = Date.now();
      const authKey = import.meta.env.VITE_AUTH_KEY;
      await APIFaceRecog.post("/attendances/record", requestBody, {
        headers: {
          Authorization: `Bearer ${authKey}`,
          'Content-Type': 'application/json',
        },
      });

      const endTime = Date.now();
      console.log(`API response time: ${(endTime - startTime) / 1000} seconds`);

      // f7.dialog.alert(translate('face_recognize_success', language), () => {
      //   f7.views.main.router.navigate('/home/', { clearPreviousHistory: true });
      // });
      // f7.views.main.router.navigate('/home/', { clearPreviousHistory: true });
      // showToast(translate('face_recognize_success', language), theme)
      setSheetOpened(true)
    } catch (error) {
      console.error('Attendance submission error:', error);
      // f7.dialog.alert(
      //   error?.response?.data?.message,
      //   translate('attendance_submission_failed', language),
      //   () => {
      //     f7.views.main.router.navigate('/home/', { clearPreviousHistory: true });
      //   });
      // f7.views.main.router.navigate('/home/', { clearPreviousHistory: true });
      // showToastFailed(translate('attendance_submission_failed', language))
      setTextFailed(translate('attendance_submission_failed', language))
      setSheetOpenedFailed(true)
    } finally {
      setShowLoading(false);
    }
  };

  const selectRandomChallenges = () => {
    const allChallenges = [
      'headTurnLeft',
      'headTurnRight',
      'headTurnUp',
      'headTurnDown',
    ];

    const shuffled = [...allChallenges];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected = shuffled.slice(0, 3);
    console.log("Randomized challenges:", selected);
    setSelectedChallenges(selected);

    checksRef.current.selectedChallenges = selected;
    checksRef.current.currentChallenge = selected[0];
    updateChallengeInstructions(selected[0]);

    return selected;
  };

  useEffect(() => {
    if (selectedChallenges.length > 0) {
      checksRef.current.challenges = selectedChallenges;
    }
  }, [selectedChallenges]);

  const updateChallengeInstructions = (challenge) => {
    console.log("Updating instructions for:", challenge);
    switch (challenge) {
      case 'headTurnLeft':
        setLivenessStatus(translate('face_recognize_face_left', language));
        break;
      case 'headTurnRight':
        setLivenessStatus(translate('face_recognize_face_right', language));
        break;
      case 'headTurnUp':
        setLivenessStatus(translate('face_recognize_face_up', language));
        break;
      case 'headTurnDown':
        setLivenessStatus(translate('face_recognize_face_down', language));
        break;
      case 'blinkEyes':
        setLivenessStatus(translate('face_recognize_blink_eyes', language));
        break;
      default:
        setLivenessStatus('');
    }
  };


  const moveToNextChallenge = () => {
    const currentChallenge = checksRef.current.currentChallenge;
    const completed = checksRef.current.completedChallenges
    if (!currentChallenge) return;

    if (!completed.includes(currentChallenge)) {
      completed.push(currentChallenge);
    }

    if (completed.length == 3) {
      setLivenessStatus(translate("face_recognize_success", language))
      checksRef.current.checksCompleted = true;
      setIsCaptureEnabled(true);
      return;
    }

    const nextIndex = completed.length;
    const challengesToUse = selectedChallenges.length > 0 ?
      selectedChallenges :
      checksRef.current.selectedChallenges;

    const nextChallenge = challengesToUse[nextIndex];

    if (nextChallenge) {
      checksRef.current.currentChallenge = nextChallenge;
      setCurrentChallenge(nextChallenge);
      console.log("Moving to next challenge:", nextChallenge);
      updateChallengeInstructions(nextChallenge);
    } else {
      console.error("No more challenges left to process.");
      setLivenessStatus(translate("face_recognize_completed", language))
    }
  };

  const handleCaptureFace = () => {
    if (!isCaptureEnabled) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const centerX = canvas.width / 2;
      const centerY = canvas.width / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.45;

      const faceImage = captureFullFaceImage(video, canvas, centerX, centerY, radius);
      console.log("faceImage :", faceImage);

      setCapturedFaceImage(faceImage);

      if (cameraRef.current) {
        cameraRef.current.stop();
        streamRef.current?.getTracks().forEach((track) => track.stop());
      }

      submitAttendanceRecord(faceImage);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('muted', 'true');
      videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
    }
  }, []);

  // useEffect(() => {
  //   if (showLoading) {
  //     f7.dialog.preloader('Loading...');
  //   } else {
  //     f7.dialog.close();
  //   }
  // }, [showLoading]);

  useEffect(() => {
    updateChallengeInstructions(currentChallenge);
  }, [currentChallenge]);

  const initializeFaceMesh = async () => {
    try {
      const challenges = selectRandomChallenges();
      checksRef.current.selectedChallenges = challenges;

      const faceMesh = new FaceMesh({
        locateFile: (file) => `/mediapipe/face_mesh/${file}`
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      await faceMesh.initialize();

      faceMesh.onResults((results) => {
        if (isLoading) setIsLoading(false);

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height * 0.45;
        const radius = Math.min(canvas.width, canvas.height) * 0.45;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        const isFaceDetected = results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0;
        let faceFullyInside = false;

        if (isFaceDetected) {
          const landmarks = results.multiFaceLandmarks[0];
          faceFullyInside = checkFaceInCircle(landmarks, centerX, centerY, radius, canvas);

          drawConnectors(ctx, landmarks, FaceMesh.TESSELATION);

          if (!checksRef.current.checksCompleted && faceFullyInside) {
            processFaceChallenges(landmarks);
          }
        }

        ctx.strokeStyle = isFaceDetected && faceFullyInside ? 'green' : 'red';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        updateStatusMessage(isFaceDetected, faceFullyInside);
      });

      const camera = new Camera(videoRef.current, {
        onFrame: async () => await faceMesh.send({ image: videoRef.current }),
        width: 1280,
        height: 720,
      });

      camera.start();
      cameraRef.current = camera;
      await fetchOfficeArea();
      await getAddress();
    } catch (error) {
      console.error("Initialization failed:", error);
      if (device.platform === 'iOS') {
        alert("iOS Error: " + error.message);
      }
    }
  };

  const checkFaceInCircle = (landmarks, centerX, centerY, radius, canvas) => {
    for (let point of landmarks) {
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;
      const dx = (x - centerX);
      const dy = (y - centerY);
      if ((dx * dx + dy * dy) > (radius * radius)) {
        return false;
      }
    }
    return true;
  };

  const updateStatusMessage = (isFaceDetected, faceFullyInside) => {
    if (checksRef.current.checksCompleted) {
      setLivenessStatus(translate('face_recognize_completed', language))
    } else if (!isFaceDetected) {
      setLivenessStatus(translate('face_recognize_face_in', language));
    } else if (!faceFullyInside) {
      setLivenessStatus(translate('face_recognize_face_position_in', language));
    } else if (!checksRef.current.checksCompleted) {
      updateChallengeInstructions(checksRef.current.currentChallenge);
    }
  };

  const processFaceChallenges = (landmarks) => {
    if (checksRef.current.checksCompleted) return;
    console.log("selectedChallenge :", selectedChallenges);

    const currentChallenge = checksRef.current.currentChallenge;
    if (!currentChallenge) return;

    switch (currentChallenge) {
      case 'headTurnLeft':
        detectHeadTurnLeft(landmarks);
        break;
      case 'headTurnRight':
        detectHeadTurnRight(landmarks);
        break;
      case 'headTurnUp':
        detectHeadTurnUp(landmarks);
        break;
      case 'headTurnDown':
        detectHeadTurnDown(landmarks);
        break;
      case 'blinkEyes':
        detectEyeBlink(landmarks);
        break;
    }
  };

  const detectHeadTurnLeft = (landmarks) => {
    const nose = landmarks[1];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const eyeDistance = rightEye.x - leftEye.x;
    const noseToEyeCenter = nose.x - (leftEye.x + rightEye.x) / 2;
    const headRotation = (noseToEyeCenter / eyeDistance) * 100;

    if (headRotation > 25) {
      moveToNextChallenge();
    }
  };

  const detectHeadTurnRight = (landmarks) => {
    const nose = landmarks[1];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const eyeDistance = rightEye.x - leftEye.x;
    const noseToEyeCenter = nose.x - (leftEye.x + rightEye.x) / 2;
    const headRotation = (noseToEyeCenter / eyeDistance) * 100;

    if (headRotation < -25) {
      moveToNextChallenge();
    }
  };

  const detectHeadTurnUp = (landmarks) => {
    const nose = landmarks[1];
    const chinBottom = landmarks[152];
    const foreheadTop = landmarks[10];
    const verticalRatio = (chinBottom.y - nose.y) / (nose.y - foreheadTop.y);

    if (verticalRatio > 1.5) {
      moveToNextChallenge();
    }
  };

  const detectHeadTurnDown = (landmarks) => {
    const nose = landmarks[1];
    const chinBottom = landmarks[152];
    const foreheadTop = landmarks[10];
    const verticalRatio = (chinBottom.y - nose.y) / (nose.y - foreheadTop.y);

    if (verticalRatio < 0.8) {
      moveToNextChallenge();
    }
  };

  const detectEyeBlink = (landmarks) => {
    const leftEyeTop = landmarks[159];
    const leftEyeBottom = landmarks[145];
    const rightEyeTop = landmarks[386];
    const rightEyeBottom = landmarks[374];

    const leftEyeDistance = Math.abs(leftEyeTop.y - leftEyeBottom.y);
    const rightEyeDistance = Math.abs(rightEyeTop.y - rightEyeBottom.y);

    const leftEyeHorizontal = Math.abs(landmarks[33].x - landmarks[133].x);
    const rightEyeHorizontal = Math.abs(landmarks[362].x - landmarks[263].x);

    const leftEyeOpenness = leftEyeDistance / leftEyeHorizontal;
    const rightEyeOpenness = rightEyeDistance / rightEyeHorizontal;

    const eyeOpenness = (leftEyeOpenness + rightEyeOpenness) / 2;

    const isBlinking = eyeOpenness < 0.15;

    if (!checksRef.current.lastBlinkState && isBlinking) {
      checksRef.current.blinkCount += 1;

      if (checksRef.current.blinkCount >= 1) {
        moveToNextChallenge();
        checksRef.current.blinkCount = 0;
      }
    }

    checksRef.current.lastBlinkState = isBlinking;
    checksRef.current.lastEyeOpenness = eyeOpenness;
  };


  const requestAndroidPermissions = () => {
    return new Promise((resolve, reject) => {
      if (!window.cordova || !cordova.plugins || !cordova.plugins.permissions) {
        resolve(true);
        return;
      }

      const permissions = cordova.plugins.permissions;
      const requiredPermissions = [
        permissions.CAMERA,
        permissions.ACCESS_FINE_LOCATION
      ];

      const checkPermissions = () => {
        permissions.requestPermissions(
          requiredPermissions,
          (status) => {
            if (status.hasPermission) {
              resolve(true);
            } else {
              reject(new Error(translate('permissions_not_granted', language)));
            }
          },
          () => {
            reject(new Error(translate('permissions_request_failed', language)));
          }
        );
      };

      permissions.hasPermission(
        requiredPermissions,
        (status) => {
          if (status.hasPermission) {
            resolve(true);
          } else {
            checkPermissions();
          }
        },
        () => {
          reject(new Error(translate('permission_check_failed', language)));
        }
      );
    });
  };

  useEffect(() => {
    const initializeWorkflow = async () => {
      try {
        await requestAndroidPermissions()

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 1280, height: 720 }
        });

        setPermissionStatus('granted');
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        initializeFaceMesh();
      } catch (error) {
        setIsLoading(false);
        setPermissionStatus('denied');
        // f7.dialog.alert(
        //   translate('face_recognize_camera_permission', language),
        //   translate('face_recognize_camera_permission_denied', language),
        //   () => {
        //     f7.views.main.router.back();
        //   }
        // );
        // f7.views.main.router.back();
        // showToastFailed(translate('face_recognize_camera_permission_denied', language) + ". " + translate('face_recognize_camera_permission', language))
        setTextFailed((translate('face_recognize_camera_permission_denied', language) + ". " + translate('face_recognize_camera_permission', language)))
        setSheetOpenedFailed(true)
      }
    };

    initializeWorkflow();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // useEffect(() => {
  //   if (checksRef.current.checksCompleted) {
  //     submitAttendanceRecord();
  //   }
  // }, [checksRef.current.checksCompleted]);

  // console.log("address :", address);

  // const textAddress = () => {
  //   if (!isInOfficeLocation) {
  //     if (address.length > 85) {
  //       return address.slice(0, 85) + "..."
  //     } else {
  //       return address
  //     }
  //   } else {
  //     return null
  //   }
  // }

  const backToHome = () => {
    try {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setIsLoading(false);
      setShowLoading(false);
      setPermissionStatus('prompt');
      setLivenessStatus('');
      setSelectedChallenges([]);
      setCurrentChallenge(null);
      setCapturedFaceImage(null);
      setLocation({});
      setIsInOfficeLocation(false);
      setOfficeName(null);
      setOfficeAreas([]);
      // setAddress('');
      setAttendanceType(null);
      setIsCaptureEnabled(false);

      checksRef.current = {
        currentChallenge: null,
        completedChallenges: [],
        checksCompleted: false,
        lastBlinkState: false,
        blinkCount: 0,
        lastEyeOpenness: 1.0,
        selectedChallenges: null,
      };

      f7.dialog.close();

      dispatch(setActiveTab('view-home'));
      f7.views.main.router.navigate('/home/', {
        reloadCurrent: false,
        replaceState: true,
        clearPreviousHistory: true,
        props: {
          targetTab: 'view-home'
        }
      });

    } catch (error) {
      console.error('Error during cleanup:', error);
      dispatch(setActiveTab('view-home'));
      f7.views.main.router.navigate('/home/', {
        reloadCurrent: false,
        replaceState: true,
        clearPreviousHistory: true,
        props: {
          targetTab: 'view-home'
        }
      });
    }
  };

  return (
    <Page>
      <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: "hidden" }}>
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            height: "100vh"
          }}>
            <Preloader color="white" size={50} />
            <p style={{ color: 'white', marginTop: 20, fontSize: 16 }}>
              {permissionStatus === 'prompt'
                ? translate('face_recognize_get_permission', language)
                : translate('face_recognize_prepare_camera', language)}
            </p>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', background: "black", transform: 'scaleX(-1)' }}
        />

        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: -10, left: 0, width: '100%', height: '102%', zIndex: 1 }}
        />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", position: "absolute", zIndex: 999, height: "100dvh", color: 'white', top: 0, width: "100%" }}>
          <div>
            <Link onClick={backToHome} style={{ color: "white", paddingTop: "20px", paddingLeft: "10px" }}>
              <IoIosArrowRoundBack size={"25px"} style={{ marginRight: "10px" }} />
              <p style={{ fontSize: "var(--font-lg)", fontWeight: "600" }}>{translate('home_clockin', language)}</p>
            </Link>

            <p style={{
              width: '100%',
              fontSize: 20,
              fontWeight: 700,
              textAlign: "center"
            }}>
              {translate('face_recognize_hold_upright', language)}
            </p>
          </div>

          <div>
            <p style={{
              width: '100%',
              fontSize: '16px',
              fontWeight: 400,
              textAlign: "center"
            }}>
              {livenessStatus}
            </p>

            <p style={{
              color: isInOfficeLocation ? 'var(--color-green)' : 'var(--color-red)',
              width: '90%',
              fontSize: '16px',
              fontWeight: 700,
              textAlign: "center",
              margin: "auto",
              paddingBottom: "15px",
            }}>
              {officeName ? `${translate('in_the_office_area', language)} ${officeName}` : translate('out_the_office_area', language)}
            </p>

            {/*<p style={{
              color: isInOfficeLocation ? 'var(--color-green)' : 'var(--color-red)',
              width: '90%',
              fontSize: '16px',
              fontWeight: 500,
            }}>
              {textAddress()}
            </p>*/}

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              paddingBottom: '15px',
            }}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "12px", background: "rgba(0,0,0,0)", border: "5px solid rgba(255,255,255,0.3)", borderRadius: "100%", padding: "1px", transition: isCaptureEnabled ? "all ease-in 0.3s" : "" }} disabled={!isCaptureEnabled} onClick={handleCaptureFace}>
                <GiPlainCircle style={{ color: "white", opacity: isCaptureEnabled ? 1 : 0.5, transition: 'all 0.3s ease' }} size={55} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmAttendancePopup popupOpened={isOutOfficeLocationPopup} setPopupOpened={setIsOutOfficeLocationPopup} />
      <LoadingPopup popupOpened={showLoading} setPopupOpened={setShowLoading} />
      <MessageAlert
        sheetOpened={sheetOpenedFailed}
        setSheetOpened={setSheetOpenedFailed}
        title={translate('attendance_submission_failed', language)}
        message={textFailed}
        imageAlert={theme === "light" ? AlertFailedLight : AlertFailedDark}
        btnCloseText={translate('close', language)}
        handleClick={() => f7.views.main.router.navigate('/home/', { clearPreviousHistory: true })}
      />

      <MessageAlert
        sheetOpened={sheetOpened}
        setSheetOpened={setSheetOpened}
        title={attendanceType == "clockin" ? translate('clockin_success', language) : translate('clockout_success', language)}
        message={attendanceType == "clockin" ? translate('clockin_success_text', language) : translate('clockout_success_text', language)}
        imageAlert={theme == "light" ? ImageAlertLight : ImageAlertDark}
        btnCloseText={translate('close', language)}
        handleClick={() => f7.views.main.router.navigate('/home/', { clearPreviousHistory: true })}
      />
    </Page>
  );
};

export default FaceRecognizer;