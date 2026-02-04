import { Button, f7, Link, Page } from 'framework7-react'
import React, { useState } from 'react'
import BackButton from '../../../../components/backButton'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../../slices/settingsSlice'
import { selectLanguages } from '../../../../slices/languagesSlice'
import { formatDate } from '../../../../functions/formatDate'
import { getHoursMinutes } from '../../../../functions/getHoursMinutes'
import { GoDotFill } from 'react-icons/go'
import { IoLocationOutline } from 'react-icons/io5'
import { BsArrowRepeat } from 'react-icons/bs'
import { labelFilter } from '../../../../functions/labelFilter'
import { translate } from '../../../../utils/translate'
import { getScheduleTypeColor } from '../../functions/getScheduleTypeColor'
import CancelPopup from '../../../../components/cancelPopup'
import ConfirmCancelSchedulePopup from '../../components/confirmCancelSchedulePopup'
import ButtonFixBottom from '../../../../components/buttonFixBottom'
import CustomButton from '../../../../components/customButton'
import ReimburseIcon from '../../../../icons/reimburse'
import UserIcon from '../../../../icons/user'
import VideoIcon from '../../../../icons/video'

const CardScheduleDetail = () => {
    const dataCard = JSON.parse(localStorage.getItem('scheduleData'))
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const color = getScheduleTypeColor(dataCard.schedule_type)
    const [isCancelPopup, setIsCancelPopup] = useState(false)

    console.log("dataCard :", dataCard);

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ margin: 0, color: theme === "light" ? "black" : "white", padding: "15px 10px" }}>
                <BackButton label={translate('schedule_detail', language)} />

                <div style={{ display: "grid", gridTemplateColumns: "12% 88%", padding: "10px 20px", fontSize: "var(--font-sm)" }}>
                    <div style={{ width: "25px", height: "25px", background: color.border, borderRadius: "4px", marginBottom: "10px" }} />
                    <div style={{ marginBottom: "10px" }}>
                        <p style={{ margin: 0, fontSize: "var(--font-lg)", fontWeight: 700 }}>{dataCard.event_name}</p>

                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <p style={{ margin: "5px 0" }}>{formatDate(dataCard.start_date, language, "with-weekdays")}</p>
                            <GoDotFill size={12} />
                            <p style={{ margin: "5px 0" }}>{getHoursMinutes(dataCard.start_date) + " - " + getHoursMinutes(dataCard.end_date)}</p>
                        </div>
                    </div>

                    <IoLocationOutline size={25} style={{ margin: "15px 0", color: "var(--bg-primary-green)" }} />
                    <p style={{ margin: "15px 0", textTransform: "capitalize" }}>{dataCard?.metadata?.address || dataCard?.metadata?.method || "-"}</p>

                    <BsArrowRepeat size={25} style={{ margin: "15px 0", color: "var(--bg-primary-green)" }} />
                    <p style={{ margin: "15px 0" }}>{labelFilter(dataCard.recurrence_type, language)}</p>

                    <div style={{ display: "flex", justifyContent: "center", width: "25px", marginTop: "15px" }}>
                        <ReimburseIcon fillColor="var(--bg-primary-green)" width={20} height={20} />
                    </div>
                    <p style={{ margin: "15px 0" }}>{dataCard?.metadata?.notes ? dataCard?.metadata?.notes : "-"}</p>

                    {dataCard.schedule_type == "interview" && (
                        <>
                            <div style={{ display: "flex", justifyContent: "center", width: "25px", marginTop: "15px" }}>
                                <UserIcon fillColor="var(--bg-primary-green)" width={20} height={20} />
                            </div>
                            <p style={{ margin: "15px 0" }}>
                                {dataCard.guests.length > 0 ? dataCard.guests.map(item => item.name).join(", ") : "-"}
                            </p>

                            <div style={{ display: "flex", justifyContent: "center", width: "25px", marginTop: "15px" }}>
                                <VideoIcon fillColor="var(--bg-primary-green)" width={20} height={20} />
                            </div>
                            <Link href external style={{ margin: "15px 0", textAlign: "start", width: "auto", display: "inline" }}>{dataCard?.metadata?.meet_link ? dataCard?.metadata?.meet_link : " - "}</Link>
                        </>
                    )}
                </div>

            </div>

            {dataCard.schedule_type == "custom" && (
                <ButtonFixBottom needBorderTop={true}>
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between", gap: "20px" }}>
                        <CustomButton
                            color={"var(--color-red)"}
                            bg={"transparent"}
                            border={"1px solid var(--color-red)"}
                            text={translate('delete', language)}
                            handleClick={() => setIsCancelPopup(true)}
                        />

                        <CustomButton
                            color={"white"}
                            bg={"var(--bg-primary-green)"}
                            border={"1px solid var(--bg-primary-green)"}
                            text={"Edit"}
                            handleClick={() => f7.views.main.router.navigate('/update-schedule/')}
                        />
                    </div>
                </ButtonFixBottom>
            )}

            <ConfirmCancelSchedulePopup
                popupOpened={isCancelPopup}
                setIsCancelPopup={setIsCancelPopup}
                idCard={dataCard.id}
                typeCard={dataCard.recurrence_type}
            />
        </Page>
    )
}

export default CardScheduleDetail