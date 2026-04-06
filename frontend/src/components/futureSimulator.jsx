import axios from "axios";
import { useState } from "react";

export default function FutureSimulator() {

    const [prediction, setPrediction] = useState(null)

    const simulate = async () => {

        const res = await axios.post(
            "http://localhost:5000/api/simulate",
            {
                sleep: 8,
                water: 3,
                steps: 9000
            }
        )

        setPrediction(res.data)

    }

    return (

        <div>

            <button onClick={simulate}>
                Simulate Better Habits
            </button>

            {prediction &&

                <div>

                    Predicted Health Score:
                    {prediction.predictedScore}

                </div>

            }

        </div>

    )

}