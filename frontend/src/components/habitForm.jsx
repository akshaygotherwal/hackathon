import { useState } from "react";
import axios from "axios";

export default function HabitForm() {

    const [data, setData] = useState({
        sleep_hours: "",
        water_intake: "",
        steps: ""
    });

    const submit = async () => {
        await axios.post("http://localhost:5000/api/habits", data);
    };

    return (
        <div>

            <input
                placeholder="Sleep Hours"
                onChange={e => setData({ ...data, sleep_hours: e.target.value })}
            />

            <input
                placeholder="Water Intake (L)"
                onChange={e => setData({ ...data, water_intake: e.target.value })}
            />

            <input
                placeholder="Steps"
                onChange={e => setData({ ...data, steps: e.target.value })}
            />

            <button onClick={submit}>Submit</button>

        </div>
    );
}