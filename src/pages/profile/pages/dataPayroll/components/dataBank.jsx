import { useSelector } from "react-redux";
import { selectSettings } from "../../../../../slices/settingsSlice";
import { selectLanguages } from "../../../../../slices/languagesSlice";
import { translate } from "../../../../../utils/translate";
import InputText from "../../../../../components/inputText";
import { useEffect, useState } from "react";
import Loading from "../../../../../components/loading";
import { z } from "zod";

const schema = z.object({
    account_number: z.string().regex(/^\d{10}$/, "Nomor rekening harus 10 digit angka"),
    account_name: z.string().trim().min(1, "Nama pemilik rekening tidak boleh kosong"),
});

const DataBank = ({ data, setDataSubmit, isUpdate = false, isLoadingSubmit, isOnboarding = "false", onRegisterValidator }) => {
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);

    const [formData, setFormData] = useState({
        bank_name: "BCA",
        account_number: "",
        account_name: "",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (data) {
            const next = {
                bank_name: "BCA",
                account_number: (data.account_number != null ? String(data.account_number) : "") || "",
                account_name: data.account_name || "",
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
            schema.parse({
                account_number: String(formData.account_number || ""),
                account_name: formData.account_name || "",
            });
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
        <form style={{ fontSize: "var(--font-sm)" }}>
            <InputText
                title={translate("bank_name", language)}
                value={formData.bank_name}
                id={"bank_name"}
                onChange={handleInputChange("bank_name")}
                isUpdate={isUpdate}
                theme={theme}
                placeholder={isOnboarding === "true" ? "Masukkan Nama Bank ..." : "-"}
                disabled
            />

            <InputText
                title={translate("account_number", language)}
                value={formData.account_number}
                id={"account_number"}
                type="number"
                onChange={handleInputChange("account_number")}
                isUpdate={isUpdate}
                theme={theme}
                placeholder={isOnboarding === "true" ? "Masukkan Nomor Rekening ..." : "-"}
                error={!!errors.account_number}
                errorMessage={errors.account_number}
            />

            <InputText
                title={translate("account_owner_name", language)}
                value={formData.account_name}
                id={"account_name"}
                onChange={handleInputChange("account_name")}
                isUpdate={isUpdate}
                theme={theme}
                placeholder={isOnboarding === "true" ? "Masukkan Nama Pemilik Rekening ..." : "-"}
                error={!!errors.account_name}
                errorMessage={errors.account_name}
            />
        </form>
    );
};

export default DataBank;
