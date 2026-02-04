import { useEffect, useState } from "react";
import { HiOutlineTrash } from "react-icons/hi2";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../../../slices/settingsSlice";
import { selectLanguages } from "../../../../../slices/languagesSlice";
import { translate } from "../../../../../utils/translate";
import TypePopup from "../../../../../components/typePopup";
import { Button } from "framework7-react";
import { findLabelFromValue } from "../../../../../functions/findLabelFromValue";
import { findValueFromLabel } from "../../../../../functions/findValueFromLabel";
import { genderOptions } from "../../../../../utils/selectOptions";
import Loading from "../../../../../components/loading";
import InputDate from "../../../../../components/inputDate";
import InputDropdown from "../../../../../components/inputDropdown";
import CustomButton from "../../../../../components/customButton";
import { FaPlus } from "react-icons/fa";
import InputText from "../../../../../components/inputText";
import { z } from "zod";

const childSchema = z.object({
    name: z.string().trim().min(1, "Nama anak tidak boleh kosong"),
    gender: z.string().trim().min(1, "Jenis kelamin anak wajib dipilih"),
    birth_date: z.string().trim().min(1, "Tanggal lahir anak wajib diisi"),
});

const DataAnak = ({ data, setDataSubmit, isUpdate, isLoadingSubmit, isOnboarding = "false", onRegisterValidator }) => {
    const generateId = () => "_" + Math.random().toString(36).substr(2, 15);

    const [children, setChildren] = useState([]);
    const [selectedChildId, setSelectedChildId] = useState(null);
    const [popupOpened, setPopupOpened] = useState(false);
    const [childErrors, setChildErrors] = useState({});

    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);
    const genderLabels = genderOptions.map((option) => option.label);

    useEffect(() => {
        const initial =
            data.childrens && data.childrens.length > 0
                ? data.childrens.map((child) => {
                    const genderLabel = findLabelFromValue(genderOptions, child.gender);
                    return {
                        id: generateId(),
                        name: child.name || "",
                        gender: child.gender || "",
                        gender_display: genderLabel || null,
                        birth_date: child.birth_date ? child.birth_date.split("T")[0] : ""
                    };
                })
                : [
                    { id: generateId(), name: "", gender: "", gender_display: null, birth_date: "" },
                ];

        setChildren(initial);
    }, [data]);

    useEffect(() => {
        const payload = {
            childrens: children.map(({ id, gender_display, ...rest }) => rest),
        };
        setDataSubmit(payload);
    }, [children]);

    const addChild = () => {
        setChildren((prev) => [
            ...prev,
            { id: generateId(), name: "", gender: "", gender_display: null, birth_date: "" },
        ]);
    };

    const removeChild = (id) => {
        const updated = children.filter((child) => child.id !== id);
        setChildren(updated);
    };

    const handleChange = (id, field, value) => {
        setChildren((prev) =>
            prev.map((child) => (child.id === id ? { ...child, [field]: value } : child))
        );
        setChildErrors((prev) => {
            const copy = { ...prev };
            if (copy[id] && copy[id][field]) {
                copy[id] = { ...copy[id], [field]: "" };
            }
            return copy;
        });
    };

    const openGenderPopup = (id) => {
        setSelectedChildId(id);
        setPopupOpened(true);
    };

    const selectGender = (genderLabel) => {
        if (selectedChildId !== null) {
            const genderValue = findValueFromLabel(genderOptions, genderLabel);
            setChildren((prev) =>
                prev.map((child) =>
                    child.id === selectedChildId
                        ? { ...child, gender: genderValue, gender_display: genderLabel }
                        : child
                )
            );
            setChildErrors((prev) => {
                const copy = { ...prev };
                if (copy[selectedChildId]?.gender) {
                    copy[selectedChildId] = { ...copy[selectedChildId], gender: "" };
                }
                return copy;
            });
        }
        setPopupOpened(false);
    };

    const validate = () => {
        if (!isUpdate) { setChildErrors({}); return true; }
        let ok = true;
        const next = {};
        children.forEach((c) => {
            try {
                childSchema.parse({
                    name: c.name || "",
                    gender: c.gender || "",
                    birth_date: c.birth_date || ""
                });
                next[c.id] = {};
            } catch (e) {
                ok = false;
                const obj = {};
                e?.issues?.forEach?.((iss) => {
                    const k = iss.path?.[0];
                    if (k) obj[k] = iss.message;
                });
                next[c.id] = obj;
            }
        });
        setChildErrors(next);
        return ok;
    };

    useEffect(() => {
        if (typeof onRegisterValidator === "function") onRegisterValidator(() => validate());
        return () => {
            if (typeof onRegisterValidator === "function") onRegisterValidator(undefined);
        };
    }, [children, isUpdate]);

    if (isLoadingSubmit) return <Loading height="80vh" />;

    return (
        <div style={{ paddingBottom: "80px" }}>
            {!isOnboarding || isOnboarding !== "true" ? (
                <div
                    style={{
                        background: theme === "light" ? "#D4E2FD" : "rgba(40, 111, 243, 0.2)",
                        borderRadius: "12px",
                        padding: "2px 10px",
                        fontSize: "var(--font-sm)",
                        marginTop: "20px",
                    }}
                >
                    <p>{translate("having_no_child", language)}</p>
                </div>
            ) : null}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {children.map((child) => (
                    <div key={child.id} style={{ fontSize: "var(--font-sm)", marginTop: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "end", alignItems: "center", position: "absolute", width: "95%", marginTop: "-8px" }}>
                            {children.length > 1 && isUpdate && (
                                <Button
                                    fill
                                    small
                                    color="red"
                                    onClick={() => removeChild(child.id)}
                                    style={{
                                        background: "transparent",
                                        color: "red",
                                        fontSize: "var(--font-xs)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "5px",
                                        border: "none",
                                        textTransform: "capitalize",
                                    }}
                                >
                                    <HiOutlineTrash size={"16px"} /> {translate("delete", language)}
                                </Button>
                            )}
                        </div>

                        <InputText
                            type="text"
                            id={`child-name-${child.id}`}
                            value={child.name}
                            onChange={(e) => handleChange(child.id, "name", e.target.value)}
                            isUpdate={isUpdate}
                            title={translate("child_name", language)}
                            placeholder={translate("child_name_text", language)}
                            theme={theme}
                            error={!!(childErrors[child.id] && childErrors[child.id].name)}
                            errorMessage={childErrors[child.id] && childErrors[child.id].name}
                        />

                        <InputDropdown
                            title={translate("gender", language)}
                            value={child.gender_display}
                            noValue={translate("gender_text", language)}
                            onClick={() => {
                                if (isUpdate) openGenderPopup(child.id);
                            }}
                            isUpdate={!isUpdate}
                            theme={theme}
                            error={!!(childErrors[child.id] && childErrors[child.id].gender)}
                            errorMessage={childErrors[child.id] && childErrors[child.id].gender}
                        />

                        <InputDate
                            title={translate("date_of_birth", language)}
                            id={`child-birthdate-${child.id}`}
                            value={child.birth_date}
                            noValue={translate("date_of_birth_text", language)}
                            onChange={(e) => handleChange(child.id, "birth_date", e.target.value)}
                            language={language}
                            theme={theme}
                            disabled={!isUpdate}
                            error={!!(childErrors[child.id] && childErrors[child.id].birth_date)}
                            errorMessage={childErrors[child.id] && childErrors[child.id].birth_date}
                            maxToday
                        />
                    </div>
                ))}
            </div>

            {isUpdate && (
                <CustomButton
                    bg={"transparent"}
                    color={"var(--bg-primary-green)"}
                    border={"none"}
                    text={translate("add_child", language)}
                    handleClick={addChild}
                    icon={<FaPlus size={20} />}
                />
            )}

            <TypePopup
                top={"82%"}
                height="75vh"
                opened={popupOpened}
                onClose={() => setPopupOpened(false)}
                options={genderLabels}
                onSelect={selectGender}
            />
        </div>
    );
};

export default DataAnak;
