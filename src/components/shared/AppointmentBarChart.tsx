import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChartData } from "@/types/dashboard.types";

interface AppointmentBarChartProps {
    data: BarChartData[];
    title?: string;
    description?: string;
}

const AppointmentBarChart = ({ 
    data, 
    title = "Appointment Trends", 
    description = "Monthly Appointment Statistics" 
}: AppointmentBarChartProps) => {
    
    // 1. Check for invalid data
    if (!data || !Array.isArray(data)) {
        return (
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-75">
                    <p className="text-sm text-muted-foreground">
                        Invalid data provided for the chart.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // 2. Format the data safely
    const formattedData = data.map((item) => ({
        month: typeof item.month === "string" 
            ? format(new Date(item.month), "MMM yyyy") 
            : format(item.month, "MMM yyyy"), // Fixed: properly wrapped in the format() function
        appointments: Number(item.count),
    }));

    // 3. Handle empty data states (Now shows a message instead of the chart)
    if (!formattedData.length || formattedData.every(item => item.appointments === 0)) {
        return (
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[350px]">
                    <p className="text-sm text-muted-foreground">
                        No appointment data available to display.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // 4. Render the actual chart when there is valid data
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis tickLine={false} axisLine={false} dataKey="month" />
                        <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar 
                            dataKey="appointments" 
                            fill="oklch(0.646 0.222 41.116)" // Fixed typo: ok1ch -> oklch
                            radius={[4, 4, 0, 0]} 
                            maxBarSize={60} 
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default AppointmentBarChart;