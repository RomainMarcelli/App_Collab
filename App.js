import React, { useEffect, useState } from 'react';

function App() {
    const [collaborateurs, setCollaborateurs] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/collaborateurs')
            .then(response => response.json())
            .then(data => setCollaborateurs(data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
        <div className="App">
            <h1>Sélectionnez un collaborateur</h1>
            <form>
                <label htmlFor="collaborateurs">Collaborateurs:</label>
                <select id="collaborateurs" name="collaborateurs">
                    {collaborateurs.map(collaborateur => (
                        <option key={collaborateur.id} value={collaborateur.name}>
                            {collaborateur.name}
                        </option>
                    ))}
                </select>
            </form>
        </div>
    );
}

export default App;
