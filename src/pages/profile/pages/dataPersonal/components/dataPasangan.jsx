import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../../../slices/settingsSlice";
import TypePopup from "../../../../../components/typePopup";
import { translate } from "../../../../../utils/translate";
import { selectLanguages } from "../../../../../slices/languagesSlice";
import { findLabelFromValue } from "../../../../../functions/findLabelFromValue";
import { findValueFromLabel } from "../../../../../functions/findValueFromLabel";
import { genderOptions } from "../../../../../utils/selectOptions";
import Loading from "../../../../../components/loading";
import InputText from "../../../../../components/inputText";
import InputDropdown from "../../../../../components/inputDropdown";
import InputDate from "../../../../../components/inputDate";
import { z } from "zod";

const schema = z.object({
    spouse_name: z.string().trim().min(1, "Nama pasangan tidak boleh kosong"),
    spouse_gender: z.string().trim().min(1, "Jenis kelamin pasangan wajib dipilih"),
    spouse_birth_date: z.string().trim().min(1, "Tanggal lahir pasangan wajib diisi"),
});

const DataPasangan = ({ data, setDataSubmit, isUpdate, isLoadingSubmit, isOnboarding = "false", onRegisterValidator }) => {
    const [formData, setFormData] = useState({
        spouse_name: "",
        spouse_gender: "",
        spouse_birth_date: ""
    });
    const [displayData, setDisplayData] = useState({ spouse_gender: null });
    const [errors, setErrors] = useState({});
    const [typePopupOpened, setTypePopupOpened] = useState(false);

    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);
    const genderLabels = genderOptions.map((option) => option.label);

    useEffect(() => {
        if (data) {
            const genderLabel = findLabelFromValue(genderOptions, data.spouse_gender);
            const next = {
                spouse_name: data.spouse_name || "",
                spouse_gender: data.spouse_gender || "",
                spouse_birth_date: data.spouse_birth_date || ""
            };
            setFormData(next);
            setDisplayData({ spouse_gender: genderLabel || null });
            setDataSubmit(next);
        }
    }, [data]);

    useEffect(() => {
        setDataSubmit(formData);
    }, [formData]);

    const validate = () => {
        if (!isUpdate) { setErrors({}); return true; }
        try {
            schema.parse(formData);
            setErrors({});
            return true;
        } catch (e) {
            const err = {};
            e?.issues?.forEach?.((iss) => {
                const k = iss.path?.[0];
                if (k) err[k] = iss.message;
            });
            setErrors(err);
            return false;
        }
    };

    useEffect(() => {
        if (typeof onRegisterValidator === "function") onRegisterValidator(() => validate());
        return () => {
            if (typeof onRegisterValidator === "function") onRegisterValidator(undefined);
        };
    }, [formData, isUpdate]);

    const handleInputChange = (field) => (event) => {
        setFormData((prev) => ({ ...prev, [field]: event.target.value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const openTypePopup = () => { if (isUpdate) setTypePopupOpened(true); };
    const closeTypePopup = () => setTypePopupOpened(false);

    const onSelect = (selectedLabel) => {
        const genderValue = findValueFromLabel(genderOptions, selectedLabel);
        setFormData((prev) => ({ ...prev, spouse_gender: genderValue }));
        setDisplayData((prev) => ({ ...prev, spouse_gender: selectedLabel }));
        if (errors.spouse_gender) setErrors((prev) => ({ ...prev, spouse_gender: "" }));
        closeTypePopup();
    };

    if (isLoadingSubmit) return <Loading height="80vh" />;

    return (
        <div>
            {!isOnboarding || isOnboarding !== "true" ? (
                <div style={{ background: theme === "light" ? "#D4E2FD" : "rgba(40, 111, 243, 0.2)", borderRadius: "12px", padding: "2px 10px", fontSize: "var(--font-xs)", marginTop: "20px" }}>
                    <p>{translate("having_no_partner", language)}</p>
                </div>
            ) : null}

            <form style={{ fontSize: "var(--font-sm)", marginTop: "15px" }}>
                <InputText
                    type="text"
                    id="partnerName"
                    value={formData.spouse_name}
                    onChange={handleInputChange("spouse_name")}
                    isUpdate={isUpdate}
                    title={translate("partner_name", language)}
                    placeholder={translate("partner_name_text", language)}
                    theme={theme}
                    error={!!errors.spouse_name}
                    errorMessage={errors.spouse_name}
                />

                <InputDropdown
                    title={translate("gender", language)}
                    value={displayData.spouse_gender}
                    noValue={translate("gender_text", language)}
                    onClick={openTypePopup}
                    isUpdate={!isUpdate}
                    theme={theme}
                    error={!!errors.spouse_gender}
                    errorMessage={errors.spouse_gender}
                />

                <InputDate
                    title={translate("date_of_birth", language)}
                    id="birthdate"
                    value={formData.spouse_birth_date}
                    noValue={translate("date_of_birth_text", language)}
                    onChange={handleInputChange("spouse_birth_date")}
                    language={language}
                    theme={theme}
                    disabled={!isUpdate}
                    error={!!errors.spouse_birth_date}
                    errorMessage={errors.spouse_birth_date}
                    maxToday
                />
            </form>

            <TypePopup
                top={"82%"}
                height={"75vh"}
                opened={typePopupOpened}
                onClose={closeTypePopup}
                options={genderLabels}
                onSelect={onSelect}
            />
        </div>
    );
};

export default DataPasangan;
