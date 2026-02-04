import React from 'react';
import star from "../../../assets/icons/star.svg";
import { f7, Link } from 'framework7-react';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import { formatDate } from '../../../functions/formatDate';
import { selectLanguages } from '../../../slices/languagesSlice';
import { truncateText } from '../../../functions/truncateText';
import { translate } from '../../../utils/translate';
import { labelFilter } from '../../../functions/labelFilter';

const CardTraining = ({ data }) => {
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);

    if (!data) {
        return null;
    }

    return (
        <Link onClick={() => f7.views.main.router.navigate(`/training-detail/${data.id}/`)} style={{ border: "none", padding: "0 5px", width: "100%" }}>
            <div style={{ boxShadow: "0px 2px 16px 0px rgba(0,0,0,0.1)", borderRadius: "12px", width: "100%", background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-gray)" }}>
                <div style={{ width: "90%", height: "50px", position: "absolute", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(0,0,0, 0.5)", borderRadius: "360px", height: "21px", padding: "1px 10px" }}>
                        <img src={star} alt="star" style={{ width: "12px" }} />
                        <p style={{ fontSize: "var(--font-xs)", fontWeight: "700", color: "white" }}>{Number.isInteger(data.rating) ? data.rating : data.rating.toFixed(2)}</p>
                    </div>

                    {
                        data.completed ? (
                            <div style={{ background: "var(--color-bg-green)", borderRadius: "360px", padding: "6px 15px" }}>
                                <p style={{ fontWeight: 700, fontSize: "var(--font-xxs)", color: "var(--color-green)", margin: 0 }}>{translate('training_finished', language)}</p>
                            </div>
                        ) : (
                            <div style={{ background: "var(--color-bg-yellow)", borderRadius: "360px", padding: "6px 15px" }}>
                                <p style={{ fontWeight: 700, fontSize: "var(--font-xxs)", color: "var(--color-yellow)", margin: 0 }}>{translate('training_unfinished', language)}</p>
                            </div>
                        )
                    }
                </div>

                <img src={data.thumbnail} alt="content" style={{ width: "100%", height: "170px", borderRadius: "20px 20px 0 0", objectFit: "cover" }} />

                <div style={{ padding: "0 10px", marginTop: "-8px", height: "60%", textAlign: "start", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                        <p style={{ fontSize: "var(--font-md)", fontWeight: "700", color: theme === "light" ? "black" : "white", marginBottom: 0 }}>{data.title}</p>
                        <p style={{ color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)", fontSize: "var(--font-xs)", fontWeight: "400", margin: 0, padding: 0, marginTop: "4px" }}>{formatDate(data.start_date, language, "no-weekdays")} {data.end_data && "-" + formatDate(data.end_date, language, "no-weekdays")}</p>
                    </div>

                    <div style={{ width: "100%", overflowX: "auto", marginTop: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "100vw" }}>
                            <div style={{ background: "var(--bg-primary-green)", borderRadius: "360px", }}>
                                <p style={{ fontWeight: 700, fontSize: "var(--font-xs)", color: "white", padding: "5px 15px", margin: 0 }}>{labelFilter(data.mandatory, language)}</p>
                            </div>

                            <div style={{ background: "var(--bg-primary-green)", borderRadius: "360px", }}>
                                <p style={{ fontWeight: 700, fontSize: "var(--font-xs)", color: "white", padding: "5px 15px", margin: 0, textTransform: "capitalize" }}>{data.method}</p>
                            </div>

                            <div style={{ background: "var(--bg-primary-green)", borderRadius: "360px", }}>
                                <p style={{ fontWeight: 700, fontSize: "var(--font-xs)", color: "white", padding: "5px 15px", margin: 0 }}>{labelFilter(data.training_format, language)}</p>
                            </div>
                        </div>
                    </div>

                    <p style={{ fontSize: "var(--font-sm)", fontWeight: "400", color: theme == "light" ? "var(--color-dark-gray)" : "var(--color-gray)", paddingTop: "5px" }}>
                        {truncateText(data.description)}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <p style={{ color: "var(--color-green)", fontWeight: 700, fontSize: "var(--font-sm)" }}>+{data.point_present} Pts</p>
                        {/*<p style={{ color: "var(--color-gray)", fontSize: "var(--font-xs)", fontWeight: "400" }}>50 Menit</p>*/}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CardTraining;