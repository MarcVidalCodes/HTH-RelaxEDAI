import React, { useState, useEffect } from 'react';
import { FaThermometerHalf, FaHeartbeat } from 'react-icons/fa';

interface StressInstanceProps {
    onSelectStress: (stress: string) => void;
}

const StressInstance: React.FC<StressInstanceProps> = ({ onSelectStress }) => {
    const [stress, setStress] = useState<any[]>([]);
    const [selectedStress, setSelectedStress] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchStressData = async () => {
            try {
                const token = localStorage.getItem('token'); 
                if (!token) {
                    console.error('No token found');
                    return;
                }
                const response = await fetch('http://localhost:5001/api/stress-data', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setStress(data);
                if (data.length > 0) {
                    setSelectedStress(data[0]._id);
                    onSelectStress(JSON.stringify(data[0]));
                }
            } catch (error) {
                console.error('Failed to fetch stress data:', error);
            }
        };
    
        fetchStressData();
    }, [onSelectStress]);

    const handleStressClick = (stressId: string) => {
        setSelectedStress(stressId);
        const selected = stress.find(stress => stress._id === stressId);
        if (selected) {
            onSelectStress(JSON.stringify(selected));
        }
    };

    return (
        <div className="stress-list">
            {stress.map((stress, index) => (
                <div
                    key={stress._id}
                    className={`card ${selectedStress === stress._id ? 'selected' : ''}`}
                    onClick={() => handleStressClick(stress._id)}
                >
                    <h3 className="card-title">Stress Item {index + 1}</h3>
                    <p className="card-text">
                        <span className="icon"><FaThermometerHalf /></span> Temperature: {stress.temperature}
                    </p>
                    <p className="card-text">
                        <span className="icon"><FaHeartbeat /></span> Pulse: {stress.pulse}
                    </p>
                </div>
            ))}
        </div>
    );
};

// Add CSS for hover effect
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
    .stress-list {
        display: flex;
        flex-direction: column;
        width: 100%;
    }
    .card {
        padding: 15px;
        margin-bottom: 10px;
        border-radius: 8px;
        cursor: pointer;
        text-align: left;
        transition: transform 0.2s, box-shadow 0.2s;
        position: relative;
    }
    .card.selected {
        background-color: #333;
    }
    .card:hover {
        transform: scale(1.02);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    }
    .card-title {
        font-size: 20px;
        margin-bottom: 5px;
        color: #E2BFD9;
        font-weight: bold;
    }
    .card-text {
        margin-bottom: 5px;
        color: #ECECEC;
        display: flex;
        align-items: center;
    }
    .icon {
        margin-right: 8px;
    }
`;
document.head.appendChild(styleSheet);

export default StressInstance;
