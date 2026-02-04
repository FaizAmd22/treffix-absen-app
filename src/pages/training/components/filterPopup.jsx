import { Block, Button, Popup } from 'framework7-react'
import React from 'react'
import { IoMdClose } from 'react-icons/io'
import { translate } from '../../../utils/translate'
import CustomButton from '../../../components/customButton'
import ButtonFixBottomPopup from '../../../components/buttonFixBottomPopup'

const FilterTrainingPopup = ({
    isFilterPopup,
    closeFilterPopup,
    applyFilter,
    tempSelectedStatus,
    setTempSelectedStatus,
    tempSelectedMethod,
    setTempSelectedMethod,
    tempSelectedFormat,
    setTempSelectedFormat,
    toggleSelection,
    theme,
    language
}) => {
    const categoryData = [
        {
            status: "wajib",
            label: "Wajib"
        },
        {
            status: "tidak wajib",
            label: "TIdak Wajib"
        },
    ]

    const methodData = [
        {
            status: "online",
            label: "Online"
        },
        {
            status: "offline",
            label: "Offline"
        },
    ]

    const trainingFormatData = [
        {
            status: "single",
            label: "Development Sekali"
        },
        {
            status: "group",
            label: "Development Berkala"
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
            <Block style={{ height: "95%", padding: '15px', margin: 0, color: theme === "light" ? "black" : "white", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontWeight: 'bold', fontSize: 'var(--font-lg)' }}>{translate('training_filters', language)}</p>
                        <Button onClick={closeFilterPopup} style={{ background: 'transparent', border: 'none', color: theme === "light" ? 'black' : 'white' }}>
                            <IoMdClose size={"20px"} />
                        </Button>
                    </div>

                    <div style={{ height: "70vh", overflowY: "auto" }}>
                        <p style={{ fontSize: "var(--font-md)", fontWeight: 700 }}>{translate('training_status', language)}</p>
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {categoryData.map((item, index) => (
                                <Button
                                    key={index}
                                    onClick={() => toggleSelection(item.status, tempSelectedStatus, setTempSelectedStatus)}
                                    style={{
                                        backgroundColor: tempSelectedStatus.includes(item.status) ? 'var(--bg-primary-green)' : theme === "light" ? '#E9E9E9' : "#212121",
                                        color: tempSelectedStatus.includes(item.status) ? 'white' : theme === "light" ? 'black' : "white",
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

                        <p style={{ fontSize: "var(--font-md)", fontWeight: 700 }}>{translate('training_method', language)}</p>
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {methodData.map((item, index) => (
                                <Button
                                    key={index}
                                    onClick={() => toggleSelection(item.status, tempSelectedMethod, setTempSelectedMethod)}
                                    style={{
                                        backgroundColor: tempSelectedMethod.includes(item.status) ? 'var(--bg-primary-green)' : theme === "light" ? '#E9E9E9' : "#212121",
                                        color: tempSelectedMethod.includes(item.status) ? 'white' : theme === "light" ? 'black' : "white",
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

                        <p style={{ fontSize: "var(--font-md)", fontWeight: 700 }}>{translate('training_format', language)}</p>
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {trainingFormatData.map((item, index) => (
                                <Button
                                    key={index}
                                    onClick={() => toggleSelection(item.status, tempSelectedFormat, setTempSelectedFormat)}
                                    style={{
                                        backgroundColor: tempSelectedFormat.includes(item.status) ? 'var(--bg-primary-green)' : theme === "light" ? '#E9E9E9' : "#212121",
                                        color: tempSelectedFormat.includes(item.status) ? 'white' : theme === "light" ? 'black' : "white",
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

export default FilterTrainingPopup