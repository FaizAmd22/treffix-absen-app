import { Block, Button, Popup } from 'framework7-react'
import React from 'react'
import { IoMdClose } from 'react-icons/io'
import { translate } from '../../../utils/translate'
import { useSelector } from 'react-redux'
import { selectLanguages } from '../../../slices/languagesSlice'
import CustomButton from '../../../components/customButton'
import ButtonFixBottomPopup from '../../../components/buttonFixBottomPopup'


const FilterPerformancePopup = ({ isFilterPopup, closeFilterPopup, applyFilter, tempSelectedStatus, setTempSelectedStatus, tempSelectedType, setTempSelectedType, toggleSelection, theme }) => {
    const language = useSelector(selectLanguages)

    const activityData = [
        {
            status: "plus",
            label: translate('increased', language)
        },
        {
            status: "minus",
            label: translate('decreased', language)
        }
    ]

    const typeData = [
        {
            type: "attendance",
            label: translate('attendance', language)
        },
        {
            type: "development",
            label: translate('development', language)
        },
        {
            type: "performance",
            label: translate('performance', language)
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
            <Block style={{ height: "95%", padding: '15px', margin: 0, color: theme === "light" ? "black" : "white", display: "flex", justifyContent: "space-between", flexDirection: "column" }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontWeight: 'bold', fontSize: 'var(--font-xl)' }}>{translate('performance_select_submission_type', language)}</p>
                        <Button onClick={closeFilterPopup} style={{ background: 'transparent', border: 'none', color: theme === "light" ? "black" : "white" }}>
                            <IoMdClose size={"20px"} />
                        </Button>
                    </div>

                    <div style={{ height: "69vh", overflowY: "auto" }}>
                        <p style={{ fontSize: "var(--font-md)", fontWeight: 700 }}>{translate('performance_point_activity', language)}</p>
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {activityData.map((item, index) => (
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

                        <p style={{ fontSize: "var(--font-md)", fontWeight: 700 }}>{translate('performance_assessment_type', language)}</p>
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

export default FilterPerformancePopup