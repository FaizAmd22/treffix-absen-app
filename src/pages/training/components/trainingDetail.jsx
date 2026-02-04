import React, { useEffect, useState } from 'react';
import profile from "../../../assets/user-pic.jpeg";
import star from "../../../assets/icons/star.svg";
import starOutline from "../../../assets/icons/star-outline.svg";
import { Button, Link, Page, SkeletonBlock, f7 } from 'framework7-react';
import { useDispatch, useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { CiUser } from 'react-icons/ci';
import { PiAlarmLight, PiSealCheck } from 'react-icons/pi';
import { TiDocumentText } from 'react-icons/ti';
import { LuMonitor } from 'react-icons/lu';
import { updateTest } from '../../../slices/testSlice';
import TrainingPopup from './trainingPopup';
import { API } from '../../../api/axios';
import { selectLanguages } from '../../../slices/languagesSlice';
import { formatDate } from '../../../functions/formatDate';
import { translate } from '../../../utils/translate';
import { labelFilter } from '../../../functions/labelFilter';
import Loading from '../../../components/loading';
import RatingPopup from './ratingPopup';
import ExpiredPopup from './expiredPopup';
import { showToastFailed } from '../../../functions/toast';
import LoadingPopup from '../../../components/loadingPopup';
import { truncateText } from '../../../functions/truncateText';
import ButtonFixBottom from '../../../components/buttonFixBottom';
import CustomButton from '../../../components/customButton';

const TrainingDetail = () => {
    const theme = useSelector(selectSettings);
    const [popupOpened, setPopupOpened] = useState(false);
    const [expiredPopupOpened, setExpiredPopupOpened] = useState(false);
    const [ratingOpened, setRatingOpened] = useState(false);
    const [dataDetail, setDataDetail] = useState({});
    const [dataTrainingCard, setDataTrainingCard] = useState([]);
    const [dataRating, setDataRating] = useState([]);
    const [isHasCard, setIsHasCard] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const [isLoadingPopup, setIsLoadingPopup] = useState(false);
    const [error, setError] = useState(null);
    const [isTest, setIsTest] = useState(null);
    const [method, setMethod] = useState(null);
    const [testType, setTestType] = useState("");
    const language = useSelector(selectLanguages);
    const token = localStorage.getItem('token');
    const today = new Date();
    const dispatch = useDispatch();
    const totalStars = 5;
    const filledStarsCount = dataDetail.rating;
    const stars = [];

    console.log("dataDetail :", dataDetail)
    console.log("dataTrainingCard :", dataTrainingCard)
    console.log("dataRating :", dataRating)
    console.log("testType :", testType)

    function isTodayOrPast(dateString) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const checkDate = new Date(dateString);
        checkDate.setHours(0, 0, 0, 0);

        return checkDate <= today;
    }

    for (let i = 0; i < totalStars; i++) {
        if (i < filledStarsCount) {
            stars.push(
                <img key={i} src={star} alt="Filled Star" style={{ width: "20px", height: "20px" }} />
            );
        } else {
            stars.push(
                <img key={i} src={starOutline} alt="Empty Star" style={{ width: "20px", height: "20px" }} />
            );
        }
    }

    // useEffect(() => {
    //     if (isLoadingSubmit) {
    //         f7.dialog.preloader('Loading ...');
    //     } else {
    //         f7.dialog.close()
    //     }
    // }, [isLoadingSubmit])

    const fetchDetail = async () => {
        const id = f7.views.main.router.currentRoute.params.id;

        try {
            const response = await API.get(`/user-developments/${id}`);
            const data = response.data.payload
            console.log("payload :", response.data);
            setDataDetail(data);
            setMethod(data.method)
            localStorage.setItem("method", data.method)
            localStorage.setItem("training_format", data.training_format)
            setTestType(data.current_test_type)
            dispatch(updateTest(data.current_test_type))
        } catch (error) {
            console.error("fetch detail tidak bisa diakses", error);
            setError(translate('training_detail_failed_getdetail', language));
            f7.views.main.router.back();
        }
    };

    const fetchDetailTrainingCard = async () => {
        const id = f7.views.main.router.currentRoute.params.id;

        try {
            const response = await API.get(`/user-developments/${id}/trainings`);
            const data = response.data.payload
            setDataTrainingCard(data)

            if (data.length > 0) {
                setIsHasCard(true)
            }

        } catch (error) {
            console.error("fetch detail card tidak bisa diakses", error);
            setError(translate('training_detail_failed_getdetail', language));
        }
    };

    const fetchRating = async () => {
        const id = f7.views.main.router.currentRoute.params.id;

        try {
            const response = await API.get(`/user-developments/${id}/reviews`);
            const data = response.data.payload
            setDataRating(data)
        } catch (error) {
            console.error("fetch detail card tidak bisa diakses", error);
            setError(translate('training_detail_failed_getdetail', language));
        }
    };

    useEffect(() => {
        const url = f7.views.main.router.currentRoute.params.test;
        setIsTest(url)
        setIsHasCard(false)

        if (token) {
            setIsLoading(true)
            fetchDetail();
            fetchDetailTrainingCard();
            fetchRating()
            setIsLoading(false)
        }
    }, [token]);

    const onRefresh = (done) => {
        setTimeout(() => {
            setIsLoading(true);
            Promise.all([
                fetchDetail(),
                fetchDetailTrainingCard(),
                fetchRating()
            ]).finally(() => {
                setIsLoading(false);
                done();
            });
        }, 500);
    }

    const fetchStartTest = async () => {
        const id = f7.views.main.router.currentRoute.params.id;

        try {
            await API.post(`/user-developments/${id}/check-online`, {});

            fetchQuestion()
        } catch (error) {
            console.error("Data tidak bisa diakses", error);
            // f7.dialog.alert(translate('training_detail_failed_start_test', language));
            showToastFailed(translate('training_detail_failed_start_test', language))
        }
    };

    const fetchQuestion = async () => {
        const id = f7.views.main.router.currentRoute.params.id;

        try {
            const response = await API.get(`/user-developments/${id}/test-details`);

            const payload = response.data.payload;
            console.log("Response Payload question:", payload);

            if (payload.step === "pre_test") {
                console.log("Navigating to /question/${id}/");
                f7.views.main.router.navigate(`/question/${id}/`, { clearPreviousHistory: true });
            } else if (payload.step === "video_learning") {
                console.log("Navigating to /video-learning/${id}/");
                f7.views.main.router.navigate(`/video-learning/${id}/`, { clearPreviousHistory: true });
            } else {
                console.log("Navigating to /question/${id}/");
                f7.views.main.router.navigate(`/question/${id}/`, { clearPreviousHistory: true });
            }
        } catch (error) {
            console.error("Error in fetchQuestion:", error);

            if (error.status == 406) {
                setExpiredPopupOpened(true)
            } else {
                // f7.dialog.alert(translate('training_detail_failed_getdetail', language));
                showToastFailed(translate('training_detail_failed_getdetail', language))
            }
        } finally {
            setIsLoadingPopup(false);
        }
    };

    const detail = [
        {
            icon: <CiUser size={"20px"} />,
            label: dataDetail.allowed_positions?.length >= 1 ? translate('for', language) + dataDetail.allowed_positions?.map(position => position.name).join(', ') : translate('for_all_positions', language),
        },
        (dataTrainingCard.length < 1 || method == "offline" ? {
            icon: <PiAlarmLight size={"20px"} />,
            label: `Pre-Test: ${dataDetail.pre_test_timeout} ${translate('minutes', language).toLowerCase()}, ${dataDetail.post_test_timeout ? `Post-Test: ${dataDetail.post_test_timeout} ${translate('minutes', language).toLowerCase()},` : ""} ${method == "online" ? " + video learning" : ""}`,
        } : {}),
        {
            icon: <TiDocumentText size={"20px"} />,
            label: labelFilter(dataDetail.mandatory, language),
        },
        // {
        //     icon: <PiSealCheck size={"20px"} />,
        //     label: "Certificate of Completion",
        // },
        {
            icon: <LuMonitor size={"20px"} />,
            label: translate('training_detail_device', language),
        },
    ];

    const handleOpenPopup = () => {
        setPopupOpened(true);
    };

    const handleConfirm = () => {
        setPopupOpened(false);
        dispatch(updateTest('pre-test'));
        setIsLoadingPopup(true)
        fetchStartTest()
    };

    // useEffect(() => {
    //     if (isLoadingPopup) {
    //         f7.dialog.preloader('Loading...');
    //     } else {
    //         f7.dialog.close();
    //     }
    // }, [isLoadingPopup]);

    const description = () => {
        if (testType == "video_learning") {
            return translate('go_to_video', language)
        } else {
            return `${translate('training_desc_start_test1', language)} ${testType == 'post_test' ? "Post-Test" : "Pre-Test"} ${translate('training_desc_start_test2', language)}`
        }
    }

    if (isLoading) {
        return (
            <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
                <Loading height="100vh" />
            </Page>
        );
    }

    if (error) {
        return (
            <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                    <p style={{ color: theme === "light" ? "black" : "white" }}>{error}</p>
                </div>
            </Page>
        );
    }

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} ptr ptrMousewheel={true} onPtrRefresh={onRefresh}>
            <div>
                <div style={{ position: "relative", height: "36vh" }}>
                    {
                        isTest ? (
                            <Link back style={{ color: "white", padding: "3px", position: "absolute", top: 25, left: 10, background: "rgba(0,0,0, 0.3)", borderRadius: "100%" }} className='ios-mt-30'>
                                <IoIosArrowRoundBack size={"25px"} />
                            </Link>
                        ) : (
                            <Link href="/training/" style={{ padding: "3px", color: "white", position: "absolute", top: 25, left: 10, background: "rgba(0,0,0, 0.3)", borderRadius: "100%" }} className='ios-mt-30'>
                                <IoIosArrowRoundBack size={"25px"} />
                            </Link>
                        )
                    }

                    <div style={{ position: "relative", width: "100%", height: "100%" }}>
                        {
                            dataDetail.thumbnail ? (
                                <img
                                    src={dataDetail.thumbnail}
                                    alt="Content"
                                    style={{
                                        width: "100%",
                                        height: "98%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <SkeletonBlock
                                    className="skeleton-effect-wave"
                                    style={{
                                        width: "100%",
                                        height: "98%",
                                        borderRadius: "0",
                                    }}
                                />
                            )
                        }
                        <div
                            style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                width: "100%",
                                height: "30%",
                                background:
                                    theme === "light"
                                        ? "linear-gradient(to top, #F2F2F2, rgba(0,0,0,0))"
                                        : "linear-gradient(to top, #1A1A1A, rgba(0,0,0,0))",
                            }}
                        ></div>
                    </div>
                </div>

                <div style={{ height: "55vh", overflowY: "auto", padding: "10px 15px" }}>
                    <div>
                        <p style={{ fontSize: "var(--font-xl)", fontWeight: 700, color: theme === "light" ? "black" : "white" }}>
                            {dataDetail.title ? dataDetail.title : ""}
                        </p>
                        <p style={{ fontSize: "var(--font-xs)", fontWeight: 400, color: theme === "light" ? "var(--color-dark-gray)" : "var(--color-gray)", marginTop: "-10px" }}>
                            {formatDate(dataDetail.start_date, language, "no-weekdays") + (dataDetail.end_date ? " - " + formatDate(today, language, "no-weekdays") : "")}
                        </p>
                    </div>

                    <div style={{ marginTop: "30px" }}>
                        <p style={{ fontSize: "var(--font-md)", fontWeight: 700, color: theme === "light" ? "black" : "white" }}>{translate('training_detail_deskription', language)}</p>
                        <p style={{ fontSize: "var(--font-sm)", fontWeight: 400, color: theme === "light" ? "var(--color-dark-gray)" : "var(--color-gray)", marginTop: "15px", textAlign: "justify" }}>
                            {dataDetail.description}
                        </p>
                    </div>

                    <div style={{ marginTop: "30px" }}>
                        <p style={{ fontSize: "var(--font-md)", fontWeight: 700, color: theme === "light" ? "black" : "white" }}>{translate('training_detail', language)}</p>

                        {detail.map((item, index) => (
                            <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "20px", gap: "5px", color: theme === "light" ? "var(--color-dark-gray)" : "var(--color-gray)" }}>
                                <div style={{ width: "7%" }}>
                                    {item.icon}
                                </div>
                                <p style={{ fontSize: "var(--font-xs)", fontWeight: 400, width: "90%", margin: 0 }}>{item.label}</p>
                            </div>
                        ))}
                    </div>

                    {
                        (!isTest && dataDetail.training_format == "group") && (
                            <>
                                <div style={{ marginTop: "30px" }}>
                                    <p style={{ fontSize: "var(--font-md)", fontWeight: 700, color: theme === "light" ? "black" : "white" }}>{translate('training_list', language)}</p>

                                    {dataTrainingCard.map((item, index) => (
                                        <a key={index} href={`/training-detail/${item.id}/test/`} style={{ width: "100%" }}>
                                            <div key={index} style={{ boxShadow: "0 0 2px rgba(0, 0, 0, 0.15)", borderRadius: "12px", width: "100%", height: "100%", background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-gray)", gap: "20px", marginBottom: "20px", color: theme === "light" ? "black" : "white" }}>
                                                <div style={{ position: "relative", display: "flex", justifyContent: "end", marginTop: "20px", paddingTop: "10px", marginRight: "10px" }}>
                                                    {
                                                        item.completed ? (
                                                            <div style={{ background: "var(--color-green)", borderRadius: "360px", padding: "5px 10px", width: "100px", textAlign: "center", marginTop: "-5px" }}>
                                                                <p style={{ fontWeight: 700, fontSize: "var(--font-xs)", color: "white", margin: 0, padding: 0 }}>{translate('training_finished', language)}</p>
                                                            </div>
                                                        ) : (
                                                            <div style={{ background: "var(--color-yellow)", borderRadius: "360px", padding: "5px 10px", width: "100px", textAlign: "center", marginTop: "-5px" }}>
                                                                <p style={{ fontWeight: 700, fontSize: "var(--font-xs)", color: "white", margin: 0 }}>{translate('training_unfinished', language)}</p>
                                                            </div>
                                                        )
                                                    }
                                                </div>

                                                <img src={item.thumbnail} alt={item.title} style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "12px 12px 0 0", marginTop: "-33px" }} />

                                                <div style={{ width: "100%", padding: "10px 15px" }}>
                                                    <p style={{ fontSize: "var(--font-md)", fontWeight: 700, margin: 0, marginTop: "10px", width: "80%" }}>{item.title}</p>
                                                    <p style={{ color: "var(--color-gray)", fontSize: "var(--font-xs)", fontWeight: "400", margin: 0, padding: 0, marginTop: 0 }}>{formatDate(item.start_date, language, "no-weekdays")} {item.end_date && `- ${formatDate(item.end_date, language, "no-weekdays")}`}</p>

                                                    <p style={{ fontSize: "var(--font-sm)", padding: "5px 0" }}>{truncateText(item.description, 80)}</p>
                                                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "10px" }}>
                                                        <img src={item.trainer_pic ? item.trainer_pic : profile} alt={item.trainer_name} style={{ width: "30px", height: "30px", objectFit: "cover", borderRadius: "360px" }} />

                                                        <div>
                                                            <p style={{ fontSize: "var(--font-xs)" }}>{item.trainer_name}</p>
                                                            <p style={{ fontSize: "var(--font-xs)" }}>{item.trainer_position_name ? item.trainer_position_name : null}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </>
                        )
                    }

                    {
                        (isTest || dataDetail.training_format == "single") && (
                            <div style={{ marginTop: "30px", marginBottom: "30px" }}>
                                <p style={{ fontSize: "var(--font-md)", fontWeight: 700, color: theme === "light" ? "black" : "white" }}>{translate('training_tutor', language)}</p>

                                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                    <img src={dataDetail.trainer_pic ? dataDetail.trainer_pic : profile} alt="Profile" style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "100px" }} />
                                    <div>
                                        <p style={{ fontSize: "var(--font-sm)", fontWeight: 700, color: theme === "light" ? "black" : "white" }}>{dataDetail?.trainer_name}</p>
                                        <p style={{ fontSize: "var(--font-xs)", fontWeight: 400, color: theme === "light" ? "var(--color-dark-gray)" : "var(--color-gray)", marginTop: "-10px" }}>{dataDetail?.trainer_position_name}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {
                        !isHasCard ? (
                            <div style={{ marginBottom: "40px", marginTop: "30px" }}>
                                <p style={{ fontSize: "var(--font-md)", fontWeight: 700, color: theme === "light" ? "black" : "white" }}>{translate('training_review', language)}</p>
                                {
                                    dataRating.length > 0 ? (
                                        <>
                                            <div style={{ display: "flex", alignItems: "center", gap: "7px", marginTop: "-10px" }}>
                                                <img src={star} alt="Star" style={{ width: "25px", height: "25px" }} />
                                                <p style={{ color: theme === "light" ? "black" : "white", fontSize: "var(--font-sm)", fontWeight: "700" }}>{dataDetail.rating}</p>
                                            </div>

                                            {dataRating.map((item, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-gray)",
                                                        border: theme === "light" ? "1px solid var(--border-primary-gray)" : "1px solid var(--bg-secondary-gray)",
                                                        borderRadius: "12px",
                                                        padding: "15px",
                                                        marginBottom: "10px",
                                                    }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                                        <img src={item.reviewer_pic ? item.reviewer_pic : profile} alt="Profile" style={{ width: "35px", height: "35px", objectFit: "cover", borderRadius: "100px" }} />
                                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                                            <p style={{ fontSize: "var(--font-sm)", fontWeight: 700, color: theme === "light" ? "black" : "white", margin: 0 }}>{item.reviewer_name}</p>
                                                            <p style={{ fontSize: "var(--font-xs)", fontWeight: 400, color: theme === "light" ? "var(--color-dark-gray)" : "var(--color-gray)", margin: 0 }}>{item.reviewer_position}</p>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
                                                        {stars}
                                                        <p style={{ fontSize: "var(--font-xs)", fontWeight: 400, color: theme === "light" ? "var(--color-dark-gray)" : "var(--color-gray)", marginLeft: "8px" }}>{formatDate(item.created_at, language, "with-time")}</p>
                                                    </div>

                                                    <p style={{ fontSize: "var(--font-xs)", fontWeight: 400, color: theme === "light" ? "var(--color-dark-gray)" : "var(--color-gray)" }}>
                                                        {item.comment}
                                                    </p>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <div>
                                            <p style={{ fontStyle: "italic", fontSize: "var(--font-xs)", color: theme === "light" ? "black" : "white" }}>{translate('no_review_yet', language)}</p>
                                        </div>
                                    )
                                }
                            </div>
                        ) : !isTest && !dataDetail.has_reviewed && dataDetail.training_format == "group" ? (
                            <div style={{ marginBottom: "40px", marginTop: "30px" }}>
                                <p style={{ fontSize: "var(--font-md)", fontWeight: 700, color: theme === "light" ? "black" : "white" }}>{translate('training_review', language)}</p>
                                <div style={{ marginTop: "30px", fontWeight: 700, fontSize: "var(--font-xs)", color: theme === "light" ? "black" : "white" }}>
                                    <p>{translate('no_review_yet', language)}</p>
                                </div>
                            </div>
                        ) : <></>
                    }
                </div>
                {
                    (isTest || dataDetail.training_format == "single") && (method == "online" && isTodayOrPast(dataDetail.start_date)) ? (
                        <ButtonFixBottom needBorderTop={true}>
                            <CustomButton
                                bg={dataDetail.completed ? "var(--bg-secondary-gray)" : "var(--bg-primary-green)"}
                                color={"white"}
                                disable={dataDetail.completed}
                                // disable
                                handleClick={handleOpenPopup}
                                text={dataDetail.completed ? translate('training_finished', language) : translate('start_training', language)}
                            />
                        </ButtonFixBottom>
                    ) : (isTest || dataDetail.training_format == "single") && (method == "offline" && isTodayOrPast(dataDetail.start_date)) ? (
                        <ButtonFixBottom needBorderTop={true}>
                            <CustomButton
                                bg={dataDetail.completed ? "var(--bg-secondary-gray)" : "var(--bg-primary-green)"}
                                color={"white"}
                                disable={dataDetail.completed}
                                // disable
                                handleClick={() => f7.views.main.router.navigate(`/scan/${dataDetail.id}/`, { clearPreviousHistory: true })}
                                text={dataDetail.completed ? translate('training_finished', language) : testType == "pre_test" ? translate('training_scan_pretest', language) : testType == "post_test" ? translate('training_scan_posttest', language) : translate('training_scan_checkin', language)}
                            />
                        </ButtonFixBottom>
                    ) : <></>
                }
            </div>

            <TrainingPopup
                theme={theme}
                popupOpened={popupOpened}
                setPopupOpened={setPopupOpened}
                handleConfirm={handleConfirm}
                title={translate('start_training', language)}
                desc={description()}
                btnYes={translate('start', language)}
                btnNo={translate('training_cancel', language)}
            />

            <ExpiredPopup
                theme={theme}
                popupOpened={expiredPopupOpened}
                setPopupOpened={setExpiredPopupOpened}
                language={language}
                method={method}
                setIsLoadingSubmit={setIsLoadingSubmit}
                setRatingOpened={setRatingOpened}
                testType={testType}
                title={translate('training_expired', language)}
                desc={translate('training_expired_text', language)}
                btnYes={translate('continue', language)}
                btnNo={translate('training_cancel', language)}
            />
            <RatingPopup ratingOpened={ratingOpened} setRatingOpened={setRatingOpened} />
            <LoadingPopup popupOpened={isLoadingPopup} setPopupOpened={setIsLoadingPopup} />
            <LoadingPopup popupOpened={isLoadingSubmit} setPopupOpened={setIsLoadingSubmit} />
        </Page>
    );
};

export default TrainingDetail;