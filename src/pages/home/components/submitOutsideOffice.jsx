import { Block, Button, f7, Page } from 'framework7-react'
import { useSelector } from 'react-redux'
import { selectRequestBody } from '../../../slices/requestBodySlice'
import { LuMapPin } from 'react-icons/lu'
import { GetAddress } from '../../../functions/getAddress'
import { FaChevronRight } from 'react-icons/fa'
import { translate } from '../../../utils/translate'
import { selectSettings } from '../../../slices/settingsSlice'
import { selectLanguages } from '../../../slices/languagesSlice'
import { getHoursMinutes } from '../../../functions/getHoursMinutes'
import BackToHomeButton from '../../../components/backToHomeButton'
import { useState } from 'react'
import { APIFaceRecog } from '../../../api/axios'
import { showToast, showToastFailed } from '../../../functions/toast'
import MessageAlert from '../../../components/messageAlert'
import ButtonFixBottom from '../../../components/buttonFixBottom'
import CustomButton from '../../../components/customButton'
import InputTextarea from '../../../components/inputTextarea'
import AlertFailedLight from '../../../assets/messageAlert/alert-failed-light.png'
import AlertFailedDark from '../../../assets/messageAlert/alert-failed-dark.png'
import ImageAlertLight from '../../../assets/messageAlert/absen-light.png'
import ImageAlertDark from '../../../assets/messageAlert/absen-dark.png'

const SubmitOutsideOffice = () => {
    const dataRequestBody = useSelector(selectRequestBody)
    const [note, setNote] = useState(null)
    const [isLoading, setIsLoading] = useState(null)
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const address = localStorage.getItem('address')
    const [sheetOpened, setSheetOpened] = useState(false);
    const [sheetOpenedFailed, setSheetOpenedFailed] = useState(false);
    const [textFailed, setTextFailed] = useState(null);
    const attendanceType = dataRequestBody.attendance_type

    const handleInputChange = (setter) => (event) => {
        setter(event.target.value);
    };

    console.log("dataRequestBody :", dataRequestBody);

    const handleOpenMap = () => {
        localStorage.setItem("location_lat", dataRequestBody.coordinate.latitude)
        localStorage.setItem("location_lng", dataRequestBody.coordinate.longitude)
        f7.views.main.router.navigate("/visit-map/")
    }

    const handleSubmit = async () => {
        setIsLoading(true)

        try {
            const requestBody = {
                employee_id: dataRequestBody.employee_id,
                coordinate: {
                    latitude: dataRequestBody.coordinate.latitude,
                    longitude: dataRequestBody.coordinate.longitude,
                },
                timestamp: dataRequestBody.timestamp,
                timezone: dataRequestBody.timezone,
                attendance_type: dataRequestBody.attendance_type,
                picture: dataRequestBody.picture,
                notes: note,
                // picture: pic,
            };

            const authKey = import.meta.env.VITE_AUTH_KEY;
            await APIFaceRecog.post("/attendances/record", requestBody, {
                headers: {
                    Authorization: `Bearer ${authKey}`,
                }
            });

            // f7.dialog.alert(translate('face_recognize_success', language), () => {
            //     f7.views.main.router.navigate('/home/', { clearPreviousHistory: true });
            // });
            // f7.views.main.router.navigate('/home/', { clearPreviousHistory: true });
            // showToast(translate('face_recognize_success', language), theme)
            setSheetOpened(true)
        } catch (error) {
            console.error('Attendance submission error:', error);
            // f7.dialog.alert(
            //     error?.response?.data?.message,
            //     translate('attendance_submission_failed', language),
            //     () => {
            //         f7.views.main.router.navigate('/home/', { clearPreviousHistory: true });
            //     });
            // f7.views.main.router.navigate('/home/', { clearPreviousHistory: true });
            // showToastFailed(translate('attendance_submission_failed', language) + ". " + error?.response?.data?.message)
            if (error?.response?.data?.message === "CONFIGURATION NOT FOUND") {
                setTextFailed(translate('attendance_failed_performance', language))
            } else if (error?.response?.data?.message == "Face not recognized") {
                setTextFailed(error?.response?.data?.message)
            } else {
                setTextFailed(translate('attendance_failed_text', language))
            }
            setSheetOpenedFailed(true)
        } finally {
            setIsLoading(false);
        }
    }

    const userLocation = { lat: dataRequestBody.coordinate.latitude, lng: dataRequestBody.coordinate.longitude }

    return (
        <Page style={{ background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <Block style={{ marginTop: "5px", margin: "0", padding: "0", color: theme == "light" ? "black" : "white" }}>
                <div style={{ padding: "0 20px", marginBottom: "100px", fontSize: "var(--font-sm)" }}>
                    <BackToHomeButton label="Detail Absen" />

                    <p style={{ fontWeight: 700, margin: 0 }}>{translate('absence_start_time', language)}</p>
                    <div
                        style={{
                            padding: "10px 15px",
                            marginBottom: "10px",
                            borderRadius: "5px",
                            minHeight: "18px",
                            border: theme === "light" ? "1px solid #ccc" : "1px solid #202020",
                            background: theme === "light" ? "#D9DADC" : "#202020"
                        }}
                    >
                        {getHoursMinutes(new Date())}
                    </div>

                    <p style={{ fontWeight: 700, margin: 0 }}>{translate('absent_location', language)}</p>
                    <div style={{ border: theme == "light" ? "1px solid #ccc" : "1px solid #202020", borderRadius: "8px", padding: "0 10px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <LuMapPin size={20} style={{ color: "var(--bg-primary-green)" }} />

                        <div onClick={handleOpenMap} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            {address ? (
                                <p>{address.length > 32 ? address.slice(0, 32) + "..." : address}</p>
                            ) : (
                                <p><GetAddress locationData={userLocation} /></p>
                            )}
                            <FaChevronRight size={16} style={{ color: "var(--bg-primary-green)" }} />
                        </div>
                    </div>

                    <InputTextarea
                        title={translate('submission_permission_note', language)}
                        id={"note"}
                        type={"p"}
                        noMargin={true}
                        placeholder={translate('add_note', language)}
                        value={note}
                        onChange={handleInputChange(setNote)}
                        theme={theme}
                    />
                </div>
            </Block>

            <ButtonFixBottom needBorderTop={true}>
                <CustomButton
                    handleClick={handleSubmit}
                    color={"white"}
                    bg={note || !isLoading ? "var(--bg-primary-green)" : "var(--color-dark-gray)"}
                    disable={!note || isLoading}
                    text={isLoading ? "Loading..." : translate('confirm', language)}
                />
            </ButtonFixBottom>

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
    )
}

export default SubmitOutsideOffice