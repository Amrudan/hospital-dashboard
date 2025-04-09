import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomLineChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false}
        />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#6c5ce7" 
          strokeWidth={2}
          dot={{ fill: "#6c5ce7", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CustomLineChart; 