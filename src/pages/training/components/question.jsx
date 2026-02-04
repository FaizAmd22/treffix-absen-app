import React, { useEffect, useRef, useState } from 'react';
import { Page, Button, Progressbar, List, f7, Preloader } from 'framework7-react';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import QuestionPopup from './questionPopup';
import RatingPopup from './ratingPopup';
import { API } from '../../../api/axios';
import { translate } from '../../../utils/translate';
import { selectLanguages } from '../../../slices/languagesSlice';
import Loading from '../../../components/loading';
import { showToastFailed } from '../../../functions/toast';
import LoadingPopup from '../../../components/loadingPopup';
import CustomPopup from '../../../components/customPopup';
import ButtonFixBottom from '../../../components/buttonFixBottom';
import CustomButton from '../../../components/customButton';

const QuestionPage = () => {
    // const questions = dataQuestion2[0].payload.data.questions
    // const data = dataQuestion2[0].payload.data
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [popupOpened, setPopupOpened] = useState(false);
    const [ratingOpened, setRatingOpened] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const [questions, setQuestions] = useState({})
    const [payload, setPayload] = useState({})

    const [showPopup, setShowPopup] = useState(false)
    const [typeShowPopup, setTypeShowPopup] = useState(null)
    const selectedTestRef = useRef()
    const nextTestRef = useRef();
    const timeoutRef = useRef();
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const token = localStorage.getItem("token")
    const method = localStorage.getItem("method")
    const sessionCode = localStorage.getItem("sessionCode")
    const trainingFormat = localStorage.getItem("training_format")
    const isAllAnswered = questions.length == answers.length ? true : false
    // console.log("selectedOptions", selectedOptions)
    // console.log("selectedTestRef", selectedTestRef.current)
    // console.log("timeoutRef", timeoutRef.current)
    // console.log("answer", answers)
    // console.log("isAllAnswered", isAllAnswered)
    // console.log("questions", questions)


    useEffect(() => {
        if (timeoutRef.current) {
            setTimeLeft(timeoutRef.current * 60);
        }
    }, [timeoutRef.current]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // useEffect(() => {
    //     if (isLoadingSubmit) {
    //         f7.dialog.preloader('Loading ...');
    //     } else {
    //         f7.dialog.close()
    //     }
    // }, [isLoadingSubmit])

    useEffect(() => {
        setIsLoading(true)
        const id = f7.views.main.router.currentRoute.params.id;
        console.log("id :", id);

        const fetchQuestion = async () => {
            try {
                let response = ""
                if (method == "online") {
                    response = await API.get(`/user-developments/${id}/test-details`);
                } else {
                    response = await API.get(`/user-developments/${id}/offline/details`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Session-Code': sessionCode,
                        }
                    });
                }

                const payload = response.data.payload;
                // console.log("response :", payload);
                selectedTestRef.current = payload.step;
                nextTestRef.current = payload.next_step;
                timeoutRef.current = payload.data.timeout;
                // console.log("nextTestRef :", nextTestRef.current);

                setPayload(payload)
                setQuestions(payload.data.questions || [])
            } catch (error) {
                console.log("error :", error);
                // f7.dialog.create({
                //     title: 'Error',
                //     text: translate('question_failed_getdata', language),
                //     destroyOnClose: true
                // }).open();
                showToastFailed(translate('question_failed_getdata', language))
            } finally {
                setIsLoading(false)
            }
        };

        if (token) {
            fetchQuestion();
        }
    }, [token]);


    const fetchSubmitAnswer = async () => {
        const id = f7.views.main.router.currentRoute.params.id;
        setIsLoadingSubmit(true)

        try {
            const payload = { answers }
            let response = ""
            if (method == "online") {
                response = await API.post(`/user-developments/${id}/test-submit`, payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
            } else {
                response = await API.post(`/user-developments/${id}/offline/submit`, payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Session-Code': sessionCode,
                    }
                });
            }

            // console.log("response fetchSubmit :", response);
            setIsLoadingSubmit(false)
            if (method == "offline") {
                setPopupOpened(false);
                if (response.data.payload.finished == true) {
                    setRatingOpened(true)
                } else {
                    if (trainingFormat == "single") {
                        setShowPopup(true)
                        setTypeShowPopup("training_single")
                        // f7.dialog.create({
                        //     text: translate('question_submit_success', language),
                        //     buttons: [
                        //         {
                        //             text: 'OK',
                        //             onClick: function () {
                        //                 f7.views.main.router.navigate(`/training-detail/${id}/`, {
                        //                     reloadCurrent: false,
                        //                     replaceState: true,
                        //                     clearPreviousHistory: true,
                        //                 });
                        //             }
                        //         }
                        //     ],
                        //     destroyOnClose: true
                        // }).open();
                    } else {
                        setShowPopup(true)
                        setTypeShowPopup("training_berkala")
                        // f7.dialog.create({
                        //     text: translate('question_submit_success', language),
                        //     buttons: [
                        //         {
                        //             text: 'OK',
                        //             onClick: function () {
                        //                 f7.views.main.router.navigate(`/training-detail/${id}/test`, {
                        //                     reloadCurrent: false,
                        //                     replaceState: true,
                        //                     clearPreviousHistory: true,
                        //                 });
                        //             }
                        //         }
                        //     ],
                        //     destroyOnClose: true
                        // }).open();
                    }
                }
            } else {
                if (nextTestRef.current == "video_learning") {
                    console.log("nextTestRef.current :", nextTestRef.current);
                    setPopupOpened(false);
                    f7.views.main.router.navigate(`/video-learning/${id}/`, { clearPreviousHistory: true, });
                } else {
                    console.log("finished :", response.data.payload.finished);
                    console.log("test_passed :", response.data.payload.test_passed);
                    if (response.data.payload.finished == true) {
                        setPopupOpened(false);
                        setRatingOpened(true)
                    } else {
                        setPopupOpened(false);
                        setShowPopup(true)
                        setTypeShowPopup("rewatch_video")
                        // f7.dialog.create({
                        //     title: translate('training_failed', language),
                        //     text: translate('question_rewatch_video', language),
                        //     buttons: [
                        //         {
                        //             text: 'OK',
                        //             onClick: function () {
                        //                 f7.views.main.router.navigate(`/video-learning/${id}/`, {
                        //                     reloadCurrent: false,
                        //                     replaceState: true,
                        //                     clearPreviousHistory: true,
                        //                 });
                        //             }
                        //         }
                        //     ],
                        //     destroyOnClose: true
                        // }).open();
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            // f7.dialog.alert(translate('question_submit_failed', language))
            showToastFailed(translate('question_submit_failed', language))
        } finally {
            setIsLoadingSubmit(false);
        }
    };

    const handleConfirmPopup = () => {
        setShowPopup(false)
        const id = f7.views.main.router.currentRoute.params.id;

        if (typeShowPopup == "rewatch_video") {
            f7.views.main.router.navigate(`/video-learning/${id}/`, { clearPreviousHistory: true, })
        } else if (typeShowPopup == "training_single") {
            f7.views.main.router.navigate(`/training-detail/${id}/`, { clearPreviousHistory: true, });
        } else if (typeShowPopup == "training_berkala") {
            f7.views.main.router.navigate(`/training-detail/${id}/test`, { clearPreviousHistory: true, });
        }
    }

    const getTitle = () => {
        if (typeShowPopup == "rewatch_video") {
            return translate('training_failed', language)
        } else {
            return null
        }
    }

    const getText = () => {
        if (typeShowPopup == "rewatch_video") {
            return translate('question_rewatch_video', language)
        } else {
            return translate('question_submit_success', language)
        }
    }

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            handleLogoutClick()
        }
    };

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleOptionSelect = (index) => {
        const newSelectedOptions = [...selectedOptions];
        newSelectedOptions[currentQuestion] = index;
        setSelectedOptions(newSelectedOptions);

        const selectedAnswer = {
            question_id: questions[currentQuestion]?.id,
            question_type: "multiple_choice",
            answer_id: questions[currentQuestion]?.options[index]?.id,
            answer_text: null
        };

        setAnswers(prevAnswers => {
            const updatedAnswers = [...prevAnswers];
            updatedAnswers[currentQuestion] = selectedAnswer;
            return updatedAnswers;
        });
    };

    const handleInputAnswer = (e) => {
        const selectedAnswer = {
            question_id: questions[currentQuestion]?.id,
            question_type: "free_text",
            answer_id: null,
            answer_text: e.target.value
        };

        setAnswers(prevAnswers => {
            const updatedAnswers = [...prevAnswers];
            updatedAnswers[currentQuestion] = selectedAnswer;
            return updatedAnswers;
        });
    };

    const handleLogoutClick = () => {
        setPopupOpened(true);
    };

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            {isLoading ? (
                <Loading height="100vh" />
            ) : (
                <div style={{ color: theme === "light" ? "black" : "white" }}>
                    <div style={{ padding: "10px 18px" }}>
                        <p style={{ fontSize: "var(--font-xl)", fontWeight: 700 }}>{selectedTestRef.current === "pre-test" ? "Pre Test -" : "Post Test - "} {payload.title}</p>

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--font-sm)", fontWeight: 400 }}>
                            <p>{translate('question_has_answered', language)}</p>

                            <p>{selectedOptions.length} {translate('from', language)} {questions.length}</p>
                        </div>

                        <Progressbar progress={(currentQuestion + 1) / questions.length * 100} bgColor='var(--border-primary-gray)' color="var(--bg-primary-green)" style={{ borderRadius: "20px", height: "8px" }} />

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--font-sm)", fontWeight: 400 }}>
                            <p>{translate('question_time_remaining', language)}</p>

                            <p style={{ fontWeight: 700 }}>{formatTime(timeLeft)}</p>
                        </div>


                        <div style={{ marginTop: "30px" }}>
                            <p style={{ fontSize: "var(--font-sm)", fontWeight: 400 }}>{translate('question_question_number', language)} {currentQuestion + 1} {translate('from', language)} {questions.length}</p>

                            {questions?.[currentQuestion]?.question_image_url && (
                                <img src={questions?.[currentQuestion]?.question_image_url} style={{ width: "90%", objectFit: "cover" }} />
                            )}
                            <p style={{ fontSize: "var(--font-xs)" }}>{questions?.[currentQuestion]?.question || 'Loading...'}</p>
                        </div>

                        {questions?.[currentQuestion]?.question_type != "free_text" ? (
                            <>
                                <p style={{ fontSize: "var(--font-sm)", fontWeight: 400, marginTop: " 30px" }}>{translate('question_choose_correct_answer', language)}</p>

                                <List style={{ margin: 0, marginBottom: "100px" }}>
                                    {questions?.[currentQuestion]?.options?.map((option, index) => (
                                        <div
                                            key={option.id}
                                            onClick={() => handleOptionSelect(index)}
                                            style={{
                                                backgroundColor: selectedOptions[currentQuestion] === index ? "var(--bg-primary-green-transparent)" : "transparent",
                                                color: selectedOptions[currentQuestion] === index ? "var(--bg-primary-green)" : (theme === "light" ? "black" : "white"),
                                                border: selectedOptions[currentQuestion] === index ? "1px solid var(--bg-primary-green)" : (theme === "light" ? "1px solid #DEDEDE" : "1px solid #363636"),
                                                borderRadius: "12px",
                                                marginBottom: "10px",
                                                padding: "10px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "15px",
                                                fontSize: "var(--font-sm)",
                                                fontWeight: selectedOptions[currentQuestion] === index ? 700 : 400
                                            }}
                                        >
                                            <div style={{ background: selectedOptions[currentQuestion] !== index ? "rgba(212, 226, 253, 0.1)" : (theme === "light" ? "#D4E2FD" : "#363636"), padding: "3px 8px", borderRadius: "50px" }}>
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <p>{option.answer}</p>
                                        </div>
                                    ))}
                                </List>
                            </>
                        ) : (
                            <>
                                <p style={{ fontSize: "var(--font-sm)", fontWeight: 400, marginTop: " 30px" }}>Isi dengan jawaban yang tepat</p>

                                <textarea
                                    onChange={handleInputAnswer}
                                    style={{
                                        width: "100%",
                                        height: "100px",
                                        padding: "10px",
                                        marginTop: "10px",
                                        marginBottom: "100px",
                                        borderRadius: "8px",
                                        border: theme === "light" ? "1px solid #DEDEDE" : "1px solid #363636",
                                        backgroundColor: theme === "light" ? "white" : "var(--bg-secondary-black)",
                                        color: theme === "light" ? "black" : "white",
                                        fontSize: "var(--font-sm)"
                                    }}
                                />
                            </>
                        )}
                    </div>

                    <ButtonFixBottom needBorderTop={true}>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", gap: "20px" }}>
                            <CustomButton
                                color={currentQuestion === 0 ? "var(--color-gray)" : "var(--bg-primary-green)"}
                                bg={currentQuestion === 0 ? "#D9DADC" : "transparent"}
                                border={currentQuestion === 0 ? "1px solid #D9DADC" : "1px solid var(--bg-primary-green)"}
                                text={translate('prev', language)}
                                handleClick={handlePrev}
                                disable={currentQuestion === 0}
                            />

                            <CustomButton
                                color={"white"}
                                bg={"var(--bg-primary-green)"}
                                border={"1px solid var(--bg-primary-green)"}
                                text={currentQuestion === questions.length - 1 ? translate('done', language) : translate('next', language)}
                                handleClick={handleNext}
                            />
                        </div>
                    </ButtonFixBottom>

                    <QuestionPopup theme={theme} popupOpened={popupOpened} setPopupOpened={setPopupOpened} handleConfirm={fetchSubmitAnswer} nextTest={nextTestRef.current} isAllAnswered={isAllAnswered} language={language} />
                    <RatingPopup ratingOpened={ratingOpened} setRatingOpened={setRatingOpened} />
                    <LoadingPopup popupOpened={isLoadingSubmit} setPopupOpened={setIsLoadingSubmit} />
                    <CustomPopup
                        title={getTitle()}
                        message={getText()}
                        popupOpened={showPopup}
                        setPopupOpened={setShowPopup}
                        btnYes={"OK"}
                        handleConfirm={handleConfirmPopup}
                    />
                </div>
            )
            }
        </Page>
    );
};

export default QuestionPage;