import { useSelector } from "react-redux";
import { selectSettings } from "../../../../../slices/settingsSlice";
import { selectLanguages } from "../../../../../slices/languagesSlice";
import { translate } from "../../../../../utils/translate";
import InputText from "../../../../../components/inputText";
import { useEffect, useState } from "react";
import Loading from "../../../../../components/loading";
import InputNumber from "../../../../../components/inputNumber";
import InputTextarea from "../../../../../components/inputTextarea";
import { z } from "zod";

const schema = z.object({
    emergency_contact_name: z.string().trim().min(1, "Nama kontak darurat tidak boleh kosong"),
    emergency_contact_phone: z.string().regex(/^\d{8,}$/, "Nomor telepon minimal 8 digit angka"),
    emergency_contact_relation: z.string().trim().min(1, "Hubungan tidak boleh kosong"),
    emergency_contact_address: z.string().trim().min(1, "Alamat tidak boleh kosong"),
});

const KontakDarurat = ({ data, setDataSubmit, isUpdate, isLoadingSubmit, onRegisterValidator }) => {
    const [formData, setFormData] = useState({
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_relation: "",
        emergency_contact_address: ""
    });
    const [errors, setErrors] = useState({});

    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);

    useEffect(() => {
        if (data) {
            const next = {
                emergency_contact_name: data.emergency_contact_name || "",
                emergency_contact_phone: data.emergency_contact_phone || "",
                emergency_contact_relation: data.emergency_contact_relation || "",
                emergency_contact_address: data.emergency_contact_address || ""
            };
            setFormData(next);
            setDataSubmit(next);
        }
    }, [data]);

    useEffect(() => {
        setDataSubmit(formData);
    }, [formData]);

    const validate = () => {
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
    }, [formData]);

    const handleInputChange = (field) => (event) => {
        setFormData((prev) => ({ ...prev, [field]: event.target.value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    if (isLoadingSubmit) return <Loading height="80vh" />;

    return (
        <div>
            <form style={{ fontSize: "var(--font-sm)", marginTop: "20px" }}>
                <InputText
                    type="text"
                    id="emergencyContact"
                    value={formData.emergency_contact_name}
                    onChange={handleInputChange("emergency_contact_name")}
                    isUpdate={isUpdate}
                    title={translate("name_of_emergency_contact", language)}
                    placeholder={translate("name_of_emergency_contact_text", language)}
                    theme={theme}
                    error={!!errors.emergency_contact_name}
                    errorMessage={errors.emergency_contact_name}
                />

                <InputNumber
                    title={translate("phone_number", language)}
                    id="phoneNumber"
                    value={formData.emergency_contact_phone}
                    placeholder={translate("phone_number_text", language)}
                    onChange={handleInputChange("emergency_contact_phone")}
                    disabled={!isUpdate}
                    theme={theme}
                    error={!!errors.emergency_contact_phone}
                    errorMessage={errors.emergency_contact_phone}
                />

                <InputText
                    type="text"
                    id="emergencyContactRelationship"
                    value={formData.emergency_contact_relation}
                    onChange={handleInputChange("emergency_contact_relation")}
                    isUpdate={isUpdate}
                    title={translate("emergency_contact_relationship", language)}
                    placeholder={translate("emergency_contact_relationship_text", language)}
                    theme={theme}
                    error={!!errors.emergency_contact_relation}
                    errorMessage={errors.emergency_contact_relation}
                />

                <InputTextarea
                    title={translate("emergency_contact_address", language)}
                    id="address"
                    type="label"
                    noMargin={false}
                    placeholder={translate("emergency_contact_address_text", language)}
                    value={formData.emergency_contact_address}
                    onChange={handleInputChange("emergency_contact_address")}
                    disabled={!isUpdate}
                    theme={theme}
                    error={!!errors.emergency_contact_address}
                    errorMessage={errors.emergency_contact_address}
                />
            </form>
        </div>
    );
};

export default KontakDarurat;
