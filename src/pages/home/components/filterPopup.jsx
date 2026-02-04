import { Block, Button, Popup } from 'framework7-react'
import React from 'react'
import { IoMdClose } from 'react-icons/io'
import { useSelector } from 'react-redux'
import { selectLanguages } from '../../../slices/languagesSlice'
import { translate } from '../../../utils/translate'
import { FaChevronRight } from 'react-icons/fa'
import { formatPeriodLabel } from '../../../functions/formatPeriodLabel'
import ButtonFixBottomPopup from '../../../components/buttonFixBottomPopup'
import CustomButton from '../../../components/customButton'
import CalendarIcon from '../../../icons/calendar'

const FilterApprovalPopup = ({
    isFilterPopup,
    closeFilterPopup,
    applyFilter,
    tempSelectedStatus,
    setTempSelectedStatus,
    tempSelectedType,
    setTempSelectedType,
    tempSelectedPeriod,
    setTempSelectedPeriod,
    toggleSelection,
    theme
}) => {
    const language = useSelector(selectLanguages)

    const statusData = [
        {
            status: "approved",
            label: translate('approved', language)
        },
        {
            status: "rejected",
            label: translate('rejected', language)
        },
        {
            status: "idle",
            label: translate('waiting_approval', language)
        },
        {
            status: "canceled",
            label: translate('canceled', language)
        }
    ]

    const typeData = [
        {
            type: "leave",
            label: translate('attendance_permission', language)
        },
        {
            type: "overtime",
            label: translate('overtime', language)
        },
        {
            type: "reimbursement",
            label: "Reimbursement"
        },
        {
            type: "procurement",
            label: translate('home_assets', language)
        }
    ]

    return (
        <Popup
            opened={isFilterPopup}
            onPopupClosed={closeFilterPopup}
            style={{
                top: "5%",
                borderRadius: '12px 12px 0 0',
                background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)",
            }}
        >
            <Block style={{
                height: "95%",
                padding: '15px',
                margin: 0,
                color: theme === "light" ? "black" : "white",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
            }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontWeight: 'bold', fontSize: 'var(--font-xl)' }}>Filter</p>
                        <Button onClick={closeFilterPopup} style={{ background: 'transparent', border: 'none', color: theme === "light" ? "black" : "white" }}>
                            <IoMdClose size={"20px"} />
                        </Button>
                    </div>

                    <div style={{ height: "69vh", overflowY: "auto" }}>
                        <p style={{ fontSize: "var(--font-md)", fontWeight: 700 }}>{translate('type_request', language)}</p>
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {typeData.map((item, index) => (
                                <Button
                                    key={index}
                                    onClick={() => toggleSelection(item.type, tempSelectedType, setTempSelectedType)}
                                    style={{
                                        backgroundColor: tempSelectedType.includes(item.type) ? 'var(--bg-primary-green)' : theme == "light" ? '#E9E9E9' : "#212121",
                                        color: tempSelectedType.includes(item.type) ? 'white' : theme == "light" ? 'black' : "white",
                                        margin: '5px',
                                        padding: "4px 18px",
                                        borderRadius: "360px",
                                        fontSize: "var(--font-xs)",
                                        fontWeight: 700,
                                        textTransform: "capitalize"
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </div>

                        <p style={{ fontSize: "var(--font-md)", fontWeight: 700, marginTop: "20px" }}>{translate('procurement_status_sub', language)}</p>
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {statusData.map((item, index) => (
                                <Button
                                    key={index}
                                    onClick={() => toggleSelection(item.status, tempSelectedStatus, setTempSelectedStatus)}
                                    style={{
                                        backgroundColor: tempSelectedStatus.includes(item.status) ? 'var(--bg-primary-green)' : theme == "light" ? '#E9E9E9' : "#212121",
                                        color: tempSelectedStatus.includes(item.status) ? 'white' : theme == "light" ? 'black' : "white",
                                        margin: '5px',
                                        padding: "4px 18px",
                                        borderRadius: "360px",
                                        fontSize: "var(--font-xs)",
                                        fontWeight: 700,
                                        textTransform: "capitalize"
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </div>

                        <p style={{ fontSize: "var(--font-md)", fontWeight: 700 }}>{translate('period', language)}</p>
                        <div style={{ border: theme == "light" ? "1px solid var(--border-primary-gray)" : "1px solid #363636", borderRadius: "8px", marginTop: "20px", height: "45px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", height: "45px", padding: "0 15px" }}>
                                <CalendarIcon fillColor="var(--bg-primary-green)" width={18} height={18} />
                                <div style={{ width: "90vw", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <p style={{ margin: 0, fontWeight: 700 }}>{tempSelectedPeriod ? formatPeriodLabel(tempSelectedPeriod) : translate('all_period', language)}</p>
                                    <FaChevronRight style={{ fontSize: "16px", opacity: 0.7 }} />
                                </div>
                            </div>

                            <input
                                type="month"
                                id="month-input"
                                placeholder={translate('reimburse_choose_month', language)}
                                style={{
                                    width: "100%",
                                    height: "45px",
                                    fontSize: "var(--font-sm)",
                                    color: theme === "light" ? "black" : "white",
                                    backgroundColor: "red",
                                    border: "none",
                                    outline: "none",
                                    opacity: 0,
                                    marginTop: "-45px",
                                    position: "relative"
                                }}
                                value={tempSelectedPeriod || ''}
                                onChange={(e) => setTempSelectedPeriod(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <ButtonFixBottomPopup>
                    <CustomButton
                        color={"var(--bg-primary-green)"}
                        bg={"transparent"}
                        border={"1px solid var(--bg-primary-green)"}
                        text={translate('procurement_cancel', language)}
                        handleClick={closeFilterPopup}
                    />

                    <CustomButton
                        color={"white"}
                        bg={"var(--bg-primary-green)"}
                        border={"1px solid var(--bg-primary-green)"}
                        text={translate('procurement_apply', language)}
                        handleClick={applyFilter}
                    />
                </ButtonFixBottomPopup>
            </Block>
        </Popup>
    )
}

export default FilterApprovalPopup