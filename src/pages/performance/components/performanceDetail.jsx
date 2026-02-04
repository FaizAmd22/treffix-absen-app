import { Button, Page } from 'framework7-react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../slices/settingsSlice';
import BackButton from '../../../components/backButton';
import { selectLanguages } from '../../../slices/languagesSlice';
import FilterPerformancePopup from './filterPopup';
import { labelFilter } from '../../../functions/labelFilter';
import { API } from '../../../api/axios';
import CardPerformance from './cardPerformance';
import { translate } from '../../../utils/translate';
import { getTranslatedMonths } from '../../../functions/getTranslatedMonths';
import Loading from '../../../components/loading';
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';

const PerformanceDetailPage = (props) => {
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);
    const [loading, setLoading] = useState(true);
    const [detailData, setDetailData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isFilterPopup, setIsFilterPopup] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [selectedType, setSelectedType] = useState([]);
    const [tempSelectedStatus, setTempSelectedStatus] = useState([]);
    const [tempSelectedType, setTempSelectedType] = useState([]);
    const token = localStorage.getItem("token")

    const months = getTranslatedMonths(language)

    const month = parseInt(props.month);
    const year = parseInt(props.year);

    useEffect(() => {
        const fetchPerformance = async () => {
            const monthStr = (month + 1).toString().padStart(2, "0");
            const cond = { "created_at[month]": `${year}-${monthStr}` };

            try {
                setLoading(true);
                const response = await API.get("/mobile/user-performance", {
                    params: {
                        page: 1,
                        cond: JSON.stringify(cond),
                        sort_by: "created_at desc",
                        limit: 100,
                    },
                });

                const rawData = response.data.payload;

                console.log("rawData :", rawData);


                const formattedPoints = rawData.map(p => ({
                    tanggal: p.created_at,
                    point: p.point,
                    label: p.name,
                    point_activity: p.point > 0 ? "plus" : "minus",
                    type: p.type
                }));

                setDetailData(formattedPoints);
                setFilteredData(formattedPoints);
                setLoading(false)
            } catch (error) {
                console.log("Data performance tidak bisa diakses", error);
                setDetailData([]);
                setFilteredData([]);
                setLoading(false)
            }
        };

        if (token && !isNaN(month) && !isNaN(year)) {
            fetchPerformance();
        }
    }, [token, month, year]);


    useEffect(() => {
        let newFilteredData = detailData;
        if (selectedStatus.length > 0) {
            newFilteredData = newFilteredData.filter(item => selectedStatus.includes(item.point_activity));
        }
        if (selectedType.length > 0) {
            newFilteredData = newFilteredData.filter(item => selectedType.includes(item.type));
        }
        setFilteredData(newFilteredData);
    }, [selectedStatus, selectedType, detailData]);

    const toggleSelection = (value, selectedValues, setSelectedValues) => {
        if (selectedValues.includes(value)) {
            setSelectedValues(selectedValues.filter(item => item !== value));
        } else {
            setSelectedValues([...selectedValues, value]);
        }
    };

    const applyFilter = () => {
        setSelectedStatus(tempSelectedStatus);
        setSelectedType(tempSelectedType);
        setIsFilterPopup(false);
    };

    const openFilterPopup = () => setIsFilterPopup(true);
    const closeFilterPopup = () => setIsFilterPopup(false);

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <div style={{ padding: "15px", color: theme === "light" ? "black" : "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <BackButton label={`${translate('performance_point_activity', language)} ${months[month]} ${year}`} />
                    <Button onClick={openFilterPopup}>
                        <HiOutlineAdjustmentsHorizontal size={"20px"} color="var(--bg-primary-green)" />
                    </Button>
                </div>

                <div style={{ display: "flex", width: "100%", overflowX: "auto", gap: "10px", marginTop: "10px" }}>
                    {[...selectedStatus, ...selectedType].map((filter, index) => (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: theme == "light" ? "#E9E9E9" : "#212121",
                                padding: "5px 10px",
                                borderRadius: "20px",
                                fontSize: "var(--font-xs)",
                                fontWeight: 700,
                                textTransform: "capitalize",
                                minWidth: "100px",
                                justifyContent: "space-between"
                            }}
                            onClick={() => {
                                if (selectedStatus.includes(filter)) {
                                    const updatedStatus = selectedStatus.filter(item => item !== filter);
                                    setSelectedStatus(updatedStatus);
                                    setTempSelectedStatus(updatedStatus);
                                } else {
                                    const updatedType = selectedType.filter(item => item !== filter);
                                    setSelectedType(updatedType);
                                    setTempSelectedType(updatedType);
                                }
                            }}
                        >
                            {labelFilter(filter, language)}

                            <p style={{ margin: 0 }}>✖</p>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: "20px" }}>
                    {loading ? (
                        <Loading height="70vh" />
                    ) : filteredData.length > 0 ? (
                        filteredData.map((item, index) => (
                            <CardPerformance key={index} item={item} />
                        ))
                    ) : (
                        <p style={{ textAlign: "center", marginTop: "50px" }}>{translate('performance_no_data', language)}</p>
                    )}
                </div>
            </div>

            <FilterPerformancePopup
                applyFilter={applyFilter}
                closeFilterPopup={closeFilterPopup}
                isFilterPopup={isFilterPopup}
                setTempSelectedStatus={setTempSelectedStatus}
                setTempSelectedType={setTempSelectedType}
                tempSelectedStatus={tempSelectedStatus}
                tempSelectedType={tempSelectedType}
                toggleSelection={toggleSelection}
                theme={theme}
            />
        </Page>
    );
};

export default PerformanceDetailPage;
