import { Link, PageContent, Sheet } from 'framework7-react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../slices/settingsSlice'


const MessageAlert = ({ sheetOpened, setSheetOpened, title, message, imageAlert, btnCloseText, handleClick, handleSubmit, btnSubmitText }) => {
    const theme = useSelector(selectSettings)

    return (
        <Sheet
            opened={sheetOpened}
            onSheetClosed={() => { setSheetOpened(false) }}
            style={{ height: "auto", overflowY: "auto", background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}
            swipeToClose
        >
            <PageContent>
                <div style={{ padding: "15px 20px", marginBottom: "10px", color: theme == "light" ? "black" : "white", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                    <div style={{ width: "70%", marginTop: "5px" }}>
                        <img src={imageAlert} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>

                    <p style={{ fontSize: "var(--font-lg)", fontWeight: 700, padding: 0, margin: 0, marginBottom: "10px", marginTop: "-5px" }}>{title}</p>
                    <p style={{ fontSize: "var(--font-sm)", padding: 0, margin: 0 }}>{message}</p>
                </div>

                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "10px 20px 25px 20px" }}>
                    {handleSubmit && btnSubmitText ? (
                        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "15px" }}>
                            <Link
                                style={{
                                    width: "100%",
                                    backgroundColor: "var(--bg-primary-green)",
                                    color: "white",
                                    fontSize: "16px",
                                    fontWeight: "700",
                                    textTransform: "capitalize",
                                    borderRadius: "8px",
                                    border: "1px solid var(--bg-primary-green)"
                                }}
                                sheetClose
                                onClick={handleClick}
                            >
                                <p>{btnCloseText}</p>
                            </Link>

                            <Link
                                style={{
                                    width: "100%",
                                    backgroundColor: "transparent",
                                    color: "var(--bg-primary-green)",
                                    fontSize: "16px",
                                    fontWeight: "700",
                                    textTransform: "capitalize",
                                    borderRadius: "8px",
                                    border: "1px solid var(--bg-primary-green)"
                                }}
                                sheetClose
                                onClick={handleSubmit}
                            >
                                <p>{btnSubmitText}</p>
                            </Link>
                        </div>
                    ) : (
                        <Link
                            style={{
                                width: "100%",
                                backgroundColor: "var(--bg-primary-green)",
                                color: "white",
                                fontSize: "16px",
                                fontWeight: "700",
                                textTransform: "capitalize",
                                borderRadius: "8px",
                                border: "1px solid var(--bg-primary-green)"
                            }}
                            sheetClose
                            onClick={handleClick ? handleClick : () => { }}
                        >
                            <p>{btnCloseText}</p>
                        </Link>
                    )}
                </div>
            </PageContent>
        </Sheet>
    )
}

export default MessageAlert