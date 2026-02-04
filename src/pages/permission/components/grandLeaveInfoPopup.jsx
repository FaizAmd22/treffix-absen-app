import { Button, Link, PageContent, Sheet } from 'framework7-react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import { IoMdClose } from 'react-icons/io'
import { selectLanguages } from '../../../slices/languagesSlice'
import { translate } from '../../../utils/translate'


const GrandLeaveInfoPopup = ({ sheetOpened, setSheetOpened }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)

    return (
        <Sheet
            opened={sheetOpened}
            onSheetClosed={() => { setSheetOpened(false) }}
            style={{ height: "auto", overflowY: "auto", background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}
            swipeToClose
        >
            <PageContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: "0 20px", paddingTop: "5px", marginBottom: "-5px" }}>
                    <p style={{ fontSize: 'var(--font-xl)' }}>{translate('sabbatical_leave_information', language)}</p>
                    <Button onClick={() => setSheetOpened(false)} style={{ background: 'transparent', border: 'none', color: theme === "light" ? "black" : "white" }}>
                        <IoMdClose size={"20px"} />
                    </Button>
                </div>

                <hr style={{ border: theme == "light" ? "1px solid var(--border-primary-gray)" : "" }} />

                <div style={{ padding: "10px 20px", marginTop: "15px", color: theme === "light" ? "black" : "white" }}>
                    <ul style={{ paddingLeft: "20px", margin: 0, fontSize: "var(--font-sm)" }}>
                        <li style={{ marginBottom: "4px" }}>{translate('sabbatical_leave_information_text1', language)}</li>
                        <li style={{ marginBottom: "4px" }}>{translate('sabbatical_leave_information_text2', language)}</li>
                        <li style={{ marginBottom: "4px" }}>{translate('sabbatical_leave_information_text3', language)}</li>
                    </ul>
                </div>


                <div style={{ display: 'flex', justifyContent: 'center', gap: "40px", padding: "20px 0", fontSize: "var(--font-sm)" }}>
                    <div
                        style={{ border: "1px solid var(--bg-primary-green)", background: "var(--bg-primary-green)", width: "90%", borderRadius: "8px", textAlign: "center", cursor: "pointer" }}
                        onClick={() => setSheetOpened(false)}
                    >
                        <p style={{ color: "white", fontWeight: 700, padding: "11px 0", margin: 0 }}>{translate('i_understand', language)}</p>
                    </div>
                </div>
            </PageContent>
        </Sheet>
    )
}

export default GrandLeaveInfoPopup