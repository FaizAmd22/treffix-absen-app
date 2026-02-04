import { useSelector } from 'react-redux';
import { selectLanguages } from '../../../../slices/languagesSlice';
import BackButton from '../../../../components/backButton';
import InputNumber from '../../../../components/inputNumber';
import InputText from '../../../../components/inputText';
import { translate } from '../../../../utils/translate';
import { useState, useEffect, useRef } from 'react';
import CustomPopup from '../../../../components/customPopup';
import ButtonFixBottom from '../../../../components/buttonFixBottom';
import CustomButton from '../../../../components/customButton';
import InputDate from '../../../../components/inputDate';
import { f7, Page } from 'framework7-react';
import TypePopup from '../../../../components/typePopup';
import InputDropdown from '../../../../components/inputDropdown';
import { bloodTypeOptions, genderOptions, maritalStatusOptions, religionOptions } from '../../../../utils/selectOptions';
import { API } from '../../../../api/axios';
import { showToastFailed } from '../../../../functions/toast';
import LoadingPopup from '../../../../components/loadingPopup';
import { parseTTL } from '../../../../functions/parseTtl';
import { ensureJpegUploadable } from '../../../../functions/dataUrlToFile';
import { z } from 'zod';
import { normalizeToYMD } from '../../../../functions/normalizeToYMD';
import { decryptAccessDoc } from '../../../../utils/accessDocDecrypt';
import { selectSettings } from '../../../../slices/settingsSlice';

const ValidasiKtp = () => {
  const theme = useSelector(selectSettings)
  const language = useSelector(selectLanguages)
  const dataOcr = JSON.parse(localStorage.getItem('dataOcr'))
  const capturedImage = localStorage.getItem('capturedImage')
  const filename = localStorage.getItem('filename')
  const isOnboarding = localStorage.getItem("isOnboarding")
  const [errors, setErrors] = useState({})
  const [previewUrl, setPreviewUrl] = useState(capturedImage || '');
  const previewUrlRef = useRef(null);

  const notEmpty = z.string().trim().min(1, translate('field_cant_empty', language));
  const sixteenDigits = (label) =>
    z.string().regex(/^\d{16}$/, `${label} harus memiliki 16 digit`);
  const dateYMD = z
    .string()
    .trim()
    .min(1, translate('field_cant_empty', language))
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid");

  const capitalizeWords = (str) =>
    str
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const makeSchema = () => {
    if (isTaxNumber) {
      return z.object({
        taxNumber: notEmpty,
      });
    }

    if (isFamilyCard) {
      return z.object({
        familyCardNumber: sixteenDigits("No KK"),
      });
    }

    if (isDrivingLicense) {
      return z.object({
        licenseNumber: notEmpty,
        licenseValidDate: dateYMD,
        licenseName: notEmpty,
      });
    }

    return z.object({
      nikValue: sixteenDigits("No KTP"),
      nameValue: z.string().trim().min(3, translate("field_cant_empty", language)).transform(capitalizeWords),
      placeOfBirthValue: z.string().trim().min(1, translate("field_cant_empty", language)).transform(capitalizeWords),
      birthDateValue: dateYMD,
      genderValue: notEmpty,
      bloodTypeValue: notEmpty,
      regionValue: notEmpty,
      maritalStatusValue: notEmpty,
      addressValue: notEmpty,
      villageValue: notEmpty,
      rtrwValue: notEmpty,
      subdistrictValue: notEmpty,
      cityValue: notEmpty,
      provinceValue: notEmpty,
    });
  };

  const matchValueWithOptions = (ocrValue, options) => {
    if (!ocrValue) return '';

    const normalizedOcrValue = ocrValue.trim().toLowerCase();
    const matchedOption = options.find(opt =>
      opt.label.toLowerCase() === normalizedOcrValue
    );

    if (matchedOption) {
      return matchedOption.label;
    }

    return '';
  };

  const matchGender = (ocrGender) => {
    if (!ocrGender) return '';
    const normalized = ocrGender.trim().toLowerCase();

    if (normalized.includes('laki') || normalized === 'l') {
      return 'Laki-laki';
    } else if (normalized.includes('perempuan') || normalized === 'p') {
      return 'Perempuan';
    }
    return '';
  };

  const matchMaritalStatus = (ocrStatus) => {
    if (!ocrStatus) return '';
    const normalized = ocrStatus.trim().toLowerCase();

    if (normalized.includes('belum')) {
      return 'Belum Menikah';
    } else if (normalized.includes('kawin') || normalized.includes('menikah')) {
      return 'Menikah';
    } else if (normalized.includes('cerai')) {
      return 'Cerai';
    }
    return '';
  };

  const ttlData = parseTTL(dataOcr?.ttl);

  const [nikValue, setNikValue] = useState(dataOcr?.nik || '');
  const [nameValue, setNameValue] = useState(dataOcr?.nama || '');
  const [placeOfBirthValue, setPlaceOfBirthValue] = useState(ttlData.place);
  const [birthDateValue, setBirthDateValue] = useState(normalizeToYMD(ttlData?.dateIso || dataOcr?.birth_date || ""));
  const [genderValue, setGenderValue] = useState(matchGender(dataOcr?.gender));
  const [bloodTypeValue, setBloodTypeValue] = useState(matchValueWithOptions(dataOcr?.goldar, bloodTypeOptions));
  const [regionValue, setRegionValue] = useState(matchValueWithOptions(dataOcr?.agama, religionOptions));
  const [maritalStatusValue, setMaritalStatusValue] = useState(matchMaritalStatus(dataOcr?.status_kawin));
  const [addressValue, setAddressValue] = useState(dataOcr?.alamat || '');
  const [villageValue, setVillageValue] = useState(dataOcr?.desa || '');
  const [rtrwValue, setRtrwValue] = useState(dataOcr?.rt || '');
  const [subdistrictValue, setSubdistrictValue] = useState(dataOcr?.kecamatan || '');
  const [cityValue, setCityValue] = useState(dataOcr?.kota || '');
  const [provinceValue, setProvinceValue] = useState(dataOcr?.provinsi || '');
  const [confirmPopupOpened, setConfirmPopupOpened] = useState(false);
  const [titleTypePopup, setTitleTypePopup] = useState(null);
  const [typePopupOpened, setTypePopupOpened] = useState(false);
  const [kindOfType, setKindOfType] = useState(null);
  const [showLoading, setShowLoading] = useState(false);
  const [query, setQuery] = useState({});

  useEffect(() => {
    const params = f7.views.main.router.currentRoute.query;
    setQuery(params || {});
    localStorage.setItem("isOnboarding", "true")
  }, []);

  const qval = String(query?.value || '').toLowerCase();
  const isTaxNumber = qval === 'tax_number';
  const isFamilyCard = qval === 'family-card' || qval === 'family_card';
  const isDrivingLicense = qval.startsWith('driving_license');

  const [taxNumber, setTaxNumber] = useState(dataOcr?.tax_number || '');
  const [familyCardNumber, setFamilyCardNumber] = useState(dataOcr?.no_kk || '');
  const [licenseNumber, setLicenseNumber] = useState(dataOcr?.licence_number || '');
  const [licenseValidDate, setLicenseValidDate] = useState(normalizeToYMD(dataOcr?.valid_date || ""));
  const [licenseName, setLicenseName] = useState(dataOcr?.name || '');

  const handleInputChange = (setter, fieldKey) => (event) => {
    setter(event.target.value);
    if (fieldKey && errors[fieldKey]) {
      setErrors((prev) => ({ ...prev, [fieldKey]: "" }));
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrlRef.current && String(previewUrlRef.current).startsWith('blob:')) {
        try { URL.revokeObjectURL(previewUrlRef.current); } catch (_) { }
      }
    };
  }, []);


  const handleSubmit = () => {
    const schema = makeSchema();
    const formDataByMode = isTaxNumber
      ? { taxNumber }
      : isFamilyCard
        ? { familyCardNumber }
        : isDrivingLicense
          ? { licenseNumber, licenseValidDate, licenseName }
          : {
            nikValue, nameValue, placeOfBirthValue, birthDateValue,
            genderValue, bloodTypeValue, regionValue, maritalStatusValue,
            addressValue, villageValue, rtrwValue, subdistrictValue,
            cityValue, provinceValue,
          };

    const result = schema.safeParse(formDataByMode);
    if (!result.success) {
      const nextErrors = {};
      result.error.issues.forEach((iss) => {
        const key = iss.path?.[0];
        if (key) nextErrors[key] = iss.message;
      });
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setConfirmPopupOpened(true);
  };

  const openTypePopup = (type, title) => {
    setKindOfType(type);
    setTitleTypePopup(title);
    setTimeout(() => setTypePopupOpened(true), 200);
  };

  const getOptions = () => {
    if (kindOfType === "jenisKelamin") {
      return genderOptions
    } else if (kindOfType === "goldar") {
      return bloodTypeOptions
    } else if (kindOfType === "agama") {
      return religionOptions
    } else if (kindOfType === "statusKawin") {
      return maritalStatusOptions
    } else {
      return bloodTypeOptions
    }
  }

  const capitalizeName = (str) => {
    if (!str) return null;
    return str
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleOnSelect = (selectedType) => {
    const label = typeof selectedType === 'object' && selectedType !== null
      ? (selectedType.label ?? '')
      : String(selectedType ?? '');

    if (kindOfType === 'jenisKelamin') {
      setGenderValue(label);
      if (errors.genderValue) setErrors(prev => ({ ...prev, genderValue: "" }));
    } else if (kindOfType === 'goldar') {
      setBloodTypeValue(label);
      if (errors.bloodTypeValue) setErrors(prev => ({ ...prev, bloodTypeValue: "" }));
    } else if (kindOfType === 'agama') {
      setRegionValue(label);
      if (errors.regionValue) setErrors(prev => ({ ...prev, regionValue: "" }));
    } else if (kindOfType === 'statusKawin') {
      setMaritalStatusValue(label);
      if (errors.maritalStatusValue) setErrors(prev => ({ ...prev, maritalStatusValue: "" }));
    }

    setTypePopupOpened(false);
  };

  const handleSubmitPopup = async () => {
    setConfirmPopupOpened(false);
    setShowLoading(true);

    try {
      if (isTaxNumber) {
        const payload = { tax_number: taxNumber };
        await API.put('/mobile/employees/personal/tax-number-data', payload);
      } else if (isFamilyCard) {
        const payload = { family_card_number: familyCardNumber };
        await API.put('/mobile/employees/personal/family-card-number', payload);
      } else if (isDrivingLicense) {
        const capitalizeName = (licenseName || '')
          .toLowerCase()
          .split(' ')
          .map(w => (w ? w[0].toUpperCase() + w.slice(1) : ''))
          .join(' ');
        const payload = {
          license_number: licenseNumber,
          document_type: qval,
          valid_date: licenseValidDate,
          name: capitalizeName,
        };
        await API.put('/mobile/employees/personal/driving-license-data', payload);
      } else {
        const getValueFromLabel = (label, options) => {
          const opt = options.find(o => o.label === label);
          return opt ? opt.value : '';
        };
        const capitalizeAddress = (text) =>
          text.split(" ").map(word => {
            if (word.toUpperCase().includes("RT/RW")) return word;
            if (!word.trim()) return "";
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          }).join(" ");

        const addressRaw = `${addressValue}, RT/RW ${rtrwValue}, ${villageValue}, ${subdistrictValue}, ${cityValue}, ${provinceValue}`;

        const payload = {
          identity_number: nikValue,
          name: capitalizeName(nameValue),
          birth_place: capitalizeName(placeOfBirthValue),
          date_of_birth: birthDateValue,
          gender: getValueFromLabel(genderValue, genderOptions),
          blood_type: bloodTypeValue,
          religion: getValueFromLabel(regionValue, religionOptions),
          marital_status: getValueFromLabel(maritalStatusValue, maritalStatusOptions),
          address: capitalizeAddress(addressRaw),
          domicile_address: capitalizeAddress(addressRaw),
        };
        await API.put('/mobile/employees/personal/identity-card-data', payload);
      }

      try {
        const out = await ensureJpegUploadable(capturedImage, filename, 0.9);
        console.log("out :", out);

        const formData = new FormData();
        if (out?.blob) {
          formData.append('file', out.blob, out.filename);
        } else if (out?.file) {
          if (!out.file.size) {
            const fallback = await ensureJpegUploadable(capturedImage, filename, 0.9);
            console.log("fallback :", fallback);
            formData.append('file', fallback.blob, fallback.filename);
          } else {
            formData.append('file', out.file);
          }
        } else {
          throw new Error('No blob/file returned');
        }

        const valueType = qval;
        formData.append('document_type', valueType);

        const uploadRes = await API.post('/mobile/employees/upload-document', formData, {
          transformRequest: [(data) => data],
        });

        const docId = uploadRes?.data?.payload;
        if (!docId) {
          showToastFailed("Upload berhasil tapi doc_id kosong!");
          return;
        }

        try {
          const { url, kind } = await decryptAccessDoc(docId);
          if (kind === 'image' && url) {
            if (previewUrlRef.current && String(previewUrlRef.current).startsWith('blob:')) {
              try { URL.revokeObjectURL(previewUrlRef.current); } catch (_) { }
            }
            previewUrlRef.current = url;
            setPreviewUrl(url);
          }
        } catch (e) {
          console.error("decrypt after upload failed:", e);
        }
      } catch (uploadErr) {
        showToastFailed("Gagal upload dokumen!}");
        return;
      }

      console.log(isOnboarding);

      if (isOnboarding || isOnboarding == "true") {
        f7.views.main.router.back('/upload-dokumen-list/', { force: true, ignoreCache: true })
      } else {
        f7.views.main.router.back('/personal-data/', { force: true, ignoreCache: true })
      }
    } catch (error) {
      showToastFailed(translate('failed_data_validation', language));
    } finally {
      setShowLoading(false);
    }
  };

  const isButtonEnabled =
    isTaxNumber
      ? Boolean(taxNumber)
      : isFamilyCard
        ? Boolean(familyCardNumber)
        : isDrivingLicense
          ? Boolean(licenseNumber && licenseValidDate && licenseName)
          : Boolean(
            nikValue && nameValue && placeOfBirthValue && birthDateValue &&
            genderValue && bloodTypeValue && regionValue && maritalStatusValue &&
            addressValue && villageValue && rtrwValue && subdistrictValue &&
            cityValue && provinceValue
          );

  const isKTP = !isTaxNumber && !isFamilyCard && !isDrivingLicense;

  return (
    <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
      <div style={{ color: theme === "light" ? "black" : "white" }}>
        <div style={{ padding: "15px", paddingTop: "25px", marginBottom: "80px" }}>
          <BackButton label={translate('data_validation', language)} />

          <div style={{ margin: "10px 0" }}>
            <img
              src={previewUrl || null}
              alt="imageUploaded"
              style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 24 24'%3E%3Cpath fill='%23757575' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
              }}
            />
          </div>

          {isTaxNumber && (
            <form onSubmit={e => e.preventDefault()} style={{ fontSize: "var(--font-sm)" }}>
              <InputText
                id="taxNumber"
                value={taxNumber}
                onChange={handleInputChange(setTaxNumber, "taxNumber")}
                title={translate('tax_number', language)}
                placeholder={translate('tax_number_placeholder', language)}
                theme={"light"}
                error={!!errors.taxNumber}
                errorMessage={errors.taxNumber}
              />
            </form>
          )}

          {isFamilyCard && (
            <form onSubmit={e => e.preventDefault()} style={{ fontSize: "var(--font-sm)" }}>
              <InputNumber
                type="number"
                id="familyCardNumber"
                value={familyCardNumber}
                onChange={handleInputChange(setFamilyCardNumber, "familyCardNumber")}
                title={translate('family_card_number', language)}
                placeholder={translate('family_card_number_placeholder', language)}
                theme={"light"}
                error={!!errors.familyCardNumber}
                errorMessage={errors.familyCardNumber}
              />
            </form>
          )}

          {isDrivingLicense && (
            <form onSubmit={e => e.preventDefault()} style={{ fontSize: "var(--font-sm)" }}>
              <InputText
                type="text"
                id="licenseNumber"
                value={licenseNumber}
                onChange={handleInputChange(setLicenseNumber, "licenseNumber")}
                title={translate('license_number', language)}
                placeholder={translate('license_number_placeholder', language)}
                theme={"light"}
                error={!!errors.licenseNumber}
                errorMessage={errors.licenseNumber}
              />
              <InputDate
                id="licenseValidDate"
                value={licenseValidDate}
                title={translate('sim_card_validity_period', language)}
                noValue={translate('sim_card_validity_period_placeholder', language)}
                onChange={handleInputChange(setLicenseValidDate, "licenseValidDate")}
                language={language}
                theme={"light"}
                error={!!errors.licenseValidDate}
                errorMessage={errors.licenseValidDate}
              />
              <InputText
                type="text"
                id="licenseName"
                value={licenseName}
                onChange={handleInputChange(setLicenseName, "licenseName")}
                title={translate('license_name', language)}
                placeholder={translate('license_name_placeholder', language)}
                theme={"light"}
                error={!!errors.licenseName}
                errorMessage={errors.licenseName}
              />
            </form>
          )}

          {isKTP && (
            <form onSubmit={handleSubmit} style={{ fontSize: "var(--font-sm)" }}>
              <InputNumber
                type={"number"}
                id={"nikValue"}
                value={nikValue}
                onChange={handleInputChange(setNikValue, "nikValue")}
                title={translate('nik', language)}
                placeholder={translate('nik_placeholder', language)}
                theme={"light"}
                error={!!errors.nikValue}
                errorMessage={errors.nikValue}
              />

              <InputText
                type={"text"}
                id={"nameValue"}
                value={nameValue}
                onChange={handleInputChange(setNameValue, "nameValue")}
                title={translate('name', language)}
                placeholder={translate('name_placeholder', language)}
                theme={"light"}
                error={!!errors.nameValue}
                errorMessage={errors.nameValue}
              />

              <InputText
                type={"text"}
                id={"placeOfBirthValue"}
                value={placeOfBirthValue}
                onChange={handleInputChange(setPlaceOfBirthValue, "placeOfBirthValue")}
                title={translate('placeofbirth', language)}
                placeholder={translate('placeofbirth_placeholder', language)}
                theme={"light"}
                error={!!errors.placeOfBirthValue}
                errorMessage={errors.placeOfBirthValue}
              />

              <InputDate
                id={"birthDateValue"}
                value={birthDateValue}
                title={translate('dateofbirth', language)}
                noValue={translate('dateofbirth_placeholder', language)}
                onChange={handleInputChange(setBirthDateValue, "birthDateValue")}
                language={language}
                theme={"light"}
                error={!!errors.birthDateValue}
                errorMessage={errors.birthDateValue}
              />

              <InputDropdown
                value={genderValue}
                title={translate('gender', language)}
                noValue={translate('gender_text', language)}
                onClick={() => openTypePopup("jenisKelamin", translate('gender', language))}
                theme={"light"}
                error={!!errors.genderValue}
                errorMessage={errors.genderValue}
              />

              <InputDropdown
                value={regionValue}
                title={translate('religion', language)}
                noValue={translate('religion_text', language)}
                onClick={() => openTypePopup("agama", translate('religion_text', language))}
                theme={"light"}
                error={!!errors.regionValue}
                errorMessage={errors.regionValue}
              />

              <InputDropdown
                value={bloodTypeValue}
                title={translate('blood_type', language)}
                noValue={translate('blood_type_text', language)}
                onClick={() => openTypePopup("goldar", translate('blood_type_text', language))}
                theme={"light"}
                error={!!errors.bloodTypeValue}
                errorMessage={errors.bloodTypeValue}
              />

              <InputDropdown
                value={maritalStatusValue}
                title={translate('marital_status', language)}
                noValue={translate('marital_status_text', language)}
                onClick={() => openTypePopup("statusKawin", translate('marital_status_text', language))}
                theme={"light"}
                error={!!errors.maritalStatusValue}
                errorMessage={errors.maritalStatusValue}
              />

              <InputText
                type={"text"}
                id={"addressValue"}
                value={addressValue}
                onChange={handleInputChange(setAddressValue, "addressValue")}
                error={!!errors.addressValue}
                errorMessage={errors.addressValue}
                title={translate('add_schedule_address', language)}
                placeholder={translate('add_schedule_address_text', language)}
                theme={"light"}
              />

              <InputText
                type={"text"}
                id={"villageValue"}
                value={villageValue}
                onChange={handleInputChange(setVillageValue, "villageValue")}
                error={!!errors.villageValue}
                errorMessage={errors.villageValue}
                title={translate('village', language)}
                placeholder={translate('village_text', language)}
                theme={"light"}
              />

              <InputText
                type={"text"}
                id={"rtrwValue"}
                value={rtrwValue}
                onChange={handleInputChange(setRtrwValue, "rtrwValue")}
                error={!!errors.rtrwValue}
                errorMessage={errors.rtrwValue}
                title={"RT/RW"}
                placeholder={translate('rt_rw_placeholder', language)}
                theme={"light"}
              />

              <InputText
                type={"text"}
                id={"subdistrictValue"}
                value={subdistrictValue}
                onChange={handleInputChange(setSubdistrictValue, "subdistrictValue")}
                error={!!errors.subdistrictValue}
                errorMessage={errors.subdistrictValue}
                title={translate('subdistrict', language)}
                placeholder={translate('subdistrict_text', language)}
                theme={"light"}
              />

              <InputText
                type={"text"}
                id={"cityValue"}
                value={cityValue}
                onChange={handleInputChange(setCityValue, "cityValue")}
                error={!!errors.cityValue}
                errorMessage={errors.cityValue}
                title={translate('city', language)}
                placeholder={translate('city_text', language)}
                theme={"light"}
              />

              <InputText
                type={"text"}
                id={"provinceValue"}
                value={provinceValue}
                onChange={handleInputChange(setProvinceValue, "provinceValue")}
                error={!!errors.provinceValue}
                errorMessage={errors.provinceValue}
                title={translate('province', language)}
                placeholder={translate('province_text', language)}
                theme={"light"}
              />
            </form>
          )}
        </div>

        <ButtonFixBottom needBorderTop={true}>
          <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
            <CustomButton
              color={"var(--bg-primary-green)"}
              bg={"transparent"}
              text={"Ambil Foto Ulang"}
              border={"1px solid var(--bg-primary-green)"}
              handleClick={() => {
                const params = `?value=${encodeURIComponent(query.value)}&label=${encodeURIComponent(query.label)}`;
                f7.views.main.router.navigate(`/capture-ktp/${params}`);
              }}
            />

            <CustomButton
              color={"white"}
              bg={"var(--bg-primary-green)"}
              text={"Selesai"}
              // disable={!isButtonEnabled}
              handleClick={handleSubmit}
            />
          </div>
        </ButtonFixBottom>
      </div>

      <LoadingPopup popupOpened={showLoading} setPopupOpened={setShowLoading} />

      <CustomPopup
        popupOpened={confirmPopupOpened}
        setPopupOpened={setConfirmPopupOpened}
        title={`Verifikasi ${query?.label}`}
        message={`Pastikan semua data ${query?.label} yang Anda isi sudah benar. Isi data selanjutnya?`}
        btnNo={translate('procurement_cancel', language)}
        handleCancel={() => setConfirmPopupOpened(false)}
        btnYes={translate('done', language)}
        handleConfirm={handleSubmitPopup}
      />

      {kindOfType && (
        <TypePopup
          title={titleTypePopup}
          opened={typePopupOpened}
          onClose={() => setTypePopupOpened(false)}
          options={getOptions()}
          onSelect={handleOnSelect}
        />
      )}
    </Page>
  );
}

export default ValidasiKtp