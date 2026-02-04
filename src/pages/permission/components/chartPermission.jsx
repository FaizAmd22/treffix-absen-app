import ReactECharts from "echarts-for-react";

const ChartPermission = ({ chartData, theme }) => {
    const hasCutiBesar = chartData.some(item => item.name === "Cuti Besar");
    const hasCutiKosong = chartData.some(item => item.name === "Cuti Kosong");

    const colors = hasCutiBesar
        ? ['#737AFC', '#85F195', '#FC9595']
        : hasCutiKosong ? ['#E8E8E8']
            : ['#737AFC', '#FC9595'];

    const option = {
        legend: false,
        color: colors,
        series: [
            {
                name: 'Access From',
                type: 'pie',
                radius: ['80%', '125%'],
                center: ['50%', '80%'],
                startAngle: 180,
                endAngle: 360,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: theme == "light" ? '#fff' : '#1A1A1A',
                    borderWidth: 5
                },
                label: {
                    show: !hasCutiKosong,
                    position: 'inner',
                    fontWeight: 'bold',
                    color: 'white',
                    formatter: function (params) {
                        return params.value > 0 ? params.value : '';
                    }
                },
                labelLine: {
                    show: false
                },
                data: chartData
            }
        ]
    };

    return (
        <div style={{ width: "100%", height: "35vh" }}>
            <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
        </div>
    );
};

export default ChartPermission;
