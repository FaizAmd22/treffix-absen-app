import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectSettings } from '../slices/settingsSlice';
import LoadingImage from '../assets/loading/loading-blue.json'
import { Preloader } from 'framework7-react';
import LottieWebAnimation from './LottieWebAnimation';

const Loading = ({ height }) => {
    const theme = useSelector(selectSettings)
    const lottieRef = useRef(null)

    return (
        <div style={{ width: "100%", height: height, display: "flex", justifyContent: "center", alignItems: "center" }}>
            {/*<div style={{ width: "200px", height: "200px", animation: "spin 1s linear infinite", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <img
                    src={theme == 'light' ? logo2 : logo}
                    alt="loading"
                    style={{
                        width: "25%",
                    }}
                />
                <style jsx>{`
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        `}</style>
            </div>*/}

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <LottieWebAnimation ref={lottieRef} path={LoadingImage} width={"180px"} height={"180px"} />
            </div>
        </div>
    );
};

export default Loading;