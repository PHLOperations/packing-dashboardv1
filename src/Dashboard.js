import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [ordersRemaining, setOrdersRemaining] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const fetchCSV = async () => {
      const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSs1te3K2GDZFmvXnV2dj_uLzlZpLQsLehdsGgDIVT2jYBQaebYQ-xxTL_cT3sot9TrU31cHWM8Xhz1/pub?output=csv");
      const csvText = await response.text();
      const rows = csvText.trim().split("\n").map(row => row.split(","));

      const headers = rows[0].slice(1); // Remove 'Hour'
      const parsedData = rows.slice(1).map(row => {
        const hour = row[0];
        const values = row.slice(1).map(val => parseInt(val, 10));
        const entry = { hour };
        headers.forEach((name, i) => {
          entry[name] = values[i];
        });
        return entry;
      });

      const totalRow = parsedData.find(row => row.hour.toLowerCase() === "total");
      const remaining = totalRow
        ? Object.entries(totalRow)
            .filter(([key]) => key !== "hour")
            .reduce((sum, [, val]) => sum + val, 0)
        : 0;

      setOrdersRemaining(remaining);
      setData(parsedData);
      setLastUpdated(new Date().toLocaleTimeString());
    };

    fetchCSV();
    const interval = setInterval(fetchCSV, 10 * 60 * 1000); // every 10 minutes
    return () => clearInterval(interval);
  }, []);

  const users = data.length > 0 ? Object.keys(data[0]).filter(k => k !== "hour") : [];

  return (
    <div className="p-6 bg-white min-h-screen text-center">
      <h1 className="text-3xl font-bold mb-4">📦 Packing Dashboard</h1>
      <div className="text-xl mb-2 text-red-600">
        Orders Remaining: <span className="font-bold">{ordersRemaining}</span>
      </div>
      <div className="text-gray-500 mb-6">Last updated at: {lastUpdated}</div>
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse w-full text-lg">
          <thead>
            <tr>
              <th className="border px-4 py-2">Hour</th>
              {users.map((user, idx) => (
                <th key={idx} className="border px-4 py-2">{user}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className={row.hour.toLowerCase() === "total" ? "font-bold bg-gray-100" : ""}>
                <td className="border px-4 py-2">{row.hour}</td>
                {users.map((user, i) => (
                  <td key={i} className="border px-4 py-2">{row[user]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
