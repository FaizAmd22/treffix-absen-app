import React, { useEffect } from 'react';
import { getDevice } from 'framework7/lite-bundle';
import { Provider } from 'react-redux';
import { f7, f7ready, App, View } from 'framework7-react';
import cordovaApp from './js/cordova-app';
import routes from './js/routes';
import store from './js/store';
import { destroyReminderSystem, initReminderSystem } from './functions/notification';
import { TourProvider } from '@reactour/tour';
import { steps } from './utils/steps';

const MyApp = () => {
  const device = getDevice();

  useEffect(() => {
    initReminderSystem();

    return () => {
      destroyReminderSystem();
    };
  }, []);

  const f7params = {
    name: 'Ngabsen',
    theme: 'auto',
    routes: routes,
    input: {
      scrollIntoViewOnFocus: device.cordova,
      scrollIntoViewCentered: device.cordova,
    },
    statusbar: {
      iosOverlaysWebView: true,
      androidOverlaysWebView: false,
    },
  };

  function debugWonderPush() {
    if (cordova && cordova.plugins && cordova.plugins.WonderPush) {
      cordova.plugins.WonderPush.setLogging(true);

      cordova.plugins.WonderPush.getInstallationId((id) => {
        console.log('Installation ID:', id);
      }, (err) => {
        console.error('Gagal ambil Installation ID:', err);
      });

      cordova.plugins.WonderPush.getPushToken((token) => {
        console.log('FCM token:', token);
      }, (err) => {
        console.error('Gagal ambil FCM token:', err);
      });
    }
  }

  function initializeWonderPush() {
    if (cordova && cordova.plugins && cordova.plugins.WonderPush) {
      // console.log('Initializing WonderPush...');

      cordova.plugins.WonderPsush.setLogging(true);

      cordova.plugins.WonderPush.subscribeToNotifications(
        function (result) {
          // console.log("WonderPush subscription success:", result);

          setTimeout(() => {
            debugWonderPush();
          }, 2000);
        },
        function (error) {
          console.error("WonderPush subscription error:", error);
        }
      );
    } else {
      console.error('WonderPush plugin not available');
    }
  }

  f7ready(() => {
    if (f7.device.cordova) {
      cordovaApp.init(f7);
    }

    function onDeviceReady() {
      // console.log("test cordova");
      WonderPush.subscribeToNotifications();
      setTimeout(() => {
        initializeWonderPush();
      }, 1000);

      if (!navigator.onLine) {
        f7.views.main.router.navigate('/connection-lost/');
      }
    }

    document.addEventListener('deviceready', onDeviceReady);

    let lastOfflineTriggered = false;

    setInterval(() => {
      const router = f7.views.main.router;

      if (!navigator.onLine && !lastOfflineTriggered) {
        const currentUrl = router.currentRoute.url;
        console.log("connection lost!");

        localStorage.setItem('previousRoute', currentUrl);

        router.navigate('/connection-lost/', {
          force: true,
          ignoreCache: true,
        });

        lastOfflineTriggered = true;
      }

      if (navigator.onLine && lastOfflineTriggered) {
        lastOfflineTriggered = false;
      }
    }, 5000);
  });

  return (
    <TourProvider
      steps={steps}
      badgeContent={({ totalSteps, currentStep }) => currentStep + 1 + "/" + totalSteps}
      showCloseButton={false}
      showDots={false}
      styles={{
        popover: (base) => ({
          ...base,
          '--reactour-accent': 'var(--bg-primary-green)',
          borderRadius: 10,
          width: "250px",
          background: "#212121",
          color: "white",
        }),
        maskArea: (base) => ({ ...base, rx: 15 }),
        maskWrapper: (base) => ({ ...base, color: '#000', pointerEvents: 'none' }),
        badge: (base) => ({ ...base, left: 3 }),
        controls: (base) => ({ ...base, marginTop: 20, gap: 80 }),
      }}

      onClickMask={(e) => {
        e.stopPropagation();
        return false;
      }}

      nextButton={({ currentStep, stepsLength, setIsOpen, setCurrentStep }) => {
        const isLast = currentStep === stepsLength - 1;
        return (
          <button
            onClick={() => {
              if (isLast) {
                setIsOpen(false)
                setCurrentStep(0)
                // localStorage.removeItem("isOnboarding")
              } else {
                setCurrentStep((s) => s + 1);
              }
            }}
            style={{
              color: 'var(--bg-primary-green)',
              background: 'none',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isLast ? 'Selesai' : 'Selanjutnya'}
          </button>
        );
      }}

      prevButton={({ setIsOpen, setCurrentStep }) => (
        <button
          onClick={() => {
            setIsOpen(false)
            setCurrentStep(0)
            // localStorage.removeItem("isOnboarding")
          }}
          style={{
            color: 'red',
            background: 'none',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Tutup
        </button>
      )}
    >
      <Provider store={store}>
        <App {...f7params}>
          <View main className="safe-areas" url="/" />
        </App>
      </Provider>
    </TourProvider>
  );
};

export default MyApp;
