async function generateChineseName(englishName, gender) {
    try {
        const response = await fetch('http://localhost:3000/api/generate-name', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ englishName, gender })
        });

        if (!response.ok) {
            throw new Error('Failed to generate name. Please try again.');
        }

        const data = await response.json();
        console.log('Response from server:', data);
        return data;

    } catch (error) {
        console.error('Error in generateChineseName:', error);
        throw error;
    }
}

export { generateChineseName }; 