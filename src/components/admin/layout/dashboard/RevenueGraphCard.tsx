import { MainCard } from "../MainCard";
import { useTheme } from "@mui/material";
import dynamic from "next/dynamic";
import SsidChartIcon from '@mui/icons-material/SsidChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useState } from "react";
import { ToggleButtonGroup } from "@mui/material";
import { ToggleButton } from "@mui/lab";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type SamplePoint = {revenue: number; ticketAmount: number};

const lineYAxis = (theme) => [
    {
        axisTicks: {
            show: true
        },
        axisBorder: {
            show: true,
            color: theme.palette.secondary.main
        },
        labels: {
            style: {
                colors: theme.palette.secondary.main
            },
            formatter: function (val) {
                return val?.toFixed(2)
            }
        },
        title: {
            text: "Revenue",
            style: {
                color: theme.palette.secondary.main
            }
        }
    },
    {
        opposite: true,
        axisTicks: {
            show: true
        },
        axisBorder: {
            show: true,
            color: theme.palette.primary.main
        },
        labels: {
            style: {
                colors: theme.palette.primary.main
            },
            formatter: function (val) {
                return val?.toFixed(0)
            }
        },
        title: {
            text: "Ticket Amount",
            style: {
                color: theme.palette.primary.main
            }
        }
    }
];


export const RevenueGraphCard = ({oneYearOrdersGroup}: {oneYearOrdersGroup: Record<string, SamplePoint>}) => {
    const theme = useTheme();
    const [chartType, setChartType] = useState<"line" | "bar">("line");
    const [duration, setDuration] = useState<number>(7);

    const compareDate = new Date();
    compareDate.setDate(compareDate.getDate() - duration);
    const milliseconds = compareDate.getTime();
    const data: [number, {revenue: number; ticketAmount: number}][] = Object.entries(oneYearOrdersGroup)
        .map((value) => [(new Date(value[0])).getTime(), value[1]] as [number, SamplePoint])
        .filter((value) => value[0] > milliseconds)
        .sort((a, b) => a[0] - b[0]);

    return (
        <MainCard
            title={"Timeline"}
            icon={<SsidChartIcon /> }
            color={{
                dark: "#EFEFEF",
                main: "#BBBBBB",
                light: "#FFFFFF",
                contrastText: "#222222"
            }}
            navigations={[
                <ToggleButtonGroup
                    key="duration-group"
                    value={duration}
                    exclusive
                    onChange={(_, value) => setDuration(value)}
                    aria-label="text alignment"
                >
                    <ToggleButton value={365}>Year</ToggleButton>
                    <ToggleButton value={30}>Month</ToggleButton>
                    <ToggleButton value={7}>Week</ToggleButton>
                </ToggleButtonGroup>,
                <ToggleButtonGroup
                    key="type-group"
                    value={chartType}
                    exclusive
                    onChange={(_, value) => setChartType(value)}
                    aria-label="text alignment"
                >
                    <ToggleButton value={"line"}><SsidChartIcon /></ToggleButton>
                    <ToggleButton value={"bar"}><BarChartIcon /></ToggleButton>
                </ToggleButtonGroup>
                ]
            }
        >
            <Chart
                key={chartType}
                type={chartType}
                series={[
                    {
                        name: "Revenue",
                        data: data.map(d => [d[0], d[1].revenue]) as [number, number][]
                    },
                    {
                        name: "Ticket Amount",
                        data: data.map(d => [d[0], d[1].ticketAmount]) as [number, number][]
                    }
                ]}
                height={480}
                options={{
                    xaxis: {
                        type: "datetime"
                    },
                    legend: {
                        show: true,
                        fontSize: '14px',
                        fontFamily: `'Roboto', sans-serif`,
                        position: 'bottom',
                        offsetX: 20,
                        labels: {
                            useSeriesColors: false,
                            colors: theme.palette.grey[500]
                        },
                        markers: {
                            width: 16,
                            height: 16,
                            radius: 5
                        },
                        itemMargin: {
                            horizontal: 15,
                            vertical: 8
                        }
                    },
                    chart: {
                        toolbar: {
                            show: false
                        },
                        zoom: {
                            enabled: false
                        }
                    },
                    stroke: {
                        curve: 'smooth'
                    },
                    yaxis: lineYAxis(theme),
                    grid: {
                        borderColor: theme.palette.grey[400]
                    },
                    tooltip: {
                        theme: 'dark'
                    }
                }}
            />
        </MainCard>
    )
}
