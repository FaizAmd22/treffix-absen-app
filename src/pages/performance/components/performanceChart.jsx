import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale, Filler } from 'chart.js';
import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectLanguages } from '../../../slices/languagesSlice';

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale, Filler);

const PerformanceChart = ({ data: pointsData }) => {
    const chartRef = useRef(null);
    const [gradient, setGradient] = useState(null);
    const language = useSelector(selectLanguages)

    console.log("pointsData :", pointsData);

    useEffect(() => {
        if (chartRef.current) {
            const chart = chartRef.current.ctx;
            const gradientFill = chart.createLinearGradient(0, 0, 0, 250);
            gradientFill.addColorStop(0, 'rgba(29, 138, 142, 0.5)');
            gradientFill.addColorStop(1, 'rgba(40, 111, 243, 0)');
            setGradient(gradientFill);
        }
    }, []);

    const sortedPoints = [...pointsData].sort((a, b) =>
        new Date(a.tanggal) - new Date(b.tanggal)
    );

    let cumulativePoints = [];
    let runningTotal = 0;
    sortedPoints.forEach(point => {
        runningTotal += point.point;
        cumulativePoints.push({
            tanggal: point.tanggal,
            point: runningTotal,
            label: point.label,
            type: point.type,
            originalPoint: point.point
        });
    });

    const data = {
        labels: cumulativePoints.map(point =>
            new Date(point.tanggal).toLocaleDateString(language, { day: 'numeric', month: 'short' })
        ),
        datasets: [
            {
                label: 'Total Point',
                data: cumulativePoints.map(point => point.point),
                borderColor: '#1d8b8e',
                backgroundColor: gradient || 'rgba(29, 138, 142, 0.5)',
                fill: true,
                tension: 0,
                pointRadius: 5,
                pointBackgroundColor: '#1d8b8e',
                pointBorderColor: 'rgba(29, 138, 142, 0.4)',
                pointBorderWidth: 4,
                pointHoverRadius: 6,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: false
            },
            datalabels: {
                display: false
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    display: false
                }
            },
            y: {
                grid: {
                    color: 'rgba(200, 200, 200, 0.3)'
                }
            }
        }
    };

    return (
        <div style={{ paddingBottom: "20px" }}>
            <div style={{ height: '250px' }}>
                <Line ref={chartRef} data={data} options={options} />
            </div>
        </div>
    );
};

export default PerformanceChart;
