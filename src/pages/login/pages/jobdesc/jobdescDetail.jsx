import { useEffect, useState } from 'react'
import { f7, Page } from 'framework7-react'
import BackButton from '../../../../components/backButton'
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md'
import { showToastFailed } from '../../../../functions/toast'
import { API } from '../../../../api/axios'
import Loading from '../../../../components/loading'
import ButtonFixBottom from '../../../../components/buttonFixBottom'
import CustomButton from '../../../../components/customButton'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../../slices/settingsSlice'

const JobdescDetailPage = () => {
    const [isChecked, setIsChecked] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [jobPosition, setJobPosition] = useState(null)
    const [dataJobdesc, setDataJobdesc] = useState(false)
    const theme = useSelector(selectSettings)

    console.log("jobPosition :", jobPosition);
    console.log("dataJobdesc :", dataJobdesc);

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const jobname = await API.get('/mobile/employees/employment')
            const jobdesc = await API.get('/mobile/job-positions/qualifications/me')

            setJobPosition(jobname.data.payload.job_position_name)
            setDataJobdesc(jobdesc.data.payload)
        } catch (error) {
            console.log("error :", error);

            showToastFailed("Failed to get job description!")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleNextStep = async () => {
        try {
            await API.put('/mobile/employees/onboarding/steps', { step: "jobdesc" })
            f7.views.main.router.navigate('/upload-dokumen/', { clearPreviousHistory: true })
        } catch (error) {
            showToastFailed('Gagal ke tahap selanjutnya!')
        }
    }

    if (isLoading) {
        return (
            <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
                <div style={{ padding: "0 25px", color: theme === "light" ? "black" : "white" }}>
                    <BackButton label={"Kualifikasi & Deskripsi Pekerjaan"} />

                    <Loading height={"80vh"} />
                </div>
            </Page>
        )
    }

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ padding: "0 25px", color: theme === "light" ? "black" : "white" }}>
                <BackButton label={"Kualifikasi & Deskripsi Pekerjaan"} />

                <div style={{ marginBottom: "90px", marginTop: "20px" }}>
                    {(jobPosition && dataJobdesc) && (
                        <div>
                            <h2 style={{ marginBottom: "40px" }}>{jobPosition}</h2>

                            <p style={{ fontWeight: 700, fontSize: "var(--font-md)", margin: 0 }}>Kualifikasi</p>
                            <div
                                dangerouslySetInnerHTML={{ __html: dataJobdesc.job_requirement }}
                                style={{ marginTop: "20px" }}
                            />

                            <p style={{ fontWeight: 700, fontSize: "var(--font-md)", margin: 0 }}>Deskripsi Pekerjaan</p>
                            <div
                                dangerouslySetInnerHTML={{ __html: dataJobdesc.job_description }}
                                style={{ marginTop: "20px" }}
                            />
                        </div>
                    )}

                    <div style={{ display: "flex", gap: "10px", textAlign: "start", paddingTop: "20px" }}>
                        <div onClick={() => setIsChecked(!isChecked)}>
                            {isChecked ? (
                                <MdCheckBox size={30} style={{ color: "var(--bg-primary-green)" }} />
                            ) : (
                                <MdCheckBoxOutlineBlank size={30} style={{ color: "var(--color-gray)" }} />
                            )}
                        </div>

                        <div>
                            <p style={{ margin: 0, textAlign: "justify" }}>Saya telah membaca dan memahami seluruh kualifikasi serta deskripsi pekerjaan yang diberikan, dan saya bersedia menjalankan tugas sesuai deskripsi pekerjaan yang telah ditetapkan.</p>
                        </div>
                    </div>
                </div>
            </div>

            <ButtonFixBottom needBorderTop={false}>
                <CustomButton
                    handleClick={handleNextStep}
                    color={"white"}
                    bg={isChecked ? "var(--bg-primary-green)" : "var(--color-gray)"}
                    disable={!isChecked}
                    text={"Saya Sudah Paham"}
                />
            </ButtonFixBottom>
        </Page>
    )
}

export default JobdescDetailPage