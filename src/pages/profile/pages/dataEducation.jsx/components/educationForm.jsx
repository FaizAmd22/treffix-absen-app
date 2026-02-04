import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "framework7-react";
import { HiOutlineTrash } from "react-icons/hi2";
import TypePopup from "../../../../../components/typePopup";
import InputDropdown from "../../../../../components/inputDropdown";
import InputText from "../../../../../components/inputText";
import InputNumber from "../../../../../components/inputNumber";
import Loading from "../../../../../components/loading";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../../../slices/settingsSlice";
import { selectLanguages } from "../../../../../slices/languagesSlice";
import { translate } from "../../../../../utils/translate";
import { educationLevelOptions } from "../../../../../utils/selectOptions";
import CustomButton from "../../../../../components/customButton";
import { FaPlus } from "react-icons/fa6";
import { showToastFailed } from "../../../../../functions/toast";
import { API } from "../../../../../api/axios";
import SearchDropdownPopup from "../../../../../components/searchDropdownPopup";
import { FiPlus } from "react-icons/fi";
import { z } from "zod";

const mapIncoming = (dataArr) => {
    const arr = Array.isArray(dataArr) ? dataArr : [];
    if (!arr.length) {
        return [
            { id: Date.now().toString(), level: "", institution: "", graduationYear: "", gpa: "", major: "" },
        ];
    }
    return arr.map((item) => {
        let graduationYear = "";
        const endYear = item?.end_year || item?.graduationYear || "";
        if (endYear) {
            graduationYear = String(endYear).includes("-")
                ? String(endYear).split("-")[0]
                : String(endYear);
        }
        return {
            id: item.id ?? Date.now().toString() + Math.random(),
            level: item.level || "",
            institution: item.school || item.institution || "",
            graduationYear,
            gpa: item.gpa || "",
            major: item.major || "",
        };
    });
};

const mapLevelCond = (raw) => {
    if (!raw) return undefined;
    const v = String(raw).toUpperCase();
    if (["SD", "SMP", "SMA"].includes(v)) return v;
    return "UNIVERSITY";
};

const mapLevelForPost = (raw) => {
    if (!raw) return undefined;
    const v = String(raw).toUpperCase();
    if (v === "SD") return "SD";
    if (v === "SMP") return "SMP";
    if (v === "SMA") return "SMA";
    return "UNIVERSITY";
};

const gpaSchema = z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z
        .string()
        .trim()
        .min(1, "GPA wajib diisi")
        .refine((v) => !Number.isNaN(Number(v)), {
            message: "GPA harus berupa angka",
        })
);

const eduItemSchema = z.object({
    level: z.string().trim().min(1, "Level pendidikan wajib diisi"),
    institution: z.string().trim().min(1, "Nama institusi wajib diisi"),
    graduationYear: z
        .preprocess(
            (val) => (val === null || val === undefined ? "" : String(val)),
            z
                .string()
                .trim()
                .regex(/^\d{4}$/, "Tahun lulus harus 4 digit")
        ),
    gpa: gpaSchema,
    major: z.string().trim().min(1, "Jurusan/Program studi wajib diisi"),
});

const EducationForm = ({ data, setDataSubmit, isUpdate, isLoadingSubmit, onRegisterValidator }) => {
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);

    const [educations, setEducations] = useState(() => mapIncoming(data));
    const [institutionOption, setInstitutionOption] = useState([]);
    const [levelPopupOpened, setLevelPopupOpened] = useState(false);
    const [searchPopupOpened, setSearchPopupOpened] = useState(false);
    const [selectedEducationId, setSelectedEducationId] = useState(null);
    const [errors, setErrors] = useState({});

    const [searchQuery, setSearchQuery] = useState("");
    const searchDebounceRef = useRef(null);

    const getEducationById = (id) => educations.find((e) => e.id === id);

    useEffect(() => {
        setEducations(mapIncoming(data));
    }, [data]);

    useEffect(() => {
        const payload = {
            educations: educations.map((edu) => {
                const formattedYear = edu.graduationYear ? `${edu.graduationYear}-01-01` : "";
                return {
                    level: edu.level,
                    school: edu.institution,
                    end_year: formattedYear,
                    gpa: edu.gpa ? parseFloat(edu.gpa) : null,
                    major: edu.major || "",
                };
            }),
        };
        if (typeof setDataSubmit === "function") setDataSubmit(payload);
    }, [educations, setDataSubmit]);

    const fetchInstitutions = async (query, levelRaw) => {
        try {
            const cond = {};
            const mapped = mapLevelCond(levelRaw);
            if (mapped) cond.level = mapped;
            if (query && query.trim()) cond["name[like]"] = query.trim();

            const params = {};
            if (Object.keys(cond).length > 0) {
                params.cond = JSON.stringify(cond);
            }

            const response = await API.get("/master-institutions", { params });
            setInstitutionOption(Array.isArray(response.data?.payload) ? response.data.payload : []);
        } catch (error) {
            showToastFailed("Gagal memuat data institusi");
        }
    };

    const levelLabels = useMemo(() => educationLevelOptions.map((o) => o.label), []);

    const openLevelPopup = (id) => {
        setSelectedEducationId(id);
        setLevelPopupOpened(true);
    };

    const openInstitutionPopup = (id) => {
        setSelectedEducationId(id);
        setSearchPopupOpened(true);
    };

    useEffect(() => {
        if (!searchPopupOpened) return;
        const edu = getEducationById(selectedEducationId);
        fetchInstitutions("", edu?.level);
        setSearchQuery("");
    }, [searchPopupOpened]);

    useEffect(() => {
        if (!searchPopupOpened) return;
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            const edu = getEducationById(selectedEducationId);
            fetchInstitutions(searchQuery, edu?.level);
        }, 400);
        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        };
    }, [searchQuery, searchPopupOpened, selectedEducationId]);

    const onSelectLevel = (selectedLabel) => {
        const opt = educationLevelOptions.find((o) => o.label === selectedLabel);
        const value = opt ? opt.value : "";
        if (selectedEducationId != null) {
            handleChange(selectedEducationId, "level", value);
            fetchInstitutions("", value);
        }
        setLevelPopupOpened(false);
    };

    const onSelectInstitution = (option) => {
        const name = option?.name ?? "";
        if (selectedEducationId != null) {
            handleChange(selectedEducationId, "institution", name);
        }
        setSearchPopupOpened(false);
    };

    const addEducation = () => {
        setEducations((prev) => [
            ...prev,
            { id: Date.now().toString(), level: "", institution: "", graduationYear: "", gpa: "", major: "" },
        ]);
    };

    const removeEducation = (id) => {
        setEducations((prev) => prev.filter((e) => e.id !== id));
    };

    const handleChange = (id, field, value) => {
        setEducations((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
        setErrors((prev) => {
            const copy = { ...prev };
            if (copy[id] && copy[id][field]) {
                copy[id] = { ...copy[id], [field]: "" };
            }
            return copy;
        });
    };

    const validate = () => {
        let ok = true;
        const nextErrors = {};
        educations.forEach((edu) => {
            try {
                eduItemSchema.parse(edu);
                nextErrors[edu.id] = {};
            } catch (e) {
                ok = false;
                const eObj = {};
                e?.issues?.forEach?.((iss) => {
                    const k = iss.path?.[0];
                    if (k) eObj[k] = iss.message;
                });
                nextErrors[edu.id] = eObj;
            }
        });
        setErrors(nextErrors);
        return ok;
    };

    useEffect(() => {
        if (typeof onRegisterValidator === "function") onRegisterValidator(() => validate());
        return () => {
            if (typeof onRegisterValidator === "function") onRegisterValidator(undefined);
        };
    }, [educations]);

    const handleAddInstitution = async () => {
        const edu = getEducationById(selectedEducationId);
        const levelRaw = edu?.level;

        if (!levelRaw) {
            showToastFailed("Tambah Institusi gagal! Silakan pilih Level Pendidikan terlebih dahulu");
            return;
        }
        if (!searchQuery || !searchQuery.trim()) {
            showToastFailed("Tambah Institusi gagal! Nama institusi tidak boleh kosong");
            return;
        }

        try {
            const body = {
                institution_name: searchQuery.trim(),
                institution_level: mapLevelForPost(levelRaw),
            };
            await API.post("/master-institutions", body);
            handleChange(selectedEducationId, "institution", body.institution_name);
            await fetchInstitutions(searchQuery, levelRaw);
        } catch (err) {
            showToastFailed("Gagal menambah institusi");
        }
    };

    const AddInstitutionEmpty = () => (
        <div style={{ padding: "16px", display: "grid", gap: 8 }}>
            <p
                onClick={handleAddInstitution}
                style={{
                    color: theme === "light" ? "black" : "white",
                    border: "none",
                    textTransform: "capitalize",
                    fontSize: "var(--font-sm)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                }}
            >
                <FiPlus style={{ width: "18px", height: "18px", color: "var(--bg-primary-green)" }} />
                Tambah Institusi
            </p>
        </div>
    );

    if (isLoadingSubmit) return <Loading height="80vh" />;

    return (
        <div>
            {educations.map((edu, index) => (
                <div key={edu.id} style={{ marginBottom: "20px" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "var(--font-sm)",
                        }}
                    >
                        <p style={{ fontSize: "var(--font-md)", fontWeight: 700 }}>
                            {translate("education_history", language)} {index + 1}
                        </p>
                        {educations.length > 1 && isUpdate && (
                            <Button
                                fill
                                small
                                color="red"
                                onClick={() => removeEducation(edu.id)}
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

                    <InputDropdown
                        title={translate("education_level", language)}
                        value={educationLevelOptions.find((o) => o.value === edu.level)?.label}
                        noValue={translate("select_education_level", language)}
                        onClick={() => {
                            if (isUpdate) openLevelPopup(edu.id);
                        }}
                        isUpdate={!isUpdate}
                        theme={theme}
                        error={!!(errors[edu.id] && errors[edu.id].level)}
                        errorMessage={errors[edu.id] && errors[edu.id].level}
                    />

                    <InputDropdown
                        title={translate("institution_name", language)}
                        value={edu.institution || ""}
                        noValue={translate("institution_name_text", language)}
                        onClick={() => {
                            if (isUpdate) openInstitutionPopup(edu.id);
                        }}
                        isUpdate={!isUpdate}
                        theme={theme}
                        error={!!(errors[edu.id] && errors[edu.id].institution)}
                        errorMessage={errors[edu.id] && errors[edu.id].institution}
                    />

                    <InputNumber
                        title={translate("graduation_year", language)}
                        id={`graduationYear-${edu.id}`}
                        value={edu.graduationYear}
                        placeholder={translate("graduation_year_text", language)}
                        onChange={(e) => handleChange(edu.id, "graduationYear", e.target.value)}
                        disabled={!isUpdate}
                        theme={theme}
                        error={!!(errors[edu.id] && errors[edu.id].graduationYear)}
                        errorMessage={errors[edu.id] && errors[edu.id].graduationYear}
                    />

                    <InputNumber
                        title={"GPA"}
                        id={`gpa-${edu.id}`}
                        value={edu.gpa}
                        placeholder={translate("gpa_text", language)}
                        onChange={(e) => handleChange(edu.id, "gpa", e.target.value)}
                        disabled={!isUpdate}
                        theme={theme}
                        error={!!(errors[edu.id] && errors[edu.id].gpa)}
                        errorMessage={errors[edu.id] && errors[edu.id].gpa}
                    />

                    <InputText
                        type="text"
                        id={`major-${edu.id}`}
                        value={edu.major}
                        onChange={(e) => handleChange(edu.id, "major", e.target.value)}
                        isUpdate={isUpdate}
                        title={translate("major", language)}
                        placeholder={translate("major_text", language)}
                        theme={theme}
                        error={!!(errors[edu.id] && errors[edu.id].major)}
                        errorMessage={errors[edu.id] && errors[edu.id].major}
                    />
                </div>
            ))}

            {isUpdate && (
                <CustomButton
                    color={"var(--bg-primary-green)"}
                    border={"none"}
                    text={translate("add_education_history", language)}
                    handleClick={addEducation}
                    icon={<FaPlus size={20} />}
                />
            )}

            <TypePopup
                opened={levelPopupOpened}
                onClose={() => setLevelPopupOpened(false)}
                options={levelLabels}
                onSelect={onSelectLevel}
                top="20%"
                height="69vh"
            />

            <SearchDropdownPopup
                opened={searchPopupOpened}
                onClose={() => setSearchPopupOpened(false)}
                options={institutionOption}
                onSelect={onSelectInstitution}
                title={translate("institution_name", language)}
                placeholder={"Cari Nama Institusi"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                emptyComponent={<AddInstitutionEmpty />}
            />
        </div>
    );
};

export default EducationForm;
