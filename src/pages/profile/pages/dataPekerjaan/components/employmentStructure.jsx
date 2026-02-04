import { Link, Tab, Tabs, Toolbar } from 'framework7-react';
import React, { useEffect, useState } from 'react';
import { API } from '../../../../../api/axios';
import OrganizationChart from './organizationChart';
import Loading from '../../../../../components/loading';
import NoData from '../../../../../components/noData';
import ImageNoData from "../../../../../assets/error/no-data.svg";
import { translate } from '../../../../../utils/translate';
import { useSelector } from 'react-redux';
import { selectLanguages } from '../../../../../slices/languagesSlice';

const EmploymentStructure = ({ isLoading }) => {
    const [datas, setDatas] = useState([])
    const [userNodeId, setUserNodeId] = useState(null);
    const token = localStorage.getItem("token")
    const language = useSelector(selectLanguages)

    const fetchDataChart = async () => {
        try {
            const response = await API.get("/mobile/employees/employment/chart-nodes");
            const userId = await API.get('/mobile/job-positions/qualifications/me')

            const data = response.data.payload
            console.log("userId :", userId.data.payload);
            setDatas(data)
            setUserNodeId(userId.data.payload.job_position_id)
        } catch (error) {
            console.log("Data chart tidak bisa diakses!", error);
        }
    }

    useEffect(() => {
        if (token) {
            fetchDataChart()
        }
    }, [token])

    return (
        <div>
            {isLoading ? (
                <Loading height="60vh" />
            ) : datas.length > 0 ? (
                <OrganizationChart nodes={datas} userNodeId={userNodeId} />
            ) : (
                <NoData image={ImageNoData} title={translate('no_data_chart', language)} />
            )}
        </div>
    );
};

export default EmploymentStructure;