import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../../../slices/settingsSlice";
import { selectLanguages } from "../../../../../slices/languagesSlice";
import { translate } from "../../../../../utils/translate";
import Loading from "../../../../../components/loading";
import InputText from "../../../../../components/inputText";
import { z } from "zod";

const schema = z.object({
    instagram: z.string().trim().min(1, "Instagram tidak boleh kosong"),
    facebook: z.string().trim().min(1, "Facebook tidak boleh kosong"),
    twitter: z.string().trim().min(1, "Twitter tidak boleh kosong"),
    linkedin: z.string().trim().min(1, "LinkedIn tidak boleh kosong"),
});

const SocialMedia = ({ data, setDataSubmit, isUpdate, isLoadingSubmit, isOnboarding = false, onRegisterValidator }) => {
    const [formData, setFormData] = useState({
        instagram: "",
        facebook: "",
        twitter: "",
        linkedin: ""
    });
    const [errors, setErrors] = useState({
        instagram: "",
        facebook: "",
        twitter: "",
        linkedin: ""
    });

    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);

    useEffect(() => {
        if (data) {
            const next = {
                instagram: data.instagram ?? "",
                facebook: data.facebook ?? "",
                twitter: data.twitter ?? "",
                linkedin: data.linkedin ?? ""
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
            setErrors({ instagram: "", facebook: "", twitter: "", linkedin: "" });
            return true;
        } catch (e) {
            const err = { instagram: "", facebook: "", twitter: "", linkedin: "" };
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
    };

    if (isLoadingSubmit) return <Loading height="80vh" />;

    return (
        <div>
            {isOnboarding && (
                <p>
                    Catatan: <br />
                    Apabila Anda tidak memiliki akun media sosial yang diminta, harap isi dengan tanda “-” sebagai pengganti.
                </p>
            )}
            <form style={{ fontSize: "var(--font-sm)", marginTop: "20px" }}>
                <InputText
                    type="text"
                    id="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange("instagram")}
                    isUpdate={isUpdate}
                    title={"Instagram"}
                    placeholder={translate("instagram_text", language)}
                    theme={theme}
                    error={!!errors.instagram}
                    errorMessage={errors.instagram}
                />

                <InputText
                    type="text"
                    id="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange("facebook")}
                    isUpdate={isUpdate}
                    title={"Facebook"}
                    placeholder={translate("facebook_text", language)}
                    theme={theme}
                    error={!!errors.facebook}
                    errorMessage={errors.facebook}
                />

                <InputText
                    type="text"
                    id="twitter"
                    value={formData.twitter}
                    onChange={handleInputChange("twitter")}
                    isUpdate={isUpdate}
                    title={"Twitter"}
                    placeholder={translate("twitter_text", language)}
                    theme={theme}
                    error={!!errors.twitter}
                    errorMessage={errors.twitter}
                />

                <InputText
                    type="text"
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange("linkedin")}
                    isUpdate={isUpdate}
                    title={"LinkedIn"}
                    placeholder={translate("linkedin_text", language)}
                    theme={theme}
                    error={!!errors.linkedin}
                    errorMessage={errors.linkedin}
                />
            </form>
        </div>
    );
};

export default SocialMedia;
