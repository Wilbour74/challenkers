import React, {useEffect, useState} from "react";
import axios from 'axios';

function CitationForm({ onCitationAdded }){
    const [NewCitation, setNewCitation] = useState("");

    function handlejoin(){
        

        axios.post('http://localhost:8000/citation', { citation: NewCitation})
        .then((response) => {
            console.log(response.data);
            onCitationAdded();
            setNewCitation(""); 
        })
        .catch((error) => {
            console.error(error);
        })

    }
    return(
        <div className="Form">
            <input
                type="text"
                placeholder="Ajoute ta citation"
                value={NewCitation}
                className="ajout"
                onChange={(event) => {
                    setNewCitation(event.target.value);
                }}>
                </input>
                <button onClick={handlejoin} className="crud-button">Ajouter</button>


        </div>
    )
}

export default CitationForm;