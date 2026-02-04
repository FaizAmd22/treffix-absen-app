import { Button, f7, Page } from 'framework7-react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import BackButton from '../../../components/backButton';
import TypePopup from '../../../components/typePopup';
import { API } from '../../../api/axios';
import { translate } from '../../../utils/translate';
import { selectLanguages } from '../../../slices/languagesSlice';
import { inputFilterConvert } from '../../../functions/inputFilterConvert';
import { showToast, showToastFailed } from '../../../functions/toast';
import MessageAlert from '../../../components/messageAlert';
import ButtonFixBottom from '../../../components/buttonFixBottom';
import CustomButton from '../../../components/customButton';
import InputText from '../../../components/inputText';
import InputDropdown from '../../../components/inputDropdown';
import InputTextarea from '../../../components/inputTextarea';
import InputNumber from '../../../components/inputNumber';
import ImageAlertLight from '../../../assets/messageAlert/procurement-light.png'
import ImageAlertDark from '../../../assets/messageAlert/procurement-dark.png'

const ProcurementSubmission = () => {
    const [procurementName, setProcurementName] = useState("");
    const [procurementType, setProcurementType] = useState("");
    const [procurementPrice, setProcurementPrice] = useState("");
    const [procurementPurchaseLink, setProcurementPurchaseLink] = useState("");
    const [procurementReason, setProcurementReason] = useState("");
    const [typePopupOpened, setTypePopupOpened] = useState(false);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const [sheetOpened, setSheetOpened] = useState(false);
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);
    const token = localStorage.getItem("token")

    // const submissionTypes = [translate('electronic', language), translate('office_tool', language), translate('vehicle', language)];
    const submissionTypes = ['Elektronik', 'Alat Kerja', 'Kendaraan'];
    const openTypePopup = () => setTypePopupOpened(true);
    const closeTypePopup = () => setTypePopupOpened(false);

    const convertRupiahToNumber = (rupiahString) => {
        return parseInt(rupiahString.replace(/[^\d]/g, ''), 10) || 0;
    };

    const fetchSubmit = async () => {
        setIsLoadingSubmit(true)
        try {
            const payload = {
                "title": procurementName,
                "amount": convertRupiahToNumber(procurementPrice),
                "url": procurementPurchaseLink,
                "reason": procurementReason,
                "type_of_procurement": inputFilterConvert(procurementType.toLowerCase())
            };

            console.log("Sending payload:", payload);

            const response = await API.post(`/mobile/form-request-procurement`, payload);

            console.log("response submit:", response);
            // f7.dialog.alert(translate('submission_permission_successful_submission', language), () => f7.views.main.router.back('/procurement/', { reloadCurrent: true }));
            f7.views.main.router.back('/procurement/', { reloadCurrent: true })
            // showToast(translate('submission_permission_successful_submission', language), theme)
            setSheetOpened(true)
        } catch (error) {
            console.log("error :", error);
            // f7.dialog.alert(translate("submission_permission_failed_submission", language));
            showToastFailed(translate('submission_permission_failed_submission', language))
        } finally {
            setTimeout(() => {
                setIsLoadingSubmit(false)
            }, 3000);
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!procurementName || !procurementType || !procurementPrice || !procurementReason) {
            // f7.dialog.alert(translate("procurement_alert_must_filled", language));
            showToastFailed(translate('procurement_alert_must_filled', language))
            return;
        }

        fetchSubmit();
    };

    const handleInputChange = (setter) => (event) => {
        setter(event.target.value);
    };

    const formatRupiah = (value) => {
        const numberString = value.replace(/[^0-9]/g, "");
        if (!numberString) return "";

        return new Intl.NumberFormat("id-ID").format(Number(numberString));
    };

    const handleInputChangeRupiah = (event) => {
        const rawValue = event.target.value;
        setProcurementPrice(formatRupiah(rawValue));
    };

    const isButtonEnabled = procurementName && procurementType && procurementPrice && procurementReason;

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ color: theme === "light" ? "black" : "white" }}>
                <div style={{ padding: "0 15px", marginBottom: "90px" }}>
                    <BackButton label={translate("item_submission", language)} />

                    <form onSubmit={handleSubmit} style={{ fontSize: "var(--font-sm)" }}>
                        <InputText
                            type={"text"}
                            id={"procurementName"}
                            value={procurementName}
                            onChange={handleInputChange(setProcurementName)}
                            title={translate("detail_procurement_item_name", language)}
                            placeholder={translate('procurement_item_name_placeholder', language)}
                            theme={theme}
                        />

                        <InputDropdown
                            title={translate('detail_procurement_item_type', language)}
                            value={procurementType}
                            noValue={translate('procurement_item_type_placeholder', language)}
                            onClick={openTypePopup}
                            theme={theme}
                        />

                        <InputNumber
                            type={"rupiah"}
                            id={"procurementPrice"}
                            value={procurementPrice}
                            onChange={handleInputChangeRupiah}
                            title={translate("detail_procurement_item_price", language)}
                            placeholder={translate('procurement_item_price_placeholder', language)}
                            theme={theme}
                        />

                        <InputText
                            type={"text"}
                            id={"procurementPurchaseLink"}
                            value={procurementPurchaseLink}
                            onChange={handleInputChange(setProcurementPurchaseLink)}
                            title={translate("detail_procurement_item_link", language)}
                            placeholder={translate('procurement_item_link_placeholder', language)}
                            theme={theme}
                        />

                        <InputTextarea
                            title={translate('detail_procurement_item_reason', language)}
                            id={"procurementReason"}
                            type={"label"}
                            noMargin={false}
                            placeholder={translate('procurement_item_reason_placeholder', language)}
                            value={procurementReason}
                            onChange={handleInputChange(setProcurementReason)}
                            theme={theme}
                        />
                    </form>
                </div>

                <ButtonFixBottom needBorderTop={true}>
                    {isLoadingSubmit ? (
                        <CustomButton
                            color={"white"}
                            bg={"var(--color-gray)"}
                            text={"Loading..."}
                            disable={true}
                        />
                    ) : (
                        <CustomButton
                            color={"white"}
                            bg={isButtonEnabled ? "var(--bg-primary-green)" : "var(--color-gray)"}
                            text={translate('submit', language)}
                            disable={!isButtonEnabled}
                            handleClick={handleSubmit}
                        />
                    )}
                </ButtonFixBottom>
            </div>

            <TypePopup
                title={translate("procurement_select_submission_type", language)}
                top="64%"
                opened={typePopupOpened}
                onClose={closeTypePopup}
                options={submissionTypes}
                onSelect={(selectedType) => {
                    setProcurementType(selectedType);
                    closeTypePopup();
                }}
            />

            <MessageAlert
                sheetOpened={sheetOpened}
                setSheetOpened={setSheetOpened}
                title={translate('submission_procurement_success', language)}
                message={translate('submission_procurement_success_text', language)}
                imageAlert={theme == "light" ? ImageAlertLight : ImageAlertDark}
                btnCloseText={translate('close', language)}
            />
        </Page>
    );
}

export default ProcurementSubmission;