import { TextField, MenuItem, Button } from "@mui/material";
import { useState } from "react";

const DateFilter = ({ onFilter }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [groupBy, setGroupBy] = useState("day");

  const handleSubmit = () => {
    onFilter({ fromDate, toDate, groupBy });
  };

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <TextField
        label="From"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
      />
      <TextField
        label="To"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
      />
      <TextField
        label="Follow"
        select
        value={groupBy}
        onChange={(e) => setGroupBy(e.target.value)}
      >
        <MenuItem value="day">Day</MenuItem>
        <MenuItem value="month">Month</MenuItem>
        <MenuItem value="quarter">Quarter</MenuItem>
        <MenuItem value="year">Year</MenuItem>
      </TextField>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Find
      </Button>
    </div>
  );
};

export default DateFilter;
