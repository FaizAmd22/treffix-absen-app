import BackButton from '../../../../components/backButton'
import { useSelector } from 'react-redux'
import { f7, Page } from 'framework7-react'
import { GoCheckCircleFill, GoCircle } from 'react-icons/go'
import { useEffect, useState } from 'react'
import { API } from '../../../../api/axios'
import Loading from '../../../../components/loading'
import ButtonFixBottom from '../../../../components/buttonFixBottom'
import CustomButton from '../../../../components/customButton'
import CustomPopup from '../../../../components/customPopup'
import { translate } from '../../../../utils/translate'
import { selectLanguages } from '../../../../slices/languagesSlice'
import { selectSettings } from '../../../../slices/settingsSlice'

const EmployeDataList = () => {
    const language = useSelector(selectLanguages)
    const [completedDatas, setCompletedDatas] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [popupOpened, setPopupOpened] = useState(false);
    const theme = useSelector(selectSettings)

    const fetchData = async () => {
        const getSteps = await API.get("/mobile/employees/onboarding/steps");
        setCompletedDatas(getSteps.data.payload.completed_data)
        localStorage.setItem("isOnboarding", "true")
        console.log("completedDocument :", completedDatas);
    }

    useEffect(() => {
        setIsLoading(true)
        fetchData()
        setTimeout(() => {
            setIsLoading(false)
        }, 500);
    }, [])

    const dataList = [
        { value: "education_data", label: "Data Pendidikan" },
        { value: "partner_data", label: "Data Pasangan" },
        { value: "childrens_data", label: "Data Anak" },
        { value: "emergency_contact", label: "Kontak Darurat" },
        { value: "social_media", label: "Media Sosial" },
        { value: "bank_data", label: "Data Bank" },
    ]

    const handleSubmit = async () => {
        try {
            await API.put('/mobile/employees/onboarding/steps', { step: "employe_data" });
        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(() => {
                setPopupOpened(false)
                f7.views.main.router.navigate("/home/", { clearPreviousHistory: true })
                localStorage.removeItem("isOnboarding")
            }, 500);
        }
    }

    const handleClick = (opt) => {
        const params = `?value=${encodeURIComponent(opt.value)}&label=${encodeURIComponent(opt.label)}`;
        f7.views.main.router.navigate(`/employe-data-form/${params}`);
    }

    const onPageBeforeIn = () => {
        setIsLoading(true)
        fetchData()
        setTimeout(() => {
            setIsLoading(false)
        }, 500);
    };

    const onRefresh = (done) => {
        setIsLoading(true)
        fetchData();
        setTimeout(() => {
            setIsLoading(false)
            done()
        }, 500);
    }

    if (isLoading) {
        return (
            <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} onPageBeforeIn={onPageBeforeIn} ptr ptrMousewheel onPtrRefresh={onRefresh}>
                <div style={{ padding: "15px", marginBottom: "90px", color: theme === "light" ? "black" : "white" }}>
                    <BackButton label="Kelengkapan Berkas Karyawan" />
                    <Loading height={"80vh"} />
                </div>
            </Page>
        )
    }

    const isDisableSubmit = dataList.length === completedDatas.length

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} onPageBeforeIn={onPageBeforeIn} ptr ptrMousewheel onPtrRefresh={onRefresh}>
            <div style={{ padding: "15px", marginBottom: "90px", color: theme === "light" ? "black" : "white" }}>
                <BackButton label="Kelengkapan Data Karyawan" />

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                    {dataList.map((item, index) => {
                        const isCompleted = completedDatas.includes(item.value);
                        return (
                            <div key={index} onClick={() => handleClick(item)} style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)", padding: "8px 16px", borderRadius: "8px", boxShadow: "0 2px 16px 0 rgba(0, 0, 0, 0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <p>{item.label}</p>

                                {isCompleted ? (
                                    <GoCheckCircleFill style={{ width: "20px", height: "20px", color: "var(--color-green)" }} />
                                ) : (
                                    <GoCircle style={{ width: "20px", height: "20px", color: "#E5E5E5" }} />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <ButtonFixBottom needBorderTop={false} needShadow>
                <CustomButton
                    handleClick={() => setPopupOpened(true)}
                    color={!isDisableSubmit ? "#B3B3B3" : "white"}
                    bg={!isDisableSubmit ? "#F0F0F0" : "var(--bg-primary-green)"}
                    text={"Data Sudah Lengkap"}
                    disable={!isDisableSubmit}
                />
            </ButtonFixBottom>

            <CustomPopup
                popupOpened={popupOpened}
                setPopupOpened={setPopupOpened}
                title={"Pelengkapan Data Selesai"}
                message={"Terima kasih telah melengkapi seluruh data karyawan. Mohon pastikan semua informasi yang Anda isi sudah benar dan sesuai sebelum menyelesaikan proses onboarding."}
                btnNo={translate('procurement_cancel', language)}
                handleCancel={() => setPopupOpened(false)}
                btnYes={translate('done', language)}
                handleConfirm={handleSubmit}
                top={280}
            />
        </Page>
    )
}

export default EmployeDataList
