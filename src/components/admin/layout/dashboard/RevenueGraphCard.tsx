import { MainCard } from "../MainCard";
import { useTheme } from "@mui/material";
import dynamic from "next/dynamic";
import SsidChartIcon from '@mui/icons-material/SsidChart';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type SamplePoint = {revenue: number; ticketAmount: number};

export const RevenueGraphCard = ({oneYearOrdersGroup}: {oneYearOrdersGroup: Record<string, SamplePoint>}) => {
    const theme = useTheme();

    const compareDate = new Date();
    compareDate.setDate(compareDate.getDate() - 7);
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
        >
            <Chart
                type={"line"}
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
                    yaxis: {
                        labels: {
                            style: {
                                colors: [theme.palette.primary.dark, theme.palette.secondary.dark]
                            }
                        }
                    },
                    grid: {
                        borderColor: theme.palette.grey[500]
                    },
                    tooltip: {
                        theme: 'dark'
                    }
                }}
            />
        </MainCard>
    )
}
