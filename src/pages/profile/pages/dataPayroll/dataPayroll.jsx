import { Page } from "framework7-react";
import { useEffect, useRef, useState } from "react";
import BackButton from "../../../../components/backButton";
import TypePopup from "../../../../components/typePopup";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../../slices/settingsSlice";
import { MdNavigateNext } from "react-icons/md";
import InformasiGaji from "./components/informasiGaji";
import InformasiTunjangan from "./components/informasiTunjangan";
import DataBank from "./components/dataBank";
import { selectLanguages } from "../../../../slices/languagesSlice";
import { translate } from "../../../../utils/translate";
import { API } from "../../../../api/axios";

const DataPayroll = () => {
  const theme = useSelector(selectSettings)
  const language = useSelector(selectLanguages)
  const [dataPayroll, setDataPayroll] = useState(false);
  const [submissionType, setSubmissionType] = useState(translate('salary_information', language));
  const [typePopupOpened, setTypePopupOpened] = useState(false);
  const [dataSubmit, setDataSubmit] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token")

  const submissionTypes = [
    translate('salary_information', language),
    translate('benefits_information', language),
    translate('bank_data', language)
  ];

  const openTypePopup = () => setTypePopupOpened(true);
  const closeTypePopup = () => setTypePopupOpened(false);

  const fetchPayroll = async () => {
    setIsLoading(true)
    try {
      const response = await API.get("/mobile/employees/payroll");
      const data = response.data.payload;

      console.log("data payroll :", data);
      setDataPayroll(data)
    } catch (error) {
      console.log("Data request tidak bisa diakses", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false)
      }, 500);
    }
  };

  const validatorsRef = useRef({
    social: undefined,
    education: undefined,
    bank: undefined,
    emergency: undefined,
    partner: undefined,
    children: undefined,
  });

  const registerValidator = (key) => (fn) => {
    validatorsRef.current[key] = fn || undefined;
  };

  useEffect(() => {
    if (token) {
      fetchPayroll()
    }
  }, [token])

  const onRefresh = (done) => {
    fetchPayroll()
    setTimeout(() => {
      done();
    }, 500);
  }

  return (
    <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }} ptr ptrMousewheel={true} onPtrRefresh={onRefresh}>
      <div style={{ padding: "15px", marginBottom: "90px", fontSize: "var(--font-sm)", color: theme === "light" ? "black" : "white" }}>
        <BackButton label="Data Payroll" />

        <div style={{ marginBottom: "20px" }}>
          <div
            onClick={openTypePopup}
            style={{
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
              border: theme === "light" ? "1px solid #ccc" : "1px solid #363636",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            {submissionType}
            <MdNavigateNext size={"18px"} color="var(--bg-primary-green)" />
          </div>

          {(submissionType == "Informasi Gaji" || submissionType == "Salary Information") && (
            <InformasiGaji data={dataPayroll} isLoading={isLoading} />
          )}

          {(submissionType == "Informasi Tunjangan" || submissionType == "Benefits Information") && (
            <InformasiTunjangan data={dataPayroll} />
          )}

          {(submissionType == "Data Bank" || submissionType == "Bank Data") && (
            <DataBank data={dataPayroll} isOnboarding="false" onRegisterValidator={registerValidator("bank")} setDataSubmit={setDataSubmit} />
          )}
        </div>
      </div>

      <TypePopup
        top="70%"
        opened={typePopupOpened}
        onClose={closeTypePopup}
        options={submissionTypes}
        onSelect={(selectedType) => {
          setSubmissionType(selectedType);
          closeTypePopup();
        }}
      />
    </Page>
  );
};

export default DataPayroll;
