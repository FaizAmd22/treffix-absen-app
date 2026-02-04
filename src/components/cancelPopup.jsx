import { Block, Button, List, ListItem, Popup } from 'framework7-react'
import React from 'react'
import { IoMdClose } from 'react-icons/io'
import { useSelector } from 'react-redux'
import { selectSettings } from '../slices/settingsSlice'
import { translate } from '../utils/translate'
import { selectLanguages } from '../slices/languagesSlice'

const CancelPopup = ({ label, opened, onClose, openConfirm }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)

    const handleCancel = () => {
        onClose()
        openConfirm()
    }

    return (
        <Popup
            opened={opened}
            onPopupClose={onClose}
            style={{
                top: "80%",
                borderRadius: '12px 12px 0 0',
                background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)",
            }}
        >
            <Block style={{ padding: '15px', margin: 0, color: theme == "light" ? "black" : "white" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: "0 10px" }}>
                    <p style={{ fontWeight: 'bold', fontSize: 'var(--font-lg)' }}>{label}</p>
                    <Button onClick={onClose} style={{ background: 'transparent', border: 'none', color: theme == "light" ? "black" : "white" }}>
                        <IoMdClose size={"20px"} />
                    </Button>
                </div>

                <List style={{ padding: 0, margin: 0 }}>
                    <ListItem>
                        <Button
                            style={{ textTransform: "capitalize", width: "100%", display: "flex", justifyContent: "start", padding: "20px 0", color: theme == "light" ? "black" : "white", fontSize: "var(--font-sm)" }}
                            onClick={handleCancel}
                        >
                            {translate('cancel_submission', language)}
                        </Button>
                    </ListItem>
                </List>
            </Block>
        </Popup>
    )
}

export default CancelPopup