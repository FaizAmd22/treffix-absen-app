import { f7, Link, PageContent, Sheet } from 'framework7-react'
import { useDispatch, useSelector } from 'react-redux'
import { selectSettings } from '../../../slices/settingsSlice'
import { setActiveTab } from '../../../slices/tabSlice'


const MessageAlertUpdatePassword = ({ sheetOpened, setSheetOpened, title, message, imageAlert, btnCloseText }) => {
    const theme = useSelector(selectSettings)
    const dispatch = useDispatch()

    const handleClose = () => {
        dispatch(setActiveTab('view-home'))
        f7.views.main.router.navigate('/login/', { clearPreviousHistory: true })
    }

    return (
        <Sheet
            opened={sheetOpened}
            onSheetClosed={() => { setSheetOpened(false) }}
            backdrop={true}
            closeByBackdropClick={false}
            style={{ height: "auto", overflowY: "auto", background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}
        >
            <PageContent>
                <div style={{ padding: "15px 20px", marginBottom: "10px", color: theme == "light" ? "black" : "white", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                    <div style={{ width: "70%", marginTop: "5px" }}>
                        <img src={imageAlert} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>

                    <p style={{ fontSize: "var(--font-lg)", fontWeight: 700, padding: 0, margin: 0, marginBottom: "10px", marginTop: "-5px" }}>{title}</p>
                    <p style={{ fontSize: "var(--font-sm)", padding: 0, margin: 0 }}>{message}</p>
                </div>

                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "10px 20px 25px 20px", boxShadow: "0 -2px 16px rgba(0, 0, 0, 0.05)" }}>
                    <Link
                        style={{
                            width: "100%",
                            backgroundColor: "var(--bg-primary-green)",
                            color: "white",
                            fontSize: "16px",
                            fontWeight: "700",
                            textTransform: "capitalize",
                            borderRadius: "8px"
                        }}
                        sheetClose
                        onClick={handleClose}
                    >
                        <p>{btnCloseText}</p>
                    </Link>
                </div>
            </PageContent>
        </Sheet>
    )
}

export default MessageAlertUpdatePassword