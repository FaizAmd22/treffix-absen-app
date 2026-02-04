import { PageContent, Sheet } from 'framework7-react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../slices/settingsSlice'
import { IoCloseOutline } from 'react-icons/io5'
import { LuCamera, LuImage } from 'react-icons/lu'
import { selectLanguages } from '../slices/languagesSlice'
import { translate } from '../utils/translate'


const UploadPicturePopup = ({ sheetOpened, setSheetOpened, title, capturePhotoHandler }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)

    const handleTakePicture = () => {
        setSheetOpened(false)
        // console.log("handle foto");
        capturePhotoHandler("camera")
    }

    const handleUploadPicture = () => {
        setSheetOpened(false)
        // console.log("handle upload");
        capturePhotoHandler("upload")
    }

    return (
        <Sheet
            opened={sheetOpened}
            onSheetClosed={() => { setSheetOpened(false) }}
            style={{ height: "auto", background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}
            swipeToClose
        >
            <PageContent style={{ color: theme == "light" ? "black" : "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", width: "90%", borderBottom: theme == "light" ? "1px solid #F5F5F5" : "1px solid var(--bg-secondary-gray)" }}>
                    <p style={{ fontWeight: 700, fontSize: "var(--font-lg)" }}>{title}</p>

                    <IoCloseOutline size={26} onClick={() => setSheetOpened(false)} />
                </div>

                <div style={{ padding: "15px 20px", marginBottom: "10px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "10px" }}>
                    <div onClick={handleTakePicture} style={{ display: "flex", alignItems: "center", justifyContent: "start", width: "100%", gap: "10px" }}>
                        <LuCamera size={26} />

                        <p>{translate('visit_take_picture', language)}</p>
                    </div>

                    <div onClick={handleUploadPicture} style={{ display: "flex", alignItems: "center", justifyContent: "start", width: "100%", gap: "10px" }}>
                        <LuImage size={26} />

                        <p>{translate('upload_image', language)}</p>
                    </div>
                </div>
            </PageContent>
        </Sheet>
    )
}

export default UploadPicturePopup